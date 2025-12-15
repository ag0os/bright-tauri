use crate::db::Database;
use crate::git::GitService;
use crate::models::{CreateStoryInput, Story, UpdateStoryInput};
use crate::repositories::StoryRepository;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn create_story(
    app: AppHandle,
    db: State<Database>,
    input: CreateStoryInput,
) -> Result<Story, String> {
    // Create the story in the database
    let story = StoryRepository::create(&db, input).map_err(|e| e.to_string())?;

    // Get app data directory for git repos
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Initialize git repository for the story
    let git_repo_path = GitService::init_repo(&app_data_dir, &story.id)
        .map_err(|e| format!("Failed to initialize git repository: {}", e))?;

    // Update the story with the git repo path
    let git_repo_path_str = git_repo_path.to_string_lossy().to_string();
    StoryRepository::set_git_repo_path(&db, &story.id, &git_repo_path_str)
        .map_err(|e| format!("Failed to update git repo path: {}", e))?;

    // Return the updated story
    StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string())
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
    StoryRepository::delete(&db, &id).map_err(|e| e.to_string())
}

// Story hierarchy commands

#[tauri::command]
pub fn list_story_children(db: State<Database>, parent_id: String) -> Result<Vec<Story>, String> {
    StoryRepository::list_children(&db, &parent_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reorder_story_children(
    db: State<Database>,
    parent_id: String,
    story_ids: Vec<String>,
) -> Result<(), String> {
    StoryRepository::reorder_children(&db, &parent_id, story_ids).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_story_with_children(
    db: State<Database>,
    id: String,
) -> Result<(Story, Vec<Story>), String> {
    StoryRepository::get_with_children(&db, &id).map_err(|e| e.to_string())
}

/// Ensure a story has a git repository initialized.
/// This is useful for stories created before git integration was added.
/// Also syncs the current_branch field with the actual git branch.
/// Returns the updated story with the git repo path set.
#[tauri::command]
pub fn ensure_story_git_repo(
    app: AppHandle,
    db: State<Database>,
    id: String,
) -> Result<Story, String> {
    // Get the story
    let story = StoryRepository::find_by_id(&db, &id).map_err(|e| e.to_string())?;

    // If git_repo_path is already set and exists, sync the branch name and return
    if !story.git_repo_path.is_empty() {
        let path = std::path::Path::new(&story.git_repo_path);
        if path.exists() && path.join(".git").exists() {
            // Sync the current branch name from the actual repo
            let actual_branch = GitService::get_current_branch(path)
                .map_err(|e| format!("Failed to get current branch: {}", e))?;

            if actual_branch != story.current_branch {
                StoryRepository::set_current_branch(&db, &story.id, &actual_branch)
                    .map_err(|e| format!("Failed to update current branch: {}", e))?;
                return StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string());
            }

            return Ok(story);
        }
    }

    // Get app data directory for git repos
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Initialize git repository for the story
    let git_repo_path = GitService::init_repo(&app_data_dir, &story.id)
        .map_err(|e| format!("Failed to initialize git repository: {}", e))?;

    // Update the story with the git repo path
    let git_repo_path_str = git_repo_path.to_string_lossy().to_string();
    StoryRepository::set_git_repo_path(&db, &story.id, &git_repo_path_str)
        .map_err(|e| format!("Failed to update git repo path: {}", e))?;

    // Return the updated story
    StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string())
}
