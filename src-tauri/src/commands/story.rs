use crate::db::Database;
use crate::models::{CreateStoryInput, Story, UpdateStoryInput};
use crate::repositories::StoryRepository;
use tauri::State;

/// Create a new story.
///
/// Note: Story creation will eventually also create an "Original" version
/// and initial empty snapshot. This is handled by task-104 (version/snapshot repositories).
#[tauri::command]
pub fn create_story(db: State<Database>, input: CreateStoryInput) -> Result<Story, String> {
    StoryRepository::create(&db, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_story(db: State<Database>, id: String) -> Result<Story, String> {
    StoryRepository::find_by_id(&db, &id).map_err(|e| e.to_string())
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
