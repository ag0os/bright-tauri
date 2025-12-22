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
    // Transaction sequence:
    // 1. Insert DB row (story)
    // 2. If entity should have git repo (standalone story):
    //    - Initialize git repo
    //    - If git init fails → rollback DB insert, return error
    //    - Update git_repo_path in DB
    //    - If path update fails → delete git repo dir, rollback DB, return error

    // STEP 1: Create the story in the database
    let story = StoryRepository::create(&db, input).map_err(|e| e.to_string())?;

    // Only initialize git repository for standalone stories (container_id = None)
    // Stories within containers share their container's git repo
    if story.should_have_git_repo() {
        // Get app data directory for git repos
        let app_data_dir = app.path().app_data_dir().map_err(|e| {
            // Rollback: Delete the story from database
            let _ = StoryRepository::delete(&db, &story.id);
            format!("Failed to get app data directory: {e}")
        })?;

        // STEP 2: Initialize git repository for the story
        let git_repo_path = GitService::init_repo(&app_data_dir, &story.id).map_err(|e| {
            // Rollback: Delete the story from database
            let _ = StoryRepository::delete(&db, &story.id);
            format!("Failed to initialize git repository: {e}")
        })?;

        // STEP 3: Update the story with the git repo path
        let git_repo_path_str = git_repo_path.to_string_lossy().to_string();
        if let Err(e) = StoryRepository::set_git_repo_path(&db, &story.id, &git_repo_path_str) {
            // Rollback: Delete the git repo directory
            if git_repo_path.exists() {
                let _ = std::fs::remove_dir_all(&git_repo_path);
            }
            // Rollback: Delete the story from database
            let _ = StoryRepository::delete(&db, &story.id);
            return Err(format!("Failed to update git repo path: {e}"));
        }

        // Get current branch from the newly created repo
        let current_branch = GitService::get_current_branch(&git_repo_path).map_err(|e| {
            // Rollback: Delete git repo and story
            if git_repo_path.exists() {
                let _ = std::fs::remove_dir_all(&git_repo_path);
            }
            let _ = StoryRepository::delete(&db, &story.id);
            format!("Failed to get current branch: {e}")
        })?;

        // Update the current branch
        if let Err(e) = StoryRepository::set_current_branch(&db, &story.id, &current_branch) {
            // Rollback: Delete git repo and story
            if git_repo_path.exists() {
                let _ = std::fs::remove_dir_all(&git_repo_path);
            }
            let _ = StoryRepository::delete(&db, &story.id);
            return Err(format!("Failed to update current branch: {e}"));
        }

        // Return the updated story
        return StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string());
    }

    // For stories within containers, just return the created story
    Ok(story)
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
pub fn delete_story(app: AppHandle, db: State<Database>, id: String) -> Result<(), String> {
    // Delete the story
    StoryRepository::delete(&db, &id).map_err(|e| e.to_string())?;

    // Get app data directory for git repos
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {e}"))?;

    // Delete git repository for the story (if it exists)
    let git_repos_dir = app_data_dir.join("git-repos");
    let repo_path = git_repos_dir.join(&id);
    if repo_path.exists() {
        std::fs::remove_dir_all(&repo_path)
            .map_err(|e| format!("Failed to delete git repo for {id}: {e}"))?;
    }

    Ok(())
}

/// Ensure a story has a git repository initialized.
/// This is useful for stories created before git integration was added.
/// Also syncs the current_branch field with the actual git branch.
/// Returns the updated story with the git repo path set.
///
/// Note: Only standalone stories (container_id = None) have their own git repos.
/// Stories within containers share their container's git repo.
#[tauri::command]
pub fn ensure_story_git_repo(
    app: AppHandle,
    db: State<Database>,
    id: String,
) -> Result<Story, String> {
    // Get the story
    let story = StoryRepository::find_by_id(&db, &id).map_err(|e| e.to_string())?;

    // Only standalone stories should have their own git repos
    if !story.should_have_git_repo() {
        return Err(format!(
            "Story '{}' is within a container and shares the container's git repo",
            story.id
        ));
    }

    // If git_repo_path is already set and exists, sync the branch name and return
    if !story.git_repo_path.is_empty() {
        let path = std::path::Path::new(&story.git_repo_path);
        if path.exists() && path.join(".git").exists() {
            // Sync the current branch name from the actual repo
            let actual_branch = GitService::get_current_branch(path)
                .map_err(|e| format!("Failed to get current branch: {e}"))?;

            if actual_branch != story.current_branch {
                StoryRepository::set_current_branch(&db, &story.id, &actual_branch)
                    .map_err(|e| format!("Failed to update current branch: {e}"))?;
                return StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string());
            }

            return Ok(story);
        }
    }

    // Get app data directory for git repos
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {e}"))?;

    // Initialize git repository for the story
    let git_repo_path = GitService::init_repo(&app_data_dir, &story.id)
        .map_err(|e| format!("Failed to initialize git repository: {e}"))?;

    // Update the story with the git repo path
    let git_repo_path_str = git_repo_path.to_string_lossy().to_string();
    StoryRepository::set_git_repo_path(&db, &story.id, &git_repo_path_str)
        .map_err(|e| format!("Failed to update git repo path: {e}"))?;

    // Return the updated story
    StoryRepository::find_by_id(&db, &story.id).map_err(|e| e.to_string())
}
