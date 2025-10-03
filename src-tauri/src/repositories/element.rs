use crate::db::Database;
use crate::models::{CreateElementInput, Element, ElementRelationship, ElementType, UpdateElementInput};
use rusqlite::{params, Result};
use chrono::Utc;
use uuid::Uuid;
use std::collections::HashMap;

pub struct ElementRepository;

impl ElementRepository {
    /// Create a new Element
    pub fn create(db: &Database, input: CreateElementInput) -> Result<Element> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        let element_type_str = input.element_type
            .map(|et| format!("{:?}", et).to_lowercase())
            .unwrap_or_else(|| "character".to_string());

        let attributes_json = input.attributes.map(|a| serde_json::to_string(&a).unwrap());
        let tags_json = input.tags.map(|t| serde_json::to_string(&t).unwrap());

        db.execute(
            "INSERT INTO elements (
                id, universe_id, name, description, element_type, custom_type_name,
                details, attributes, image_url, created_at, updated_at, tags,
                color, icon, favorite, element_order
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            params![
                &id,
                &input.universe_id,
                &input.name,
                &input.description,
                &element_type_str,
                &input.custom_type_name,
                &input.details,
                &attributes_json,
                &input.image_url,
                &now,
                &now,
                &tags_json,
                &input.color,
                &input.icon,
                false,  // favorite
                0,  // element_order
            ],
        )?;

        // Create relationships if provided
        if let Some(relationships) = input.relationships {
            for rel in relationships {
                Self::create_relationship(db, &id, &rel)?;
            }
        }

