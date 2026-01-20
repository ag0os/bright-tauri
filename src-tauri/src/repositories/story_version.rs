use crate::db::Database;
use crate::models::StoryVersion;
use chrono::Utc;
use rusqlite::{params, Result};
use uuid::Uuid;

pub struct StoryVersionRepository;

impl StoryVersionRepository {
    /// Create a new StoryVersion for a story
    ///
    /// Creates a new named version (e.g., "Original", "Alternate Ending") that belongs to a story.
    /// Each version will contain one or more snapshots with the actual content.
    pub fn create(db: &Database, story_id: &str, name: &str) -> Result<StoryVersion> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        db.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![&id, story_id, name, &now, &now],
        )?;

        Self::get(db, &id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    /// Get a StoryVersion by ID
    pub fn get(db: &Database, id: &str) -> Result<Option<StoryVersion>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let result = conn.query_row(
            "SELECT id, story_id, name, created_at, updated_at
             FROM story_versions WHERE id = ?1",
            params![id],
            Self::map_row_to_version,
        );

        match result {
            Ok(version) => Ok(Some(version)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// List all StoryVersions for a story, ordered by creation date (oldest first)
    pub fn list_by_story(db: &Database, story_id: &str) -> Result<Vec<StoryVersion>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, story_id, name, created_at, updated_at
             FROM story_versions
             WHERE story_id = ?1
             ORDER BY created_at ASC",
        )?;

        let versions = stmt
            .query_map(params![story_id], Self::map_row_to_version)?
            .collect::<Result<Vec<_>>>()?;

        Ok(versions)
    }

    /// Rename an existing StoryVersion
    pub fn rename(db: &Database, id: &str, new_name: &str) -> Result<()> {
        let now = Utc::now().to_rfc3339();

        let rows_affected = db.execute(
            "UPDATE story_versions SET name = ?1, updated_at = ?2 WHERE id = ?3",
            params![new_name, &now, id],
        )?;

        if rows_affected == 0 {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }

        Ok(())
    }

    /// Delete a StoryVersion
    ///
    /// Note: This method performs a last-version check to prevent deleting the only version.
    /// A story must always have at least one version. If this is the last version,
    /// deletion will fail with an error.
    pub fn delete(db: &Database, id: &str) -> Result<()> {
        // First, get the story_id for this version
        let story_id = {
            let conn = db.connection();
            let conn = conn.lock().unwrap();

            conn.query_row(
                "SELECT story_id FROM story_versions WHERE id = ?1",
                params![id],
                |row| row.get::<_, String>(0),
            )?
        };

        // Check version count for this story
        let version_count = Self::count_by_story(db, &story_id)?;

        if version_count <= 1 {
            return Err(rusqlite::Error::InvalidParameterName(
                "Cannot delete the last version of a story".to_string(),
            ));
        }

        // Safe to delete - not the last version
        db.execute("DELETE FROM story_versions WHERE id = ?1", params![id])?;

        Ok(())
    }

    /// Count the number of versions for a story
    ///
    /// Used for deletion validation to ensure a story always has at least one version.
    pub fn count_by_story(db: &Database, story_id: &str) -> Result<i32> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM story_versions WHERE story_id = ?1",
            params![story_id],
            |row| row.get(0),
        )?;

        Ok(count)
    }

    /// Helper function to map a row to StoryVersion struct
    fn map_row_to_version(row: &rusqlite::Row) -> Result<StoryVersion> {
        Ok(StoryVersion {
            id: row.get(0)?,
            story_id: row.get(1)?,
            name: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;
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
    fn test_create_version() {
        let (db, _temp_dir) = setup_test_db();

        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();

        assert!(!version.id.is_empty());
        assert_eq!(version.story_id, "story-1");
        assert_eq!(version.name, "Original");
        assert!(!version.created_at.is_empty());
        assert!(!version.updated_at.is_empty());
    }

    #[test]
    fn test_create_multiple_versions() {
        let (db, _temp_dir) = setup_test_db();

        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Alternate Ending").unwrap();
        let v3 = StoryVersionRepository::create(&db, "story-1", "Director's Cut").unwrap();

        // Each version should have unique ID
        assert_ne!(v1.id, v2.id);
        assert_ne!(v2.id, v3.id);
        assert_ne!(v1.id, v3.id);

        // All belong to same story
        assert_eq!(v1.story_id, "story-1");
        assert_eq!(v2.story_id, "story-1");
        assert_eq!(v3.story_id, "story-1");
    }

    #[test]
    fn test_get_version() {
        let (db, _temp_dir) = setup_test_db();

        let created = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let fetched = StoryVersionRepository::get(&db, &created.id).unwrap();

        assert!(fetched.is_some());
        let fetched = fetched.unwrap();
        assert_eq!(fetched.id, created.id);
        assert_eq!(fetched.story_id, created.story_id);
        assert_eq!(fetched.name, created.name);
    }

    #[test]
    fn test_get_nonexistent_version() {
        let (db, _temp_dir) = setup_test_db();

        let result = StoryVersionRepository::get(&db, "nonexistent-id").unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_list_by_story() {
        let (db, _temp_dir) = setup_test_db();

        // Create multiple versions
        StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        StoryVersionRepository::create(&db, "story-1", "Alternate Ending").unwrap();
        StoryVersionRepository::create(&db, "story-1", "Director's Cut").unwrap();

        let versions = StoryVersionRepository::list_by_story(&db, "story-1").unwrap();

        assert_eq!(versions.len(), 3);
        // Should be ordered by creation date (oldest first)
        assert_eq!(versions[0].name, "Original");
        assert_eq!(versions[1].name, "Alternate Ending");
        assert_eq!(versions[2].name, "Director's Cut");
    }

    #[test]
    fn test_list_by_story_empty() {
        let (db, _temp_dir) = setup_test_db();

        let versions = StoryVersionRepository::list_by_story(&db, "story-1").unwrap();
        assert_eq!(versions.len(), 0);
    }

    #[test]
    fn test_list_by_story_different_stories() {
        let (db, _temp_dir) = setup_test_db();

        // Create a second test story
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

        // Create versions for both stories
        StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        StoryVersionRepository::create(&db, "story-1", "Draft 2").unwrap();
        StoryVersionRepository::create(&db, "story-2", "Original").unwrap();

        let story1_versions = StoryVersionRepository::list_by_story(&db, "story-1").unwrap();
        let story2_versions = StoryVersionRepository::list_by_story(&db, "story-2").unwrap();

        assert_eq!(story1_versions.len(), 2);
        assert_eq!(story2_versions.len(), 1);
    }

    #[test]
    fn test_rename_version() {
        let (db, _temp_dir) = setup_test_db();

        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let original_updated_at = version.updated_at.clone();

        // Small delay to ensure timestamp changes
        std::thread::sleep(std::time::Duration::from_millis(10));

        StoryVersionRepository::rename(&db, &version.id, "Final Draft").unwrap();

        let updated = StoryVersionRepository::get(&db, &version.id).unwrap().unwrap();
        assert_eq!(updated.name, "Final Draft");
        // updated_at should have changed
        assert_ne!(updated.updated_at, original_updated_at);
    }

    #[test]
    fn test_rename_nonexistent_version() {
        let (db, _temp_dir) = setup_test_db();

        let result = StoryVersionRepository::rename(&db, "nonexistent-id", "New Name");
        assert!(result.is_err());
    }

    #[test]
    fn test_delete_version() {
        let (db, _temp_dir) = setup_test_db();

        // Create two versions (need at least 2 to delete one)
        let v1 = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let v2 = StoryVersionRepository::create(&db, "story-1", "Draft").unwrap();

        // Delete the second version
        StoryVersionRepository::delete(&db, &v2.id).unwrap();

        // v2 should be gone
        let fetched = StoryVersionRepository::get(&db, &v2.id).unwrap();
        assert!(fetched.is_none());

        // v1 should still exist
        let fetched_v1 = StoryVersionRepository::get(&db, &v1.id).unwrap();
        assert!(fetched_v1.is_some());
    }

    #[test]
    fn test_delete_last_version_fails() {
        let (db, _temp_dir) = setup_test_db();

        // Create only one version
        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();

        // Attempt to delete the last version should fail
        let result = StoryVersionRepository::delete(&db, &version.id);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Cannot delete the last version"));

        // Version should still exist
        let fetched = StoryVersionRepository::get(&db, &version.id).unwrap();
        assert!(fetched.is_some());
    }

    #[test]
    fn test_delete_nonexistent_version() {
        let (db, _temp_dir) = setup_test_db();

        // Try to delete a nonexistent version
        let result = StoryVersionRepository::delete(&db, "nonexistent-id");
        assert!(result.is_err());
    }

    #[test]
    fn test_count_by_story() {
        let (db, _temp_dir) = setup_test_db();

        // Initially no versions
        let count = StoryVersionRepository::count_by_story(&db, "story-1").unwrap();
        assert_eq!(count, 0);

        // Create versions and check count
        StoryVersionRepository::create(&db, "story-1", "Original").unwrap();
        let count = StoryVersionRepository::count_by_story(&db, "story-1").unwrap();
        assert_eq!(count, 1);

        StoryVersionRepository::create(&db, "story-1", "Draft 2").unwrap();
        let count = StoryVersionRepository::count_by_story(&db, "story-1").unwrap();
        assert_eq!(count, 2);

        StoryVersionRepository::create(&db, "story-1", "Draft 3").unwrap();
        let count = StoryVersionRepository::count_by_story(&db, "story-1").unwrap();
        assert_eq!(count, 3);
    }

    #[test]
    fn test_count_by_story_nonexistent_story() {
        let (db, _temp_dir) = setup_test_db();

        // Count for nonexistent story should be 0, not an error
        let count = StoryVersionRepository::count_by_story(&db, "nonexistent-story").unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn test_version_timestamps() {
        let (db, _temp_dir) = setup_test_db();

        let version = StoryVersionRepository::create(&db, "story-1", "Original").unwrap();

        // created_at and updated_at should be set and equal on creation
        assert!(!version.created_at.is_empty());
        assert!(!version.updated_at.is_empty());
        assert_eq!(version.created_at, version.updated_at);

        // After rename, updated_at should change but created_at stays same
        std::thread::sleep(std::time::Duration::from_millis(10));
        StoryVersionRepository::rename(&db, &version.id, "Renamed").unwrap();

        let updated = StoryVersionRepository::get(&db, &version.id).unwrap().unwrap();
        assert_eq!(updated.created_at, version.created_at);
        assert_ne!(updated.updated_at, version.updated_at);
    }
}
