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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "lowercase")]
pub enum UniverseStatus {
    Active,
    Archived,
    Template,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_universe_serialization_round_trip() {
        let universe = Universe {
            id: "test-id".to_string(),
            name: "Test Universe".to_string(),
            description: "A test universe".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            genre: Some(Genre::Fantasy),
            tone: Some(Tone::Dark),
            worldbuilding_notes: Some("Magic system notes".to_string()),
            themes: Some(vec!["adventure".to_string(), "friendship".to_string()]),
            status: UniverseStatus::Active,
            color: Some("#FF5733".to_string()),
            icon: Some("🌌".to_string()),
            tags: Some(vec!["epic".to_string(), "series".to_string()]),
        };

        let json = serde_json::to_string(&universe).unwrap();
        let deserialized: Universe = serde_json::from_str(&json).unwrap();

        assert_eq!(universe.id, deserialized.id);
        assert_eq!(universe.name, deserialized.name);
        assert_eq!(universe.genre, deserialized.genre);
    }

    #[test]
    fn test_universe_with_optional_fields_none() {
        let universe = Universe {
            id: "test-id".to_string(),
            name: "Minimal Universe".to_string(),
            description: "A minimal universe".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            genre: None,
            tone: None,
            worldbuilding_notes: None,
            themes: None,
            status: UniverseStatus::Active,
            color: None,
            icon: None,
            tags: None,
        };

        let json = serde_json::to_string(&universe).unwrap();
        let deserialized: Universe = serde_json::from_str(&json).unwrap();

        assert_eq!(universe.id, deserialized.id);
        assert!(deserialized.genre.is_none());
        assert!(deserialized.tags.is_none());
    }

    #[test]
    fn test_genre_serialization() {
        let genre = Genre::SciFi;
        let json = serde_json::to_string(&genre).unwrap();
        assert_eq!(json, "\"sci-fi\"");

        let deserialized: Genre = serde_json::from_str(&json).unwrap();
        assert!(matches!(deserialized, Genre::SciFi));
    }

    #[test]
    fn test_universe_status_serialization() {
        let status = UniverseStatus::Active;
        let json = serde_json::to_string(&status).unwrap();
        assert_eq!(json, "\"active\"");

        let deserialized: UniverseStatus = serde_json::from_str(&json).unwrap();
        assert!(matches!(deserialized, UniverseStatus::Active));
    }

    #[test]
    fn test_universe_json_uses_camel_case() {
        let universe = Universe {
            id: "test".to_string(),
            name: "Test".to_string(),
            description: "Test".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            genre: None,
            tone: None,
            worldbuilding_notes: Some("notes".to_string()),
            themes: None,
            status: UniverseStatus::Active,
            color: None,
            icon: None,
            tags: None,
        };

        let json = serde_json::to_string(&universe).unwrap();
        assert!(json.contains("createdAt"));
        assert!(json.contains("updatedAt"));
        assert!(json.contains("worldbuildingNotes"));
    }
}
