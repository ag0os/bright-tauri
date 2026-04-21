use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use std::collections::HashMap;
use ts_rs::TS;

/// Element domain model
///
/// An Element is any entity within a Universe that can be referenced in stories.
/// Elements can be characters, locations, vehicles, items, organizations, or any
/// custom type the author needs.
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/", rename_all = "camelCase")]
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
    pub custom_type_name: Option<String>,

    // Content & Details
    pub details: Option<String>,
    pub attributes: Option<HashMap<String, String>>,
    pub image_url: Option<String>,
    pub tags: Option<Vec<String>>,

    // Relationships
    pub relationships: Option<Vec<ElementRelationship>>,
    pub related_story_ids: Option<Vec<String>>,

    // Organization
    pub color: Option<String>,
    pub icon: Option<String>,
    pub favorite: Option<bool>,
    pub order: Option<u32>,
}

/// Relationship between elements with flexible labeling
#[skip_serializing_none]
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct ElementRelationship {
    /// ID of the target element this relationship points to
    pub target_element_id: String,

    /// Label describing the relationship from source to target
    /// Examples: "best friend", "owns", "lives in", "captain of"
    pub label: String,

    /// Optional inverse label for bidirectional queries
    /// Examples: "best friend of", "owned by", "home of", "captained by"
    pub inverse_label: Option<String>,

    /// Optional additional context about this relationship
    pub description: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/", rename_all = "kebab-case")]
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
#[ts(export, export_to = "../../src/types/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct CreateElementInput {
    pub universe_id: String,
    pub name: String,
    pub description: Option<String>,
    pub element_type: Option<ElementType>,
    pub custom_type_name: Option<String>,
    pub details: Option<String>,
    pub attributes: Option<HashMap<String, String>>,
    pub image_url: Option<String>,
    pub tags: Option<Vec<String>>,
    pub relationships: Option<Vec<ElementRelationship>>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

/// Input for updating an existing Element
#[derive(Debug, Clone, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/", rename_all = "camelCase")]
#[serde(rename_all = "camelCase")]
pub struct UpdateElementInput {
    pub name: Option<String>,
    pub description: Option<String>,
    pub element_type: Option<ElementType>,
    pub custom_type_name: Option<String>,
    pub details: Option<String>,
    pub attributes: Option<HashMap<String, String>>,
    pub image_url: Option<String>,
    pub tags: Option<Vec<String>>,
    pub relationships: Option<Vec<ElementRelationship>>,
    #[allow(dead_code)] // kept until related-story updates are wired through the backend.
    pub related_story_ids: Option<Vec<String>>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub favorite: Option<bool>,
    pub order: Option<u32>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_element_serialization_round_trip() {
        let mut attributes = HashMap::new();
        attributes.insert("age".to_string(), "32".to_string());
        attributes.insert("height".to_string(), "6'2\"".to_string());

        let element = Element {
            id: "char-1".to_string(),
            universe_id: "univ-1".to_string(),
            name: "Han Solo".to_string(),
            description: "Smuggler and pilot".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            element_type: ElementType::Character,
            custom_type_name: None,
            details: Some("Captain of the Millennium Falcon".to_string()),
            attributes: Some(attributes),
            image_url: Some("/images/han.jpg".to_string()),
            tags: Some(vec!["main character".to_string(), "pilot".to_string()]),
            relationships: Some(vec![ElementRelationship {
                target_element_id: "char-2".to_string(),
                label: "best friend".to_string(),
                inverse_label: Some("best friend of".to_string()),
                description: Some("Met during the war".to_string()),
            }]),
            related_story_ids: Some(vec!["story-1".to_string()]),
            color: Some("#FF5733".to_string()),
            icon: Some("👤".to_string()),
            favorite: Some(true),
            order: Some(1),
        };

        let json = serde_json::to_string(&element).unwrap();
        let deserialized: Element = serde_json::from_str(&json).unwrap();

        assert_eq!(element.id, deserialized.id);
        assert_eq!(element.name, deserialized.name);
        assert_eq!(element.element_type, deserialized.element_type);
        assert_eq!(
            element.attributes.as_ref().unwrap().get("age"),
            deserialized.attributes.as_ref().unwrap().get("age")
        );
    }

    #[test]
    fn test_element_type_serialization() {
        let element_type = ElementType::Location;
        let json = serde_json::to_string(&element_type).unwrap();
        assert_eq!(json, "\"location\"");

        let deserialized: ElementType = serde_json::from_str(&json).unwrap();
        assert_eq!(element_type, deserialized);
    }

    #[test]
    fn test_element_with_hashmap_attributes() {
        let mut attributes = HashMap::new();
        attributes.insert("population".to_string(), "1000000".to_string());
        attributes.insert("climate".to_string(), "temperate".to_string());

        let element = Element {
            id: "loc-1".to_string(),
            universe_id: "univ-1".to_string(),
            name: "Coruscant".to_string(),
            description: "City planet".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            element_type: ElementType::Location,
            custom_type_name: None,
            details: None,
            attributes: Some(attributes.clone()),
            image_url: None,
            tags: None,
            relationships: None,
            related_story_ids: None,
            color: None,
            icon: None,
            favorite: None,
            order: None,
        };

        let json = serde_json::to_string(&element).unwrap();
        let deserialized: Element = serde_json::from_str(&json).unwrap();

        let attrs = deserialized.attributes.unwrap();
        assert_eq!(attrs.get("population").unwrap(), "1000000");
        assert_eq!(attrs.get("climate").unwrap(), "temperate");
    }

    #[test]
    fn test_element_relationship_serialization() {
        let relationship = ElementRelationship {
            target_element_id: "vehicle-1".to_string(),
            label: "owns".to_string(),
            inverse_label: Some("owned by".to_string()),
            description: Some("Primary vehicle".to_string()),
        };

        let json = serde_json::to_string(&relationship).unwrap();
        let deserialized: ElementRelationship = serde_json::from_str(&json).unwrap();

        assert_eq!(
            relationship.target_element_id,
            deserialized.target_element_id
        );
        assert_eq!(relationship.label, deserialized.label);
        assert_eq!(relationship.inverse_label, deserialized.inverse_label);
    }

    #[test]
    fn test_element_json_uses_camel_case() {
        let element = Element {
            id: "test".to_string(),
            universe_id: "univ".to_string(),
            name: "Test".to_string(),
            description: "Test".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            element_type: ElementType::Character,
            custom_type_name: Some("CustomType".to_string()),
            details: None,
            attributes: None,
            image_url: Some("/image.jpg".to_string()),
            tags: None,
            relationships: None,
            related_story_ids: Some(vec!["story-1".to_string()]),
            color: None,
            icon: None,
            favorite: None,
            order: None,
        };

        let json = serde_json::to_string(&element).unwrap();
        assert!(json.contains("universeId"));
        assert!(json.contains("createdAt"));
        assert!(json.contains("updatedAt"));
        assert!(json.contains("elementType"));
        assert!(json.contains("customTypeName"));
        assert!(json.contains("imageUrl"));
        assert!(json.contains("relatedStoryIds"));
    }
}
