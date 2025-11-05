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
    pub parent_story_id: Option<String>,
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
    /// - Containers (Novel, Screenplay, Collection) always get repos
    /// - Standalone content (ShortStory, Episode, Poem without parent) get repos
    /// - Children (Chapter, Scene) never get repos
    /// - Series (grouping only) never gets repos
    /// - Planning docs (Outline, Treatment) follow parent logic
    #[allow(dead_code)]
    pub fn should_have_git_repo(&self) -> bool {
        match self.story_type {
            // Containers always get repos
            StoryType::Novel | StoryType::Screenplay | StoryType::Collection => true,

            // Standalone content gets repos only if no parent
            StoryType::ShortStory | StoryType::Episode | StoryType::Poem => {
                self.parent_story_id.is_none()
            }

            // Children never get their own repos
            StoryType::Chapter | StoryType::Scene => false,

            // Planning docs follow parent logic
            StoryType::Outline | StoryType::Treatment => self.parent_story_id.is_none(),

            // Series is just a grouping, no content
            StoryType::Series => false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "kebab-case")]
pub enum StoryType {
    // Containers (optional parents for grouping)
    Novel,
    Series,
    Screenplay,
    Collection,

    // Independent content (can exist alone OR have a parent)
    Chapter,
    ShortStory,
    Scene,
    Episode,
    Poem,

    // Planning docs
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
    pub parent_story_id: Option<String>,
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
            story_type: StoryType::Novel,
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
            parent_story_id: None,
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
            story_type: StoryType::Novel,
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
            parent_story_id: None,
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
    fn test_should_have_git_repo_containers() {
        // Containers always get repos regardless of parent
        let novel = Story {
            story_type: StoryType::Novel,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(novel.should_have_git_repo());

        let novel_with_parent = Story {
            story_type: StoryType::Novel,
            parent_story_id: Some("parent-123".to_string()),
            ..create_test_story()
        };
        assert!(novel_with_parent.should_have_git_repo());

        let screenplay = Story {
            story_type: StoryType::Screenplay,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(screenplay.should_have_git_repo());

        let collection = Story {
            story_type: StoryType::Collection,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(collection.should_have_git_repo());
    }

    #[test]
    fn test_should_have_git_repo_standalone_content() {
        // Standalone content gets repos only without parent
        let short_story = Story {
            story_type: StoryType::ShortStory,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(short_story.should_have_git_repo());

        let short_story_with_parent = Story {
            story_type: StoryType::ShortStory,
            parent_story_id: Some("parent-123".to_string()),
            ..create_test_story()
        };
        assert!(!short_story_with_parent.should_have_git_repo());

        let episode = Story {
            story_type: StoryType::Episode,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(episode.should_have_git_repo());

        let poem = Story {
            story_type: StoryType::Poem,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(poem.should_have_git_repo());
    }

    #[test]
    fn test_should_have_git_repo_children() {
        // Children never get repos
        let chapter = Story {
            story_type: StoryType::Chapter,
            parent_story_id: Some("novel-123".to_string()),
            ..create_test_story()
        };
        assert!(!chapter.should_have_git_repo());

        let scene = Story {
            story_type: StoryType::Scene,
            parent_story_id: Some("screenplay-123".to_string()),
            ..create_test_story()
        };
        assert!(!scene.should_have_git_repo());

        // Even without parent (edge case)
        let orphan_chapter = Story {
            story_type: StoryType::Chapter,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(!orphan_chapter.should_have_git_repo());
    }

    #[test]
    fn test_should_have_git_repo_series() {
        // Series never gets repos (grouping only)
        let series = Story {
            story_type: StoryType::Series,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(!series.should_have_git_repo());
    }

    #[test]
    fn test_should_have_git_repo_planning_docs() {
        // Planning docs follow parent logic
        let outline = Story {
            story_type: StoryType::Outline,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(outline.should_have_git_repo());

        let outline_with_parent = Story {
            story_type: StoryType::Outline,
            parent_story_id: Some("parent-123".to_string()),
            ..create_test_story()
        };
        assert!(!outline_with_parent.should_have_git_repo());

        let treatment = Story {
            story_type: StoryType::Treatment,
            parent_story_id: None,
            ..create_test_story()
        };
        assert!(treatment.should_have_git_repo());
    }

    fn create_test_story() -> Story {
        Story {
            id: "story-1".to_string(),
            universe_id: "universe-1".to_string(),
            title: "Test Story".to_string(),
            description: "Test".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            story_type: StoryType::Novel,
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
            parent_story_id: None,
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
