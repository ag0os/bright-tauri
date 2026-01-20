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
