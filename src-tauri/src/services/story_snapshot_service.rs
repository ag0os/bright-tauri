use crate::db::Database;
use crate::models::{Story, StorySnapshot};
use crate::repositories::{StoryRepository, StorySnapshotRepository};

/// Default maximum snapshots to keep per version when not specified
const DEFAULT_MAX_SNAPSHOTS: i32 = 50;

/// Count words in a string using whitespace splitting.
fn count_words(text: &str) -> u32 {
    text.split_whitespace().count() as u32
}

/// Create a new snapshot for the current active version of a story.
/// Updates the story's active_snapshot_id, word_count, and last_edited_at.
/// Applies retention policy (deletes oldest snapshots beyond limit).
pub fn create_story_snapshot(
    db: &Database,
    story_id: &str,
    content: &str,
    word_count: Option<u32>,
    max_snapshots: Option<i32>,
) -> Result<StorySnapshot, String> {
    let story = StoryRepository::find_by_id(db, story_id).map_err(|e| e.to_string())?;

    let active_version_id = story
        .active_version_id
        .ok_or_else(|| "Story has no active version".to_string())?;

    let word_count = word_count.unwrap_or_else(|| count_words(content));
    let max_snapshots = max_snapshots.unwrap_or(DEFAULT_MAX_SNAPSHOTS);

    let snapshot = StorySnapshotRepository::create(db, &active_version_id, content)
        .map_err(|e| e.to_string())?;

    StoryRepository::set_active_snapshot(db, story_id, &snapshot.id)
        .map_err(|e| e.to_string())?;

    StoryRepository::update_word_count_and_edited(db, story_id, word_count)
        .map_err(|e| e.to_string())?;

    StorySnapshotRepository::delete_oldest(db, &active_version_id, max_snapshots)
        .map_err(|e| e.to_string())?;

    Ok(snapshot)
}

/// Update the current active snapshot's content in place (auto-save target).
/// Also updates the story's word_count and last_edited_at.
pub fn update_snapshot_content(
    db: &Database,
    story_id: &str,
    content: &str,
    word_count: u32,
) -> Result<(), String> {
    let story = StoryRepository::find_by_id(db, story_id).map_err(|e| e.to_string())?;

    let active_snapshot_id = story
        .active_snapshot_id
        .ok_or_else(|| "Story has no active snapshot".to_string())?;

    StorySnapshotRepository::update_content(db, &active_snapshot_id, content)
        .map_err(|e| e.to_string())?;

    StoryRepository::update_word_count_and_edited(db, story_id, word_count)
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Switch to a different snapshot, creating a fresh working copy.
/// Historical snapshots remain immutable.
pub fn switch_story_snapshot(
    db: &Database,
    story_id: &str,
    snapshot_id: &str,
    word_count: Option<u32>,
    max_snapshots: Option<i32>,
) -> Result<Story, String> {
    let snapshot = StorySnapshotRepository::get(db, snapshot_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Snapshot not found".to_string())?;

    let story = StoryRepository::find_by_id(db, story_id).map_err(|e| e.to_string())?;

    let active_version_id = story
        .active_version_id
        .ok_or_else(|| "Story has no active version".to_string())?;

    if snapshot.version_id != active_version_id {
        return Err("Snapshot does not belong to the story's active version".to_string());
    }

    let restored_snapshot =
        StorySnapshotRepository::create(db, &active_version_id, &snapshot.content)
            .map_err(|e| e.to_string())?;

    StoryRepository::set_active_snapshot(db, story_id, &restored_snapshot.id)
        .map_err(|e| e.to_string())?;

    StoryRepository::update_word_count_and_edited(
        db,
        story_id,
        word_count.unwrap_or_else(|| count_words(&snapshot.content)),
    )
    .map_err(|e| e.to_string())?;

    StorySnapshotRepository::delete_oldest(
        db,
        &active_version_id,
        max_snapshots.unwrap_or(DEFAULT_MAX_SNAPSHOTS),
    )
    .map_err(|e| e.to_string())?;

    StoryRepository::find_by_id(db, story_id).map_err(|e| e.to_string())
}
