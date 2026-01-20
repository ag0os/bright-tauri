use crate::db::Database;
use crate::models::{CreateStoryInput, Story, UpdateStoryInput};
use crate::repositories::{StoryRepository, StorySnapshotRepository, StoryVersionRepository};
use tauri::State;

/// Create a new story.
///
/// This command creates a story and initializes the versioning system:
/// 1. Creates the story record
/// 2. Creates an "Original" version
/// 3. Creates an initial empty snapshot
/// 4. Sets active_version_id and active_snapshot_id on the story
///
/// All operations are wrapped in a transaction for atomicity.
#[tauri::command]
pub fn create_story(db: State<Database>, input: CreateStoryInput) -> Result<Story, String> {
    // Begin transaction
    {
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        conn.execute("BEGIN TRANSACTION", [])
            .map_err(|e| e.to_string())?;
    }

    // Create the story (this doesn't set active_version_id or active_snapshot_id yet)
    let story = match StoryRepository::create(&db, input) {
        Ok(s) => s,
        Err(e) => {
            // Rollback on error
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }
    };

    // Create the "Original" version
    let version = match StoryVersionRepository::create(&db, &story.id, "Original") {
        Ok(v) => v,
        Err(e) => {
            // Rollback on error
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }
    };

    // Create the initial empty snapshot
    let snapshot = match StorySnapshotRepository::create(&db, &version.id, "") {
        Ok(s) => s,
        Err(e) => {
            // Rollback on error
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }
    };

    // Update the story's active_version_id and active_snapshot_id
    if let Err(e) = StoryRepository::set_active_version(&db, &story.id, &version.id) {
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        let _ = conn.execute("ROLLBACK", []);
        return Err(e.to_string());
    }

    if let Err(e) = StoryRepository::set_active_snapshot(&db, &story.id, &snapshot.id) {
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        let _ = conn.execute("ROLLBACK", []);
        return Err(e.to_string());
    }

    // Commit transaction
    {
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
    }

    // Return the story with inline version and snapshot data populated
    let mut result = StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string())?;
    result.active_version = Some(version);
    result.active_snapshot = Some(snapshot);

    Ok(result)
}

/// Get a story by ID with active version and snapshot populated.
///
/// This command fetches the story and also loads the active_version and active_snapshot
/// inline data so the frontend gets everything in one request.
#[tauri::command]
pub fn get_story(db: State<Database>, id: String) -> Result<Story, String> {
    let mut story = StoryRepository::find_by_id(&db, &id).map_err(|e| e.to_string())?;

    // Populate active_version if present
    if let Some(ref version_id) = story.active_version_id {
        if let Ok(Some(version)) = StoryVersionRepository::get(&db, version_id) {
            story.active_version = Some(version);
        }
    }

    // Populate active_snapshot if present
    if let Some(ref snapshot_id) = story.active_snapshot_id {
        if let Ok(Some(snapshot)) = StorySnapshotRepository::get(&db, snapshot_id) {
            story.active_snapshot = Some(snapshot);
        }
    }

    Ok(story)
}

