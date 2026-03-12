use rusqlite::Connection;

// Simplified version of the migrations
fn test_migration() -> rusqlite::Result<()> {
    let conn = Connection::open_in_memory()?;
    
    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;
    
    println!("Creating stories table with FK to non-existent tables...");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            universe_id TEXT NOT NULL,
            active_version_id TEXT,
            active_snapshot_id TEXT,
            FOREIGN KEY (active_version_id) REFERENCES story_versions(id),
            FOREIGN KEY (active_snapshot_id) REFERENCES story_snapshots(id)
        )",
        [],
    )?;
    
    println!("Creating story_versions table...");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS story_versions (
            id TEXT PRIMARY KEY NOT NULL
        )",
        [],
    )?;
    
    println!("Creating story_snapshots table...");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS story_snapshots (
            id TEXT PRIMARY KEY NOT NULL
        )",
        [],
    )?;
    
    println!("All tables created successfully!");
    Ok(())
}

fn main() {
    match test_migration() {
        Ok(_) => println!("Migration succeeded"),
        Err(e) => println!("Migration failed: {}", e),
    }
}
