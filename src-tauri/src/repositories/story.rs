use crate::db::Database;
use crate::models::{
    CreateStoryInput, Story, StoryStatus, StoryType, UpdateStoryInput, VariationType,
};
use chrono::Utc;
use rusqlite::{params, Result};
use uuid::Uuid;

pub struct StoryRepository;

impl StoryRepository {
    /// Create a new Story
    pub fn create(db: &Database, input: CreateStoryInput) -> Result<Story> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        // Generate variation_group_id if this is a new story (not a variation)
        let variation_group_id = Uuid::new_v4().to_string();

        // Use serde serialization to get correct kebab-case format (e.g., "short-story")
        let story_type_str = input
            .story_type
            .map(|st| {
                serde_json::to_string(&st)
                    .unwrap()
                    .trim_matches('"')
                    .to_string()
            })
            .unwrap_or_else(|| "novel".to_string());
        let variation_type_str = input
            .variation_type
            .map(|vt| {
                serde_json::to_string(&vt)
                    .unwrap()
                    .trim_matches('"')
                    .to_string()
            })
            .unwrap_or_else(|| "original".to_string());
        let tags_json = input.tags.map(|t| serde_json::to_string(&t).unwrap());

        db.execute(
            "INSERT INTO stories (
                id, universe_id, title, description, story_type, status, word_count,
                content, variation_group_id, variation_type, parent_variation_id,
                git_repo_path, current_branch, staged_changes, created_at, updated_at,
                notes, outline, target_word_count, \"order\", tags, color, favorite,
                related_element_ids, series_name, parent_story_id, last_edited_at, version
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28)",
            params![
                &id,
                &input.universe_id,
                &input.title,
                &input.description,
                &story_type_str,
                "draft",
                0,
                &input.content.unwrap_or_default(),
                &variation_group_id,
                &variation_type_str,
                &input.parent_variation_id,
                "",  // git_repo_path - will be set when Git integration is implemented
                "main",  // current_branch
                false,  // staged_changes
                &now,
                &now,
                &input.notes,
                &input.outline,
                &input.target_word_count,
                0,  // story_order
                &tags_json,
                &input.color,
                false,  // favorite
                None::<String>,  // related_element_ids
                &input.series_name,
                &input.parent_story_id,
                &now,  // last_edited_at
                1,  // version
            ],
        )?;

        Self::find_by_id(db, &id)
    }

    /// Find a Story by ID
    pub fn find_by_id(db: &Database, id: &str) -> Result<Story> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        conn.query_row(
            "SELECT id, universe_id, title, description, story_type, status, word_count,
                    content, variation_group_id, variation_type, parent_variation_id,
                    git_repo_path, current_branch, staged_changes, created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, parent_story_id, last_edited_at, version
             FROM stories WHERE id = ?1",
            params![id],
            Self::map_row_to_story,
        )
    }

    /// List all Stories for a Universe
    pub fn list_by_universe(db: &Database, universe_id: &str) -> Result<Vec<Story>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, title, description, story_type, status, word_count,
                    content, variation_group_id, variation_type, parent_variation_id,
                    git_repo_path, current_branch, staged_changes, created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, parent_story_id, last_edited_at, version
             FROM stories
             WHERE universe_id = ?1
             ORDER BY updated_at DESC",
        )?;

        let stories = stmt
            .query_map(params![universe_id], Self::map_row_to_story)?
            .collect::<Result<Vec<_>>>()?;

        Ok(stories)
    }

    /// Get all variations in a variation group
    pub fn list_by_variation_group(db: &Database, variation_group_id: &str) -> Result<Vec<Story>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, title, description, story_type, status, word_count,
                    content, variation_group_id, variation_type, parent_variation_id,
                    git_repo_path, current_branch, staged_changes, created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, parent_story_id, last_edited_at, version
             FROM stories
             WHERE variation_group_id = ?1
             ORDER BY created_at ASC",
        )?;

        let stories = stmt
            .query_map(params![variation_group_id], Self::map_row_to_story)?
            .collect::<Result<Vec<_>>>()?;

        Ok(stories)
    }

    /// Get all children of a parent story, ordered by story_order
    pub fn list_children(db: &Database, parent_id: &str) -> Result<Vec<Story>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, title, description, story_type, status, word_count,
                    content, variation_group_id, variation_type, parent_variation_id,
                    git_repo_path, current_branch, staged_changes, created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, parent_story_id, last_edited_at, version
             FROM stories
             WHERE parent_story_id = ?1
             ORDER BY \"order\" ASC, created_at ASC",
        )?;

        let stories = stmt
            .query_map(params![parent_id], Self::map_row_to_story)?
            .collect::<Result<Vec<_>>>()?;

        Ok(stories)
    }

    /// Get a parent story with all its children
    pub fn get_with_children(db: &Database, id: &str) -> Result<(Story, Vec<Story>)> {
        let parent = Self::find_by_id(db, id)?;
        let children = Self::list_children(db, id)?;
        Ok((parent, children))
    }

    /// Reorder children by updating their order fields
    pub fn reorder_children(db: &Database, parent_id: &str, story_ids: Vec<String>) -> Result<()> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        // Start transaction
        conn.execute("BEGIN TRANSACTION", [])?;

        // Validate that all story_ids belong to the parent
        for story_id in &story_ids {
            let parent_check: Result<Option<String>, _> = conn.query_row(
                "SELECT parent_story_id FROM stories WHERE id = ?1",
                params![story_id],
                |row| row.get(0),
            );

            match parent_check {
                Ok(Some(pid)) if pid == parent_id => {}
                Ok(Some(_)) | Ok(None) => {
                    conn.execute("ROLLBACK", [])?;
                    return Err(rusqlite::Error::QueryReturnedNoRows);
                }
                Err(e) => {
                    conn.execute("ROLLBACK", [])?;
                    return Err(e);
                }
            }
        }

        // Update order for each story
        for (index, story_id) in story_ids.iter().enumerate() {
            conn.execute(
                "UPDATE stories SET \"order\" = ?1 WHERE id = ?2",
                params![index as u32, story_id],
            )?;
        }

        // Commit transaction
        conn.execute("COMMIT", [])?;

        Ok(())
    }

    /// Update a Story
    pub fn update(db: &Database, id: &str, input: UpdateStoryInput) -> Result<Story> {
        let now = Utc::now().to_rfc3339();

        // Use serde serialization to get correct kebab-case/lowercase format
        let story_type_str = input.story_type.map(|st| {
            serde_json::to_string(&st)
                .unwrap()
                .trim_matches('"')
                .to_string()
        });
        let status_str = input.status.map(|s| {
            serde_json::to_string(&s)
                .unwrap()
                .trim_matches('"')
                .to_string()
        });
        let tags_json = input.tags.map(|t| serde_json::to_string(&t).unwrap());
        let related_elements_json = input
            .related_element_ids
            .map(|ids| serde_json::to_string(&ids).unwrap());

        let mut updates = vec!["updated_at = ?1"];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];

        if let Some(title) = input.title {
            updates.push("title = ?");
            params_vec.push(Box::new(title));
        }
        if let Some(description) = input.description {
            updates.push("description = ?");
            params_vec.push(Box::new(description));
        }
        if let Some(story_type) = story_type_str {
            updates.push("story_type = ?");
            params_vec.push(Box::new(story_type));
        }
        if let Some(status) = status_str {
            updates.push("status = ?");
            params_vec.push(Box::new(status));
        }
        if let Some(content) = input.content {
            updates.push("content = ?");
            params_vec.push(Box::new(content));
        }
        if let Some(notes) = input.notes {
            updates.push("notes = ?");
            params_vec.push(Box::new(notes));
        }
        if let Some(outline) = input.outline {
            updates.push("outline = ?");
            params_vec.push(Box::new(outline));
        }
        if let Some(target_wc) = input.target_word_count {
            updates.push("target_word_count = ?");
            params_vec.push(Box::new(target_wc));
        }
        if let Some(order) = input.order {
            updates.push("\"order\" = ?");
            params_vec.push(Box::new(order));
        }
        if let Some(tags) = tags_json {
            updates.push("tags = ?");
            params_vec.push(Box::new(tags));
        }
        if let Some(color) = input.color {
            updates.push("color = ?");
            params_vec.push(Box::new(color));
        }
        if let Some(favorite) = input.favorite {
            updates.push("favorite = ?");
            params_vec.push(Box::new(favorite));
        }
        if let Some(related_elements) = related_elements_json {
            updates.push("related_element_ids = ?");
            params_vec.push(Box::new(related_elements));
        }
        if let Some(series_name) = input.series_name {
            updates.push("series_name = ?");
            params_vec.push(Box::new(series_name));
        }

        let query = format!("UPDATE stories SET {} WHERE id = ?", updates.join(", "));

        params_vec.push(Box::new(id.to_string()));

        let params_refs: Vec<&dyn rusqlite::ToSql> =
            params_vec.iter().map(|b| b.as_ref()).collect();

        db.execute(&query, &params_refs)?;

        Self::find_by_id(db, id)
    }

    /// Delete a Story and all its children recursively
    /// Returns a list of all deleted story IDs (including the parent)
    pub fn delete(db: &Database, id: &str) -> Result<Vec<String>> {
        let mut deleted_ids = Vec::new();
        Self::delete_recursive(db, id, &mut deleted_ids)?;
        Ok(deleted_ids)
    }

    /// Helper function to recursively delete a story and its children
    fn delete_recursive(db: &Database, id: &str, deleted_ids: &mut Vec<String>) -> Result<()> {
        // First, get all children of this story
        let children = Self::list_children(db, id)?;

        // Recursively delete each child
        for child in children {
            Self::delete_recursive(db, &child.id, deleted_ids)?;
        }

        // Delete the story itself from the database
        db.execute("DELETE FROM stories WHERE id = ?1", params![id])?;

        // Add the ID to the list of deleted IDs
        deleted_ids.push(id.to_string());

        Ok(())
    }

    /// Get the count of direct children for a story
    pub fn get_child_count(db: &Database, parent_id: &str) -> Result<i32> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM stories WHERE parent_story_id = ?1",
            params![parent_id],
            |row| row.get(0),
        )?;

        Ok(count)
    }

    /// Update the git repo path for a story (internal use)
    pub fn set_git_repo_path(db: &Database, id: &str, git_repo_path: &str) -> Result<()> {
        db.execute(
            "UPDATE stories SET git_repo_path = ?1 WHERE id = ?2",
            params![git_repo_path, id],
        )?;
        Ok(())
    }

    /// Update the current branch for a story (internal use)
    pub fn set_current_branch(db: &Database, id: &str, branch: &str) -> Result<()> {
        db.execute(
            "UPDATE stories SET current_branch = ?1 WHERE id = ?2",
            params![branch, id],
        )?;
        Ok(())
    }

    /// Helper function to map a row to Story struct
    fn map_row_to_story(row: &rusqlite::Row) -> Result<Story> {
        let story_type_str: String = row.get(4)?;
        let status_str: String = row.get(5)?;
        let variation_type_str: String = row.get(9)?;
        let tags_json: Option<String> = row.get(20)?;
        let related_elements_json: Option<String> = row.get(23)?;

        let story_type: StoryType = serde_json::from_str(&format!("\"{story_type_str}\"")).unwrap();
        let status: StoryStatus = serde_json::from_str(&format!("\"{status_str}\"")).unwrap();
        let variation_type: VariationType =
            serde_json::from_str(&format!("\"{variation_type_str}\"")).unwrap();
        let tags = tags_json.and_then(|s| serde_json::from_str(&s).ok());
        let related_element_ids = related_elements_json.and_then(|s| serde_json::from_str(&s).ok());

        Ok(Story {
            id: row.get(0)?,
            universe_id: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            story_type,
            status,
            word_count: row.get(6)?,
            content: row.get(7)?,
            variation_group_id: row.get(8)?,
            variation_type,
            parent_variation_id: row.get(10)?,
            git_repo_path: row.get(11)?,
            current_branch: row.get(12)?,
            staged_changes: row.get(13)?,
            created_at: row.get(14)?,
            updated_at: row.get(15)?,
            notes: row.get(16)?,
            outline: row.get(17)?,
            target_word_count: row.get(18)?,
            order: row.get(19)?,
            tags,
            color: row.get(21)?,
            favorite: row.get(22)?,
            related_element_ids,
            series_name: row.get(24)?,
            parent_story_id: row.get(25)?,
            last_edited_at: row.get(26)?,
            version: row.get(27)?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;
    use crate::models::{CreateStoryInput, StoryType};
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
    fn test_delete_story_without_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create a story
        let input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Test Story".to_string(),
            description: Some("Test".to_string()),
            story_type: Some(StoryType::Novel),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: None,
            variation_type: None,
            parent_variation_id: None,
        };

        let story = StoryRepository::create(&db, input).unwrap();

        // Delete the story
        let deleted_ids = StoryRepository::delete(&db, &story.id).unwrap();

        // Should return only the deleted story ID
        assert_eq!(deleted_ids.len(), 1);
        assert_eq!(deleted_ids[0], story.id);

        // Story should be deleted
        let result = StoryRepository::find_by_id(&db, &story.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_delete_story_with_single_child() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent story
        let parent_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Parent Story".to_string(),
            description: Some("Parent".to_string()),
            story_type: Some(StoryType::Novel),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: None,
            variation_type: None,
            parent_variation_id: None,
        };

        let parent = StoryRepository::create(&db, parent_input).unwrap();

        // Create child story
        let child_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Child Story".to_string(),
            description: Some("Child".to_string()),
            story_type: Some(StoryType::Chapter),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: Some(parent.id.clone()),
            variation_type: None,
            parent_variation_id: None,
        };

        let child = StoryRepository::create(&db, child_input).unwrap();

        // Delete the parent story
        let deleted_ids = StoryRepository::delete(&db, &parent.id).unwrap();

        // Should return both IDs (child first, then parent)
        assert_eq!(deleted_ids.len(), 2);
        assert!(deleted_ids.contains(&child.id));
        assert!(deleted_ids.contains(&parent.id));

        // Both should be deleted
        assert!(StoryRepository::find_by_id(&db, &parent.id).is_err());
        assert!(StoryRepository::find_by_id(&db, &child.id).is_err());
    }

    #[test]
    fn test_delete_story_with_nested_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent story
        let parent_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Novel".to_string(),
            description: Some("Novel".to_string()),
            story_type: Some(StoryType::Novel),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: None,
            variation_type: None,
            parent_variation_id: None,
        };

        let parent = StoryRepository::create(&db, parent_input).unwrap();

        // Create child story (chapter)
        let child1_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Chapter 1".to_string(),
            description: Some("Chapter".to_string()),
            story_type: Some(StoryType::Chapter),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: Some(parent.id.clone()),
            variation_type: None,
            parent_variation_id: None,
        };

        let child1 = StoryRepository::create(&db, child1_input).unwrap();

        // Create grandchild story (scene)
        let grandchild_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Scene 1".to_string(),
            description: Some("Scene".to_string()),
            story_type: Some(StoryType::Scene),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: Some(child1.id.clone()),
            variation_type: None,
            parent_variation_id: None,
        };

        let grandchild = StoryRepository::create(&db, grandchild_input).unwrap();

        // Create second child
        let child2_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Chapter 2".to_string(),
            description: Some("Chapter".to_string()),
            story_type: Some(StoryType::Chapter),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: Some(parent.id.clone()),
            variation_type: None,
            parent_variation_id: None,
        };

        let child2 = StoryRepository::create(&db, child2_input).unwrap();

        // Delete the parent story
        let deleted_ids = StoryRepository::delete(&db, &parent.id).unwrap();

        // Should return all IDs (grandchild, child1, child2, parent)
        assert_eq!(deleted_ids.len(), 4);
        assert!(deleted_ids.contains(&grandchild.id));
        assert!(deleted_ids.contains(&child1.id));
        assert!(deleted_ids.contains(&child2.id));
        assert!(deleted_ids.contains(&parent.id));

        // All should be deleted
        assert!(StoryRepository::find_by_id(&db, &parent.id).is_err());
        assert!(StoryRepository::find_by_id(&db, &child1.id).is_err());
        assert!(StoryRepository::find_by_id(&db, &child2.id).is_err());
        assert!(StoryRepository::find_by_id(&db, &grandchild.id).is_err());
    }

    #[test]
    fn test_get_child_count_no_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create a story without children
        let input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Test Story".to_string(),
            description: Some("Test".to_string()),
            story_type: Some(StoryType::Novel),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: None,
            variation_type: None,
            parent_variation_id: None,
        };

        let story = StoryRepository::create(&db, input).unwrap();

        // Get child count
        let count = StoryRepository::get_child_count(&db, &story.id).unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn test_get_child_count_with_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent story
        let parent_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Parent Story".to_string(),
            description: Some("Parent".to_string()),
            story_type: Some(StoryType::Novel),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: None,
            variation_type: None,
            parent_variation_id: None,
        };

        let parent = StoryRepository::create(&db, parent_input).unwrap();

        // Create 3 child stories
        for i in 1..=3 {
            let child_input = CreateStoryInput {
                universe_id: "universe-1".to_string(),
                title: format!("Child {}", i),
                description: Some("Child".to_string()),
                story_type: Some(StoryType::Chapter),
                content: None,
                notes: None,
                outline: None,
                target_word_count: None,
                tags: None,
                color: None,
                series_name: None,
                parent_story_id: Some(parent.id.clone()),
                variation_type: None,
                parent_variation_id: None,
            };

            StoryRepository::create(&db, child_input).unwrap();
        }

        // Get child count
        let count = StoryRepository::get_child_count(&db, &parent.id).unwrap();
        assert_eq!(count, 3);
    }

    #[test]
    fn test_get_child_count_only_direct_children() {
        let (db, _temp_dir) = setup_test_db();

        // Create parent story
        let parent_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Novel".to_string(),
            description: Some("Novel".to_string()),
            story_type: Some(StoryType::Novel),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: None,
            variation_type: None,
            parent_variation_id: None,
        };

        let parent = StoryRepository::create(&db, parent_input).unwrap();

        // Create child story
        let child_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Chapter".to_string(),
            description: Some("Chapter".to_string()),
            story_type: Some(StoryType::Chapter),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: Some(parent.id.clone()),
            variation_type: None,
            parent_variation_id: None,
        };

        let child = StoryRepository::create(&db, child_input).unwrap();

        // Create grandchild story
        let grandchild_input = CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: "Scene".to_string(),
            description: Some("Scene".to_string()),
            story_type: Some(StoryType::Scene),
            content: None,
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            parent_story_id: Some(child.id.clone()),
            variation_type: None,
            parent_variation_id: None,
        };

        StoryRepository::create(&db, grandchild_input).unwrap();

        // Get child count for parent (should only count direct children, not grandchildren)
        let count = StoryRepository::get_child_count(&db, &parent.id).unwrap();
        assert_eq!(count, 1);

        // Get child count for child (should count the grandchild)
        let count = StoryRepository::get_child_count(&db, &child.id).unwrap();
        assert_eq!(count, 1);
    }
}
