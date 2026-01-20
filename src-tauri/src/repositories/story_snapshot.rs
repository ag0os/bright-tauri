use crate::db::Database;
use crate::models::StorySnapshot;
use chrono::Utc;
use rusqlite::{params, Result};
use uuid::Uuid;

pub struct StorySnapshotRepository;

impl StorySnapshotRepository {
    /// Create a new snapshot for a version
    ///
    /// Creates a point-in-time save of content within a story version.
    /// The snapshot is assigned a new UUID and the current timestamp.
    pub fn create(db: &Database, version_id: &str, content: &str) -> Result<StorySnapshot> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        db.execute(
            "INSERT INTO story_snapshots (id, version_id, content, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![&id, version_id, content, &now],
        )?;

        Self::get(db, &id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    /// Get a snapshot by ID
    pub fn get(db: &Database, id: &str) -> Result<Option<StorySnapshot>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let result = conn.query_row(
            "SELECT id, version_id, content, created_at FROM story_snapshots WHERE id = ?1",
            params![id],
            Self::map_row_to_snapshot,
        );

        match result {
            Ok(snapshot) => Ok(Some(snapshot)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Get the most recent snapshot for a version
    ///
    /// Returns the snapshot with the latest created_at timestamp for the given version.
    pub fn get_latest(db: &Database, version_id: &str) -> Result<Option<StorySnapshot>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let result = conn.query_row(
            "SELECT id, version_id, content, created_at
             FROM story_snapshots
             WHERE version_id = ?1
             ORDER BY created_at DESC
             LIMIT 1",
            params![version_id],
            Self::map_row_to_snapshot,
        );

        match result {
            Ok(snapshot) => Ok(Some(snapshot)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// List all snapshots for a version, ordered by created_at DESC (newest first)
    pub fn list_by_version(db: &Database, version_id: &str) -> Result<Vec<StorySnapshot>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, version_id, content, created_at
             FROM story_snapshots
             WHERE version_id = ?1
             ORDER BY created_at DESC",
        )?;

        let snapshots = stmt
            .query_map(params![version_id], Self::map_row_to_snapshot)?
            .collect::<Result<Vec<_>>>()?;

        Ok(snapshots)
    }

    /// Update the content of an existing snapshot
    ///
    /// This is used by the auto-save system to update the current snapshot in place
    /// (30s debounce crash protection).
    pub fn update_content(db: &Database, id: &str, content: &str) -> Result<()> {
        let rows_affected = db.execute(
            "UPDATE story_snapshots SET content = ?1 WHERE id = ?2",
            params![content, id],
        )?;

        if rows_affected == 0 {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }

        Ok(())
    }

    /// Delete a single snapshot by ID
    pub fn delete(db: &Database, id: &str) -> Result<()> {
        let rows_affected = db.execute(
            "DELETE FROM story_snapshots WHERE id = ?1",
            params![id],
        )?;

        if rows_affected == 0 {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }

        Ok(())
    }

    /// Delete the oldest snapshots for a version, keeping only the N most recent
    ///
    /// This implements the retention policy - when creating new snapshots,
    /// older ones are automatically deleted to keep storage bounded.
    ///
    /// Returns the number of snapshots deleted.
    pub fn delete_oldest(db: &Database, version_id: &str, keep_count: i32) -> Result<i32> {
        if keep_count < 0 {
            return Ok(0);
        }

        let conn = db.connection();
        let conn = conn.lock().unwrap();

        // Get the IDs of snapshots to delete (all except the N most recent)
        let mut stmt = conn.prepare(
            "SELECT id FROM story_snapshots
             WHERE version_id = ?1
             ORDER BY created_at DESC
             LIMIT -1 OFFSET ?2",
        )?;

        let ids_to_delete: Vec<String> = stmt
            .query_map(params![version_id, keep_count], |row| row.get(0))?
            .collect::<Result<Vec<_>>>()?;

        drop(stmt);

        let deleted_count = ids_to_delete.len() as i32;

        // Delete the snapshots
        for id in ids_to_delete {
            conn.execute("DELETE FROM story_snapshots WHERE id = ?1", params![&id])?;
        }

        Ok(deleted_count)
    }

    /// Helper function to map a database row to a StorySnapshot struct
    fn map_row_to_snapshot(row: &rusqlite::Row) -> Result<StorySnapshot> {
        Ok(StorySnapshot {
            id: row.get(0)?,
            version_id: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
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
            "INSERT INTO universes (id, name, description, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, ?)",
            params!["universe-1", "Test Universe", "Test", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z", "active"],
        )
        .unwrap();

        // Create a test story
        db.execute(
            "INSERT INTO stories (id, universe_id, title, description, story_type, status, word_count, variation_group_id, variation_type, created_at, updated_at, last_edited_at, version)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                "story-1", "universe-1", "Test Story", "Description", "chapter", "draft", 0,
                "var-group-1", "original", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z", 1
            ],
        )
        .unwrap();

        // Create a test version
        db.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            params!["version-1", "story-1", "Original", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        )
        .unwrap();

        (db, temp_dir)
    }

    // AC #1: create() method: inserts new snapshot record
    #[test]
    fn test_create_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let snapshot = StorySnapshotRepository::create(&db, "version-1", "Once upon a time...").unwrap();

        assert!(!snapshot.id.is_empty());
        assert_eq!(snapshot.version_id, "version-1");
        assert_eq!(snapshot.content, "Once upon a time...");
        assert!(!snapshot.created_at.is_empty());
    }

    #[test]
    fn test_create_snapshot_empty_content() {
        let (db, _temp_dir) = setup_test_db();

        let snapshot = StorySnapshotRepository::create(&db, "version-1", "").unwrap();

        assert_eq!(snapshot.content, "");
    }

    #[test]
    fn test_create_snapshot_invalid_version() {
        let (db, _temp_dir) = setup_test_db();

        // Should fail due to foreign key constraint
        let result = StorySnapshotRepository::create(&db, "nonexistent-version", "content");
        assert!(result.is_err());
    }

    // AC #2: get() method: retrieves snapshot by id
    #[test]
    fn test_get_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let created = StorySnapshotRepository::create(&db, "version-1", "Test content").unwrap();
        let retrieved = StorySnapshotRepository::get(&db, &created.id).unwrap();

        assert!(retrieved.is_some());
        let snapshot = retrieved.unwrap();
        assert_eq!(snapshot.id, created.id);
        assert_eq!(snapshot.version_id, "version-1");
        assert_eq!(snapshot.content, "Test content");
    }

    #[test]
    fn test_get_snapshot_not_found() {
        let (db, _temp_dir) = setup_test_db();

        let result = StorySnapshotRepository::get(&db, "nonexistent-id").unwrap();
        assert!(result.is_none());
    }

    // AC #3: get_latest() method: returns most recent snapshot for a version
    #[test]
    fn test_get_latest_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        // Create multiple snapshots
        let _snapshot1 = StorySnapshotRepository::create(&db, "version-1", "First").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _snapshot2 = StorySnapshotRepository::create(&db, "version-1", "Second").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let snapshot3 = StorySnapshotRepository::create(&db, "version-1", "Third").unwrap();

        let latest = StorySnapshotRepository::get_latest(&db, "version-1").unwrap();

        assert!(latest.is_some());
        let latest = latest.unwrap();
        assert_eq!(latest.id, snapshot3.id);
        assert_eq!(latest.content, "Third");
    }

    #[test]
    fn test_get_latest_snapshot_no_snapshots() {
        let (db, _temp_dir) = setup_test_db();

        let latest = StorySnapshotRepository::get_latest(&db, "version-1").unwrap();
        assert!(latest.is_none());
    }

    // AC #4: list_by_version() method: returns all snapshots for a version ordered by created_at DESC
    #[test]
    fn test_list_by_version() {
        let (db, _temp_dir) = setup_test_db();

        // Create multiple snapshots with slight delays to ensure different timestamps
        let _snapshot1 = StorySnapshotRepository::create(&db, "version-1", "First").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _snapshot2 = StorySnapshotRepository::create(&db, "version-1", "Second").unwrap();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let _snapshot3 = StorySnapshotRepository::create(&db, "version-1", "Third").unwrap();

        let snapshots = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();

        assert_eq!(snapshots.len(), 3);
        // Should be ordered by created_at DESC (newest first)
        assert_eq!(snapshots[0].content, "Third");
        assert_eq!(snapshots[1].content, "Second");
        assert_eq!(snapshots[2].content, "First");
    }

    #[test]
    fn test_list_by_version_empty() {
        let (db, _temp_dir) = setup_test_db();

        let snapshots = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        assert!(snapshots.is_empty());
    }

    #[test]
    fn test_list_by_version_filters_by_version() {
        let (db, _temp_dir) = setup_test_db();

        // Create a second version
        db.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            params!["version-2", "story-1", "Alternate", "2024-01-02T00:00:00Z", "2024-01-02T00:00:00Z"],
        )
        .unwrap();

        // Create snapshots for both versions
        StorySnapshotRepository::create(&db, "version-1", "Version 1 content").unwrap();
        StorySnapshotRepository::create(&db, "version-2", "Version 2 content").unwrap();

        let version1_snapshots = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        let version2_snapshots = StorySnapshotRepository::list_by_version(&db, "version-2").unwrap();

        assert_eq!(version1_snapshots.len(), 1);
        assert_eq!(version2_snapshots.len(), 1);
        assert_eq!(version1_snapshots[0].content, "Version 1 content");
        assert_eq!(version2_snapshots[0].content, "Version 2 content");
    }

