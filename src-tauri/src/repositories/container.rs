use crate::db::Database;
use crate::models::{Container, MAX_NESTING_DEPTH};
use chrono::Utc;
use log::warn;
use rusqlite::{params, Result};
use uuid::Uuid;

pub struct ContainerRepository;

impl ContainerRepository {
    /// Create a new Container with leaf protection validation
    ///
    /// If parent_container_id is provided, this method validates that the parent
    /// container doesn't have any stories (leaf protection). A container can contain
    /// either child containers OR stories, but not both.
    pub fn create(
        db: &Database,
        universe_id: String,
        parent_container_id: Option<String>,
        container_type: String,
        title: String,
        description: Option<String>,
        order: i32,
    ) -> Result<Container> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        // Leaf Protection: Check if parent container has stories
        if let Some(ref parent_id) = parent_container_id {
            let story_count = Self::get_story_count(db, parent_id)?;
            if story_count > 0 {
                return Err(rusqlite::Error::InvalidParameterName(
                    "Cannot add child container to a container that already has stories"
                        .to_string(),
                ));
            }
        }

        // Depth Limit: Check if adding this container would exceed max nesting depth
        let depth = Self::calculate_depth(db, parent_container_id.as_deref())?;
        if depth >= MAX_NESTING_DEPTH {
            return Err(rusqlite::Error::InvalidParameterName(
                format!(
                    "Maximum container nesting depth of {} levels exceeded. Current depth: {}",
                    MAX_NESTING_DEPTH, depth
                ),
            ));
        }

