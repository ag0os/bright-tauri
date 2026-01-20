use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// StorySnapshot domain model
///
/// A StorySnapshot represents a point-in-time save of content within a version.
/// Snapshots are created automatically (via auto-snapshot system) and can be
/// restored to recover previous states of a story's content.
///
/// This is part of the Database-Only Versioning (DBV) system:
/// - Story → Version → Snapshot hierarchy
/// - Snapshots are automatic saves within a version
/// - Users can restore to any previous snapshot
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/")]
#[serde(rename_all = "camelCase")]
pub struct StorySnapshot {
    /// Unique identifier for the snapshot
    pub id: String,

    /// ID of the version this snapshot belongs to
    pub version_id: String,

    /// The actual content text at this point in time
    pub content: String,

    /// ISO 8601 timestamp when this snapshot was created
    pub created_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_story_snapshot_serialization_round_trip() {
        let snapshot = StorySnapshot {
            id: "snapshot-1".to_string(),
            version_id: "version-1".to_string(),
            content: "Once upon a time...".to_string(),
            created_at: "2024-01-15T10:30:00Z".to_string(),
        };

        let json = serde_json::to_string(&snapshot).unwrap();
        let deserialized: StorySnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(snapshot.id, deserialized.id);
        assert_eq!(snapshot.version_id, deserialized.version_id);
        assert_eq!(snapshot.content, deserialized.content);
        assert_eq!(snapshot.created_at, deserialized.created_at);
    }

    #[test]
    fn test_story_snapshot_json_uses_camel_case() {
        let snapshot = StorySnapshot {
            id: "snap-1".to_string(),
            version_id: "ver-1".to_string(),
            content: "Test content".to_string(),
            created_at: "2024-01-15T10:30:00Z".to_string(),
        };

        let json = serde_json::to_string(&snapshot).unwrap();
        assert!(json.contains("versionId"));
        assert!(json.contains("createdAt"));
        // Verify snake_case is NOT used
        assert!(!json.contains("version_id"));
        assert!(!json.contains("created_at"));
    }

    #[test]
    fn test_story_snapshot_empty_content() {
        let snapshot = StorySnapshot {
            id: "snapshot-empty".to_string(),
            version_id: "version-1".to_string(),
            content: "".to_string(),
            created_at: "2024-01-15T10:30:00Z".to_string(),
        };

        let json = serde_json::to_string(&snapshot).unwrap();
        let deserialized: StorySnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.content, "");
    }

    #[test]
    fn test_story_snapshot_large_content() {
        let large_content = "A".repeat(100_000); // 100KB of content
        let snapshot = StorySnapshot {
            id: "snapshot-large".to_string(),
            version_id: "version-1".to_string(),
            content: large_content.clone(),
            created_at: "2024-01-15T10:30:00Z".to_string(),
        };

        let json = serde_json::to_string(&snapshot).unwrap();
        let deserialized: StorySnapshot = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.content.len(), 100_000);
        assert_eq!(deserialized.content, large_content);
    }
}
