use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

/// Database connection wrapper
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    /// Create a new database connection
    pub fn new(db_path: PathBuf) -> Result<Self> {
        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| {
                rusqlite::Error::InvalidPath(PathBuf::from(format!(
                    "Failed to create database directory: {e}"
                )))
            })?;
        }

        let conn = Connection::open(&db_path)?;

        // Enable foreign keys (this pragma doesn't return results)
        conn.execute("PRAGMA foreign_keys = ON", [])?;

        // Enable WAL mode for better concurrency (use pragma_update since it returns a value)
        conn.pragma_update(None, "journal_mode", "WAL")?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    /// Get a reference to the connection
    pub fn connection(&self) -> Arc<Mutex<Connection>> {
        Arc::clone(&self.conn)
    }

    /// Execute a query that doesn't return rows
    pub fn execute(&self, sql: &str, params: &[&dyn rusqlite::ToSql]) -> Result<usize> {
        let conn = self.conn.lock().unwrap();
        conn.execute(sql, params)
    }

    /// Execute a query and process results
    #[allow(dead_code)]
    pub fn query<T, F>(&self, sql: &str, params: &[&dyn rusqlite::ToSql], f: F) -> Result<Vec<T>>
    where
        F: FnMut(&rusqlite::Row) -> Result<T>,
    {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(sql)?;
        let rows = stmt.query_map(params, f)?;
        rows.collect()
    }

    /// Execute a query and return a single optional result
    #[allow(dead_code)]
    pub fn query_one<T, F>(
        &self,
        sql: &str,
        params: &[&dyn rusqlite::ToSql],
        f: F,
    ) -> Result<Option<T>>
    where
        F: FnOnce(&rusqlite::Row) -> Result<T>,
    {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(sql)?;
        let mut rows = stmt.query(params)?;

        if let Some(row) = rows.next()? {
            Ok(Some(f(row)?))
        } else {
            Ok(None)
        }
    }
}
