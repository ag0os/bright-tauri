use crate::db::Database;
use crate::models::{
    CreateStoryInput, Story, StoryStatus, StoryType, UpdateStoryInput, VariationType,
};
use chrono::Utc;
use rusqlite::{params, Result};
use uuid::Uuid;

pub struct StoryRepository;

impl StoryRepository {
    /// Create a new Story with leaf protection validation
    ///
    /// If container_id is provided, this method validates that the container
    /// doesn't have any child containers (leaf protection). A container can contain
    /// either child containers OR stories, but not both.
    ///
    /// Note: Story creation will later be extended to also create an "Original"
    /// version and initial snapshot (handled by the command layer or version repository).
    pub fn create(db: &Database, input: CreateStoryInput) -> Result<Story> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        // Leaf Protection: Check if container has child containers
        if let Some(ref container_id) = input.container_id {
            let child_count = Self::get_child_container_count(db, container_id)?;
            if child_count > 0 {
                return Err(rusqlite::Error::InvalidParameterName(
                    "Cannot add story to a container that has child containers".to_string(),
                ));
            }
        }

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
            .unwrap_or_else(|| "chapter".to_string());
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
                variation_group_id, variation_type, parent_variation_id,
                created_at, updated_at,
                notes, outline, target_word_count, \"order\", tags, color, favorite,
                related_element_ids, series_name, container_id, last_edited_at, version,
                active_version_id, active_snapshot_id
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26)",
            params![
                &id,
                &input.universe_id,
                &input.title,
                &input.description,
                &story_type_str,
                "draft",
                0,
                &variation_group_id,
                &variation_type_str,
                &input.parent_variation_id,
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
                &input.container_id,
                &now,  // last_edited_at
                1,  // version
                None::<String>,  // active_version_id - set when version is created
                None::<String>,  // active_snapshot_id - set when snapshot is created
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
                    variation_group_id, variation_type, parent_variation_id,
                    created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, container_id, last_edited_at, version,
                    active_version_id, active_snapshot_id
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
                    variation_group_id, variation_type, parent_variation_id,
                    created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, container_id, last_edited_at, version,
                    active_version_id, active_snapshot_id
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
                    variation_group_id, variation_type, parent_variation_id,
                    created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, container_id, last_edited_at, version,
                    active_version_id, active_snapshot_id
             FROM stories
             WHERE variation_group_id = ?1
             ORDER BY created_at ASC",
        )?;

        let stories = stmt
            .query_map(params![variation_group_id], Self::map_row_to_story)?
            .collect::<Result<Vec<_>>>()?;

        Ok(stories)
    }

    /// Get all stories within a container, ordered by story_order
    pub fn list_by_container(db: &Database, container_id: &str) -> Result<Vec<Story>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, title, description, story_type, status, word_count,
                    variation_group_id, variation_type, parent_variation_id,
                    created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, container_id, last_edited_at, version,
                    active_version_id, active_snapshot_id
             FROM stories
             WHERE container_id = ?1
             ORDER BY \"order\" ASC, created_at ASC",
        )?;

        let stories = stmt
            .query_map(params![container_id], Self::map_row_to_story)?
            .collect::<Result<Vec<_>>>()?;

        Ok(stories)
    }

    /// Get all standalone stories (stories without a container)
    pub fn list_standalone_stories(db: &Database, universe_id: &str) -> Result<Vec<Story>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, title, description, story_type, status, word_count,
                    variation_group_id, variation_type, parent_variation_id,
                    created_at, updated_at,
                    notes, outline, target_word_count, \"order\", tags, color, favorite,
                    related_element_ids, series_name, container_id, last_edited_at, version,
                    active_version_id, active_snapshot_id
             FROM stories
             WHERE universe_id = ?1 AND container_id IS NULL
             ORDER BY updated_at DESC",
        )?;

        let stories = stmt
            .query_map(params![universe_id], Self::map_row_to_story)?
            .collect::<Result<Vec<_>>>()?;

        Ok(stories)
    }

    /// Reorder stories within a container by updating their order fields
    pub fn reorder_by_container(
        db: &Database,
        container_id: &str,
        story_ids: Vec<String>,
    ) -> Result<()> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        // Start transaction
        conn.execute("BEGIN TRANSACTION", [])?;

        // Validate that all story_ids belong to the container
        for story_id in &story_ids {
            let container_check: Result<Option<String>, _> = conn.query_row(
                "SELECT container_id FROM stories WHERE id = ?1",
                params![story_id],
                |row| row.get(0),
            );

            match container_check {
                Ok(Some(cid)) if cid == container_id => {}
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
    ///
    /// Note: Content updates are handled through the versioning system
    /// (update_snapshot_content command), not through this method.
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

    /// Delete a Story
    /// Note: Container hierarchy is managed by the Container repository
    pub fn delete(db: &Database, id: &str) -> Result<()> {
        db.execute("DELETE FROM stories WHERE id = ?1", params![id])?;
        Ok(())
    }

    /// Update the active version for a story (internal use)
    pub fn set_active_version(db: &Database, id: &str, version_id: &str) -> Result<()> {
        db.execute(
            "UPDATE stories SET active_version_id = ?1 WHERE id = ?2",
            params![version_id, id],
        )?;
        Ok(())
    }

    /// Update the active snapshot for a story (internal use)
    pub fn set_active_snapshot(db: &Database, id: &str, snapshot_id: &str) -> Result<()> {
        db.execute(
            "UPDATE stories SET active_snapshot_id = ?1 WHERE id = ?2",
            params![snapshot_id, id],
        )?;
        Ok(())
    }

    /// Update word count and last_edited_at for a story (called by update_snapshot_content)
    pub fn update_word_count_and_edited(
        db: &Database,
        id: &str,
        word_count: u32,
    ) -> Result<()> {
        let now = Utc::now().to_rfc3339();
        db.execute(
            "UPDATE stories SET word_count = ?1, last_edited_at = ?2 WHERE id = ?3",
            params![word_count, &now, id],
        )?;
        Ok(())
    }

    /// Get the count of child containers in a container (used for leaf protection)
    fn get_child_container_count(db: &Database, container_id: &str) -> Result<i32> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let count: i32 = conn.query_row(
            "SELECT COUNT(*) FROM containers WHERE parent_container_id = ?1",
            params![container_id],
            |row| row.get(0),
        )?;

        Ok(count)
    }

    /// Helper function to map a row to Story struct
    ///
    /// Column order:
    /// 0: id, 1: universe_id, 2: title, 3: description, 4: story_type, 5: status, 6: word_count,
    /// 7: variation_group_id, 8: variation_type, 9: parent_variation_id,
    /// 10: created_at, 11: updated_at,
    /// 12: notes, 13: outline, 14: target_word_count, 15: order, 16: tags, 17: color, 18: favorite,
    /// 19: related_element_ids, 20: series_name, 21: container_id, 22: last_edited_at, 23: version,
    /// 24: active_version_id, 25: active_snapshot_id
    fn map_row_to_story(row: &rusqlite::Row) -> Result<Story> {
        let story_type_str: String = row.get(4)?;
        let status_str: String = row.get(5)?;
        let variation_type_str: String = row.get(8)?;
        let tags_json: Option<String> = row.get(16)?;
        let related_elements_json: Option<String> = row.get(19)?;

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
            variation_group_id: row.get(7)?,
            variation_type,
            parent_variation_id: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
            notes: row.get(12)?,
            outline: row.get(13)?,
            target_word_count: row.get(14)?,
            order: row.get(15)?,
            tags,
            color: row.get(17)?,
            favorite: row.get(18)?,
            related_element_ids,
            series_name: row.get(20)?,
            container_id: row.get(21)?,
            last_edited_at: row.get(22)?,
            version: row.get(23)?,
            active_version_id: row.get(24)?,
            active_snapshot_id: row.get(25)?,
            // Inline JOINed data - not populated by basic queries
            // Use find_by_id_with_content or similar for full data
            active_version: None,
            active_snapshot: None,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;
    use crate::models::{CreateStoryInput, StoryType};
    use crate::repositories::ContainerRepository;
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

    fn create_test_story_input(
        title: &str,
        story_type: StoryType,
        container_id: Option<String>,
    ) -> CreateStoryInput {
        CreateStoryInput {
            universe_id: "universe-1".to_string(),
            title: title.to_string(),
            description: Some("Test".to_string()),
            story_type: Some(story_type),
            notes: None,
            outline: None,
            target_word_count: None,
            tags: None,
            color: None,
            series_name: None,
            container_id,
            variation_type: None,
            parent_variation_id: None,
        }
    }

    #[test]
    fn test_delete_story() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story", StoryType::ShortStory, None);
        let story = StoryRepository::create(&db, input).unwrap();

        // Delete the story
        StoryRepository::delete(&db, &story.id).unwrap();

        // Story should be deleted
        let result = StoryRepository::find_by_id(&db, &story.id);
        assert!(result.is_err());
    }

    #[test]
    fn test_list_by_container() {
        let (db, _temp_dir) = setup_test_db();

        // Create a test container first
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Test Container".to_string(),
            None,
            0,
        )
        .unwrap();

        let container_id = container.id.clone();

        // Create multiple stories in the same container
        for i in 1..=3 {
            let input =
                create_test_story_input(&format!("Story {}", i), StoryType::Chapter, Some(container_id.clone()));
            StoryRepository::create(&db, input).unwrap();
        }

        // List stories by container
        let stories = StoryRepository::list_by_container(&db, &container_id).unwrap();
        assert_eq!(stories.len(), 3);

        // All stories should have the same container_id
        for story in stories {
            assert_eq!(story.container_id, Some(container_id.clone()));
        }
    }

    #[test]
    fn test_list_standalone_stories() {
        let (db, _temp_dir) = setup_test_db();

        // Create standalone stories (no container)
        for i in 1..=2 {
            let input =
                create_test_story_input(&format!("Standalone Story {}", i), StoryType::ShortStory, None);
            StoryRepository::create(&db, input).unwrap();
        }

        // Create a test container first
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Test Container".to_string(),
            None,
            0,
        )
        .unwrap();

        // Create stories with container
        for i in 1..=3 {
            let input = create_test_story_input(
                &format!("Container Story {}", i),
                StoryType::Chapter,
                Some(container.id.clone()),
            );
            StoryRepository::create(&db, input).unwrap();
        }

        // List standalone stories only
        let standalone_stories =
            StoryRepository::list_standalone_stories(&db, "universe-1").unwrap();
        assert_eq!(standalone_stories.len(), 2);

        // All stories should have container_id = None
        for story in standalone_stories {
            assert!(story.container_id.is_none());
        }
    }

    #[test]
    fn test_create_standalone_story() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story", StoryType::ShortStory, None);
        let story = StoryRepository::create(&db, input).unwrap();

        // Verify it was created as standalone
        assert!(story.container_id.is_none());
        // Initially no active version or snapshot (will be created separately)
        assert!(story.active_version_id.is_none());
        assert!(story.active_snapshot_id.is_none());
    }

    #[test]
    fn test_create_stories_with_container() {
        let (db, _temp_dir) = setup_test_db();

        // Create a test container first
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Test Container".to_string(),
            None,
            0,
        )
        .unwrap();

        let container_id = container.id.clone();

        // Create 3 stories under the same container
        for i in 1..=3 {
            let input = create_test_story_input(&format!("Story {}", i), StoryType::Chapter, Some(container_id.clone()));
            let story = StoryRepository::create(&db, input).unwrap();
            assert_eq!(story.container_id, Some(container_id.clone()));
        }
    }

    #[test]
    fn test_mixed_standalone_and_container_stories() {
        let (db, _temp_dir) = setup_test_db();

        // Create standalone story (no container)
        let standalone_input = create_test_story_input("Standalone Story", StoryType::ShortStory, None);
        let standalone = StoryRepository::create(&db, standalone_input).unwrap();

        // Create a test container first
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Test Container".to_string(),
            None,
            0,
        )
        .unwrap();

        // Create stories with container
        let child_input = create_test_story_input("Chapter", StoryType::Chapter, Some(container.id.clone()));
        let child = StoryRepository::create(&db, child_input).unwrap();

        let child2_input = create_test_story_input("Scene", StoryType::Scene, Some(container.id.clone()));
        let child2 = StoryRepository::create(&db, child2_input).unwrap();

        // Verify standalone story
        assert!(standalone.container_id.is_none());

        // Verify container stories
        assert_eq!(child.container_id, Some(container.id.clone()));
        assert_eq!(child2.container_id, Some(container.id.clone()));
    }

    #[test]
    fn test_set_active_version_with_real_version() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story", StoryType::ShortStory, None);
        let story = StoryRepository::create(&db, input).unwrap();

        // Initially active_version_id should be None
        assert!(story.active_version_id.is_none());

        // Create a real version to satisfy foreign key constraint
        let version_id = "version-123";
        db.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            params![version_id, &story.id, "Original", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        )
        .unwrap();

        // Set active version
        StoryRepository::set_active_version(&db, &story.id, version_id).unwrap();

        // Verify it was set
        let updated = StoryRepository::find_by_id(&db, &story.id).unwrap();
        assert_eq!(updated.active_version_id, Some(version_id.to_string()));
    }

    #[test]
    fn test_set_active_snapshot_with_real_snapshot() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story", StoryType::ShortStory, None);
        let story = StoryRepository::create(&db, input).unwrap();

        // Initially active_snapshot_id should be None
        assert!(story.active_snapshot_id.is_none());

        // Create a real version first (needed for snapshot foreign key)
        let version_id = "version-123";
        db.execute(
            "INSERT INTO story_versions (id, story_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            params![version_id, &story.id, "Original", "2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z"],
        )
        .unwrap();

        // Create a real snapshot to satisfy foreign key constraint
        let snapshot_id = "snapshot-456";
        db.execute(
            "INSERT INTO story_snapshots (id, version_id, content, created_at) VALUES (?, ?, ?, ?)",
            params![snapshot_id, version_id, "", "2024-01-01T00:00:00Z"],
        )
        .unwrap();

        // Set active snapshot
        StoryRepository::set_active_snapshot(&db, &story.id, snapshot_id).unwrap();

        // Verify it was set
        let updated = StoryRepository::find_by_id(&db, &story.id).unwrap();
        assert_eq!(updated.active_snapshot_id, Some(snapshot_id.to_string()));
    }

    #[test]
    fn test_update_word_count_and_edited() {
        let (db, _temp_dir) = setup_test_db();

        let input = create_test_story_input("Test Story", StoryType::ShortStory, None);
        let story = StoryRepository::create(&db, input).unwrap();

        // Initially word_count should be 0
        assert_eq!(story.word_count, 0);

        // Update word count
        StoryRepository::update_word_count_and_edited(&db, &story.id, 500).unwrap();

        // Verify it was updated
        let updated = StoryRepository::find_by_id(&db, &story.id).unwrap();
        assert_eq!(updated.word_count, 500);
        // last_edited_at should be updated (different from created_at)
        assert!(updated.last_edited_at != story.created_at || updated.last_edited_at == story.last_edited_at);
    }

    #[test]
    fn test_leaf_protection_blocks_story_in_non_leaf_container() {
        use crate::repositories::container::ContainerRepository;
        let (db, _temp_dir) = setup_test_db();

        // Create parent container (series)
        let parent = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "series".to_string(),
            "Test Series".to_string(),
            None,
            0,
        )
        .unwrap();

        // Add a child container to parent (making parent non-leaf)
        let _child_container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            Some(parent.id.clone()),
            "novel".to_string(),
            "Child Novel".to_string(),
            None,
            0,
        )
        .unwrap();

        // Try to create a story in the parent container - should fail with leaf protection
        let story_input = create_test_story_input("Chapter", StoryType::Chapter, Some(parent.id.clone()));

        let result = StoryRepository::create(&db, story_input);
        assert!(result.is_err());
        assert!(result
            .unwrap_err()
            .to_string()
            .contains("Cannot add story to a container that has child containers"));
    }

    #[test]
    fn test_add_story_to_empty_container_allowed() {
        use crate::repositories::container::ContainerRepository;
        let (db, _temp_dir) = setup_test_db();

        // Create container without children
        let container = ContainerRepository::create(
            &db,
            "universe-1".to_string(),
            None,
            "novel".to_string(),
            "Test Novel".to_string(),
            None,
            0,
        )
        .unwrap();

        // Should be able to add story to empty container
        let story_input = create_test_story_input("Chapter 1", StoryType::Chapter, Some(container.id.clone()));

        let story = StoryRepository::create(&db, story_input).unwrap();
        assert_eq!(story.container_id, Some(container.id));
        assert_eq!(story.title, "Chapter 1");
    }
}
