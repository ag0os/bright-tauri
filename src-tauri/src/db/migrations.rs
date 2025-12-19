use rusqlite::{Connection, Result};

/// Current database schema version
#[allow(dead_code)]
const SCHEMA_VERSION: i32 = 1;

/// Run all database migrations
pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Create schema_version table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // Get current version
    let current_version: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Apply migrations sequentially
    if current_version < 1 {
        migrate_v1(conn)?;
        conn.execute("INSERT INTO schema_version (version) VALUES (1)", [])?;
    }

    Ok(())
}

/// Initial schema - Version 1
/// Creates tables for Universe and Element domain models
/// NOTE: Stories table removed - will be recreated in container/story refactor
fn migrate_v1(conn: &Connection) -> Result<()> {
    // Universes table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS universes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            genre TEXT,
            tone TEXT,
            worldbuilding_notes TEXT,
            themes TEXT, -- JSON array
            status TEXT NOT NULL,
            color TEXT,
            icon TEXT,
            tags TEXT -- JSON array
        )",
        [],
    )?;

    // Elements table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS elements (
            id TEXT PRIMARY KEY,
            universe_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            element_type TEXT NOT NULL,
            custom_type_name TEXT,
            details TEXT,
            attributes TEXT, -- JSON object for flexible key-value pairs
            image_url TEXT,
            tags TEXT, -- JSON array
            related_story_ids TEXT, -- JSON array
            color TEXT,
            icon TEXT,
            favorite INTEGER,
            \"order\" INTEGER,
            FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Element relationships table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS element_relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_element_id TEXT NOT NULL,
            target_element_id TEXT NOT NULL,
            label TEXT NOT NULL,
            inverse_label TEXT,
            description TEXT,
            FOREIGN KEY (source_element_id) REFERENCES elements(id) ON DELETE CASCADE,
            FOREIGN KEY (target_element_id) REFERENCES elements(id) ON DELETE CASCADE,
            UNIQUE(source_element_id, target_element_id, label)
        )",
        [],
    )?;

    // Create indices for better query performance
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_elements_universe ON elements(universe_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_element_relationships_source ON element_relationships(source_element_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_element_relationships_target ON element_relationships(target_element_id)",
        [],
    )?;

    Ok(())
}