        db.execute(
            "INSERT INTO containers (
                id, universe_id, parent_container_id, container_type, title,
                description, \"order\", git_repo_path, current_branch, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                &id,
                &universe_id,
                &parent_container_id,
                &container_type,
                &title,
                &description,
                &order,
                None::<String>, // git_repo_path - will be set when Git is initialized
                None::<String>, // current_branch - will be set when Git is initialized
                &now,
                &now,
            ],
        )?;

        Self::find_by_id(db, &id)
    }

    /// Find a Container by ID
    pub fn find_by_id(db: &Database, id: &str) -> Result<Container> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        conn.query_row(
            "SELECT id, universe_id, parent_container_id, container_type, title,
                    description, \"order\", git_repo_path, current_branch, created_at, updated_at
             FROM containers WHERE id = ?1",
            params![id],
            Self::map_row_to_container,
        )
    }

    /// List all Containers for a Universe
    pub fn list_by_universe(db: &Database, universe_id: &str) -> Result<Vec<Container>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, parent_container_id, container_type, title,
                    description, \"order\", git_repo_path, current_branch, created_at, updated_at
             FROM containers
             WHERE universe_id = ?1
             ORDER BY \"order\" ASC, created_at ASC",
        )?;

        let containers = stmt
            .query_map(params![universe_id], Self::map_row_to_container)?
            .collect::<Result<Vec<_>>>()?;

        Ok(containers)
    }

    /// Get all children of a parent container, ordered by order field
    pub fn list_children(db: &Database, parent_id: &str) -> Result<Vec<Container>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, parent_container_id, container_type, title,
                    description, \"order\", git_repo_path, current_branch, created_at, updated_at
             FROM containers
             WHERE parent_container_id = ?1
             ORDER BY \"order\" ASC, created_at ASC",
        )?;

        let containers = stmt
            .query_map(params![parent_id], Self::map_row_to_container)?
            .collect::<Result<Vec<_>>>()?;

        Ok(containers)
    }

    /// Get the full subtree of containers starting from a given container ID using recursive CTE.
    /// This method efficiently loads an entire container hierarchy in a single query,
    /// avoiding the N+1 query problem when loading deep hierarchies.
    ///
    /// # Arguments
    ///
    /// * `db` - Database connection
    /// * `container_id` - ID of the root container to start the subtree query from
    /// * `max_depth` - Optional maximum depth to traverse (None for unlimited)
    ///
    /// # Returns
    ///
    /// A vector of all containers in the subtree, ordered by hierarchy level and then by order field.
    /// The root container is included as the first element.
    ///
    /// # Performance
    ///
    /// This method uses a recursive Common Table Expression (CTE) to load the entire subtree
    /// in a single database query, which is significantly faster than making multiple queries
    /// for each level of the hierarchy.
    ///
    /// # Example
    ///
    /// ```ignore
    /// // Load entire subtree under a series container
    /// let subtree = ContainerRepository::get_subtree(&db, "series-id", None)?;
    ///
    /// // Load only 3 levels deep
    /// let subtree = ContainerRepository::get_subtree(&db, "series-id", Some(3))?;
    /// ```
    pub fn get_subtree(
        db: &Database,
        container_id: &str,
        max_depth: Option<u32>,
    ) -> Result<Vec<Container>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let query = if let Some(depth_limit) = max_depth {
            // Query with depth limit
            format!(
                "WITH RECURSIVE subtree(id, universe_id, parent_container_id, container_type, title,
                                       description, \"order\", git_repo_path, current_branch,
                                       created_at, updated_at, depth) AS (
                    -- Base case: the root container
                    SELECT id, universe_id, parent_container_id, container_type, title,
                           description, \"order\", git_repo_path, current_branch,
                           created_at, updated_at, 0 as depth
                    FROM containers
                    WHERE id = ?1

                    UNION ALL

                    -- Recursive case: children of containers in the subtree
                    SELECT c.id, c.universe_id, c.parent_container_id, c.container_type, c.title,
                           c.description, c.\"order\", c.git_repo_path, c.current_branch,
                           c.created_at, c.updated_at, s.depth + 1
                    FROM containers c
                    INNER JOIN subtree s ON c.parent_container_id = s.id
                    WHERE s.depth < {}
                )
                SELECT id, universe_id, parent_container_id, container_type, title,
                       description, \"order\", git_repo_path, current_branch, created_at, updated_at
                FROM subtree
                ORDER BY depth ASC, \"order\" ASC",
                depth_limit
            )
        } else {
            // Query without depth limit
            "WITH RECURSIVE subtree AS (
                -- Base case: the root container
                SELECT id, universe_id, parent_container_id, container_type, title,
                       description, \"order\", git_repo_path, current_branch, created_at, updated_at
                FROM containers
                WHERE id = ?1

                UNION ALL

                -- Recursive case: children of containers in the subtree
                SELECT c.id, c.universe_id, c.parent_container_id, c.container_type, c.title,
                       c.description, c.\"order\", c.git_repo_path, c.current_branch,
                       c.created_at, c.updated_at
                FROM containers c
                INNER JOIN subtree s ON c.parent_container_id = s.id
            )
            SELECT id, universe_id, parent_container_id, container_type, title,
                   description, \"order\", git_repo_path, current_branch, created_at, updated_at
            FROM subtree
            ORDER BY \"order\" ASC"
                .to_string()
        };

        let mut stmt = conn.prepare(&query)?;

        let containers = stmt
            .query_map(params![container_id], Self::map_row_to_container)?
            .collect::<Result<Vec<_>>>()?;

        Ok(containers)
    }

    /// Reorder children by updating their order fields
    pub fn reorder_children(
        db: &Database,
        parent_id: &str,
        container_ids: Vec<String>,
    ) -> Result<()> {
        let conn = db.connection();
        let mut conn = conn.lock().unwrap();

        // Start transaction using Rust's transaction API
        let tx = conn.transaction()?;

        // Validate that all container_ids belong to the parent
        for container_id in &container_ids {
            let parent_check: Result<Option<String>, _> = tx.query_row(
                "SELECT parent_container_id FROM containers WHERE id = ?1",
                params![container_id],
                |row| row.get(0),
            );

            match parent_check {
                Ok(Some(pid)) if pid == parent_id => {}
                Ok(Some(_)) | Ok(None) => {
                    // Transaction will automatically rollback on Drop
                    return Err(rusqlite::Error::QueryReturnedNoRows);
                }
                Err(e) => {
                    // Transaction will automatically rollback on Drop
                    return Err(e);
                }
            }
        }

        // Update order for each container
        for (index, container_id) in container_ids.iter().enumerate() {
            tx.execute(
                "UPDATE containers SET \"order\" = ?1 WHERE id = ?2",
                params![index as i32, container_id],
            )?;
        }

        // Commit transaction (automatic rollback on Drop if this is not reached)
        tx.commit()?;

        Ok(())
    }

    /// Update a Container
    pub fn update(
        db: &Database,
        id: &str,
        title: Option<String>,
        description: Option<String>,
        container_type: Option<String>,
        order: Option<i32>,
    ) -> Result<Container> {
        let now = Utc::now().to_rfc3339();

        let mut updates = vec!["updated_at = ?1"];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];

        if let Some(title) = title {
            updates.push("title = ?");
            params_vec.push(Box::new(title));
        }
        if let Some(description) = description {
            updates.push("description = ?");
            params_vec.push(Box::new(description));
        }
        if let Some(container_type) = container_type {
            updates.push("container_type = ?");
            params_vec.push(Box::new(container_type));
        }
        if let Some(order) = order {
            updates.push("\"order\" = ?");
            params_vec.push(Box::new(order));
        }

        let query = format!("UPDATE containers SET {} WHERE id = ?", updates.join(", "));

        params_vec.push(Box::new(id.to_string()));

        let params_refs: Vec<&dyn rusqlite::ToSql> =
            params_vec.iter().map(|b| b.as_ref()).collect();

        db.execute(&query, &params_refs)?;

        Self::find_by_id(db, id)
    }

    /// Delete a Container and all its children recursively
    /// Also removes git repo directory from filesystem if git_repo_path is set
    pub fn delete(db: &Database, id: &str) -> Result<Vec<String>> {
        let mut deleted_ids = Vec::new();
        Self::delete_recursive(db, id, &mut deleted_ids)?;
        Ok(deleted_ids)
    }

    /// Helper function to recursively delete a container and its children
    fn delete_recursive(db: &Database, id: &str, deleted_ids: &mut Vec<String>) -> Result<()> {
        // Get the container before deletion to check for git repo
        let container = Self::find_by_id(db, id)?;

        // First, get all children of this container
        let children = Self::list_children(db, id)?;

        // Recursively delete each child
        for child in children {
            Self::delete_recursive(db, &child.id, deleted_ids)?;
        }

        // Delete the container itself from the database
        // CASCADE will handle deleting stories in this container
        db.execute("DELETE FROM containers WHERE id = ?1", params![id])?;

        // If container has a git repo, remove the directory from filesystem
        if let Some(git_repo_path) = container.git_repo_path {
            if std::path::Path::new(&git_repo_path).exists() {
                if let Err(e) = std::fs::remove_dir_all(&git_repo_path) {
                    warn!(
                        "Failed to remove git repo directory {}: {}. This may result in orphaned files on disk.",
                        git_repo_path, e
                    );
                    // Continue even if filesystem cleanup fails to allow database cleanup to complete.
                    // TODO: Implement a maintenance command to find and remove orphaned git repositories.
                    // This would scan for git repo directories that don't have corresponding database entries.
                }
            }
        }

        // Add the ID to the list of deleted IDs
        deleted_ids.push(id.to_string());

        Ok(())
    }

    /// Get the count of stories in a container (used for leaf protection)
    fn get_story_count(db: &Database, container_id: &str) -> Result<i32> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM stories WHERE container_id = ?1",
            params![container_id],
            |row| row.get(0),
        )?;

        Ok(count)
    }

    /// Calculate the depth of a container in the hierarchy by walking up the parent chain
    /// Returns 0 for root containers (no parent), 1 for direct children of root, etc.
    fn calculate_depth(db: &Database, parent_container_id: Option<&str>) -> Result<u32> {
        let mut depth = 0;
        let mut current_parent = parent_container_id.map(|s| s.to_string());

        while let Some(parent_id) = current_parent {
            depth += 1;
            let parent = Self::find_by_id(db, &parent_id)?;
            current_parent = parent.parent_container_id;
        }

        Ok(depth)
    }

    /// Update the git repo path for a container (internal use)
    pub fn set_git_repo_path(db: &Database, id: &str, git_repo_path: &str) -> Result<()> {
        db.execute(
            "UPDATE containers SET git_repo_path = ?1 WHERE id = ?2",
            params![git_repo_path, id],
        )?;
        Ok(())
    }

    /// Update the current branch for a container (internal use)
    pub fn set_current_branch(db: &Database, id: &str, branch: &str) -> Result<()> {
        db.execute(
            "UPDATE containers SET current_branch = ?1 WHERE id = ?2",
            params![branch, id],
        )?;
        Ok(())
    }

    /// Check if a container is an empty non-leaf container
    ///
    /// An empty non-leaf container is one that:
    /// - Has no git_repo_path (is non-leaf)
    /// - Has no child containers
    /// - Has no stories
    ///
    /// This is the edge case where a container had child containers (became non-leaf),
    /// then all children were deleted, leaving it in limbo - can't have stories without
    /// git initialization.
    pub fn is_empty_non_leaf(db: &Database, id: &str) -> Result<bool> {
        let container = Self::find_by_id(db, id)?;

        // If it has a git repo, it's a leaf container, not the edge case
        if container.git_repo_path.is_some() {
            return Ok(false);
        }

        // Check if it has any child containers
        let child_containers = Self::list_children(db, id)?;
        if !child_containers.is_empty() {
            return Ok(false);
        }

        // Check if it has any stories
        let story_count = Self::get_story_count(db, id)?;
        if story_count > 0 {
            return Ok(false);
        }

        // It's a non-leaf container with no children and no stories
        Ok(true)
    }

    /// Get the count of child containers for a container
    pub fn get_child_container_count(db: &Database, container_id: &str) -> Result<i32> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM containers WHERE parent_container_id = ?1",
            params![container_id],
            |row| row.get(0),
        )?;

        Ok(count)
    }

    /// Helper function to map a row to Container struct
    fn map_row_to_container(row: &rusqlite::Row) -> Result<Container> {
        Ok(Container {
            id: row.get(0)?,
            universe_id: row.get(1)?,
            parent_container_id: row.get(2)?,
            container_type: row.get(3)?,
            title: row.get(4)?,
            description: row.get(5)?,
            order: row.get(6)?,
            git_repo_path: row.get(7)?,
            current_branch: row.get(8)?,
            staged_changes: false, // Not in database yet, default to false
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;
    use crate::models::MAX_NESTING_DEPTH;
    use tempfile::TempDir;

    fn setup_test_db() -> (Database, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let db_path = temp_dir.path().join("test.db");
        let db = Database::new(db_path).unwrap();

        // Run migrations
        let conn = db.connection();
        let conn = conn.lock().unwrap();
        crate::db::migrations::run_migrations(&conn).unwrap();
        drop(conn);

        // Create a test universe
        db.execute(
            "INSERT INTO universes (id, name, description, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, ?)",
            params!["universe-1", "Test Universe", "Test", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z", "active"],
        )
        .unwrap();

        (db, temp_dir)
    }

    #[test]
    fn test_create_root_container() {
        let (db, _temp_dir) = setup_test_db();

        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            Some("A great series".to_string()),
            1,
        )
        .unwrap();

        assert_eq!(container.universe_id, "universe-1");
        assert_eq!(container.title, "My Series");
        assert_eq!(container.container_type, "series");
        assert!(container.parent_container_id.is_none());
        assert_eq!(container.order, 1);
    }

    #[test]
    fn test_create_nested_container() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Create child container
        let child = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            Some("First book".to_string()),
            1,
        )
        .unwrap();

        assert_eq!(child.parent_container_id, Some(parent.id.clone()));
        assert_eq!(child.title, "Book 1");
    }

    #[test]
    fn test_leaf_protection_blocks_child_container() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        // Add a story to the parent container
        db.execute(
            "INSERT INTO stories (id, universe_id, container_id, title, last_edited_at, variation_group_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            params!["story-1", "universe-1", &parent.id, "Chapter 1", "2024-01-01T00:00:00Z", "vg-1", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        )
        .unwrap();

        // Try to create a child container - should fail with leaf protection
        let result = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "chapter".to_string(),
            "Child Container".to_string(),
            None,
            1,
        );

        assert!(result.is_err());
        match result {
            Err(rusqlite::Error::InvalidParameterName(msg)) => {
                assert!(msg.contains(
                    "Cannot add child container to a container that already has stories"
                ));
            }
            _ => panic!("Expected InvalidParameterName error"),
        }
    }

    #[test]
    fn test_add_child_to_empty_container_allowed() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container (empty, no stories)
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        // Should be able to add child container to empty parent
        let result = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "chapter".to_string(),
            "Child Container".to_string(),
            None,
            1,
        );

        assert!(result.is_ok());
        let child = result.unwrap();
        assert_eq!(child.parent_container_id, Some(parent.id));
        assert_eq!(child.title, "Child Container");
    }

    #[test]
    fn test_container_remains_non_leaf_after_losing_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Add child container (parent becomes non-leaf)
        let child = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        // Verify child exists
        let children_before = ContainerRepository::list_children(&db, &parent.id).unwrap();
        assert_eq!(children_before.len(), 1);

        // Delete the child container
        ContainerRepository::delete(&db, &child.id).unwrap();

        // Verify parent still exists and has no children
        let parent_after = ContainerRepository::find_by_id(&db, &parent.id).unwrap();
        let children_after = ContainerRepository::list_children(&db, &parent.id).unwrap();
        assert_eq!(children_after.len(), 0);

        // Parent should still exist but should not automatically get git repo
        // (git_repo_path should remain None unless explicitly initialized)
        assert!(parent_after.git_repo_path.is_none());

        // Parent can now have stories added (since it has no children)
        let story_insert = db.execute(
            "INSERT INTO stories (id, universe_id, container_id, title, last_edited_at, variation_group_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            params!["story-2", "universe-1", &parent.id, "New Story", "2024-01-01T00:00:00Z", "vg-2", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        );
        assert!(story_insert.is_ok());
    }

    #[test]
    fn test_find_by_id() {
        let (db, _temp_dir) = setup_test_db();

        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Test Novel".to_string(),
            Some("Description".to_string()),
            1,
        )
        .unwrap();

        let found = ContainerRepository::find_by_id(&db, &container.id).unwrap();

        assert_eq!(found.id, container.id);
        assert_eq!(found.title, "Test Novel");
        assert_eq!(found.description, Some("Description".to_string()));
    }

    #[test]
    fn test_list_by_universe() {
        let (db, _temp_dir) = setup_test_db();

        // Create multiple containers
        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Series 1".to_string(),
            None,
            2,
        )
        .unwrap();

        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Novel 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let containers = ContainerRepository::list_by_universe(&db, "universe-1").unwrap();

        assert_eq!(containers.len(), 2);
        // Should be ordered by order field
        assert_eq!(containers[0].title, "Novel 1"); // order = 1
        assert_eq!(containers[1].title, "Series 1"); // order = 2
    }

    #[test]
    fn test_list_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Create children
        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let children = ContainerRepository::list_children(&db, &parent.id).unwrap();

        assert_eq!(children.len(), 2);
        // Should be ordered by order field
        assert_eq!(children[0].title, "Book 1"); // order = 1
        assert_eq!(children[1].title, "Book 2"); // order = 2
    }

    #[test]
    fn test_reorder_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Create children
        let child1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let child2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        let child3 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 3".to_string(),
            None,
            3,
        )
        .unwrap();

        // Reorder: child3, child1, child2
        ContainerRepository::reorder_children(
            &db,
            &parent.id,
            vec![child3.id.clone(), child1.id.clone(), child2.id.clone()],
        )
        .unwrap();

        // Verify new order
        let children = ContainerRepository::list_children(&db, &parent.id).unwrap();
        assert_eq!(children[0].id, child3.id);
        assert_eq!(children[1].id, child1.id);
        assert_eq!(children[2].id, child2.id);
    }

    #[test]
    fn test_update_container() {
        let (db, _temp_dir) = setup_test_db();

        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Original Title".to_string(),
            Some("Original description".to_string()),
            1,
        )
        .unwrap();

        let updated = ContainerRepository::update(
            &db,
            &container.id,
            Some("Updated Title".to_string()),
            Some("New description".to_string()),
            None,
            Some(5),
        )
        .unwrap();

        assert_eq!(updated.title, "Updated Title");
        assert_eq!(updated.description, Some("New description".to_string()));
        assert_eq!(updated.order, 5);
        assert_eq!(updated.container_type, "novel"); // unchanged
    }

    #[test]
    fn test_delete_container_without_children() {
        let (db, _temp_dir) = setup_test_db();

        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "To Delete".to_string(),
            None,
            1,
        )
        .unwrap();

        let deleted_ids = ContainerRepository::delete(&db, &container.id).unwrap();

        assert_eq!(deleted_ids.len(), 1);
        assert_eq!(deleted_ids[0], container.id);

        // Container should be deleted
        let result = ContainerRepository::find_by_id(&db, &container.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_delete_container_with_children_cascade() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Create children
        let child1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let child2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Delete parent - should cascade to children
        let deleted_ids = ContainerRepository::delete(&db, &parent.id).unwrap();

        assert_eq!(deleted_ids.len(), 3);
        assert!(deleted_ids.contains(&parent.id));
        assert!(deleted_ids.contains(&child1.id));
        assert!(deleted_ids.contains(&child2.id));

        // All should be deleted
        assert!(ContainerRepository::find_by_id(&db, &parent.id).is_err());
        assert!(ContainerRepository::find_by_id(&db, &child1.id).is_err());
        assert!(ContainerRepository::find_by_id(&db, &child2.id).is_err());
    }

    #[test]
    fn test_delete_container_with_git_repo() {
        let (db, temp_dir) = setup_test_db();

        // Create container
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        // Create a fake git repo directory
        let git_repo_path = temp_dir.path().join("test-repo");
        std::fs::create_dir_all(&git_repo_path).unwrap();
        std::fs::write(git_repo_path.join("test.txt"), "test content").unwrap();

        // Set git repo path
        ContainerRepository::set_git_repo_path(&db, &container.id, git_repo_path.to_str().unwrap())
            .unwrap();

        // Verify directory exists
        assert!(git_repo_path.exists());

        // Delete container - should remove git repo directory
        let deleted_ids = ContainerRepository::delete(&db, &container.id).unwrap();

        assert_eq!(deleted_ids.len(), 1);
        assert_eq!(deleted_ids[0], container.id);

        // Git repo directory should be removed
        assert!(!git_repo_path.exists());

        // Container should be deleted
        assert!(ContainerRepository::find_by_id(&db, &container.id).is_err());
    }

    #[test]
    fn test_nested_hierarchy_queries() {
        let (db, _temp_dir) = setup_test_db();

        // Create three-level hierarchy: Series -> Novel -> (stories would go here)
        let series = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Query children of series
        let series_children = ContainerRepository::list_children(&db, &series.id).unwrap();
        assert_eq!(series_children.len(), 2);
        assert_eq!(series_children[0].id, novel1.id);
        assert_eq!(series_children[1].id, novel2.id);

        // Query children of novels (should be empty)
        let novel1_children = ContainerRepository::list_children(&db, &novel1.id).unwrap();
        assert_eq!(novel1_children.len(), 0);

        // Verify hierarchy relationships
        assert!(series.parent_container_id.is_none());
        assert_eq!(novel1.parent_container_id, Some(series.id.clone()));
        assert_eq!(novel2.parent_container_id, Some(series.id.clone()));
    }

    #[test]
    fn test_set_git_repo_path() {
        let (db, _temp_dir) = setup_test_db();

        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        assert!(container.git_repo_path.is_none());

        ContainerRepository::set_git_repo_path(&db, &container.id, "/path/to/repo").unwrap();

        let updated = ContainerRepository::find_by_id(&db, &container.id).unwrap();
        assert_eq!(updated.git_repo_path, Some("/path/to/repo".to_string()));
    }

    #[test]
    fn test_set_current_branch() {
        let (db, _temp_dir) = setup_test_db();

        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        assert!(container.current_branch.is_none());

        ContainerRepository::set_current_branch(&db, &container.id, "feature-branch").unwrap();

        let updated = ContainerRepository::find_by_id(&db, &container.id).unwrap();
        assert_eq!(updated.current_branch, Some("feature-branch".to_string()));
    }

    #[test]
    fn test_calculate_depth_root_container() {
        let (db, _temp_dir) = setup_test_db();

        // Root container has depth 0
        let depth = ContainerRepository::calculate_depth(&db, None).unwrap();
        assert_eq!(depth, 0);
    }

    #[test]
    fn test_calculate_depth_nested_containers() {
        let (db, _temp_dir) = setup_test_db();

        // Create a chain: root -> level1 -> level2
        let root = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Root".to_string(),
            None,
            1,
        )
        .unwrap();

        let level1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(root.id.clone()),
            "collection".to_string(),
            "Level 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let level2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(level1.id.clone()),
            "novel".to_string(),
            "Level 2".to_string(),
            None,
            1,
        )
        .unwrap();

        // Check depths
        assert_eq!(
            ContainerRepository::calculate_depth(&db, Some(&root.id)).unwrap(),
            1
        ); // Child of root = depth 1
        assert_eq!(
            ContainerRepository::calculate_depth(&db, Some(&level1.id)).unwrap(),
            2
        ); // Child of level1 = depth 2
        assert_eq!(
            ContainerRepository::calculate_depth(&db, Some(&level2.id)).unwrap(),
            3
        ); // Child of level2 = depth 3
    }

    #[test]
    fn test_max_nesting_depth_enforced() {
        let (db, _temp_dir) = setup_test_db();

        // Create a chain up to MAX_NESTING_DEPTH (10 levels: 0-9)
        let mut current_parent: Option<String> = None;
        let mut containers = Vec::new();

        // Create containers up to depth MAX_NESTING_DEPTH - 1 (should succeed)
        for i in 0..MAX_NESTING_DEPTH {
            let container = ContainerRepository::create(
                &db,
                "universe-1".to_string(),
                current_parent.clone(),
                "container".to_string(),
                format!("Level {}", i),
                None,
                1,
            )
            .unwrap();

            containers.push(container.clone());
            current_parent = Some(container.id);
        }

        // Verify we created MAX_NESTING_DEPTH containers
        assert_eq!(containers.len() as u32, MAX_NESTING_DEPTH);

        // Try to create one more level - should fail
        let result = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            current_parent,
            "container".to_string(),
            format!("Level {}", MAX_NESTING_DEPTH),
            None,
            1,
        );

        assert!(result.is_err());
        match result {
            Err(rusqlite::Error::InvalidParameterName(msg)) => {
                assert!(msg.contains("Maximum container nesting depth"));
                assert!(msg.contains(&MAX_NESTING_DEPTH.to_string()));
            }
            _ => panic!("Expected InvalidParameterName error for max depth exceeded"),
        }
    }

    #[test]
    fn test_max_nesting_depth_exact_limit() {
        let (db, _temp_dir) = setup_test_db();

        // Create exactly MAX_NESTING_DEPTH levels (0 to MAX_NESTING_DEPTH-1)
        let mut current_parent: Option<String> = None;

        for i in 0..MAX_NESTING_DEPTH {
            let container = ContainerRepository::create(
                &db,
                "universe-1".to_string(),
                current_parent.clone(),
                "container".to_string(),
                format!("Level {}", i),
                None,
                1,
            )
            .unwrap();

            // Verify the container was created successfully
            assert_eq!(container.title, format!("Level {}", i));
            current_parent = Some(container.id);
        }

        // The last container should be at depth MAX_NESTING_DEPTH - 1
        let last_depth =
            ContainerRepository::calculate_depth(&db, current_parent.as_deref()).unwrap();
        assert_eq!(last_depth, MAX_NESTING_DEPTH);
    }

    #[test]
    fn test_depth_limit_clear_error_message() {
        let (db, _temp_dir) = setup_test_db();

        // Create containers up to max depth
        let mut current_parent: Option<String> = None;
        for i in 0..MAX_NESTING_DEPTH {
            let container = ContainerRepository::create(
                &db,
                "universe-1".to_string(),
                current_parent,
                "container".to_string(),
                format!("Level {}", i),
                None,
                1,
            )
            .unwrap();
            current_parent = Some(container.id);
        }

        // Try to exceed depth and check error message
        let result = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            current_parent,
            "container".to_string(),
            "Too Deep".to_string(),
            None,
            1,
        );

        match result {
            Err(rusqlite::Error::InvalidParameterName(msg)) => {
                // Verify error message contains both max depth and current depth
                assert!(msg.contains("Maximum container nesting depth"));
                assert!(msg.contains(&format!("{}", MAX_NESTING_DEPTH)));
                assert!(msg.contains("Current depth"));
            }
            _ => panic!("Expected clear error message about max depth"),
        }
    }

    #[test]
    fn test_is_empty_non_leaf_with_leaf_container() {
        let (db, _temp_dir) = setup_test_db();

        // Create a container and set git repo (making it a leaf)
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        ContainerRepository::set_git_repo_path(&db, &container.id, "/path/to/repo").unwrap();

        // Should not be an empty non-leaf (it's a leaf container)
        let result = ContainerRepository::is_empty_non_leaf(&db, &container.id).unwrap();
        assert!(!result);
    }

    #[test]
    fn test_is_empty_non_leaf_with_child_containers() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container (no git repo)
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Add child container
        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        // Should not be an empty non-leaf (has children)
        let result = ContainerRepository::is_empty_non_leaf(&db, &parent.id).unwrap();
        assert!(!result);
    }

    #[test]
    fn test_is_empty_non_leaf_with_stories() {
        let (db, _temp_dir) = setup_test_db();

        // Create container (no git repo)
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "My Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        // Add a story
        db.execute(
            "INSERT INTO stories (id, universe_id, container_id, title, last_edited_at, variation_group_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            params!["story-1", "universe-1", &container.id, "Chapter 1", "2024-01-01T00:00:00Z", "vg-1", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        )
        .unwrap();

        // Should not be an empty non-leaf (has stories)
        let result = ContainerRepository::is_empty_non_leaf(&db, &container.id).unwrap();
        assert!(!result);
    }

    #[test]
    fn test_is_empty_non_leaf_true_case() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Add child container (parent becomes non-leaf)
        let child = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        // Delete the child container
        ContainerRepository::delete(&db, &child.id).unwrap();

        // Verify parent has no git repo, no children, no stories
        let parent_after = ContainerRepository::find_by_id(&db, &parent.id).unwrap();
        assert!(parent_after.git_repo_path.is_none());

        let children = ContainerRepository::list_children(&db, &parent.id).unwrap();
        assert_eq!(children.len(), 0);

        let story_count = ContainerRepository::get_story_count(&db, &parent.id).unwrap();
        assert_eq!(story_count, 0);

        // Should be an empty non-leaf container (the edge case!)
        let result = ContainerRepository::is_empty_non_leaf(&db, &parent.id).unwrap();
        assert!(result);
    }

    #[test]
    fn test_get_child_container_count() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent container
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Initially no children
        let count = ContainerRepository::get_child_container_count(&db, &parent.id).unwrap();
        assert_eq!(count, 0);

        // Add child containers
        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Should have 2 children
        let count = ContainerRepository::get_child_container_count(&db, &parent.id).unwrap();
        assert_eq!(count, 2);
    }

    #[test]
    fn test_is_empty_non_leaf_after_deleting_all_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent with multiple children
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let child1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let child2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Parent is not empty non-leaf (has children)
        assert!(!ContainerRepository::is_empty_non_leaf(&db, &parent.id).unwrap());

        // Delete first child
        ContainerRepository::delete(&db, &child1.id).unwrap();

        // Still has one child, not empty
        assert!(!ContainerRepository::is_empty_non_leaf(&db, &parent.id).unwrap());

        // Delete second child
        ContainerRepository::delete(&db, &child2.id).unwrap();

        // Now it should be an empty non-leaf container
        assert!(ContainerRepository::is_empty_non_leaf(&db, &parent.id).unwrap());
    }

    #[test]
    fn test_get_subtree_single_container() {
        let (db, _temp_dir) = setup_test_db();

        // Create a single container with no children
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Standalone Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        // Get subtree should return just the container itself
        let subtree = ContainerRepository::get_subtree(&db, &container.id, None).unwrap();

        assert_eq!(subtree.len(), 1);
        assert_eq!(subtree[0].id, container.id);
        assert_eq!(subtree[0].title, "Standalone Novel");
    }

    #[test]
    fn test_get_subtree_two_levels() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "My Series".to_string(),
            None,
            1,
        )
        .unwrap();

        // Create children
        let child1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let child2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Get subtree
        let subtree = ContainerRepository::get_subtree(&db, &parent.id, None).unwrap();

        // Should return parent + 2 children = 3 containers
        assert_eq!(subtree.len(), 3);

        // Parent should be first
        assert_eq!(subtree[0].id, parent.id);
        assert_eq!(subtree[0].title, "My Series");

        // Children should follow, ordered by order field
        assert_eq!(subtree[1].id, child1.id);
        assert_eq!(subtree[1].title, "Book 1");
        assert_eq!(subtree[2].id, child2.id);
        assert_eq!(subtree[2].title, "Book 2");
    }

    #[test]
    fn test_get_subtree_three_levels() {
        let (db, _temp_dir) = setup_test_db();

        // Create three-level hierarchy: Series -> Novels -> Parts
        let series = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Epic Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            None,
            2,
        )
        .unwrap();

        let part1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(novel1.id.clone()),
            "collection".to_string(),
            "Part 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let part2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(novel1.id.clone()),
            "collection".to_string(),
            "Part 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Get full subtree
        let subtree = ContainerRepository::get_subtree(&db, &series.id, None).unwrap();

        // Should return series + 2 novels + 2 parts = 5 containers
        assert_eq!(subtree.len(), 5);

        // Verify all containers are present
        let ids: Vec<&str> = subtree.iter().map(|c| c.id.as_str()).collect();
        assert!(ids.contains(&series.id.as_str()));
        assert!(ids.contains(&novel1.id.as_str()));
        assert!(ids.contains(&novel2.id.as_str()));
        assert!(ids.contains(&part1.id.as_str()));
        assert!(ids.contains(&part2.id.as_str()));

        // Series should be first (root)
        assert_eq!(subtree[0].id, series.id);
    }

    #[test]
    fn test_get_subtree_with_depth_limit() {
        let (db, _temp_dir) = setup_test_db();

        // Create three-level hierarchy
        let series = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Epic Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let _part = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(novel.id.clone()),
            "collection".to_string(),
            "Part 1".to_string(),
            None,
            1,
        )
        .unwrap();

        // Get subtree with depth limit of 1 (series + immediate children only)
        let subtree = ContainerRepository::get_subtree(&db, &series.id, Some(1)).unwrap();

        // Should return series + novel (depth 0 and 1), but not part (depth 2)
        assert_eq!(subtree.len(), 2);
        assert_eq!(subtree[0].id, series.id);
        assert_eq!(subtree[1].id, novel.id);

        // Get subtree with depth limit of 0 (just the root)
        let subtree = ContainerRepository::get_subtree(&db, &series.id, Some(0)).unwrap();

        // Should return only the series
        assert_eq!(subtree.len(), 1);
        assert_eq!(subtree[0].id, series.id);

        // Get subtree with depth limit of 2 (all levels)
        let subtree = ContainerRepository::get_subtree(&db, &series.id, Some(2)).unwrap();

        // Should return all 3 containers
        assert_eq!(subtree.len(), 3);
    }

    #[test]
    fn test_get_subtree_complex_hierarchy() {
        let (db, _temp_dir) = setup_test_db();

        // Create complex hierarchy:
        // Series
        //   ├── Novel 1
        //   │   ├── Part 1
        //   │   └── Part 2
        //   └── Novel 2
        //       └── Part 3
        let series = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Novel 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let novel2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Novel 2".to_string(),
            None,
            2,
        )
        .unwrap();

        let part1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(novel1.id.clone()),
            "collection".to_string(),
            "Part 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let part2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(novel1.id.clone()),
            "collection".to_string(),
            "Part 2".to_string(),
            None,
            2,
        )
        .unwrap();

        let part3 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(novel2.id.clone()),
            "collection".to_string(),
            "Part 3".to_string(),
            None,
            1,
        )
        .unwrap();

        // Get full subtree
        let subtree = ContainerRepository::get_subtree(&db, &series.id, None).unwrap();

        // Should return all 6 containers
        assert_eq!(subtree.len(), 6);

        // Verify all containers are present
        let ids: Vec<&str> = subtree.iter().map(|c| c.id.as_str()).collect();
        assert!(ids.contains(&series.id.as_str()));
        assert!(ids.contains(&novel1.id.as_str()));
        assert!(ids.contains(&novel2.id.as_str()));
        assert!(ids.contains(&part1.id.as_str()));
        assert!(ids.contains(&part2.id.as_str()));
        assert!(ids.contains(&part3.id.as_str()));

        // Get subtree from novel1 (should include novel1 and its parts)
        let novel1_subtree = ContainerRepository::get_subtree(&db, &novel1.id, None).unwrap();
        assert_eq!(novel1_subtree.len(), 3); // novel1 + 2 parts

        // Verify all expected containers are present in novel1's subtree
        let novel1_ids: Vec<&str> = novel1_subtree.iter().map(|c| c.id.as_str()).collect();
        assert!(novel1_ids.contains(&novel1.id.as_str()));
        assert!(novel1_ids.contains(&part1.id.as_str()));
        assert!(novel1_ids.contains(&part2.id.as_str()));

        // Get subtree from novel2 (should include novel2 and part3)
        let novel2_subtree = ContainerRepository::get_subtree(&db, &novel2.id, None).unwrap();
        assert_eq!(novel2_subtree.len(), 2); // novel2 + 1 part

        // Verify all expected containers are present in novel2's subtree
        let novel2_ids: Vec<&str> = novel2_subtree.iter().map(|c| c.id.as_str()).collect();
        assert!(novel2_ids.contains(&novel2.id.as_str()));
        assert!(novel2_ids.contains(&part3.id.as_str()));
    }

    #[test]
    fn test_get_subtree_nonexistent_container() {
        let (db, _temp_dir) = setup_test_db();

        // Try to get subtree for non-existent container
        let subtree = ContainerRepository::get_subtree(&db, "non-existent-id", None).unwrap();

        // Should return empty vector
        assert_eq!(subtree.len(), 0);
    }

    #[test]
    fn test_get_subtree_performance_vs_multiple_queries() {
        use std::time::Instant;

        let (db, _temp_dir) = setup_test_db();

        // Create a moderately deep hierarchy (4 levels, 31 total containers)
        // Level 0: 1 series
        // Level 1: 2 novels
        // Level 2: 4 collections (2 per novel)
        // Level 3: 8 parts (2 per collection)
        // Total: 1 + 2 + 4 + 8 = 15 containers

        let series = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let mut novels = Vec::new();
        for i in 1..=2 {
            let novel = ContainerRepository::create(
                &db,
                "universe-1".to_string(),
                Some(series.id.clone()),
                "novel".to_string(),
                format!("Novel {}", i),
                None,
                i,
            )
            .unwrap();
            novels.push(novel);
        }

        let mut collections = Vec::new();
        for (i, novel) in novels.iter().enumerate() {
            for j in 1..=2 {
                let collection = ContainerRepository::create(
                    &db,
                    "universe-1".to_string(),
                    Some(novel.id.clone()),
                    "collection".to_string(),
                    format!("Collection {}-{}", i + 1, j),
                    None,
                    j,
                )
                .unwrap();
                collections.push(collection);
            }
        }

        for (i, collection) in collections.iter().enumerate() {
            for j in 1..=2 {
                ContainerRepository::create(
                    &db,
                    "universe-1".to_string(),
                    Some(collection.id.clone()),
                    "part".to_string(),
                    format!("Part {}-{}", i + 1, j),
                    None,
                    j,
                )
                .unwrap();
            }
        }

        // Benchmark: Single recursive CTE query
        let start = Instant::now();
        let subtree_single = ContainerRepository::get_subtree(&db, &series.id, None).unwrap();
        let single_query_duration = start.elapsed();

        // Benchmark: Multiple queries (simulating N+1 problem)
        let start = Instant::now();
        let mut all_containers = Vec::new();

        // Manual traversal using multiple queries
        fn collect_recursive(
            db: &Database,
            container_id: &str,
            all_containers: &mut Vec<Container>,
        ) -> Result<()> {
            let container = ContainerRepository::find_by_id(db, container_id)?;
            all_containers.push(container);

            let children = ContainerRepository::list_children(db, container_id)?;
            for child in children {
                collect_recursive(db, &child.id, all_containers)?;
            }

            Ok(())
        }

        collect_recursive(&db, &series.id, &mut all_containers).unwrap();
        let multiple_queries_duration = start.elapsed();

        // Verify both approaches return the same number of containers
        assert_eq!(subtree_single.len(), all_containers.len());
        assert_eq!(subtree_single.len(), 15); // 1 + 2 + 4 + 8 = 15

        // Single query should be faster (or at worst, comparable)
        // Note: In development/test mode with small datasets, the difference might be minimal
        // The real benefit shows with deeper hierarchies and production databases
        println!("Single CTE query: {:?}", single_query_duration);
        println!("Multiple queries: {:?}", multiple_queries_duration);
        println!(
            "Performance improvement: {:.2}x",
            multiple_queries_duration.as_nanos() as f64 / single_query_duration.as_nanos() as f64
        );

        // The CTE approach should use fewer queries
        // In this case: 1 query vs 15 queries (one for each container)
        // This assertion just verifies both methods work correctly
        assert!(subtree_single.len() > 0);
        assert_eq!(subtree_single.len(), all_containers.len());
    }

    #[test]
    fn test_concurrent_container_creation_same_parent() {
        use std::sync::Arc;
        use std::thread;

        let (db, _temp_dir) = setup_test_db();
        let db = Arc::new(db);

        // Create parent container
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Parent Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let parent_id = Arc::new(parent.id.clone());

        // Spawn multiple threads to create containers concurrently
        let mut handles = vec![];
        for i in 0..5 {
            let db_clone = Arc::clone(&db);
            let parent_id_clone = Arc::clone(&parent_id);

            let handle = thread::spawn(move || {
                ContainerRepository::create(
                    &db_clone,
                    "universe-1".to_string(),
                    Some(parent_id_clone.to_string()),
                    "novel".to_string(),
                    format!("Novel {}", i),
                    None,
                    i,
                )
            });
            handles.push(handle);
        }

        // Collect results
        let mut results = vec![];
        for handle in handles {
            results.push(handle.join().unwrap());
        }

        // All should succeed
        assert_eq!(results.iter().filter(|r| r.is_ok()).count(), 5);

        // Verify all containers were created with unique IDs
        let children = ContainerRepository::list_children(&db, &parent_id).unwrap();
        assert_eq!(children.len(), 5);

        // Verify all IDs are unique
        let mut ids: Vec<String> = children.iter().map(|c| c.id.clone()).collect();
        ids.sort();
        ids.dedup();
        assert_eq!(ids.len(), 5);
    }

    #[test]
    fn test_reorder_with_invalid_container_ids() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent with children
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Parent Series".to_string(),
            None,
            1,
        )
        .unwrap();

        let child1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Novel 1".to_string(),
            None,
            1,
        )
        .unwrap();

        let _child2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Novel 2".to_string(),
            None,
            2,
        )
        .unwrap();

        // Create another parent with a different child
        let other_parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Other Series".to_string(),
            None,
            2,
        )
        .unwrap();

        let other_child = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(other_parent.id.clone()),
            "novel".to_string(),
            "Other Novel".to_string(),
            None,
            1,
        )
        .unwrap();

        // Try to reorder parent's children using a child from other_parent
        let result = ContainerRepository::reorder_children(
            &db,
            &parent.id,
            vec![child1.id.clone(), other_child.id.clone()],
        );

        // Should fail because other_child doesn't belong to parent
        assert!(result.is_err());
        assert!(matches!(result, Err(rusqlite::Error::QueryReturnedNoRows)));
    }

    #[test]
    fn test_full_series_workflow() {
        let (db, _temp_dir) = setup_test_db();

        // Create series container (will have child containers, so no git repo)
        let series = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Epic Series".to_string(),
            Some("A grand series of novels".to_string()),
            1,
        )
        .unwrap();

        assert!(series.git_repo_path.is_none());

        // Create 2 novel containers under series (each gets git repo)
        let novel1 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 1".to_string(),
            Some("First book".to_string()),
            1,
        )
        .unwrap();

        let novel2 = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(series.id.clone()),
            "novel".to_string(),
            "Book 2".to_string(),
            Some("Second book".to_string()),
            2,
        )
        .unwrap();

        // Verify series has no git repo (non-leaf)
        let series_after_children = ContainerRepository::find_by_id(&db, &series.id).unwrap();
        assert!(series_after_children.git_repo_path.is_none());

        // Create chapters (stories) under each novel
        use crate::models::CreateStoryInput;
        use crate::models::StoryType;
        use crate::repositories::StoryRepository;

        // Novel 1 chapters
        for i in 1..=3 {
            let story_input = CreateStoryInput {
                universe_id: "universe-1".to_string(),
                title: format!("Chapter {}", i),
                description: Some(format!("Chapter {} of Book 1", i)),
                story_type: Some(StoryType::Chapter),
                content: Some(format!("Content of chapter {}", i)),
                notes: None,
                outline: None,
                target_word_count: None,
                tags: None,
                color: None,
                series_name: None,
                container_id: Some(novel1.id.clone()),
                variation_type: None,
                parent_variation_id: None,
            };

            StoryRepository::create(&db, story_input).unwrap();
        }

        // Novel 2 chapters
        for i in 1..=2 {
            let story_input = CreateStoryInput {
                universe_id: "universe-1".to_string(),
                title: format!("Chapter {}", i),
                description: Some(format!("Chapter {} of Book 2", i)),
                story_type: Some(StoryType::Chapter),
                content: Some(format!("Content of chapter {}", i)),
                notes: None,
                outline: None,
                target_word_count: None,
                tags: None,
                color: None,
                series_name: None,
                container_id: Some(novel2.id.clone()),
                variation_type: None,
                parent_variation_id: None,
            };

            StoryRepository::create(&db, story_input).unwrap();
        }

        // Verify hierarchy
        let series_children = ContainerRepository::list_children(&db, &series.id).unwrap();
        assert_eq!(series_children.len(), 2);

        let novel1_stories = StoryRepository::list_by_container(&db, &novel1.id).unwrap();
        assert_eq!(novel1_stories.len(), 3);

        let novel2_stories = StoryRepository::list_by_container(&db, &novel2.id).unwrap();
        assert_eq!(novel2_stories.len(), 2);

        // Delete series - should cascade delete all
        let deleted_ids = ContainerRepository::delete(&db, &series.id).unwrap();

        // Should have deleted: series + novel1 + novel2 = 3 containers
        assert_eq!(deleted_ids.len(), 3);
        assert!(deleted_ids.contains(&series.id));
        assert!(deleted_ids.contains(&novel1.id));
        assert!(deleted_ids.contains(&novel2.id));

        // Verify all containers are deleted
        assert!(ContainerRepository::find_by_id(&db, &series.id).is_err());
        assert!(ContainerRepository::find_by_id(&db, &novel1.id).is_err());
        assert!(ContainerRepository::find_by_id(&db, &novel2.id).is_err());

        // Verify stories are also deleted (CASCADE)
        assert_eq!(
            StoryRepository::list_by_container(&db, &novel1.id).unwrap().len(),
            0
        );
        assert_eq!(
            StoryRepository::list_by_container(&db, &novel2.id).unwrap().len(),
            0
        );
    }
}