    // AC #5: update_content() method: updates snapshot content in place
    #[test]
    fn test_update_content() {
        let (db, _temp_dir) = setup_test_db();

        let snapshot = StorySnapshotRepository::create(&db, "version-1", "Original content").unwrap();

        StorySnapshotRepository::update_content(&db, &snapshot.id, "Updated content").unwrap();

        let updated = StorySnapshotRepository::get(&db, &snapshot.id).unwrap().unwrap();
        assert_eq!(updated.content, "Updated content");
    }

    #[test]
    fn test_update_content_to_empty() {
        let (db, _temp_dir) = setup_test_db();

        let snapshot = StorySnapshotRepository::create(&db, "version-1", "Some content").unwrap();

        StorySnapshotRepository::update_content(&db, &snapshot.id, "").unwrap();

        let updated = StorySnapshotRepository::get(&db, &snapshot.id).unwrap().unwrap();
        assert_eq!(updated.content, "");
    }

    #[test]
    fn test_update_content_not_found() {
        let (db, _temp_dir) = setup_test_db();

        let result = StorySnapshotRepository::update_content(&db, "nonexistent-id", "content");
        assert!(result.is_err());
    }

    // AC #6: delete() method: removes single snapshot
    #[test]
    fn test_delete_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let snapshot = StorySnapshotRepository::create(&db, "version-1", "To be deleted").unwrap();
        let snapshot_id = snapshot.id.clone();