        Self::find_by_id(db, &id)
    }

    /// Find an Element by ID
    pub fn find_by_id(db: &Database, id: &str) -> Result<Element> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let element = conn.query_row(
            "SELECT id, universe_id, name, description, element_type, custom_type_name,
                    details, attributes, image_url, created_at, updated_at, tags,
                    color, icon, favorite, element_order
             FROM elements WHERE id = ?1",
            params![id],
            Self::map_row_to_element,
        )?;

        drop(conn);

        // Load relationships
        let relationships = Self::get_relationships(db, id)?;

        Ok(Element {
            relationships: if relationships.is_empty() { None } else { Some(relationships) },
            ..element
        })
    }

    /// List all Elements for a Universe
    pub fn list_by_universe(db: &Database, universe_id: &str) -> Result<Vec<Element>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, name, description, element_type, custom_type_name,
                    details, attributes, image_url, created_at, updated_at, tags,
                    color, icon, favorite, element_order
             FROM elements
             WHERE universe_id = ?1
             ORDER BY element_order ASC, name ASC"
        )?;

        let element_ids: Vec<String> = stmt.query_map(params![universe_id], |row| row.get(0))?
            .collect::<Result<Vec<_>>>()?;

        drop(stmt);
        drop(conn);

        // Load each element with its relationships
        let mut elements = Vec::new();
        for element_id in element_ids {
            elements.push(Self::find_by_id(db, &element_id)?);
        }

        Ok(elements)
    }

    /// List Elements by type
    pub fn list_by_type(db: &Database, universe_id: &str, element_type: ElementType) -> Result<Vec<Element>> {
        let type_str = format!("{:?}", element_type).to_lowercase();

        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, universe_id, name, description, element_type, custom_type_name,
                    details, attributes, image_url, created_at, updated_at, tags,
                    color, icon, favorite, element_order
             FROM elements
             WHERE universe_id = ?1 AND element_type = ?2
             ORDER BY element_order ASC, name ASC"
        )?;

        let element_ids: Vec<String> = stmt.query_map(params![universe_id, type_str], |row| row.get(0))?
            .collect::<Result<Vec<_>>>()?;

        drop(stmt);
        drop(conn);

        let mut elements = Vec::new();
        for element_id in element_ids {
            elements.push(Self::find_by_id(db, &element_id)?);
        }

        Ok(elements)
    }

    /// Update an Element
    pub fn update(db: &Database, id: &str, input: UpdateElementInput) -> Result<Element> {
        let now = Utc::now().to_rfc3339();

        let element_type_str = input.element_type.map(|et| format!("{:?}", et).to_lowercase());
        let attributes_json = input.attributes.map(|a| serde_json::to_string(&a).unwrap());
        let tags_json = input.tags.map(|t| serde_json::to_string(&t).unwrap());

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
        if let Some(element_type) = element_type_str {
            updates.push("element_type = ?");
            params_vec.push(Box::new(element_type));
        }
        if let Some(custom_type_name) = input.custom_type_name {
            updates.push("custom_type_name = ?");
            params_vec.push(Box::new(custom_type_name));
        }
        if let Some(details) = input.details {
            updates.push("details = ?");
            params_vec.push(Box::new(details));
        }
        if let Some(attributes) = attributes_json {
            updates.push("attributes = ?");
            params_vec.push(Box::new(attributes));
        }
        if let Some(image_url) = input.image_url {
            updates.push("image_url = ?");
            params_vec.push(Box::new(image_url));
        }
        if let Some(tags) = tags_json {
            updates.push("tags = ?");
            params_vec.push(Box::new(tags));
        }
        if let Some(color) = input.color {
            updates.push("color = ?");
            params_vec.push(Box::new(color));
        }
        if let Some(icon) = input.icon {
            updates.push("icon = ?");
            params_vec.push(Box::new(icon));
        }
        if let Some(favorite) = input.favorite {
            updates.push("favorite = ?");
            params_vec.push(Box::new(favorite));
        }
        if let Some(order) = input.order {
            updates.push("element_order = ?");
            params_vec.push(Box::new(order));
        }

        let query = format!(
            "UPDATE elements SET {} WHERE id = ?",
            updates.join(", ")
        );

        params_vec.push(Box::new(id.to_string()));

        let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|b| b.as_ref()).collect();

        db.execute(&query, &params_refs)?;

        // Update relationships if provided
        if let Some(relationships) = input.relationships {
            // Delete existing relationships and recreate
            Self::delete_relationships(db, id)?;
            for rel in relationships {
                Self::create_relationship(db, id, &rel)?;
            }
        }

        Self::find_by_id(db, id)
    }

    /// Delete an Element
    pub fn delete(db: &Database, id: &str) -> Result<()> {
        // Relationships will be cascade deleted by the database
        db.execute("DELETE FROM elements WHERE id = ?1", params![id])?;
        Ok(())
    }

    /// Create a relationship between elements
    fn create_relationship(db: &Database, source_id: &str, rel: &ElementRelationship) -> Result<()> {
        let rel_id = Uuid::new_v4().to_string();

        db.execute(
            "INSERT INTO element_relationships (
                id, source_element_id, target_element_id, label, inverse_label, description
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                &rel_id,
                source_id,
                &rel.target_element_id,
                &rel.label,
                &rel.inverse_label,
                &rel.description,
            ],
        )?;

        Ok(())
    }

    /// Get all relationships for an element (both outgoing and incoming)
    fn get_relationships(db: &Database, element_id: &str) -> Result<Vec<ElementRelationship>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT target_element_id, label, inverse_label, description
             FROM element_relationships
             WHERE source_element_id = ?1"
        )?;

        let relationships = stmt.query_map(params![element_id], |row| {
            Ok(ElementRelationship {
                target_element_id: row.get(0)?,
                label: row.get(1)?,
                inverse_label: row.get(2)?,
                description: row.get(3)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;

        Ok(relationships)
    }

    /// Delete all relationships for an element
    fn delete_relationships(db: &Database, element_id: &str) -> Result<()> {
        db.execute(
            "DELETE FROM element_relationships WHERE source_element_id = ?1",
            params![element_id],
        )?;
        Ok(())
    }

    /// Get elements related to a specific element (including inverse relationships)
    pub fn get_related_elements(db: &Database, element_id: &str) -> Result<Vec<(String, Element)>> {
        let conn = db.connection();
        let conn = conn.lock().unwrap();

        // Get outgoing relationships
        let mut stmt = conn.prepare(
            "SELECT target_element_id, label
             FROM element_relationships
             WHERE source_element_id = ?1"
        )?;

        let mut related: Vec<(String, Element)> = stmt.query_map(params![element_id], |row| {
            let target_id: String = row.get(0)?;
            let label: String = row.get(1)?;
            Ok((target_id, label))
        })?
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .filter_map(|(target_id, label)| {
            Self::find_by_id(db, &target_id).ok().map(|el| (label, el))
        })
        .collect();

        // Get incoming relationships (using inverse label)
        let mut stmt = conn.prepare(
            "SELECT source_element_id, inverse_label
             FROM element_relationships
             WHERE target_element_id = ?1 AND inverse_label IS NOT NULL"
        )?;

        let incoming: Vec<(String, Element)> = stmt.query_map(params![element_id], |row| {
            let source_id: String = row.get(0)?;
            let inverse_label: String = row.get(1)?;
            Ok((source_id, inverse_label))
        })?
        .collect::<Result<Vec<_>>>()?
        .into_iter()
        .filter_map(|(source_id, label)| {
            Self::find_by_id(db, &source_id).ok().map(|el| (label, el))
        })
        .collect();

        related.extend(incoming);

        Ok(related)
    }

    /// Helper function to map a row to Element struct (without relationships)
    fn map_row_to_element(row: &rusqlite::Row) -> Result<Element> {
        let element_type_str: String = row.get(4)?;
        let attributes_json: Option<String> = row.get(7)?;
        let tags_json: Option<String> = row.get(11)?;

        let element_type: ElementType = serde_json::from_str(&format!("\"{}\"", element_type_str)).unwrap();
        let attributes: Option<HashMap<String, String>> = attributes_json.and_then(|s| serde_json::from_str(&s).ok());
        let tags = tags_json.and_then(|s| serde_json::from_str(&s).ok());

        Ok(Element {
            id: row.get(0)?,
            universe_id: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            element_type,
            custom_type_name: row.get(5)?,
            details: row.get(6)?,
            attributes,
            image_url: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
            tags,
            color: row.get(12)?,
            icon: row.get(13)?,
            favorite: row.get(14)?,
            order: row.get(15)?,
            relationships: None,  // Loaded separately
            related_story_ids: None,  // Not implemented yet
        })
    }
}
