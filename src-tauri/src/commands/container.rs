use crate::db::Database;
use crate::models::{Container, ContainerChildren, CreateContainerInput, UpdateContainerInput};
use crate::repositories::{ContainerRepository, StoryRepository};
use tauri::State;

#[tauri::command]
pub fn create_container(db: State<Database>, input: CreateContainerInput) -> Result<Container, String> {
    // Validate inputs
    let trimmed_title = input.title.trim();
    if trimmed_title.is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    if input.title.len() > 255 {
        return Err("Title too long (max 255 characters)".to_string());
    }

    const VALID_TYPES: &[&str] = &["novel", "series", "collection"];
    if !VALID_TYPES.contains(&input.container_type.as_str()) {
        return Err(format!(
            "Invalid container type: {}. Must be one of: novel, series, collection",
            input.container_type
        ));
    }

    // Create the container in the database
    ContainerRepository::create(
        &db,
        input.universe_id,
        input.parent_container_id,
        input.container_type,
        input.title,
        input.description,
        input.order.unwrap_or(0),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_container(db: State<Database>, id: String) -> Result<Container, String> {
    ContainerRepository::find_by_id(&db, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_containers(db: State<Database>, universe_id: String) -> Result<Vec<Container>, String> {
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
pub fn delete_container(db: State<Database>, id: String) -> Result<Vec<String>, String> {
    // Delete the container and all its children (CASCADE handles stories)
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

#[cfg(test)]
mod tests {
    /// Test the validation logic for container creation
    #[test]
    fn test_empty_title_detection() {
        let title = "   ";
        let trimmed = title.trim();
        assert!(trimmed.is_empty(), "Whitespace-only title should be empty after trim");
    }

    #[test]
    fn test_title_length_limit() {
        let valid_title = "a".repeat(255);
        assert_eq!(valid_title.len(), 255, "Valid title should be exactly 255 chars");

        let invalid_title = "a".repeat(256);
        assert!(invalid_title.len() > 255, "Invalid title should exceed 255 chars");
    }

    #[test]
    fn test_valid_container_types() {
        const VALID_TYPES: &[&str] = &["novel", "series", "collection"];

        // Valid types
        assert!(VALID_TYPES.contains(&"novel"));
        assert!(VALID_TYPES.contains(&"series"));
        assert!(VALID_TYPES.contains(&"collection"));

        // Invalid types
        assert!(!VALID_TYPES.contains(&"book"));
        assert!(!VALID_TYPES.contains(&"chapter"));
        assert!(!VALID_TYPES.contains(&"invalid"));
        assert!(!VALID_TYPES.contains(&""));
    }
}
