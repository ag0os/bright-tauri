use crate::db::Database;
use crate::models::{CreateElementInput, Element, ElementType, UpdateElementInput};
use crate::repositories::ElementRepository;
use tauri::State;

#[tauri::command]
pub fn create_element(db: State<Database>, input: CreateElementInput) -> Result<Element, String> {
    ElementRepository::create(&db, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_element(db: State<Database>, id: String) -> Result<Element, String> {
    ElementRepository::find_by_id(&db, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_elements_by_universe(
    db: State<Database>,
    universe_id: String,
) -> Result<Vec<Element>, String> {
    ElementRepository::list_by_universe(&db, &universe_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_elements_by_type(
    db: State<Database>,
    universe_id: String,
    element_type: ElementType,
) -> Result<Vec<Element>, String> {
    ElementRepository::list_by_type(&db, &universe_id, element_type).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_related_elements(
    db: State<Database>,
    element_id: String,
) -> Result<Vec<(String, Element)>, String> {
    ElementRepository::get_related_elements(&db, &element_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_element(
    db: State<Database>,
    id: String,
    input: UpdateElementInput,
) -> Result<Element, String> {
    ElementRepository::update(&db, &id, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_element(db: State<Database>, id: String) -> Result<(), String> {
    ElementRepository::delete(&db, &id).map_err(|e| e.to_string())
}
