use rusqlite::{params, Connection, Result};
use uuid::Uuid;

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
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_container_id) REFERENCES containers(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Stories table - Content-only model with database versioning
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            universe_id TEXT NOT NULL,
            container_id TEXT,
            story_type TEXT NOT NULL DEFAULT 'chapter',
            status TEXT NOT NULL DEFAULT 'draft',
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
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
            active_version_id TEXT,
            active_snapshot_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE CASCADE,
            FOREIGN KEY (container_id) REFERENCES containers(id) ON DELETE CASCADE,
            FOREIGN KEY (active_version_id) REFERENCES story_versions(id),
            FOREIGN KEY (active_snapshot_id) REFERENCES story_snapshots(id)
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

    add_story_column_if_missing(
        conn,
        "active_version_id",
        "TEXT REFERENCES story_versions(id)",
    )?;
    add_story_column_if_missing(
        conn,
        "active_snapshot_id",
        "TEXT REFERENCES story_snapshots(id)",
    )?;

    backfill_existing_stories(conn)?;

    Ok(())
}

fn add_story_column_if_missing(
    conn: &Connection,
    column_name: &str,
    definition: &str,
) -> Result<()> {
    if !table_has_column(conn, "stories", column_name)? {
        conn.execute(
            &format!("ALTER TABLE stories ADD COLUMN {column_name} {definition}"),
            [],
        )?;
    }

    Ok(())
}

fn table_has_column(conn: &Connection, table_name: &str, column_name: &str) -> Result<bool> {
    let mut stmt = conn.prepare(&format!("PRAGMA table_info({table_name})"))?;
    let columns = stmt.query_map([], |row| row.get::<_, String>(1))?;

    for column in columns {
        if column? == column_name {
            return Ok(true);
        }
    }

    Ok(false)
}

fn backfill_existing_stories(conn: &Connection) -> Result<()> {
    let has_legacy_content = table_has_column(conn, "stories", "content")?;

    let select_sql = if has_legacy_content {
        "SELECT id, COALESCE(content, ''), created_at, updated_at, last_edited_at
         FROM stories
         WHERE active_version_id IS NULL OR active_snapshot_id IS NULL"
    } else {
        "SELECT id, '', created_at, updated_at, last_edited_at
         FROM stories
         WHERE active_version_id IS NULL OR active_snapshot_id IS NULL"
    };

    let stories: Vec<(String, String, String, String, String)> = {
        let mut stmt = conn.prepare(select_sql)?;
        let rows = stmt.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
            ))
        })?;

        rows.collect::<Result<Vec<_>>>()?
    };

    for (story_id, content, created_at, updated_at, last_edited_at) in stories {
        let version_id = Uuid::new_v4().to_string();
        let snapshot_id = Uuid::new_v4().to_string();

        conn.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![&version_id, &story_id, "Original", &created_at, &updated_at],
        )?;

        conn.execute(
            "INSERT INTO story_snapshots (id, version_id, content, created_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![&snapshot_id, &version_id, &content, &last_edited_at],
        )?;

        conn.execute(
            "UPDATE stories
             SET active_version_id = ?1, active_snapshot_id = ?2
             WHERE id = ?3",
            params![&version_id, &snapshot_id, &story_id],
        )?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_legacy_v1_database(conn: &Connection) -> Result<()> {
        conn.execute(
            "CREATE TABLE schema_version (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL DEFAULT (datetime('now'))
            )",
            [],
        )?;
        conn.execute("INSERT INTO schema_version (version) VALUES (1)", [])?;

        conn.execute(
            "CREATE TABLE universes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                status TEXT NOT NULL
            )",
            [],
        )?;
        conn.execute(
            "CREATE TABLE stories (
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
                tags TEXT,
                color TEXT,
                favorite INTEGER DEFAULT 0,
                related_element_ids TEXT,
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
                FOREIGN KEY (universe_id) REFERENCES universes(id) ON DELETE CASCADE
            )",
            [],
        )?;

        conn.execute(
            "INSERT INTO universes (id, name, description, created_at, updated_at, status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                "universe-1",
                "Test Universe",
                "Test",
                "2024-01-01T00:00:00Z",
                "2024-01-01T00:00:00Z",
                "active"
            ],
        )?;

        conn.execute(
            "INSERT INTO stories (
                id, universe_id, title, description, content, story_type, status, word_count,
                last_edited_at, version, variation_group_id, variation_type, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            params![
                "story-1",
                "universe-1",
                "Legacy Story",
                "Migrated from v1",
                "{\"root\":{\"children\":[{\"children\":[{\"text\":\"Legacy content\"}]}]}}",
                "chapter",
                "draft",
                2,
                "2024-01-02T00:00:00Z",
                1,
                "variation-group-1",
                "original",
                "2024-01-01T00:00:00Z",
                "2024-01-02T00:00:00Z"
            ],
        )?;

        Ok(())
    }

    #[test]
    fn test_run_migrations_backfills_existing_v1_stories() {
        let conn = Connection::open_in_memory().unwrap();
        setup_legacy_v1_database(&conn).unwrap();

        run_migrations(&conn).unwrap();

        let has_active_version = table_has_column(&conn, "stories", "active_version_id").unwrap();
        let has_active_snapshot = table_has_column(&conn, "stories", "active_snapshot_id").unwrap();
        assert!(has_active_version);
        assert!(has_active_snapshot);

        let (active_version_id, active_snapshot_id): (String, String) = conn
            .query_row(
                "SELECT active_version_id, active_snapshot_id FROM stories WHERE id = ?1",
                params!["story-1"],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .unwrap();

        let version_name: String = conn
            .query_row(
                "SELECT name FROM story_versions WHERE id = ?1",
                params![&active_version_id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(version_name, "Original");

        let snapshot_content: String = conn
            .query_row(
                "SELECT content FROM story_snapshots WHERE id = ?1",
                params![&active_snapshot_id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(
            snapshot_content,
            "{\"root\":{\"children\":[{\"children\":[{\"text\":\"Legacy content\"}]}]}}"
        );
    }
}
