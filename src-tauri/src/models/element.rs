use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

/// Element domain model
///
/// An Element is any entity within a Universe that can be referenced in stories.
/// Elements can be characters, locations, vehicles, items, organizations, or any
/// custom type the author needs.
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct Element {
    // Core Identity
    pub id: String,
    pub universe_id: String,
    pub name: String,
    pub description: String,
    pub created_at: String, // ISO 8601 timestamp
    pub updated_at: String, // ISO 8601 timestamp

    // Element Type
    pub element_type: ElementType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_type_name: Option<String>,

    // Content & Details
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributes: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,

    // Relationships
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relationships: Option<Vec<ElementRelationship>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related_story_ids: Option<Vec<String>>,

    // Organization
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favorite: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<u32>,
}

/// Relationship between elements with flexible labeling
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct ElementRelationship {
    /// ID of the target element this relationship points to
    pub target_element_id: String,

    /// Label describing the relationship from source to target
    /// Examples: "best friend", "owns", "lives in", "captain of"
    pub label: String,

    /// Optional inverse label for bidirectional queries
    /// Examples: "best friend of", "owned by", "home of", "captained by"
    #[serde(skip_serializing_if = "Option::is_none")]
    pub inverse_label: Option<String>,

    /// Optional additional context about this relationship
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "kebab-case")]
pub enum ElementType {
    Character,
    Location,
    Vehicle,
    Item,
    Organization,
    Creature,
    Event,
    Concept,
    Custom,
}

/// Input for creating a new Element
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct CreateElementInput {
    pub universe_id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element_type: Option<ElementType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_type_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributes: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relationships: Option<Vec<ElementRelationship>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}

/// Input for updating an existing Element
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct UpdateElementInput {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element_type: Option<ElementType>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub custom_type_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attributes: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relationships: Option<Vec<ElementRelationship>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related_story_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub favorite: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub order: Option<u32>,
}
