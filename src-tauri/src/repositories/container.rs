use crate::db::Database;
use crate::models::Container;
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
}
