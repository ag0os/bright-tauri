use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Universe domain model
///
/// A Universe is a project container for creative work, holding all the context,
/// elements, and stories that belong to a particular creative world.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct Universe {
    // Core Identity
    pub id: String,
    pub name: String,
    pub description: String,
    pub created_at: String, // ISO 8601 timestamp
    pub updated_at: String, // ISO 8601 timestamp

    // Creative Context
    #[serde(skip_serializing_if = "Option::is_none")]
    pub genre: Option<Genre>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tone: Option<Tone>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub worldbuilding_notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub themes: Option<Vec<String>>,

    // Organization & Customization
    pub status: UniverseStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "lowercase")]
pub enum UniverseStatus {
    Active,
    Archived,
    Template,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "kebab-case")]
pub enum Genre {
    Fantasy,
    SciFi,
    Contemporary,
    Horror,
    Mystery,
    Romance,
    Thriller,
    Historical,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "lowercase")]
pub enum Tone {
    Dark,
    Comedic,
    Serious,
    Lighthearted,
    Dramatic,
    Satirical,
    Other,
}

/// Input for creating a new Universe
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct CreateUniverseInput {
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub genre: Option<Genre>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tone: Option<Tone>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub worldbuilding_notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub themes: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}

/// Input for updating an existing Universe
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct UpdateUniverseInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub genre: Option<Genre>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tone: Option<Tone>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub worldbuilding_notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub themes: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<UniverseStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
}
