use crate::db::Database;
use crate::models::{Story, StorySnapshot};
use crate::repositories::StorySnapshotRepository;
use crate::services::story_snapshot_service;
use tauri::State;

#[tauri::command]
pub fn create_story_snapshot(
    db: State<Database>,
    story_id: String,
    content: String,
    word_count: Option<u32>,
    max_snapshots: Option<i32>,
) -> Result<StorySnapshot, String> {
    story_snapshot_service::create_story_snapshot(&db, &story_id, &content, word_count, max_snapshots)
}

#[tauri::command]
pub fn list_story_snapshots(
    db: State<Database>,
    version_id: String,
) -> Result<Vec<StorySnapshot>, String> {
    StorySnapshotRepository::list_by_version(&db, &version_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_snapshot_content(
    db: State<Database>,
    story_id: String,
    content: String,
    word_count: u32,
) -> Result<(), String> {
    story_snapshot_service::update_snapshot_content(&db, &story_id, &content, word_count)
}

#[tauri::command]
pub fn switch_story_snapshot(
    db: State<Database>,
    story_id: String,
    snapshot_id: String,
    word_count: Option<u32>,
    max_snapshots: Option<i32>,
) -> Result<Story, String> {
    story_snapshot_service::switch_story_snapshot(&db, &story_id, &snapshot_id, word_count, max_snapshots)
}

#[tauri::command]
pub fn cleanup_old_snapshots(
    db: State<Database>,
    version_id: String,
    keep_count: i32,
) -> Result<i32, String> {
    StorySnapshotRepository::delete_oldest(&db, &version_id, keep_count).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::models::{CreateStoryInput, StoryType};
    use crate::repositories::{StoryRepository, StorySnapshotRepository, StoryVersionRepository};
    use rusqlite::params;
    use tempfile::TempDir;

    fn count_words(text: &str) -> u32 {
        text.split_whitespace().count() as u32
    }

    fn setup_test_db() -> (Database, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db = Database::new(db_path).unwrap();

        // Run migrations
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        crate::db::migrations::run_migrations(&conn).unwrap();
        drop(conn);

        // Create a test universe
        db.execute(
            "INSERT INTO universes (id, name, description, created_at, updated_at, status)
             VALUES (?, ?, ?, ?, ?, ?)",
            params![
                "universe-1",
                "Test Universe",
                "Test",
                "2024-01-01T00:00:00Z",
                "2024-01-01T00:00:00Z",
                "active"
            ],
        )
        .unwrap();

        (db, temp_dir)
    }

    fn create_test_story_input(title: &str) -> CreateStoryInput {
        CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: title.to_string(),
            description: Some("Test story".to_string()),
            story_type: Some(StoryType::Chapter),
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            container_id: None,
            variation_type: None,
            parent_variation_id: None,
        }
    }

    /// Creates a story with version and snapshot, returns (story_id, version_id, snapshot_id)
    fn create_story_with_versioning(db: &Database, title: &str) -> (String, String, String) {
        let input = create_test_story_input(title);
        let story = StoryRepository::create(db, input).unwrap();

        let version = StoryVersionRepository::create(db, &story.id, "Original").unwrap();
        let snapshot = StorySnapshotRepository::create(db, &version.id, "").unwrap();

        StoryRepository::set_active_version(db, &story.id, &version.id).unwrap();
        StoryRepository::set_active_snapshot(db, &story.id, &snapshot.id).unwrap();

        (story.id, version.id, snapshot.id)
    }

    // ==========================================================================
    // Word count helper tests
    // ==========================================================================

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

    // ==========================================================================
    // AC #5: Snapshot switching updates active pointer test
    // ==========================================================================

    #[test]
    fn test_switch_snapshot_updates_active_pointer() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning
        let (story_id, version_id, snapshot1_id) = create_story_with_versioning(&db, "Test Story");

        // Verify initial active snapshot
        let story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story.active_snapshot_id, Some(snapshot1_id.clone()));

        // Create a second snapshot
        std::thread::sleep(std::time::Duration::from_millis(10));
        let snapshot2 =
            StorySnapshotRepository::create(&db, &version_id, "Second version").unwrap();

        // Switch to the second snapshot by creating a fresh working copy
        let restored =
            StorySnapshotRepository::create(&db, &version_id, &snapshot2.content).unwrap();
        StoryRepository::set_active_snapshot(&db, &story_id, &restored.id).unwrap();

        // Verify active_snapshot_id is updated
        let updated_story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(updated_story.active_snapshot_id, Some(restored.id.clone()));
        assert_ne!(updated_story.active_snapshot_id, Some(snapshot1_id.clone()));
    }

    #[test]
    fn test_switch_snapshot_to_older_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning
        let (story_id, version_id, snapshot1_id) = create_story_with_versioning(&db, "Test Story");

        // Create additional snapshots
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _snapshot2 = StorySnapshotRepository::create(&db, &version_id, "Second").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let snapshot3 = StorySnapshotRepository::create(&db, &version_id, "Third").unwrap();

        // Set active to latest
        StoryRepository::set_active_snapshot(&db, &story_id, &snapshot3.id).unwrap();

        // Verify it's at snapshot3
        let story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story.active_snapshot_id, Some(snapshot3.id.clone()));

        // Switch back to snapshot1 by creating a fresh working copy
        let snapshot1 = StorySnapshotRepository::get(&db, &snapshot1_id)
            .unwrap()
            .unwrap();
        let restored =
            StorySnapshotRepository::create(&db, &version_id, &snapshot1.content).unwrap();
        StoryRepository::set_active_snapshot(&db, &story_id, &restored.id).unwrap();

        // Verify active_snapshot_id points to the new restored working copy
        let updated_story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(updated_story.active_snapshot_id, Some(restored.id));
    }

    #[test]
    fn test_switch_snapshot_validates_version_ownership() {
        let (db, _temp_dir) = setup_test_db();

        // Create first story
        let (story1_id, _version1_id, _snapshot1_id) = create_story_with_versioning(&db, "Story 1");

        // Create second story
        let (_story2_id, version2_id, _snapshot2_id) = create_story_with_versioning(&db, "Story 2");

        // Create a snapshot for story2's version
        let foreign_snapshot =
            StorySnapshotRepository::create(&db, &version2_id, "Foreign").unwrap();

        // Get story1's active version
        let story1 = StoryRepository::find_by_id(&db, &story1_id).unwrap();
        let active_version_id = story1.active_version_id.unwrap();

        // Verify the foreign snapshot does NOT belong to story1's active version
        assert_ne!(foreign_snapshot.version_id, active_version_id);
    }

    #[test]
    fn test_restore_creates_new_snapshot_without_overwriting_history() {
        let (db, _temp_dir) = setup_test_db();
        let (story_id, version_id, original_snapshot_id) =
            create_story_with_versioning(&db, "Test Story");

        StorySnapshotRepository::update_content(&db, &original_snapshot_id, "Original content")
            .unwrap();
        let historical_snapshot =
            StorySnapshotRepository::create(&db, &version_id, "Historical content").unwrap();

        let restored_snapshot =
            StorySnapshotRepository::create(&db, &version_id, "Historical content").unwrap();
        StoryRepository::set_active_snapshot(&db, &story_id, &restored_snapshot.id).unwrap();
        StoryRepository::update_word_count_and_edited(&db, &story_id, 2).unwrap();

        let historical_after = StorySnapshotRepository::get(&db, &historical_snapshot.id)
            .unwrap()
            .unwrap();
        let restored_after = StorySnapshotRepository::get(&db, &restored_snapshot.id)
            .unwrap()
            .unwrap();
        let story_after = StoryRepository::find_by_id(&db, &story_id).unwrap();

        assert_eq!(historical_after.content, "Historical content");
        assert_eq!(restored_after.content, "Historical content");
        assert_ne!(historical_after.id, restored_after.id);
        assert_eq!(story_after.active_snapshot_id, Some(restored_snapshot.id));
    }

    // ==========================================================================
    // AC #8: update_snapshot_content updates word_count and last_edited_at test
    // ==========================================================================

    #[test]
    fn test_update_snapshot_content_updates_word_count() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning
        let (story_id, _version_id, _snapshot_id) = create_story_with_versioning(&db, "Test Story");

        // Get initial state
        let story_before = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story_before.word_count, 0);

        // Simulate update_snapshot_content by updating the active snapshot
        let active_snapshot_id = story_before.active_snapshot_id.clone().unwrap();
        let new_content = "Once upon a time in a galaxy far away";
        let new_word_count = count_words(new_content);

        // Update snapshot content
        StorySnapshotRepository::update_content(&db, &active_snapshot_id, new_content).unwrap();

        // Update story's word_count and last_edited_at
        StoryRepository::update_word_count_and_edited(&db, &story_id, new_word_count).unwrap();

        // Verify word_count is updated
        let story_after = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story_after.word_count, 9); // "Once upon a time in a galaxy far away" = 9 words

        // Verify snapshot content is updated
        let snapshot = StorySnapshotRepository::get(&db, &active_snapshot_id)
            .unwrap()
            .unwrap();
        assert_eq!(snapshot.content, new_content);
    }

    #[test]
    fn test_update_snapshot_content_updates_last_edited_at() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning
        let (story_id, _version_id, _snapshot_id) = create_story_with_versioning(&db, "Test Story");

        // Get initial state
        let story_before = StoryRepository::find_by_id(&db, &story_id).unwrap();
        let initial_last_edited = story_before.last_edited_at.clone();

        // Wait to ensure timestamp difference
        std::thread::sleep(std::time::Duration::from_millis(10));

        // Update word count and last_edited_at
        StoryRepository::update_word_count_and_edited(&db, &story_id, 100).unwrap();

        // Verify last_edited_at is updated
        let story_after = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_ne!(story_after.last_edited_at, initial_last_edited);
    }

    #[test]
    fn test_update_snapshot_content_multiple_times() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning
        let (story_id, _version_id, _snapshot_id) = create_story_with_versioning(&db, "Test Story");

        let story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        let active_snapshot_id = story.active_snapshot_id.clone().unwrap();

        // Update multiple times
        for i in 1..=5 {
            let content = format!("Update number {}", i);
            let word_count = count_words(&content);

            StorySnapshotRepository::update_content(&db, &active_snapshot_id, &content).unwrap();
            StoryRepository::update_word_count_and_edited(&db, &story_id, word_count).unwrap();

            // Verify content is correctly updated each time
            let snapshot = StorySnapshotRepository::get(&db, &active_snapshot_id)
                .unwrap()
                .unwrap();
            assert_eq!(snapshot.content, content);

            // Verify word count is correctly updated each time
            let updated_story = StoryRepository::find_by_id(&db, &story_id).unwrap();
            assert_eq!(updated_story.word_count, word_count);
        }
    }

    #[test]
    fn test_update_snapshot_content_empty_to_content() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning (starts with empty content)
        let (story_id, _version_id, _snapshot_id) = create_story_with_versioning(&db, "Test Story");

        let story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        let active_snapshot_id = story.active_snapshot_id.clone().unwrap();

        // Verify initial empty content
        let snapshot_before = StorySnapshotRepository::get(&db, &active_snapshot_id)
            .unwrap()
            .unwrap();
        assert_eq!(snapshot_before.content, "");

        // Update to non-empty content
        let new_content = "The quick brown fox jumps over the lazy dog";
        let word_count = count_words(new_content);

        StorySnapshotRepository::update_content(&db, &active_snapshot_id, new_content).unwrap();
        StoryRepository::update_word_count_and_edited(&db, &story_id, word_count).unwrap();

        // Verify update
        let snapshot_after = StorySnapshotRepository::get(&db, &active_snapshot_id)
            .unwrap()
            .unwrap();
        assert_eq!(snapshot_after.content, new_content);

        let story_after = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story_after.word_count, 9);
    }

    #[test]
    fn test_update_snapshot_content_to_empty() {
        let (db, _temp_dir) = setup_test_db();

        // Create story with versioning
        let (story_id, _version_id, _snapshot_id) = create_story_with_versioning(&db, "Test Story");

        let story = StoryRepository::find_by_id(&db, &story_id).unwrap();
        let active_snapshot_id = story.active_snapshot_id.clone().unwrap();

        // Add some content first
        StorySnapshotRepository::update_content(&db, &active_snapshot_id, "Some content").unwrap();
        StoryRepository::update_word_count_and_edited(&db, &story_id, 2).unwrap();

        // Verify content exists
        let story_mid = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story_mid.word_count, 2);

        // Update to empty content (like clearing the editor)
        StorySnapshotRepository::update_content(&db, &active_snapshot_id, "").unwrap();
        StoryRepository::update_word_count_and_edited(&db, &story_id, 0).unwrap();

        // Verify content is cleared
        let snapshot_after = StorySnapshotRepository::get(&db, &active_snapshot_id)
            .unwrap()
            .unwrap();
        assert_eq!(snapshot_after.content, "");

        let story_after = StoryRepository::find_by_id(&db, &story_id).unwrap();
        assert_eq!(story_after.word_count, 0);
    }
}
