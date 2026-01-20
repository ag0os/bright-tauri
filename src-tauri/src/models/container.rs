use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Maximum allowed nesting depth for containers to prevent performance issues
/// and enforce reasonable hierarchy limits. A depth of 10 allows for complex
/// structures like: Universe → Series → Collection → Arc → Volume → Novel → Part → Chapter → Scene → Section
pub const MAX_NESTING_DEPTH: u32 = 10;

/// Container domain model
///
/// A Container represents an organizational entity within a Universe that can contain
/// either child containers or stories. Examples include novels, series, collections.
/// Containers support nesting: a "series" can contain "novels", and "novels" can contain
/// "chapters" (which are stories, not containers).
///
/// With Database-Only Versioning (DBV), containers no longer have Git repositories.
/// Versioning is handled at the story level through versions and snapshots.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct Container {
    // Core Identity
    pub id: String,
    pub universe_id: String,

    // Hierarchy
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_container_id: Option<String>,

    // Container Properties
    pub container_type: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub order: i32,

    // Timestamps
    pub created_at: String,
    pub updated_at: String,
}

/// Input for creating a new Container
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct CreateContainerInput {
    pub universe_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_container_id: Option<String>,
    pub container_type: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
}

/// Input for updating an existing Container
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct UpdateContainerInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub container_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<i32>,
}

/// Response type containing child containers and stories
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct ContainerChildren {
    pub containers: Vec<Container>,
    pub stories: Vec<crate::models::Story>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_container_serialization_round_trip() {
        let container = create_test_container();

        let json = serde_json::to_string(&container).unwrap();
        let deserialized: Container = serde_json::from_str(&json).unwrap();

        assert_eq!(container.id, deserialized.id);
        assert_eq!(container.title, deserialized.title);
        assert_eq!(container.container_type, deserialized.container_type);
        assert_eq!(
            container.parent_container_id,
            deserialized.parent_container_id
        );
    }

    #[test]
    fn test_container_json_uses_camel_case() {
        let container = Container {
            id: "test".to_string(),
            universe_id: "univ".to_string(),
            parent_container_id: Some("parent".to_string()),
            container_type: "novel".to_string(),
            title: "Test".to_string(),
            description: Some("Test description".to_string()),
            order: 1,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&container).unwrap();
        assert!(json.contains("universeId"));
        assert!(json.contains("parentContainerId"));
        assert!(json.contains("containerType"));
        assert!(json.contains("createdAt"));
        assert!(json.contains("updatedAt"));
        // Verify git fields are NOT present (removed in DBV)
        assert!(!json.contains("gitRepoPath"));
        assert!(!json.contains("currentBranch"));
        assert!(!json.contains("stagedChanges"));
    }

    #[test]
    fn test_container_with_parent() {
        // A novel within a series
        let nested = Container {
            id: "novel-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: Some("series-1".to_string()),
            container_type: "novel".to_string(),
            title: "Book 1".to_string(),
            description: None,
            order: 1,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&nested).unwrap();
        let deserialized: Container = serde_json::from_str(&json).unwrap();

        assert_eq!(
            deserialized.parent_container_id,
            Some("series-1".to_string())
        );
    }

    #[test]
    fn test_container_hierarchy() {
        // A series that contains novels
        let series = Container {
            id: "series-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: None,
            container_type: "series".to_string(),
            title: "The Trilogy".to_string(),
            description: Some("A three-part epic".to_string()),
            order: 1,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&series).unwrap();
        let deserialized: Container = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.container_type, "series");
        assert!(deserialized.parent_container_id.is_none());
    }

    #[test]
    fn test_container_optional_fields_skipped_when_none() {
        let container = Container {
            id: "container-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: None,
            container_type: "novel".to_string(),
            title: "Test".to_string(),
            description: None,
            order: 1,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&container).unwrap();
        // Optional None fields should be skipped
        assert!(!json.contains("parentContainerId"));
        assert!(!json.contains("description"));
    }

    fn create_test_container() -> Container {
        Container {
            id: "container-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: Some("parent-1".to_string()),
            container_type: "novel".to_string(),
            title: "The Great Novel".to_string(),
            description: Some("An epic tale".to_string()),
            order: 1,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        }
    }
}
