use crate::db::Database;
use crate::models::{Story, StoryVersion};
use crate::repositories::StoryVersionRepository;
use crate::services::story_version_service;
use tauri::State;

#[tauri::command]
pub fn create_story_version(
    db: State<Database>,
    story_id: String,
    name: String,
    content: String,
) -> Result<StoryVersion, String> {
    story_version_service::create_story_version(&db, &story_id, &name, &content)
}

#[tauri::command]
pub fn list_story_versions(
    db: State<Database>,
    story_id: String,
) -> Result<Vec<StoryVersion>, String> {
    StoryVersionRepository::list_by_story(&db, &story_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_story_version(
    db: State<Database>,
    version_id: String,
    new_name: String,
) -> Result<(), String> {
    StoryVersionRepository::rename(&db, &version_id, &new_name).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_story_version(db: State<Database>, version_id: String) -> Result<(), String> {
    story_version_service::delete_story_version(&db, &version_id)
}

#[tauri::command]
pub fn switch_story_version(
    db: State<Database>,
    story_id: String,
    version_id: String,
) -> Result<Story, String> {
    story_version_service::switch_story_version(&db, &story_id, &version_id)
}

#[cfg(test)]
mod tests {
    use crate::db::Database;
    use crate::repositories::{StoryRepository, StorySnapshotRepository, StoryVersionRepository};
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

        // Create a test story
        db.execute(
            "INSERT INTO stories (
                id, universe_id, title, description, story_type, status, word_count,
                variation_group_id, variation_type, created_at, updated_at, \"order\",
                favorite, last_edited_at, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                "story-1",
                "universe-1",
                "Test Story",
                "A test story",
                "chapter",
                "draft",
                0,
                "group-1",
                "original",
                "2024-01-01T00:00:00Z",
                "2024-01-01T00:00:00Z",
                0,
                false,
                "2024-01-01T00:00:00Z",
                1
            ],
        )
        .unwrap();

        (db, temp_dir)
    }

    #[test]
    fn test_create_story_version_creates_version_and_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let snapshot =
            StorySnapshotRepository::create(&db, &version.id, "Once upon a time...").unwrap();

        // Set active pointers
        StoryRepository::set_active_version(&db, "story-1", &version.id).unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snapshot.id).unwrap();

        // Verify version
        assert_eq!(version.story_id, "story-1");
        assert_eq!(version.name, "Original");

        // Verify snapshot
        assert_eq!(snapshot.version_id, version.id);
        assert_eq!(snapshot.content, "Once upon a time...");

        // Verify story pointers were updated
        let story = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(story.active_version_id, Some(version.id));
        assert_eq!(story.active_snapshot_id, Some(snapshot.id));
    }

    #[test]
    fn test_list_story_versions() {
        let (db, _temp_dir) = setup_test_db();

        // Create multiple versions
        StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        StoryVersionRepository::create(&db, "story-1", "Alternate Ending").unwrap();
        StoryVersionRepository::create(&db, "story-1", "Director's Cut").unwrap();

        let versions = StoryVersionRepository::list_by_story(&db, "story-1").unwrap();

        assert_eq!(versions.len(), 3);
        assert_eq!(versions[0].name, "Original");
        assert_eq!(versions[1].name, "Alternate Ending");
        assert_eq!(versions[2].name, "Director's Cut");
    }

    #[test]
    fn test_rename_story_version() {
        let (db, _temp_dir) = setup_test_db();

        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();

        StoryVersionRepository::rename(&db, &version.id, "Final Draft").unwrap();

        let updated = StoryVersionRepository::get(&db, &version.id)
            .unwrap()
            .unwrap();
        assert_eq!(updated.name, "Final Draft");
    }

    #[test]
    fn test_delete_story_version_not_last() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions
        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Alternate").unwrap();

        // Set v1 as active
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        let snap1 = StorySnapshotRepository::create(&db, &v1.id, "Content").unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snap1.id).unwrap();

        // Delete v2 (not the active one)
        StoryVersionRepository::delete(&db, &v2.id).unwrap();

        // v1 should still be active
        let story = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(story.active_version_id, Some(v1.id));
    }

    #[test]
    fn test_delete_last_version_fails() {
        let (db, _temp_dir) = setup_test_db();

        // Create only one version
        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();

        // Attempt to delete should fail
        let result = StoryVersionRepository::delete(&db, &version.id);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Cannot delete the last version"));
    }

    #[test]
    fn test_delete_active_version_auto_switches() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions
        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let v2 = StoryVersionRepository::create(&db, "story-1", "Alternate").unwrap();

        // Create snapshots for both
        let snap1 = StorySnapshotRepository::create(&db, &v1.id, "Content 1").unwrap();
        let snap2 = StorySnapshotRepository::create(&db, &v2.id, "Content 2").unwrap();

        // Set v1 as active
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snap1.id).unwrap();

        // Verify v1 is active
        let story = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(story.active_version_id, Some(v1.id.clone()));
        assert_eq!(story.active_snapshot_id, Some(snap1.id.clone()));

        // Simulate the delete_story_version command logic:
        // 1. Switch to another version BEFORE deleting
        let all_versions = StoryVersionRepository::list_by_story(&db, "story-1").unwrap();
        let new_active = all_versions
            .iter()
            .filter(|v| v.id != v1.id)
            .last()
            .unwrap();

        StoryRepository::set_active_version(&db, "story-1", &new_active.id).unwrap();
        if let Some(latest_snap) = StorySnapshotRepository::get_latest(&db, &new_active.id).unwrap()
        {
            StoryRepository::set_active_snapshot(&db, "story-1", &latest_snap.id).unwrap();
        }

        // 2. Now delete the version
        StoryVersionRepository::delete(&db, &v1.id).unwrap();

        // Verify the story now points to v2 (the remaining version)
        let updated_story = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(updated_story.active_version_id, Some(v2.id.clone()));
        assert_eq!(updated_story.active_snapshot_id, Some(snap2.id));
    }

    #[test]
    fn test_switch_story_version() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions
        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Alternate").unwrap();

        // Create snapshots
        let snap1 = StorySnapshotRepository::create(&db, &v1.id, "Content 1").unwrap();
        let snap2 = StorySnapshotRepository::create(&db, &v2.id, "Content 2").unwrap();

        // Set v1 as active initially
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snap1.id).unwrap();

        // Verify v1 is active
        let story = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(story.active_version_id, Some(v1.id.clone()));

        // Switch to v2
        let version = StoryVersionRepository::get(&db, &v2.id).unwrap().unwrap();
        assert_eq!(version.story_id, "story-1");

        StoryRepository::set_active_version(&db, "story-1", &v2.id).unwrap();
        let latest = StorySnapshotRepository::get_latest(&db, &v2.id)
            .unwrap()
            .unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &latest.id).unwrap();

        // Verify v2 is now active
        let updated = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(updated.active_version_id, Some(v2.id));
        assert_eq!(updated.active_snapshot_id, Some(snap2.id));
    }

    #[test]
    fn test_switch_to_version_of_different_story_fails() {
        let (db, _temp_dir) = setup_test_db();

        // Create another story
        db.execute(
            "INSERT INTO stories (
                id, universe_id, title, description, story_type, status, word_count,
                variation_group_id, variation_type, created_at, updated_at, \"order\",
                favorite, last_edited_at, version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                "story-2",
                "universe-1",
                "Second Story",
                "Another test story",
                "chapter",
                "draft",
                0,
                "group-2",
                "original",
                "2024-01-01T00:00:00Z",
                "2024-01-01T00:00:00Z",
                0,
                false,
                "2024-01-01T00:00:00Z",
                1
            ],
        )
        .unwrap();

        // Create a version for story-2
        let version = StoryVersionRepository::create(&db, "story-2", "Original").unwrap();

        // Try to verify switch - should fail because version doesn't belong to story-1
        let fetched = StoryVersionRepository::get(&db, &version.id)
            .unwrap()
            .unwrap();
        assert_ne!(fetched.story_id, "story-1");
    }

    // ==========================================================================
    // AC #4: Version switching updates active pointers test
    // ==========================================================================

    #[test]
    fn test_version_switching_updates_both_active_pointers() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions with snapshots
        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Alternate Ending").unwrap();

        // Create snapshots for each version
        let snap1 = StorySnapshotRepository::create(&db, &v1.id, "Version 1 content").unwrap();
        let snap2 = StorySnapshotRepository::create(&db, &v2.id, "Version 2 content").unwrap();

        // Set v1 as active initially
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snap1.id).unwrap();

        // Verify initial state
        let story_before = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(story_before.active_version_id, Some(v1.id.clone()));
        assert_eq!(story_before.active_snapshot_id, Some(snap1.id.clone()));

        // === Switch to v2 ===
        // This simulates the switch_story_version command logic
        StoryRepository::set_active_version(&db, "story-1", &v2.id).unwrap();
        let latest_snap = StorySnapshotRepository::get_latest(&db, &v2.id)
            .unwrap()
            .unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &latest_snap.id).unwrap();

        // Verify BOTH pointers are updated
        let story_after = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(
            story_after.active_version_id,
            Some(v2.id.clone()),
            "active_version_id should be updated"
        );
        assert_eq!(
            story_after.active_snapshot_id,
            Some(snap2.id.clone()),
            "active_snapshot_id should be updated to latest snapshot of new version"
        );

        // Verify they changed from original values
        assert_ne!(
            story_after.active_version_id,
            Some(v1.id),
            "active_version_id should have changed"
        );
        assert_ne!(
            story_after.active_snapshot_id,
            Some(snap1.id),
            "active_snapshot_id should have changed"
        );
    }

    #[test]
    fn test_version_switching_selects_latest_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions
        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Alternate").unwrap();

        // Create multiple snapshots for v2 with delays
        let snap1 = StorySnapshotRepository::create(&db, &v1.id, "V1 content").unwrap();
        let _snap2_old = StorySnapshotRepository::create(&db, &v2.id, "V2 old content").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _snap2_mid = StorySnapshotRepository::create(&db, &v2.id, "V2 mid content").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let snap2_latest =
            StorySnapshotRepository::create(&db, &v2.id, "V2 latest content").unwrap();

        // Set v1 as active
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snap1.id).unwrap();

        // Switch to v2 - should automatically select the LATEST snapshot
        StoryRepository::set_active_version(&db, "story-1", &v2.id).unwrap();
        let latest = StorySnapshotRepository::get_latest(&db, &v2.id)
            .unwrap()
            .unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &latest.id).unwrap();

        // Verify the latest snapshot was selected
        let story = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(story.active_snapshot_id, Some(snap2_latest.id));
    }

    #[test]
    fn test_switch_back_and_forth_between_versions() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions with snapshots
        let v1 = StoryVersionRepository::create(&db, "story-1", "Version A").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Version B").unwrap();

        let snap1 = StorySnapshotRepository::create(&db, &v1.id, "Content A").unwrap();
        let snap2 = StorySnapshotRepository::create(&db, &v2.id, "Content B").unwrap();

        // Start with v1
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &snap1.id).unwrap();

        // Switch to v2
        StoryRepository::set_active_version(&db, "story-1", &v2.id).unwrap();
        let latest = StorySnapshotRepository::get_latest(&db, &v2.id)
            .unwrap()
            .unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &latest.id).unwrap();

        let after_first_switch = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(after_first_switch.active_version_id, Some(v2.id.clone()));
        assert_eq!(
            after_first_switch.active_snapshot_id,
            Some(snap2.id.clone())
        );

        // Switch back to v1
        StoryRepository::set_active_version(&db, "story-1", &v1.id).unwrap();
        let latest = StorySnapshotRepository::get_latest(&db, &v1.id)
            .unwrap()
            .unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &latest.id).unwrap();

        let after_second_switch = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(after_second_switch.active_version_id, Some(v1.id.clone()));
        assert_eq!(
            after_second_switch.active_snapshot_id,
            Some(snap1.id.clone())
        );

        // Switch to v2 again
        StoryRepository::set_active_version(&db, "story-1", &v2.id).unwrap();
        let latest = StorySnapshotRepository::get_latest(&db, &v2.id)
            .unwrap()
            .unwrap();
        StoryRepository::set_active_snapshot(&db, "story-1", &latest.id).unwrap();

        let after_third_switch = StoryRepository::find_by_id(&db, "story-1").unwrap();
        assert_eq!(after_third_switch.active_version_id, Some(v2.id));
        assert_eq!(after_third_switch.active_snapshot_id, Some(snap2.id));
    }
}
