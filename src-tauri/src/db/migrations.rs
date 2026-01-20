use rusqlite::{Connection, Result};

/// Current database schema version
#[allow(dead_code)]
const SCHEMA_VERSION: i32 = 2;

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

    if current_version < 2 {
        migrate_v2(conn)?;
        conn.execute("INSERT INTO schema_version (version) VALUES (2)", [])?;
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

    // Containers table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS containers (
            id TEXT PRIMARY KEY,
            universe_id TEXT NOT NULL,
            parent_container_id TEXT,
            container_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            \"order\" INTEGER,
            git_repo_path TEXT,
            current_branch TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_container_id) REFERENCES containers(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Stories table - Content-only model
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            universe_id TEXT NOT NULL,
            container_id TEXT,
            story_type TEXT NOT NULL DEFAULT 'chapter',
            status TEXT NOT NULL DEFAULT 'draft',
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            content TEXT NOT NULL DEFAULT '',
            word_count INTEGER NOT NULL DEFAULT 0,
            target_word_count INTEGER,
            notes TEXT,
            outline TEXT,
            \"order\" INTEGER,
            tags TEXT,  -- JSON array
            color TEXT,
            favorite INTEGER DEFAULT 0,
            related_element_ids TEXT,  -- JSON array
            series_name TEXT,
            last_edited_at TEXT NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            variation_group_id TEXT NOT NULL,
            variation_type TEXT NOT NULL DEFAULT 'original',
            parent_variation_id TEXT,
            git_repo_path TEXT NOT NULL DEFAULT '',
            current_branch TEXT NOT NULL DEFAULT 'main',
            staged_changes INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE CASCADE,
            FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE
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
        "CREATE INDEX IF NOT EXISTS idx_containers_universe ON containers(universe_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_containers_parent ON containers(parent_container_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_stories_universe ON stories(universe_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_stories_container ON stories(container_id)",
        [],
    )?;
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

/// Version 2 - Database-only versioning tables
/// Creates story_versions and story_snapshots tables for the new versioning system
fn migrate_v2(conn: &Connection) -> Result<()> {
    // Story versions table - named variations of a story
    conn.execute(
        "CREATE TABLE IF NOT EXISTS story_versions (
            id TEXT PRIMARY KEY NOT NULL,
            story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // Story snapshots table - point-in-time content saves within a version
    conn.execute(
        "CREATE TABLE IF NOT EXISTS story_snapshots (
            id TEXT PRIMARY KEY NOT NULL,
            version_id TEXT NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
            content TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // Create indexes for story_versions
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_story_versions_story_id ON story_versions(story_id)",
        [],
    )?;
    conn.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_story_versions_name ON story_versions(story_id, name)",
        [],
    )?;

    // Create indexes for story_snapshots
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_story_snapshots_version_id ON story_snapshots(version_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_story_snapshots_created_at ON story_snapshots(version_id, created_at DESC)",
        [],
    )?;

    Ok(())
}
