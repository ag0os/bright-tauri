use serde::{Deserialize, Serialize};
use ts_rs::TS;

use super::{StorySnapshot, StoryVersion};

/// Story domain model
///
/// A Story is a written work within a Universe. It can be a novel, script, screenplay,
/// or any other type of creative writing. Stories support variations and database-based versioning.
///
/// Content is stored in the versioning system:
/// - Story → Version → Snapshot hierarchy
/// - active_version_id and active_snapshot_id point to the current working state
/// - active_version and active_snapshot are inline JOINed data for convenience
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct Story {
    // Core Identity
    pub id: String,
    pub universe_id: String,
    pub title: String,
    pub description: String,
    pub created_at: String, // ISO 8601 timestamp
    pub updated_at: String, // ISO 8601 timestamp

    // Story Type & Status
    pub story_type: StoryType,
    pub status: StoryStatus,
    pub word_count: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_word_count: Option<u32>,

    // Notes & Outline (not versioned)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outline: Option<String>,

    // Organization
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favorite: Option<bool>,

    // Context & Relationships
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related_element_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub container_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub series_name: Option<String>,

    // Metadata
    pub last_edited_at: String, // ISO 8601 timestamp
    pub version: u32,

    // Variations
    pub variation_group_id: String,
    pub variation_type: VariationType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_variation_id: Option<String>,

    // Database Versioning (DBV)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_version_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_snapshot_id: Option<String>,

    // Inline JOINed data for convenience (populated by queries)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_version: Option<StoryVersion>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active_snapshot: Option<StorySnapshot>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "kebab-case")]
pub enum StoryType {
    // Content types (actual written content)
    Chapter,
    ShortStory,
    Scene,
    Episode,
    Poem,
    Outline,
    Treatment,
    Screenplay,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "lowercase")]
pub enum StoryStatus {
    Draft,
    InProgress,
    Completed,
    Published,
    Archived,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "kebab-case")]
pub enum VariationType {
    Original,
    Screenplay,
    AlternateEnding,
    AiGenerated,
    Custom,
}

/// Input for creating a new Story
///
/// Note: `content` is not included because story creation now also creates
/// an "Original" version with an initial empty snapshot. Content is managed
/// through the versioning system.
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct CreateStoryInput {
    pub universe_id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub story_type: Option<StoryType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outline: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_word_count: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub series_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub container_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variation_type: Option<VariationType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_variation_id: Option<String>,
}

