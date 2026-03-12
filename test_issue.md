# Foreign Key Constraint Issue Analysis

## Issue Statement
Migration v2 creates tables (story_versions, story_snapshots) AFTER foreign key references to them in v1. 
The stories table in v1 migration has FOREIGN KEY constraints referencing story_versions(id) and story_snapshots(id), 
but these tables don't exist until migrate_v2 runs.

## Facts Verified

1. **PRAGMA foreign_keys is ENABLED**: In `src-tauri/src/db/connection.rs` line 25:
   ```rust
   conn.execute("PRAGMA foreign_keys = ON", [])?;
   ```

2. **Timeline of operations**:
   - Database::new() is called in lib.rs (lines 33-34)
   - This sets `PRAGMA foreign_keys = ON` in connection.rs (line 25)
   - Then migrations::run_migrations() is called on the SAME connection (lib.rs lines 37-39)
   - Migrations run sequentially: v1 first, then v2

3. **SQLite behavior**:
   - SQLite ALLOWS creating a table with FOREIGN KEY constraints to non-existent tables when `PRAGMA foreign_keys = ON`
   - The constraint is NOT enforced during TABLE CREATION
   - The constraint IS enforced during INSERT/UPDATE/DELETE operations
   - NULL values in FK columns bypass the constraint checks

4. **V1 Migration creates stories table** (lines 84-118):
   - Has FK to story_versions(id) and story_snapshots(id) which don't exist yet
   - SQLite permits this table creation (even with pragma enabled)
   
5. **V2 Migration creates the referenced tables** (lines 196-218):
   - Creates story_versions table
   - Creates story_snapshots table
   
6. **Testing**: 
   - All 194 tests pass successfully
   - No foreign key constraint errors occur
   - Data can be inserted with NULL FK values

## Root Cause Analysis
SQLite's PRAGMA foreign_keys design allows defining FK constraints to non-existent tables. 
The constraints are only validated during data operations, not during schema creation.

## Risk Assessment
- Stories table is created with NULL values for active_version_id and active_snapshot_id (default behavior)
- By the time any story data is inserted with non-NULL FK values, v2 migration has run and tables exist
- No runtime FK violations occur because the code only sets these values AFTER the tables exist
- Tests confirm this works correctly

## Conclusion
This is NOT a real issue in practice because:
1. The migration succeeds (table creation allows non-existent FK references)
2. By the time data with non-NULL FK values is inserted, the referenced tables exist
3. All tests pass, including those that create and reference these tables

## Design Note
While technically fragile (relying on SQLite's specific behavior), the current approach works because:
- The application's design ensures referenced tables are created before being used
- FK columns default to NULL, allowing inserts until proper setup is complete
- This is a valid pattern in database schema evolution