#[tauri::command]
pub fn list_stories_by_universe(
    db: State<Database>,
    universe_id: String,
) -> Result<Vec<Story>, String> {
    StoryRepository::list_by_universe(&db, &universe_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_story_variations(
    db: State<Database>,
    variation_group_id: String,
) -> Result<Vec<Story>, String> {
    StoryRepository::list_by_variation_group(&db, &variation_group_id).map_err(|e| e.to_string())
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
    use super::*;
    use crate::db::Database;
    use crate::models::{CreateStoryInput, StoryType};
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

    /// Simulates the create_story command logic for testing without Tauri State
    fn create_story_internal(db: &Database, input: CreateStoryInput) -> Result<Story, String> {
        // Begin transaction
        {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            conn.execute("BEGIN TRANSACTION", [])
                .map_err(|e| e.to_string())?;
        }

        // Create the story
        let story = match StoryRepository::create(db, input) {
            Ok(s) => s,
            Err(e) => {
                let conn = db.connection();
                let conn = conn.lock().unwrap();
                let _ = conn.execute("ROLLBACK", []);
                return Err(e.to_string());
            }
        };

        // Create the "Original" version
        let version = match StoryVersionRepository::create(db, &story.id, "Original") {
            Ok(v) => v,
            Err(e) => {
                let conn = db.connection();
                let conn = conn.lock().unwrap();
                let _ = conn.execute("ROLLBACK", []);
                return Err(e.to_string());
            }
        };

        // Create the initial empty snapshot
        let snapshot = match StorySnapshotRepository::create(db, &version.id, "") {
            Ok(s) => s,
            Err(e) => {
                let conn = db.connection();
                let conn = conn.lock().unwrap();
                let _ = conn.execute("ROLLBACK", []);
                return Err(e.to_string());
            }
        };

        // Update the story's active_version_id and active_snapshot_id
        if let Err(e) = StoryRepository::set_active_version(db, &story.id, &version.id) {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }

        if let Err(e) = StoryRepository::set_active_snapshot(db, &story.id, &snapshot.id) {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }

        // Commit transaction
        {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
        }

        // Return the story with inline version and snapshot data populated
        let mut result = StoryRepository::find_by_id(db, &story.id).map_err(|e| e.to_string())?;
        result.active_version = Some(version);
        result.active_snapshot = Some(snapshot);

        Ok(result)
    }

    // ==========================================================================
    // AC #3: Story creation auto-creates version + snapshot test
    // ==========================================================================

    #[test]
    fn test_create_story_auto_creates_version_and_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("My New Story");
        let story = create_story_internal(&db, input).unwrap();

        // Story should have active_version_id set
        assert!(story.active_version_id.is_some(), "active_version_id should be set");

        // Story should have active_snapshot_id set
        assert!(story.active_snapshot_id.is_some(), "active_snapshot_id should be set");

        // active_version should be populated with "Original" version
        assert!(story.active_version.is_some(), "active_version should be populated");
        let version = story.active_version.unwrap();
        assert_eq!(version.name, "Original");
        assert_eq!(version.story_id, story.id);

        // active_snapshot should be populated with empty content
        assert!(story.active_snapshot.is_some(), "active_snapshot should be populated");
        let snapshot = story.active_snapshot.unwrap();
        assert_eq!(snapshot.content, "");
        assert_eq!(snapshot.version_id, version.id);

        // Verify version exists in database
        let versions = StoryVersionRepository::list_by_story(&db, &story.id).unwrap();
        assert_eq!(versions.len(), 1);
        assert_eq!(versions[0].name, "Original");

        // Verify snapshot exists in database
        let snapshots = StorySnapshotRepository::list_by_version(&db, &version.id).unwrap();
        assert_eq!(snapshots.len(), 1);
        assert_eq!(snapshots[0].content, "");
    }

    #[test]
    fn test_create_story_version_and_snapshot_ids_match() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story");
        let story = create_story_internal(&db, input).unwrap();

        // Verify the IDs match between story pointers and inline data
        assert_eq!(
            story.active_version_id,
            story.active_version.as_ref().map(|v| v.id.clone())
        );
        assert_eq!(
            story.active_snapshot_id,
            story.active_snapshot.as_ref().map(|s| s.id.clone())
        );
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

        let version_id = story.active_version_id.clone().unwrap();
        let snapshot_id = story.active_snapshot_id.clone().unwrap();

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
        assert!(snapshot_after.is_none(), "Snapshot should be cascade deleted");
    }

    #[test]
    fn test_delete_story_cascades_multiple_versions_and_snapshots() {
        let (db, _temp_dir) = setup_test_db();

        // Create a story
        let input = create_test_story_input("Complex Story");
        let story = create_story_internal(&db, input).unwrap();

        let version1_id = story.active_version_id.clone().unwrap();

        // Add a second version
        let version2 = StoryVersionRepository::create(&db, &story.id, "Alternate Ending").unwrap();

        // Add multiple snapshots to each version
        let _snap1_2 = StorySnapshotRepository::create(&db, &version1_id, "Version 1 snapshot 2").unwrap();
        let _snap2_1 = StorySnapshotRepository::create(&db, &version2.id, "Version 2 snapshot 1").unwrap();
        let _snap2_2 = StorySnapshotRepository::create(&db, &version2.id, "Version 2 snapshot 2").unwrap();

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
        let snapshots_v1_after = StorySnapshotRepository::list_by_version(&db, &version1_id).unwrap();
        let snapshots_v2_after = StorySnapshotRepository::list_by_version(&db, &version2.id).unwrap();
        assert_eq!(snapshots_v1_after.len(), 0);
        assert_eq!(snapshots_v2_after.len(), 0);
    }
}
