use crate::db::Database;
use crate::models::{Container, MAX_NESTING_DEPTH};
use chrono::Utc;
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
                description, \"order\", created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                &id,
                &universe_id,
                &parent_container_id,
                &container_type,
                &title,
                &description,
                &order,
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
                    description, \"order\", created_at, updated_at
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
                    description, \"order\", created_at, updated_at
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
                    description, \"order\", created_at, updated_at
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
                                       description, \"order\", created_at, updated_at, depth) AS (
                    -- Base case: the root container
                    SELECT id, universe_id, parent_container_id, container_type, title,
                           description, \"order\", created_at, updated_at, 0 as depth
                    FROM containers
                    WHERE id = ?1

                    UNION ALL

                    -- Recursive case: children of containers in the subtree
                    SELECT c.id, c.universe_id, c.parent_container_id, c.container_type, c.title,
                           c.description, c.\"order\", c.created_at, c.updated_at, s.depth + 1
                    FROM containers c
                    INNER JOIN subtree s ON c.parent_container_id = s.id
                    WHERE s.depth < {}
                )
                SELECT id, universe_id, parent_container_id, container_type, title,
                       description, \"order\", created_at, updated_at
                FROM subtree
                ORDER BY depth ASC, \"order\" ASC",
                depth_limit
            )
        } else {
            // Query without depth limit
            "WITH RECURSIVE subtree AS (
                -- Base case: the root container
                SELECT id, universe_id, parent_container_id, container_type, title,
                       description, \"order\", created_at, updated_at
                FROM containers
                WHERE id = ?1

                UNION ALL

                -- Recursive case: children of containers in the subtree
                SELECT c.id, c.universe_id, c.parent_container_id, c.container_type, c.title,
                       c.description, c.\"order\", c.created_at, c.updated_at
                FROM containers c
                INNER JOIN subtree s ON c.parent_container_id = s.id
            )
            SELECT id, universe_id, parent_container_id, container_type, title,
                   description, \"order\", created_at, updated_at
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
    pub fn delete(db: &Database, id: &str) -> Result<Vec<String>> {
        let mut deleted_ids = Vec::new();
        Self::delete_recursive(db, id, &mut deleted_ids)?;
        Ok(deleted_ids)
    }

    /// Helper function to recursively delete a container and its children
    fn delete_recursive(db: &Database, id: &str, deleted_ids: &mut Vec<String>) -> Result<()> {
        // First, get all children of this container
        let children = Self::list_children(db, id)?;

        // Recursively delete each child
        for child in children {
            Self::delete_recursive(db, &child.id, deleted_ids)?;
        }

        // Delete the container itself from the database
        // CASCADE will handle deleting stories in this container
        db.execute("DELETE FROM containers WHERE id = ?1", params![id])?;

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
    ///
    /// Column order:
    /// 0: id, 1: universe_id, 2: parent_container_id, 3: container_type, 4: title,
    /// 5: description, 6: order, 7: created_at, 8: updated_at
    fn map_row_to_container(row: &rusqlite::Row) -> Result<Container> {
        Ok(Container {
            id: row.get(0)?,
            universe_id: row.get(1)?,
            parent_container_id: row.get(2)?,
            container_type: row.get(3)?,
            title: row.get(4)?,
            description: row.get(5)?,
            order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
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
    fn test_container_can_accept_stories_after_children_deleted() {
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

        // Add child container
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

        // Verify parent still exists and has no children
        let _parent_after = ContainerRepository::find_by_id(&db, &parent.id).unwrap();
        let children_after = ContainerRepository::list_children(&db, &parent.id).unwrap();
        assert_eq!(children_after.len(), 0);

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

        // Create a chain up to MAX_NESTING_DEPTH
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
}
