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
/// Only leaf containers (those containing stories, not child containers) have Git repositories.
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

    // Git Versioning (only for leaf containers)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub git_repo_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_branch: Option<String>,
    pub staged_changes: bool,

    // Timestamps
    pub created_at: String,
    pub updated_at: String,
}

impl Container {
    /// Determine if this container is a leaf (contains stories, not child containers)
    ///
    /// A container is a leaf if it has a git_repo_path set. Only leaf containers
    /// store stories directly and maintain their own Git repository.
    ///
    /// # Examples
    ///
    /// ```ignore
    /// let leaf = Container {
    ///     git_repo_path: Some("/path/to/repo".to_string()),
    ///     // ... other fields
    /// };
    /// assert!(leaf.is_leaf()); // true - has git repo
    ///
    /// let branch = Container {
    ///     git_repo_path: None, // Branch containers don't have git repos
    ///     // ... other fields
    /// };
    /// assert!(!branch.is_leaf()); // false - no git repo
    /// ```
    pub fn is_leaf(&self) -> bool {
        self.git_repo_path.is_some()
    }

    /// Determine if this container should have its own Git repository
    ///
    /// Only leaf containers (those containing stories) should have Git repositories.
    /// Branch containers (those containing child containers) do not need Git repos.
    ///
    /// # Examples
    ///
    /// ```ignore
    /// let leaf = Container {
    ///     git_repo_path: Some("/path/to/repo".to_string()),
    ///     // ... other fields
    /// };
    /// assert!(leaf.should_have_git_repo()); // true - is a leaf container
    /// ```
    pub fn should_have_git_repo(&self) -> bool {
        self.is_leaf()
    }
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
        let container = Container {
            id: "container-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: Some("parent-1".to_string()),
            container_type: "novel".to_string(),
            title: "The Great Novel".to_string(),
            description: Some("An epic tale".to_string()),
            order: 1,
            git_repo_path: Some("/path/to/repo".to_string()),
            current_branch: Some("main".to_string()),
            staged_changes: false,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

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
            git_repo_path: Some("/path".to_string()),
            current_branch: Some("main".to_string()),
            staged_changes: true,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&container).unwrap();
        assert!(json.contains("universeId"));
        assert!(json.contains("parentContainerId"));
        assert!(json.contains("containerType"));
        assert!(json.contains("gitRepoPath"));
        assert!(json.contains("currentBranch"));
        assert!(json.contains("stagedChanges"));
        assert!(json.contains("createdAt"));
        assert!(json.contains("updatedAt"));
    }

    #[test]
    fn test_is_leaf_with_git_repo() {
        let leaf = Container {
            id: "novel-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: None,
            container_type: "novel".to_string(),
            title: "My Novel".to_string(),
            description: None,
            order: 1,
            git_repo_path: Some("/path/to/repo".to_string()),
            current_branch: Some("main".to_string()),
            staged_changes: false,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        assert!(leaf.is_leaf());
        assert!(leaf.should_have_git_repo());
    }

    #[test]
    fn test_is_leaf_without_git_repo() {
        let branch = Container {
            id: "series-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: None,
            container_type: "series".to_string(),
            title: "My Series".to_string(),
            description: None,
            order: 1,
            git_repo_path: None,
            current_branch: None,
            staged_changes: false,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        assert!(!branch.is_leaf());
        assert!(!branch.should_have_git_repo());
    }

    #[test]
    fn test_nested_leaf_containers() {
        // A novel within a series can still be a leaf (has its own git repo)
        let nested_leaf = Container {
            id: "novel-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: Some("series-1".to_string()),
            container_type: "novel".to_string(),
            title: "Book 1".to_string(),
            description: None,
            order: 1,
            git_repo_path: Some("/path/to/book1".to_string()),
            current_branch: Some("main".to_string()),
            staged_changes: false,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        assert!(nested_leaf.is_leaf());
        assert!(nested_leaf.should_have_git_repo());
    }

    #[test]
    fn test_branch_container_hierarchy() {
        // A series that contains novels (doesn't have git repo itself)
        let series = Container {
            id: "series-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: None,
            container_type: "series".to_string(),
            title: "The Trilogy".to_string(),
            description: Some("A three-part epic".to_string()),
            order: 1,
            git_repo_path: None,
            current_branch: None,
            staged_changes: false,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        assert!(!series.is_leaf());
        assert!(!series.should_have_git_repo());
    }

    #[test]
    fn test_staged_changes_serialization() {
        let container_with_changes = Container {
            id: "container-1".to_string(),
            universe_id: "universe-1".to_string(),
            parent_container_id: None,
            container_type: "novel".to_string(),
            title: "Test".to_string(),
            description: None,
            order: 1,
            git_repo_path: Some("/path".to_string()),
            current_branch: Some("main".to_string()),
            staged_changes: true,
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&container_with_changes).unwrap();
        assert!(json.contains("\"stagedChanges\":true"));
    }
}
