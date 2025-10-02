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

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "kebab-case")]
pub enum StoryType {
    Novel,
    ShortStory,
    Script,
    Screenplay,
    Episode,
    Chapter,
    Poem,
    Article,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "lowercase")]
pub enum StoryStatus {
    Draft,
    InProgress,
    Completed,
    Published,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
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
