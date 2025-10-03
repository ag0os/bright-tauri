use crate::db::Database;
use crate::models::{CreateUniverseInput, Universe, UpdateUniverseInput};
use crate::repositories::UniverseRepository;
use tauri::State;

#[tauri::command]
pub fn create_universe(
    db: State<Database>,
    input: CreateUniverseInput,
) -> Result<Universe, String> {
    UniverseRepository::create(&db, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_universe(db: State<Database>, id: String) -> Result<Universe, String> {
    UniverseRepository::find_by_id(&db, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_universes(db: State<Database>) -> Result<Vec<Universe>, String> {
    UniverseRepository::list_all(&db).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_universe(
    db: State<Database>,
    id: String,
    input: UpdateUniverseInput,
) -> Result<Universe, String> {
    UniverseRepository::update(&db, &id, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_universe(db: State<Database>, id: String) -> Result<(), String> {
    UniverseRepository::delete(&db, &id).map_err(|e| e.to_string())
}
