use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// StoryVersion domain model
///
/// A StoryVersion represents a named variation of a story (e.g., "Original", "Alternate Ending").
/// Each version contains one or more snapshots, which are point-in-time saves of the content.
/// This is part of the Database-Only Versioning (DBV) system that replaces Git-based versioning.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct StoryVersion {
    pub id: String,
    pub story_id: String,
    pub name: String,        // "Original", "Alternate Ending", etc.
    pub created_at: String,  // ISO 8601 timestamp
    pub updated_at: String,  // ISO 8601 timestamp
}

/// Input for creating a new StoryVersion
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct CreateStoryVersionInput {
    pub story_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>, // Initial content for the first snapshot
}

/// Input for renaming an existing StoryVersion
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct RenameStoryVersionInput {
    pub version_id: String,
    pub new_name: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_story_version_serialization_round_trip() {
        let version = StoryVersion {
            id: "version-1".to_string(),
            story_id: "story-1".to_string(),
            name: "Original".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T12:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&version).unwrap();
        let deserialized: StoryVersion = serde_json::from_str(&json).unwrap();

        assert_eq!(version.id, deserialized.id);
        assert_eq!(version.story_id, deserialized.story_id);
        assert_eq!(version.name, deserialized.name);
        assert_eq!(version.created_at, deserialized.created_at);
        assert_eq!(version.updated_at, deserialized.updated_at);
    }

    #[test]
    fn test_story_version_json_uses_camel_case() {
        let version = StoryVersion {
            id: "v1".to_string(),
            story_id: "s1".to_string(),
            name: "Test".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&version).unwrap();
        assert!(json.contains("storyId"));
        assert!(json.contains("createdAt"));
        assert!(json.contains("updatedAt"));
        assert!(!json.contains("story_id"));
        assert!(!json.contains("created_at"));
        assert!(!json.contains("updated_at"));
    }

    #[test]
    fn test_create_story_version_input_deserialization() {
        let json = r#"{"storyId":"story-1","name":"Alternate Ending"}"#;
        let input: CreateStoryVersionInput = serde_json::from_str(json).unwrap();

        assert_eq!(input.story_id, "story-1");
        assert_eq!(input.name, "Alternate Ending");
        assert!(input.content.is_none());
    }

    #[test]
    fn test_create_story_version_input_with_content() {
        let json = r#"{"storyId":"story-1","name":"Draft","content":"Once upon a time..."}"#;
        let input: CreateStoryVersionInput = serde_json::from_str(json).unwrap();

        assert_eq!(input.story_id, "story-1");
        assert_eq!(input.name, "Draft");
        assert_eq!(input.content, Some("Once upon a time...".to_string()));
    }

    #[test]
    fn test_rename_story_version_input_deserialization() {
        let json = r#"{"versionId":"version-1","newName":"Final Draft"}"#;
        let input: RenameStoryVersionInput = serde_json::from_str(json).unwrap();

        assert_eq!(input.version_id, "version-1");
        assert_eq!(input.new_name, "Final Draft");
    }
}
