use crate::db::Database;
use crate::models::{Story, StorySnapshot};
use crate::repositories::{StoryRepository, StorySnapshotRepository};
use tauri::State;

/// Default maximum snapshots to keep per version when not specified
const DEFAULT_MAX_SNAPSHOTS: i32 = 50;

/// Create a new snapshot for the current active version of a story.
///
/// This command:
/// 1. Creates a new snapshot for the story's active version
/// 2. Updates the story's active_snapshot_id to the new snapshot
/// 3. Updates the story's word_count and last_edited_at
/// 4. Applies retention policy (deletes oldest snapshots beyond limit)
///
/// Used when the frontend triggers a snapshot save point (e.g., after character threshold).
#[tauri::command]
pub fn create_story_snapshot(
    db: State<Database>,
    story_id: String,
    content: String,
) -> Result<StorySnapshot, String> {
    // Get the story to find active version
    let story = StoryRepository::find_by_id(&db, &story_id).map_err(|e| e.to_string())?;

    // Ensure story has an active version
    let active_version_id = story
        .active_version_id
        .ok_or_else(|| "Story has no active version".to_string())?;

    // Calculate word count from content
    let word_count = count_words(&content);

    // Create the new snapshot
    let snapshot = StorySnapshotRepository::create(&db, &active_version_id, &content)
        .map_err(|e| e.to_string())?;

    // Update story's active_snapshot_id
    StoryRepository::set_active_snapshot(&db, &story_id, &snapshot.id)
        .map_err(|e| e.to_string())?;

    // Update word count and last_edited_at
    StoryRepository::update_word_count_and_edited(&db, &story_id, word_count)
        .map_err(|e| e.to_string())?;

    // Apply retention policy (delete oldest if over limit)
    // Using default since settings are stored in frontend localStorage
    StorySnapshotRepository::delete_oldest(&db, &active_version_id, DEFAULT_MAX_SNAPSHOTS)
        .map_err(|e| e.to_string())?;

    Ok(snapshot)
}

/// List all snapshots for a version, ordered by created_at DESC (newest first).
///
/// Used by the StoryHistory view to display available restore points.
#[tauri::command]
pub fn list_story_snapshots(
    db: State<Database>,
    version_id: String,
) -> Result<Vec<StorySnapshot>, String> {
    StorySnapshotRepository::list_by_version(&db, &version_id).map_err(|e| e.to_string())
}

/// Update the current active snapshot's content in place.
///
/// This is the auto-save target (30s debounce) - it updates the existing snapshot
/// rather than creating a new one. Also updates the story's word_count and last_edited_at.
///
/// The frontend passes story_id, and the backend resolves the active snapshot internally.
#[tauri::command]
pub fn update_snapshot_content(
    db: State<Database>,
    story_id: String,
    content: String,
    word_count: u32,
) -> Result<(), String> {
    // Get the story to find active snapshot
    let story = StoryRepository::find_by_id(&db, &story_id).map_err(|e| e.to_string())?;

    // Ensure story has an active snapshot
    let active_snapshot_id = story
        .active_snapshot_id
        .ok_or_else(|| "Story has no active snapshot".to_string())?;

    // Update the snapshot content
    StorySnapshotRepository::update_content(&db, &active_snapshot_id, &content)
        .map_err(|e| e.to_string())?;

    // Update story's word_count and last_edited_at
    StoryRepository::update_word_count_and_edited(&db, &story_id, word_count)
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Switch to a different snapshot, restoring its content as the active state.
///
/// Updates the story's active_snapshot_id to the specified snapshot.
/// Returns the updated Story with inline version/snapshot data.
#[tauri::command]
pub fn switch_story_snapshot(
    db: State<Database>,
    story_id: String,
    snapshot_id: String,
) -> Result<Story, String> {
    // Verify the snapshot exists
    let snapshot = StorySnapshotRepository::get(&db, &snapshot_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Snapshot not found".to_string())?;

    // Get the story to verify the snapshot belongs to the active version
    let story = StoryRepository::find_by_id(&db, &story_id).map_err(|e| e.to_string())?;

    let active_version_id = story
        .active_version_id
        .ok_or_else(|| "Story has no active version".to_string())?;

    // Verify snapshot belongs to the story's active version
    if snapshot.version_id != active_version_id {
        return Err("Snapshot does not belong to the story's active version".to_string());
    }

    // Update story's active_snapshot_id
    StoryRepository::set_active_snapshot(&db, &story_id, &snapshot_id)
        .map_err(|e| e.to_string())?;

    // Return updated story
    StoryRepository::find_by_id(&db, &story_id).map_err(|e| e.to_string())
}

/// Delete oldest snapshots for a version, keeping only the N most recent.
///
/// This is the manual cleanup command. Automatic cleanup happens via retention
/// policy in create_story_snapshot.
///
/// Returns the count of deleted snapshots.
#[tauri::command]
pub fn cleanup_old_snapshots(
    db: State<Database>,
    version_id: String,
    keep_count: i32,
) -> Result<i32, String> {
    StorySnapshotRepository::delete_oldest(&db, &version_id, keep_count).map_err(|e| e.to_string())
}

/// Count words in a string using whitespace splitting.
///
/// Simple implementation that handles most common cases for writing applications.
fn count_words(text: &str) -> u32 {
    text.split_whitespace().count() as u32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_words_basic() {
        assert_eq!(count_words("hello world"), 2);
        assert_eq!(count_words("one two three four five"), 5);
    }

    #[test]
    fn test_count_words_empty() {
        assert_eq!(count_words(""), 0);
        assert_eq!(count_words("   "), 0);
    }

    #[test]
    fn test_count_words_with_newlines() {
        assert_eq!(count_words("hello\nworld"), 2);
        assert_eq!(count_words("one\ntwo\nthree"), 3);
    }

    #[test]
    fn test_count_words_mixed_whitespace() {
        assert_eq!(count_words("  hello   world  "), 2);
        assert_eq!(count_words("\t\nhello\t\nworld\t\n"), 2);
    }

    #[test]
    fn test_count_words_punctuation() {
        // Punctuation attached to words counts as part of the word
        assert_eq!(count_words("Hello, world!"), 2);
        assert_eq!(count_words("It's a test."), 3);
    }
}