/// Input for updating an existing Story
///
/// Note: `content` is not included because content is managed through
/// the versioning system (update_snapshot_content command).
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct UpdateStoryInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub story_type: Option<StoryType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<StoryStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub outline: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_word_count: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favorite: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related_element_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub series_name: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_story_serialization_round_trip() {
        let story = create_test_story();

        let json = serde_json::to_string(&story).unwrap();
        let deserialized: Story = serde_json::from_str(&json).unwrap();

        assert_eq!(story.id, deserialized.id);
        assert_eq!(story.title, deserialized.title);
        assert_eq!(story.word_count, deserialized.word_count);
        assert_eq!(story.variation_type, deserialized.variation_type);
        assert_eq!(story.active_version_id, deserialized.active_version_id);
        assert_eq!(story.active_snapshot_id, deserialized.active_snapshot_id);
    }

    #[test]
    fn test_story_type_serialization() {
        let story_type = StoryType::ShortStory;
        let json = serde_json::to_string(&story_type).unwrap();
        assert_eq!(json, "\"short-story\"");

        let deserialized: StoryType = serde_json::from_str(&json).unwrap();
        assert_eq!(story_type, deserialized);
    }

    #[test]
    fn test_story_status_serialization() {
        let status = StoryStatus::InProgress;
        let json = serde_json::to_string(&status).unwrap();
        assert_eq!(json, "\"inprogress\"");
    }

    #[test]
    fn test_variation_type_serialization() {
        let variation = VariationType::AlternateEnding;
        let json = serde_json::to_string(&variation).unwrap();
        assert_eq!(json, "\"alternate-ending\"");

        let deserialized: VariationType = serde_json::from_str(&json).unwrap();
        assert_eq!(variation, deserialized);
    }

    #[test]
    fn test_story_json_uses_camel_case() {
        let story = Story {
            id: "test".to_string(),
            universe_id: "univ".to_string(),
            title: "Test".to_string(),
            description: "Test".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            story_type: StoryType::Chapter,
            status: StoryStatus::Draft,
            word_count: 100,
            target_word_count: None,
            notes: None,
            outline: None,
            order: None,
            tags: None,
            color: None,
            favorite: None,
            related_element_ids: Some(vec!["elem-1".to_string()]),
            container_id: None,
            series_name: None,
            last_edited_at: "2024-01-01T00:00:00Z".to_string(),
            version: 1,
            variation_group_id: "var-1".to_string(),
            variation_type: VariationType::Original,
            parent_variation_id: Some("parent-1".to_string()),
            active_version_id: Some("version-1".to_string()),
            active_snapshot_id: Some("snapshot-1".to_string()),
            active_version: None,
            active_snapshot: None,
        };

        let json = serde_json::to_string(&story).unwrap();
        assert!(json.contains("universeId"));
        assert!(json.contains("wordCount"));
        assert!(json.contains("storyType"));
        assert!(json.contains("relatedElementIds"));
        assert!(json.contains("variationGroupId"));
        assert!(json.contains("activeVersionId"));
        assert!(json.contains("activeSnapshotId"));
        // Verify git fields are NOT present
        assert!(!json.contains("gitRepoPath"));
        assert!(!json.contains("currentBranch"));
        assert!(!json.contains("stagedChanges"));
        assert!(!json.contains("content\":"));
    }

    #[test]
    fn test_story_with_inline_version_and_snapshot() {
        let version = StoryVersion {
            id: "version-1".to_string(),
            story_id: "story-1".to_string(),
            name: "Original".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let snapshot = StorySnapshot {
            id: "snapshot-1".to_string(),
            version_id: "version-1".to_string(),
            content: "Once upon a time...".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let story = Story {
            active_version: Some(version.clone()),
            active_snapshot: Some(snapshot.clone()),
            ..create_test_story()
        };

        let json = serde_json::to_string(&story).unwrap();
        let deserialized: Story = serde_json::from_str(&json).unwrap();

        assert!(deserialized.active_version.is_some());
        assert!(deserialized.active_snapshot.is_some());
        assert_eq!(
            deserialized.active_version.unwrap().name,
            "Original"
        );
        assert_eq!(
            deserialized.active_snapshot.unwrap().content,
            "Once upon a time..."
        );
    }

    #[test]
    fn test_story_optional_fields_skipped_when_none() {
        let story = Story {
            active_version_id: None,
            active_snapshot_id: None,
            active_version: None,
            active_snapshot: None,
            ..create_test_story()
        };

        let json = serde_json::to_string(&story).unwrap();
        // Optional None fields should be skipped
        assert!(!json.contains("activeVersionId"));
        assert!(!json.contains("activeSnapshotId"));
        assert!(!json.contains("activeVersion"));
        assert!(!json.contains("activeSnapshot"));
    }

    fn create_test_story() -> Story {
        Story {
            id: "story-1".to_string(),
            universe_id: "universe-1".to_string(),
            title: "Test Story".to_string(),
            description: "Test".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            story_type: StoryType::Chapter,
            status: StoryStatus::Draft,
            word_count: 0,
            target_word_count: None,
            notes: None,
            outline: None,
            order: None,
            tags: None,
            color: None,
            favorite: None,
            related_element_ids: None,
            container_id: None,
            series_name: None,
            last_edited_at: "2024-01-01T00:00:00Z".to_string(),
            version: 1,
            variation_group_id: "var-1".to_string(),
            variation_type: VariationType::Original,
            parent_variation_id: None,
            active_version_id: Some("version-1".to_string()),
            active_snapshot_id: Some("snapshot-1".to_string()),
            active_version: None,
            active_snapshot: None,
        }
    }
}
