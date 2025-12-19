use crate::db::Database;
use crate::git::GitService;
use crate::models::{Container, ContainerChildren, CreateContainerInput, UpdateContainerInput};
use crate::repositories::{ContainerRepository, StoryRepository};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn create_container(
    app: AppHandle,
    db: State<Database>,
    input: CreateContainerInput,
) -> Result<Container, String> {
    // Create the container in the database
    let container = ContainerRepository::create(
        &db,
        input.universe_id,
        input.parent_container_id,
        input.container_type,
        input.title,
        input.description,
        input.order.unwrap_or(0),
    )
    .map_err(|e| e.to_string())?;

    // If this is a leaf container (has no parent or will contain stories),
    // initialize a git repository for it
    // Note: Git initialization will happen when the first story is added,
    // or can be done explicitly by the frontend
    // For now, we just return the container as created

    Ok(container)
}

#[tauri::command]
pub fn get_container(db: State<Database>, id: String) -> Result<Container, String> {
    ContainerRepository::find_by_id(&db, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_containers(
    db: State<Database>,
    universe_id: String,
) -> Result<Vec<Container>, String> {
    ContainerRepository::list_by_universe(&db, &universe_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_container_children(
    db: State<Database>,
    container_id: String,
) -> Result<ContainerChildren, String> {
    // Get child containers
    let containers =
        ContainerRepository::list_children(&db, &container_id).map_err(|e| e.to_string())?;

    // Get stories in this container
    let stories =
        StoryRepository::list_by_container(&db, &container_id).map_err(|e| e.to_string())?;

    Ok(ContainerChildren {
        containers,
        stories,
    })
}

#[tauri::command]
pub fn update_container(
    db: State<Database>,
    id: String,
    input: UpdateContainerInput,
) -> Result<Container, String> {
    ContainerRepository::update(
        &db,
        &id,
        input.title,
        input.description,
        input.container_type,
        input.order,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_container(
    app: AppHandle,
    db: State<Database>,
    id: String,
) -> Result<Vec<String>, String> {
    // Delete the container and all its children
    // The repository handles cascade deletion and git repo cleanup
    ContainerRepository::delete(&db, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reorder_container_children(
    db: State<Database>,
    parent_id: String,
    child_ids: Vec<String>,
) -> Result<(), String> {
    ContainerRepository::reorder_children(&db, &parent_id, child_ids).map_err(|e| e.to_string())
}

/// Ensure a container has a git repository initialized.
/// This is useful for containers that will contain stories.
/// Returns the updated container with the git repo path set.
#[tauri::command]
pub fn ensure_container_git_repo(
    app: AppHandle,
    db: State<Database>,
    id: String,
) -> Result<Container, String> {
    // Get the container
    let container = ContainerRepository::find_by_id(&db, &id).map_err(|e| e.to_string())?;

    // If git_repo_path is already set and exists, sync the branch name and return
    if let Some(ref git_repo_path) = container.git_repo_path {
        let path = std::path::Path::new(git_repo_path);
        if path.exists() && path.join(".git").exists() {
            // Sync the current branch name from the actual repo
            let actual_branch = GitService::get_current_branch(path)
                .map_err(|e| format!("Failed to get current branch: {e}"))?;

            if let Some(ref current_branch) = container.current_branch {
                if actual_branch != *current_branch {
                    ContainerRepository::set_current_branch(&db, &container.id, &actual_branch)
                        .map_err(|e| format!("Failed to update current branch: {e}"))?;
                    return ContainerRepository::find_by_id(&db, &container.id)
                        .map_err(|e| e.to_string());
                }
            }

            return Ok(container);
        }
    }

    // Get app data directory for git repos
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {e}"))?;

    // Initialize git repository for the container
    let git_repo_path = GitService::init_repo(&app_data_dir, &container.id)
        .map_err(|e| format!("Failed to initialize git repository: {e}"))?;

    // Update the container with the git repo path
    let git_repo_path_str = git_repo_path.to_string_lossy().to_string();
    ContainerRepository::set_git_repo_path(&db, &container.id, &git_repo_path_str)
        .map_err(|e| format!("Failed to update git repo path: {e}"))?;

    // Return the updated container
    ContainerRepository::find_by_id(&db, &container.id).map_err(|e| e.to_string())
}
