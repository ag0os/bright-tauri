use crate::db::Database;
use crate::models::{CreateStoryInput, Story, StoryDetail, StorySummary, UpdateStoryInput};
use crate::repositories::StoryRepository;
use crate::services::story_service;
use tauri::State;

#[tauri::command]
pub fn create_story(db: State<Database>, input: CreateStoryInput) -> Result<StoryDetail, String> {
    story_service::create_story(&db, input)
}

#[tauri::command]
pub fn get_story(db: State<Database>, id: String) -> Result<StoryDetail, String> {
    story_service::get_story(&db, &id)
}

#[tauri::command]
pub fn list_stories_by_universe(
    db: State<Database>,
    universe_id: String,
) -> Result<Vec<StorySummary>, String> {
    let stories = StoryRepository::list_by_universe(&db, &universe_id).map_err(|e| e.to_string())?;
    Ok(stories.into_iter().map(StorySummary::from).collect())
}

#[tauri::command]
pub fn list_story_variations(
    db: State<Database>,
    variation_group_id: String,
) -> Result<Vec<StorySummary>, String> {
    let stories = StoryRepository::list_by_variation_group(&db, &variation_group_id)
        .map_err(|e| e.to_string())?;
    Ok(stories.into_iter().map(StorySummary::from).collect())
}

#[tauri::command]
pub fn update_story(
    db: State<Database>,
    id: String,
    input: UpdateStoryInput,
) -> Result<Story, String> {
    StoryRepository::update(&db, &id, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_story(db: State<Database>, id: String) -> Result<(), String> {
    // Delete the story (CASCADE will delete associated versions and snapshots)
    StoryRepository::delete(&db, &id).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::models::{CreateStoryInput, StoryDetail, StoryType};
    use crate::repositories::{StoryRepository, StorySnapshotRepository, StoryVersionRepository};
    use crate::services::story_service;
    use rusqlite::params;
    use tempfile::TempDir;

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

    fn create_story_internal(db: &Database, input: CreateStoryInput) -> Result<StoryDetail, String> {
        story_service::create_story(db, input)
    }

    // ==========================================================================
    // AC #3: Story creation auto-creates version + snapshot test
    // ==========================================================================

    #[test]
    fn test_create_story_auto_creates_version_and_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("My New Story");
        let story = create_story_internal(&db, input).unwrap();

        // StoryDetail guarantees active_version_id is set (non-optional)
        assert!(!story.active_version_id.is_empty(), "active_version_id should be set");

        // StoryDetail guarantees active_snapshot_id is set (non-optional)
        assert!(!story.active_snapshot_id.is_empty(), "active_snapshot_id should be set");

        // active_version is guaranteed populated in StoryDetail
        assert_eq!(story.active_version.name, "Original");
        assert_eq!(story.active_version.story_id, story.id);

        // active_snapshot is guaranteed populated in StoryDetail
        assert_eq!(story.active_snapshot.content, "");
        assert_eq!(story.active_snapshot.version_id, story.active_version.id);

        // Verify version exists in database
        let versions = StoryVersionRepository::list_by_story(&db, &story.id).unwrap();
        assert_eq!(versions.len(), 1);
        assert_eq!(versions[0].name, "Original");

        // Verify snapshot exists in database
        let snapshots = StorySnapshotRepository::list_by_version(&db, &story.active_version.id).unwrap();
        assert_eq!(snapshots.len(), 1);
        assert_eq!(snapshots[0].content, "");
    }

    #[test]
    fn test_create_story_version_and_snapshot_ids_match() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story");
        let story = create_story_internal(&db, input).unwrap();

        // StoryDetail has non-optional fields, so IDs are guaranteed to match
        assert_eq!(story.active_version_id, story.active_version.id);
        assert_eq!(story.active_snapshot_id, story.active_snapshot.id);
    }

    // ==========================================================================
    // AC #6: Cascade delete (story -> versions -> snapshots) test
    // ==========================================================================

    #[test]
    fn test_delete_story_cascades_to_versions_and_snapshots() {
        let (db, _temp_dir) = setup_test_db();

        // Create a story with version and snapshot
        let input = create_test_story_input("Story To Delete");
        let story = create_story_internal(&db, input).unwrap();

        let version_id = story.active_version_id.clone();
        let snapshot_id = story.active_snapshot_id.clone();

        // Verify version exists
        let version_before = StoryVersionRepository::get(&db, &version_id).unwrap();
        assert!(version_before.is_some());

        // Verify snapshot exists
        let snapshot_before = StorySnapshotRepository::get(&db, &snapshot_id).unwrap();
        assert!(snapshot_before.is_some());

        // Delete the story
        StoryRepository::delete(&db, &story.id).unwrap();

        // Verify story is deleted
        let story_result = StoryRepository::find_by_id(&db, &story.id);
        assert!(story_result.is_err());

        // Verify version is cascade deleted
        let version_after = StoryVersionRepository::get(&db, &version_id).unwrap();
        assert!(version_after.is_none(), "Version should be cascade deleted");

        // Verify snapshot is cascade deleted
        let snapshot_after = StorySnapshotRepository::get(&db, &snapshot_id).unwrap();
        assert!(
            snapshot_after.is_none(),
            "Snapshot should be cascade deleted"
        );
    }

    #[test]
    fn test_delete_story_cascades_multiple_versions_and_snapshots() {
        let (db, _temp_dir) = setup_test_db();

        // Create a story
        let input = create_test_story_input("Complex Story");
        let story = create_story_internal(&db, input).unwrap();

        let version1_id = story.active_version_id.clone();

        // Add a second version
        let version2 = StoryVersionRepository::create(&db, &story.id, "Alternate Ending").unwrap();

        // Add multiple snapshots to each version
        let _snap1_2 =
            StorySnapshotRepository::create(&db, &version1_id, "Version 1 snapshot 2").unwrap();
        let _snap2_1 =
            StorySnapshotRepository::create(&db, &version2.id, "Version 2 snapshot 1").unwrap();
        let _snap2_2 =
            StorySnapshotRepository::create(&db, &version2.id, "Version 2 snapshot 2").unwrap();

        // Verify we have multiple versions and snapshots
        let versions_before = StoryVersionRepository::list_by_story(&db, &story.id).unwrap();
        assert_eq!(versions_before.len(), 2);

        let snapshots_v1 = StorySnapshotRepository::list_by_version(&db, &version1_id).unwrap();
        let snapshots_v2 = StorySnapshotRepository::list_by_version(&db, &version2.id).unwrap();
        assert_eq!(snapshots_v1.len(), 2); // original + one more
        assert_eq!(snapshots_v2.len(), 2);

        // Delete the story
        StoryRepository::delete(&db, &story.id).unwrap();

        // Verify all versions are deleted
        let versions_after = StoryVersionRepository::list_by_story(&db, &story.id).unwrap();
        assert_eq!(versions_after.len(), 0);

        // Verify all snapshots are deleted
        let snapshots_v1_after =
            StorySnapshotRepository::list_by_version(&db, &version1_id).unwrap();
        let snapshots_v2_after =
            StorySnapshotRepository::list_by_version(&db, &version2.id).unwrap();
        assert_eq!(snapshots_v1_after.len(), 0);
        assert_eq!(snapshots_v2_after.len(), 0);
    }
}
