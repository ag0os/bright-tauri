mod commands;
mod db;
mod git;
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
        .invoke_handler(tauri::generate_handler![
            greet,
            // Universe commands
            commands::create_universe,
            commands::get_universe,
            commands::list_universes,
            commands::update_universe,
            commands::delete_universe,
            // Story commands
            commands::create_story,
            commands::get_story,
            commands::list_stories_by_universe,
            commands::list_story_variations,
            commands::update_story,
            commands::delete_story,
            // Story hierarchy commands
            commands::list_story_children,
            commands::reorder_story_children,
            commands::get_story_with_children,
            // Element commands
            commands::create_element,
            commands::get_element,
            commands::list_elements_by_universe,
            commands::list_elements_by_type,
            commands::get_related_elements,
            commands::update_element,
            commands::delete_element,
            // Git commands
            commands::git_init_repo,
            commands::git_commit_file,
            commands::git_commit_all,
            commands::git_create_branch,
            commands::git_checkout_branch,
            commands::git_diff_branches,
            commands::git_merge_branches,
            commands::git_get_history,
            commands::git_restore_commit,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
