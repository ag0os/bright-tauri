use crate::db::Database;
use crate::models::{Story, StoryVersion};
use crate::repositories::{StoryRepository, StorySnapshotRepository, StoryVersionRepository};

/// Create a new story version with an initial snapshot containing the provided content.
/// Updates the story's active pointers to the new version/snapshot.
pub fn create_story_version(
    db: &Database,
    story_id: &str,
    name: &str,
    content: &str,
) -> Result<StoryVersion, String> {
    let version =
        StoryVersionRepository::create(db, story_id, name).map_err(|e| e.to_string())?;

    let snapshot =
        StorySnapshotRepository::create(db, &version.id, content).map_err(|e| e.to_string())?;

    StoryRepository::set_active_version(db, story_id, &version.id).map_err(|e| e.to_string())?;
    StoryRepository::set_active_snapshot(db, story_id, &snapshot.id)
        .map_err(|e| e.to_string())?;

    Ok(version)
}

/// Delete a story version. Prevents deletion of the last version.
/// If deleting the active version, auto-switches to another version first.
pub fn delete_story_version(db: &Database, version_id: &str) -> Result<(), String> {
    let version = StoryVersionRepository::get(db, version_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Version not found".to_string())?;

    let story_id = version.story_id.clone();

    let version_count =
        StoryVersionRepository::count_by_story(db, &story_id).map_err(|e| e.to_string())?;

    if version_count <= 1 {
        return Err("Cannot delete the last version of a story".to_string());
    }

    let story = StoryRepository::find_by_id(db, &story_id).map_err(|e| e.to_string())?;
    let is_active_version = story.active_version_id.as_ref() == Some(&version_id.to_string());

    if is_active_version {
        let all_versions =
            StoryVersionRepository::list_by_story(db, &story_id).map_err(|e| e.to_string())?;

        let new_active = all_versions
            .iter()
            .filter(|v| v.id != version_id)
            .last()
            .ok_or_else(|| "No other version to switch to".to_string())?;

        StoryRepository::set_active_version(db, &story_id, &new_active.id)
            .map_err(|e| e.to_string())?;

        if let Some(latest_snapshot) =
            StorySnapshotRepository::get_latest(db, &new_active.id).map_err(|e| e.to_string())?
        {
            StoryRepository::set_active_snapshot(db, &story_id, &latest_snapshot.id)
                .map_err(|e| e.to_string())?;
        } else {
            db.execute(
                "UPDATE stories SET active_snapshot_id = NULL WHERE id = ?1",
                rusqlite::params![&story_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    StoryVersionRepository::delete(db, version_id).map_err(|e| e.to_string())?;

    Ok(())
}

/// Switch the active version for a story.
/// Updates both active_version_id and active_snapshot_id (to latest snapshot of new version).
pub fn switch_story_version(
    db: &Database,
    story_id: &str,
    version_id: &str,
) -> Result<Story, String> {
    let version = StoryVersionRepository::get(db, version_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Version not found".to_string())?;

    if version.story_id != story_id {
        return Err("Version does not belong to this story".to_string());
    }

    StoryRepository::set_active_version(db, story_id, version_id).map_err(|e| e.to_string())?;

    let latest_snapshot = StorySnapshotRepository::get_latest(db, version_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "No snapshots found for version".to_string())?;

    StoryRepository::set_active_snapshot(db, story_id, &latest_snapshot.id)
        .map_err(|e| e.to_string())?;

    StoryRepository::find_by_id(db, story_id).map_err(|e| e.to_string())
}