        StorySnapshotRepository::delete(&db, &snapshot_id).unwrap();

        let result = StorySnapshotRepository::get(&db, &snapshot_id).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn test_delete_snapshot_not_found() {
        let (db, _temp_dir) = setup_test_db();

        let result = StorySnapshotRepository::delete(&db, "nonexistent-id");
        assert!(result.is_err());
    }

    // AC #7: delete_oldest() method: removes oldest snapshots keeping N most recent, returns deleted count
    #[test]
    fn test_delete_oldest_keeps_n_most_recent() {
        let (db, _temp_dir) = setup_test_db();

        // Create 5 snapshots with delays to ensure different timestamps
        for i in 1..=5 {
            StorySnapshotRepository::create(&db, "version-1", &format!("Content {}", i)).unwrap();
            std::thread::sleep(std::time::Duration::from_millis(10));
        }

        // Delete oldest, keeping only 2
        let deleted = StorySnapshotRepository::delete_oldest(&db, "version-1", 2).unwrap();

        assert_eq!(deleted, 3);

        let remaining = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        assert_eq!(remaining.len(), 2);
        // Should have the 2 most recent (newest first)
        assert_eq!(remaining[0].content, "Content 5");
        assert_eq!(remaining[1].content, "Content 4");
    }

    #[test]
    fn test_delete_oldest_no_delete_needed() {
        let (db, _temp_dir) = setup_test_db();

        // Create 2 snapshots
        StorySnapshotRepository::create(&db, "version-1", "Content 1").unwrap();
        StorySnapshotRepository::create(&db, "version-1", "Content 2").unwrap();

        // Try to delete oldest, keeping 5 (more than we have)
        let deleted = StorySnapshotRepository::delete_oldest(&db, "version-1", 5).unwrap();

        assert_eq!(deleted, 0);

        let remaining = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        assert_eq!(remaining.len(), 2);
    }

