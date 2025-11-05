use crate::db::Database;
use crate::models::{CreateUniverseInput, Universe, UniverseStatus, UpdateUniverseInput};
use rusqlite::{params, Result};
use chrono::Utc;
use uuid::Uuid;

pub struct UniverseRepository;

impl UniverseRepository {
    /// Create a new Universe
    pub fn create(db: &Database, input: CreateUniverseInput) -> Result<Universe> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        let genre_str = input.genre.as_ref().map(|g| serde_json::to_string(g).unwrap());
        let tone_str = input.tone.as_ref().map(|t| serde_json::to_string(t).unwrap());
        let themes_json = input.themes.as_ref().map(|t| serde_json::to_string(t).unwrap());
        let tags_json = input.tags.as_ref().map(|t| serde_json::to_string(t).unwrap());

        db.execute(
            "INSERT INTO universes (
                id, name, description, created_at, updated_at, genre, tone,
                worldbuilding_notes, themes, status, color, icon, tags
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            params![
                &id,
                &input.name,
                &input.description.unwrap_or_default(),
                &now,
                &now,
                &genre_str,
                &tone_str,
                &input.worldbuilding_notes,
                &themes_json,
                "active",
                &input.color,
                &input.icon,
                &tags_json,
            ],
        )?;

        Self::find_by_id(db, &id)
    }

    /// Find a Universe by ID
    pub fn find_by_id(db: &Database, id: &str) -> Result<Universe> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        conn.query_row(
            "SELECT id, name, description, created_at, updated_at, genre, tone,
                    worldbuilding_notes, themes, status, color, icon, tags
             FROM universes WHERE id = ?1",
            params![id],
            |row| {
                let genre_str: Option<String> = row.get(5)?;
                let tone_str: Option<String> = row.get(6)?;
                let themes_json: Option<String> = row.get(8)?;
                let status_str: String = row.get(9)?;
                let tags_json: Option<String> = row.get(12)?;

                let genre = genre_str.and_then(|s| serde_json::from_str(&s).ok());
                let tone = tone_str.and_then(|s| serde_json::from_str(&s).ok());
                let themes = themes_json.and_then(|s| serde_json::from_str(&s).ok());
                let status: UniverseStatus = serde_json::from_str(&format!("\"{status_str}\"")).unwrap();
                let tags = tags_json.and_then(|s| serde_json::from_str(&s).ok());

                Ok(Universe {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                    genre,
                    tone,
                    worldbuilding_notes: row.get(7)?,
                    themes,
                    status,
                    color: row.get(10)?,
                    icon: row.get(11)?,
                    tags,
                })
            },
        )
    }

    /// List all Universes
    pub fn list_all(db: &Database) -> Result<Vec<Universe>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, name, description, created_at, updated_at, genre, tone,
                    worldbuilding_notes, themes, status, color, icon, tags
             FROM universes
             ORDER BY updated_at DESC"
        )?;

        let universes = stmt.query_map([], |row| {
            let genre_str: Option<String> = row.get(5)?;
            let tone_str: Option<String> = row.get(6)?;
            let themes_json: Option<String> = row.get(8)?;
            let status_str: String = row.get(9)?;
            let tags_json: Option<String> = row.get(12)?;

            let genre = genre_str.and_then(|s| serde_json::from_str(&s).ok());
            let tone = tone_str.and_then(|s| serde_json::from_str(&s).ok());
            let themes = themes_json.and_then(|s| serde_json::from_str(&s).ok());
            let status: UniverseStatus = serde_json::from_str(&format!("\"{status_str}\"")).unwrap();
            let tags = tags_json.and_then(|s| serde_json::from_str(&s).ok());

            Ok(Universe {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                genre,
                tone,
                worldbuilding_notes: row.get(7)?,
                themes,
                status,
                color: row.get(10)?,
                icon: row.get(11)?,
                tags,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

        Ok(universes)
    }

    /// Update a Universe
    pub fn update(db: &Database, id: &str, input: UpdateUniverseInput) -> Result<Universe> {
        let now = Utc::now().to_rfc3339();

        let genre_str = input.genre.map(|g| serde_json::to_string(&g).unwrap());
        let tone_str = input.tone.map(|t| serde_json::to_string(&t).unwrap());
        let themes_json = input.themes.map(|t| serde_json::to_string(&t).unwrap());
        let tags_json = input.tags.map(|t| serde_json::to_string(&t).unwrap());
        let status_str = input.status.map(|s| format!("{s:?}").to_lowercase());

        // Build dynamic UPDATE query based on which fields are provided
        let mut updates = vec!["updated_at = ?1"];
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];

        if let Some(name) = input.name {
            updates.push("name = ?");
            params_vec.push(Box::new(name));
        }
        if let Some(description) = input.description {
            updates.push("description = ?");
            params_vec.push(Box::new(description));
        }
        if let Some(genre) = genre_str {
            updates.push("genre = ?");
            params_vec.push(Box::new(genre));
        }
        if let Some(tone) = tone_str {
            updates.push("tone = ?");
            params_vec.push(Box::new(tone));
        }
        if let Some(wb_notes) = input.worldbuilding_notes {
            updates.push("worldbuilding_notes = ?");
            params_vec.push(Box::new(wb_notes));
        }
        if let Some(themes) = themes_json {
            updates.push("themes = ?");
            params_vec.push(Box::new(themes));
        }
        if let Some(status) = status_str {
            updates.push("status = ?");
            params_vec.push(Box::new(status));
        }
        if let Some(color) = input.color {
            updates.push("color = ?");
            params_vec.push(Box::new(color));
        }
        if let Some(icon) = input.icon {
            updates.push("icon = ?");
            params_vec.push(Box::new(icon));
        }
        if let Some(tags) = tags_json {
            updates.push("tags = ?");
            params_vec.push(Box::new(tags));
        }

        let query = format!(
            "UPDATE universes SET {} WHERE id = ?",
            updates.join(", ")
        );

        params_vec.push(Box::new(id.to_string()));

        let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|b| b.as_ref()).collect();

        db.execute(&query, &params_refs)?;

        Self::find_by_id(db, id)
    }

    /// Delete a Universe
    pub fn delete(db: &Database, id: &str) -> Result<()> {
        db.execute("DELETE FROM universes WHERE id = ?1", params![id])?;
        Ok(())
    }
}
