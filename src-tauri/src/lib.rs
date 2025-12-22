mod commands;
mod db;
mod file_management;
mod file_naming;
mod git;
mod models;
mod repositories;

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
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

            // Ensure the app data directory exists
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

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
            // Container commands
            commands::create_container,
            commands::get_container,
            commands::list_containers,
            commands::list_container_children,
            commands::update_container,
            commands::delete_container,
            commands::reorder_container_children,
            commands::ensure_container_git_repo,
            commands::check_empty_non_leaf_container,
            commands::convert_to_leaf_container,
            // Story commands
            commands::create_story,
            commands::get_story,
            commands::list_stories_by_universe,
            commands::list_story_variations,
            commands::update_story,
            commands::delete_story,
            commands::ensure_story_git_repo,
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
            commands::git_list_branches,
            commands::git_get_current_branch,
            commands::git_resolve_conflict,
            commands::git_abort_merge,
            commands::git_get_conflict_content,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