    #[test]
    fn test_delete_oldest_keeps_zero() {
        let (db, _temp_dir) = setup_test_db();

        // Create 3 snapshots
        for i in 1..=3 {
            StorySnapshotRepository::create(&db, "version-1", &format!("Content {}", i)).unwrap();
        }

        // Delete all by keeping 0
        let deleted = StorySnapshotRepository::delete_oldest(&db, "version-1", 0).unwrap();

        assert_eq!(deleted, 3);

        let remaining = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        assert!(remaining.is_empty());
    }

    #[test]
    fn test_delete_oldest_negative_keep_count() {
        let (db, _temp_dir) = setup_test_db();

        StorySnapshotRepository::create(&db, "version-1", "Content").unwrap();

        // Negative keep_count should do nothing
        let deleted = StorySnapshotRepository::delete_oldest(&db, "version-1", -1).unwrap();

        assert_eq!(deleted, 0);

        let remaining = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        assert_eq!(remaining.len(), 1);
    }

    #[test]
    fn test_delete_oldest_only_affects_specified_version() {
        let (db, _temp_dir) = setup_test_db();

        // Create a second version
        db.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            params!["version-2", "story-1", "Alternate", "2024-01-02T00:00:00Z", "2024-01-02T00:00:00Z"],
        )
        .unwrap();

        // Create snapshots for both versions
        for i in 1..=3 {
            StorySnapshotRepository::create(&db, "version-1", &format!("V1 Content {}", i)).unwrap();
            StorySnapshotRepository::create(&db, "version-2", &format!("V2 Content {}", i)).unwrap();
        }

        // Delete oldest from version-1 only
        let deleted = StorySnapshotRepository::delete_oldest(&db, "version-1", 1).unwrap();

        assert_eq!(deleted, 2);

        let v1_remaining = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        let v2_remaining = StorySnapshotRepository::list_by_version(&db, "version-2").unwrap();

        assert_eq!(v1_remaining.len(), 1);
        assert_eq!(v2_remaining.len(), 3); // Version 2 should be untouched
    }

    #[test]
    fn test_cascade_delete_from_version() {
        let (db, _temp_dir) = setup_test_db();

        // Create snapshots for version-1
        StorySnapshotRepository::create(&db, "version-1", "Snapshot 1").unwrap();
        StorySnapshotRepository::create(&db, "version-1", "Snapshot 2").unwrap();

        // Delete the version - should cascade delete snapshots
        db.execute("DELETE FROM story_versions WHERE id = ?1", params!["version-1"]).unwrap();

        let remaining = StorySnapshotRepository::list_by_version(&db, "version-1").unwrap();
        assert!(remaining.is_empty());
    }

    #[test]
    fn test_large_content() {
        let (db, _temp_dir) = setup_test_db();

        // Create a snapshot with large content (100KB)
        let large_content = "A".repeat(100_000);
        let snapshot = StorySnapshotRepository::create(&db, "version-1", &large_content).unwrap();

        let retrieved = StorySnapshotRepository::get(&db, &snapshot.id).unwrap().unwrap();
        assert_eq!(retrieved.content.len(), 100_000);
        assert_eq!(retrieved.content, large_content);
    }
}
