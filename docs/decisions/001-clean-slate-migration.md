# ADR 001: Clean Slate Migration Strategy for Container/Story Refactor

## Status

Accepted

## Date

2024-12-04

## Context

During the development of the Bright Tauri application, a significant architectural refactor was required to properly separate organizational entities (Containers) from content entities (Stories). The original database schema used a single `stories` table that mixed both organizational and content concerns, which created several problems:

1. **Unclear Responsibilities**: The `stories` table tried to serve dual purposes - both as an organizational hierarchy and as content storage
2. **Git Repository Management**: The mixed model made it unclear which entities should own Git repositories
3. **Scalability Concerns**: As the application grew, the mixed model would become increasingly difficult to maintain and reason about
4. **Type Safety**: The dual-purpose table made it harder to enforce type-safe operations specific to containers vs. stories

The refactor introduced two distinct tables:
- `containers` table: For organizational hierarchy (novels, series, collections)
- `stories` table: For pure content (chapters, scenes, poems, etc.)

This raised a critical decision: How to migrate existing data?

## Decision

We chose a **clean slate migration approach**: dropping the old schema entirely and recreating with the new structure.

This means:
- Drop the old `stories` table completely
- Create new `containers` and `stories` tables from scratch
- Users would need to recreate their content (acceptable at this early stage)
- No complex migration scripts or data transformation logic

## Alternatives Considered

### Alternative 1: Incremental Migration with Data Transformation

Write migration code to:
- Analyze existing `stories` records
- Determine which should become containers vs. stories
- Transform and copy data to new tables
- Maintain backward compatibility during transition

**Rejected because:**
- High complexity for early-stage project with no production users
- Risk of data corruption during transformation
- Would require maintaining dual schemas temporarily
- Difficult to test all edge cases without real user data
- Would add technical debt (migration code to maintain)

### Alternative 2: Schema Evolution with Backward Compatibility

Keep the old `stories` table and add new tables alongside:
- New code uses new schema
- Old data remains in old schema
- Gradual migration as data is accessed

**Rejected because:**
- Would require maintaining two code paths indefinitely
- Complex business logic to handle both schemas
- Unclear when old schema could be safely removed
- Would create confusion about which data model is "correct"

### Alternative 3: Feature Flag with Parallel Systems

Implement new schema behind a feature flag:
- Users could opt into new system
- Both systems run in parallel
- Eventually sunset old system

**Rejected because:**
- Massive engineering overhead for a project with no users yet
- Would delay shipping the correct architecture
- Unnecessary complexity at this stage

## Consequences

### Positive

1. **Clean Architecture**: The new schema is clean, well-designed, and purpose-built for the use case
2. **No Technical Debt**: No migration code to maintain or debug
3. **Clear Separation**: Clean distinction between organizational and content entities from day one
4. **Faster Development**: Team can move forward without maintaining backward compatibility
5. **Easier Testing**: Only one schema to test against
6. **Better Type Safety**: Each entity has its own well-defined structure
7. **Simpler Git Integration**: Clear rules about which entities own Git repositories

### Negative

1. **Data Loss for Early Testers**: Any early users would lose their data (mitigated: no production users yet)
2. **No Rollback Path**: Cannot easily revert to old schema if issues arise (mitigated: early stage allows for flexibility)
3. **Fresh Start Required**: Development work using old schema would need to be recreated (acceptable trade-off)

### Neutral

1. **Project Timeline**: No significant impact on timeline - clean slate is actually faster than complex migration
2. **Documentation**: Required updating architecture documentation (which was needed anyway)

## Implementation Details

The clean slate migration was implemented in `src-tauri/src/db/migrations.rs`:

```rust
// Drop old schema
conn.execute("DROP TABLE IF EXISTS stories", [])?;

// Create new schema
conn.execute(
    "CREATE TABLE containers (...)",
    []
)?;

conn.execute(
    "CREATE TABLE stories (...)",
    []
)?;
```

## When Would We Choose Differently?

This decision was appropriate for the current project phase:
- **Early development** with no production users
- **Fundamental architecture change** that would be difficult to incrementally migrate
- **Small team** that can absorb the cost of recreating test data

If circumstances were different, we would choose incremental migration:
- **Production users** with valuable data
- **Minor schema changes** that could be migrated safely
- **Large dataset** where recreation would be impractical
- **Contractual obligations** to preserve data

## References

- Container/Story architecture documented in `CLAUDE.md`
- Database migration code in `src-tauri/src/db/migrations.rs`
- Container model: `src-tauri/src/models/container.rs`
- Story model: `src-tauri/src/models/story.rs`

## Notes

This decision reflects a pragmatic approach for early-stage development: prioritize getting the architecture right over preserving test data. As the project matures and gains users, future schema changes will require more conservative migration strategies.
