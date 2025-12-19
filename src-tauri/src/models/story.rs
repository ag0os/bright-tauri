use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Story domain model
///
/// A Story is a written work within a Universe. It can be a novel, script, screenplay,
/// or any other type of creative writing. Stories support variations and Git-based versioning.
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

    // Content
    pub content: String,
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

    // Git Versioning
    pub git_repo_path: String,
    pub current_branch: String,
    pub staged_changes: bool,
}

impl Story {
    /// Determine if this story should have its own Git repository
    ///
    /// # Rules:
    /// - Standalone stories (container_id = None) have their own git repos
    /// - Child stories (container_id = Some) share their parent container's git repo
    #[allow(dead_code)]
    pub fn should_have_git_repo(&self) -> bool {
        self.container_id.is_none()
    }
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
    pub content: Option<String>,
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
    pub content: Option<String>,
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
        let story = Story {
            id: "story-1".to_string(),
            universe_id: "universe-1".to_string(),
            title: "The Great Adventure".to_string(),
            description: "An epic tale".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            story_type: StoryType::Chapter,
            status: StoryStatus::InProgress,
            word_count: 5000,
            target_word_count: Some(100000),
            content: "Once upon a time...".to_string(),
            notes: Some("Character notes".to_string()),
            outline: Some("Chapter 1: Beginning".to_string()),
            order: Some(1),
            tags: Some(vec!["fantasy".to_string()]),
            color: Some("#FF5733".to_string()),
            favorite: Some(true),
            related_element_ids: Some(vec!["char-1".to_string()]),
            container_id: None,
            series_name: Some("The Trilogy".to_string()),
            last_edited_at: "2024-01-01T12:00:00Z".to_string(),
            version: 1,
            variation_group_id: "var-group-1".to_string(),
            variation_type: VariationType::Original,
            parent_variation_id: None,
            git_repo_path: "/path/to/repo".to_string(),
            current_branch: "main".to_string(),
            staged_changes: false,
        };

        let json = serde_json::to_string(&story).unwrap();
        let deserialized: Story = serde_json::from_str(&json).unwrap();

        assert_eq!(story.id, deserialized.id);
        assert_eq!(story.title, deserialized.title);
        assert_eq!(story.word_count, deserialized.word_count);
        assert_eq!(story.variation_type, deserialized.variation_type);
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
            content: "test".to_string(),
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
            git_repo_path: "/path".to_string(),
            current_branch: "main".to_string(),
            staged_changes: true,
        };

        let json = serde_json::to_string(&story).unwrap();
        assert!(json.contains("universeId"));
        assert!(json.contains("wordCount"));
        assert!(json.contains("storyType"));
        assert!(json.contains("relatedElementIds"));
        assert!(json.contains("variationGroupId"));
        assert!(json.contains("gitRepoPath"));
        assert!(json.contains("currentBranch"));
        assert!(json.contains("stagedChanges"));
    }

    #[test]
    fn test_should_have_git_repo_standalone_stories() {
        // Standalone stories (container_id = None) have their own git repos
        let standalone_chapter = Story {
            story_type: StoryType::Chapter,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_chapter.should_have_git_repo());

        let standalone_short_story = Story {
            story_type: StoryType::ShortStory,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_short_story.should_have_git_repo());

        let standalone_scene = Story {
            story_type: StoryType::Scene,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_scene.should_have_git_repo());

        let standalone_episode = Story {
            story_type: StoryType::Episode,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_episode.should_have_git_repo());

        let standalone_poem = Story {
            story_type: StoryType::Poem,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_poem.should_have_git_repo());

        let standalone_outline = Story {
            story_type: StoryType::Outline,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_outline.should_have_git_repo());

        let standalone_treatment = Story {
            story_type: StoryType::Treatment,
            container_id: None,
            ..create_test_story()
        };
        assert!(standalone_treatment.should_have_git_repo());
    }

    #[test]
    fn test_should_have_git_repo_child_stories() {
        // Child stories (container_id = Some) share their parent container's git repo
        let child_chapter = Story {
            story_type: StoryType::Chapter,
            container_id: Some("container-123".to_string()),
            ..create_test_story()
        };
        assert!(!child_chapter.should_have_git_repo());

        let child_short_story = Story {
            story_type: StoryType::ShortStory,
            container_id: Some("container-456".to_string()),
            ..create_test_story()
        };
        assert!(!child_short_story.should_have_git_repo());

        let child_scene = Story {
            story_type: StoryType::Scene,
            container_id: Some("container-789".to_string()),
            ..create_test_story()
        };
        assert!(!child_scene.should_have_git_repo());

        let child_episode = Story {
            story_type: StoryType::Episode,
            container_id: Some("container-abc".to_string()),
            ..create_test_story()
        };
        assert!(!child_episode.should_have_git_repo());

        let child_poem = Story {
            story_type: StoryType::Poem,
            container_id: Some("container-def".to_string()),
            ..create_test_story()
        };
        assert!(!child_poem.should_have_git_repo());

        let child_outline = Story {
            story_type: StoryType::Outline,
            container_id: Some("container-ghi".to_string()),
            ..create_test_story()
        };
        assert!(!child_outline.should_have_git_repo());

        let child_treatment = Story {
            story_type: StoryType::Treatment,
            container_id: Some("container-jkl".to_string()),
            ..create_test_story()
        };
        assert!(!child_treatment.should_have_git_repo());
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
            content: "".to_string(),
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
            git_repo_path: "".to_string(),
            current_branch: "main".to_string(),
            staged_changes: false,
        }
    }
}
