use crate::db::Database;
use crate::models::{CreateStoryInput, StoryDetail};
use crate::repositories::{StoryRepository, StorySnapshotRepository, StoryVersionRepository};

/// Create a story with full versioning initialization (story + version + snapshot + pointers).
/// All operations are wrapped in a transaction for atomicity.
pub fn create_story(db: &Database, input: CreateStoryInput) -> Result<StoryDetail, String> {
    {
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        conn.execute("BEGIN TRANSACTION", [])
            .map_err(|e| e.to_string())?;
    }

    let story = match StoryRepository::create(db, input) {
        Ok(s) => s,
        Err(e) => {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }
    };

    let version = match StoryVersionRepository::create(db, &story.id, "Original") {
        Ok(v) => v,
        Err(e) => {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }
    };

    let snapshot = match StorySnapshotRepository::create(db, &version.id, "") {
        Ok(s) => s,
        Err(e) => {
            let conn = db.connection();
            let conn = conn.lock().unwrap();
            let _ = conn.execute("ROLLBACK", []);
            return Err(e.to_string());
        }
    };

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

    {
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
    }

    let mut result = StoryRepository::find_by_id(db, &story.id).map_err(|e| e.to_string())?;
    result.active_version = Some(version);
    result.active_snapshot = Some(snapshot);

    StoryDetail::from_story(result)
}

/// Get a story by ID with active version and snapshot populated inline.
pub fn get_story(db: &Database, id: &str) -> Result<StoryDetail, String> {
    let mut story = StoryRepository::find_by_id(db, id).map_err(|e| e.to_string())?;

    if let Some(ref version_id) = story.active_version_id {
        if let Ok(Some(version)) = StoryVersionRepository::get(db, version_id) {
            story.active_version = Some(version);
        }
    }

    if let Some(ref snapshot_id) = story.active_snapshot_id {
        if let Ok(Some(snapshot)) = StorySnapshotRepository::get(db, snapshot_id) {
            story.active_snapshot = Some(snapshot);
        }
    }

    StoryDetail::from_story(story)
}
