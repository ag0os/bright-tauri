mod db;
mod models;
mod repositories;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Create database path
            let db_path = app_data_dir.join("bright.db");

            // Initialize database
            let database =
                db::Database::new(db_path).expect("Failed to create database connection");

            // Run migrations
            let conn = database.connection();
            let conn = conn.lock().unwrap();
            db::migrations::run_migrations(&conn).expect("Failed to run migrations");
            drop(conn);

            // Store database in app state
            app.manage(database);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
