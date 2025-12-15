/// File management for story content in Git repositories
///
/// This module provides functions to create, update, and manage story content files
/// within Git repositories. Each story can have a Git repository with its chapters
/// and scenes stored as markdown files.
use crate::file_naming;
use crate::git::GitService;
use crate::models::Story;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use ts_rs::TS;

/// Error type for file management operations
#[derive(Debug)]
pub enum FileManagementError {
    /// File already exists at the target path
    #[allow(dead_code)]
    FileExists(PathBuf),
    /// IO error occurred
    Io(std::io::Error),
    /// Git operation error
    Git(crate::git::GitServiceError),
}

impl std::fmt::Display for FileManagementError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileManagementError::FileExists(path) => {
                write!(f, "File already exists: {}", path.display())
            }
            FileManagementError::Io(err) => write!(f, "IO error: {err}"),
            FileManagementError::Git(err) => write!(f, "Git error: {err}"),
        }
    }
}

impl std::error::Error for FileManagementError {}

impl From<std::io::Error> for FileManagementError {
    fn from(err: std::io::Error) -> Self {
        FileManagementError::Io(err)
    }
}

impl From<crate::git::GitServiceError> for FileManagementError {
    fn from(err: crate::git::GitServiceError) -> Self {
        FileManagementError::Git(err)
    }
}

#[allow(dead_code)]
pub type FileManagementResult<T> = Result<T, FileManagementError>;

/// Create a new story file in a Git repository
///
/// Creates a markdown file with the given content, using the file naming strategy
/// to generate a consistent filename based on order and title. Commits the file
/// to the Git repository.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `order` - The order/position of this story (1-based)
/// * `title` - The title of the story
/// * `content` - The markdown content to write
///
/// # Returns
/// The relative file path (e.g., "001-chapter-name.md")
///
/// # Errors
/// Returns an error if:
/// - The file already exists
/// - IO operations fail
/// - Git commit fails
#[allow(dead_code)]
pub fn create_story_file(
    repo_path: &Path,
    order: usize,
    title: &str,
    content: &str,
) -> FileManagementResult<String> {
    // Generate filename using naming strategy
    let filename = file_naming::generate_filename(order, title);
    let file_path = repo_path.join(&filename);

    // Check if file already exists
    if file_path.exists() {
        return Err(FileManagementError::FileExists(file_path));
    }

    // Write content to file
    fs::write(&file_path, content)?;

    // Commit to Git
    let commit_message = format!("Add {filename}: {title}");
    GitService::commit_file(repo_path, &filename, content, &commit_message)?;

    // Return relative filename
    Ok(filename)
}

/// Represents a story file to be reordered
#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct StoryFileToReorder {
    /// Current filename (e.g., "001-chapter.md")
    pub current_filename: String,
    /// New order/position (1-based)
    pub new_order: usize,
    /// Story title (for generating new filename)
    pub title: String,
}

/// Result of a file reorder operation
#[derive(Debug, Clone, PartialEq)]
pub struct FileRename {
    /// Old filename
    pub old_filename: String,
    /// New filename
    pub new_filename: String,
}

/// Reorder story files by renaming them with new order prefixes
///
/// When chapters are reordered, this function updates the order prefix in filenames
/// (e.g., "001-chapter.md" becomes "003-chapter.md") using Git mv operations.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `stories` - List of stories with their new order positions
///
/// # Returns
/// A vector of FileRename structs showing old and new filenames
///
/// # Errors
/// Returns an error if:
/// - A file doesn't exist
/// - Git operations fail
/// - IO operations fail
#[allow(dead_code)]
pub fn reorder_story_files(
    repo_path: &Path,
    stories: &[StoryFileToReorder],
) -> FileManagementResult<Vec<FileRename>> {
    use git2::Repository;

    // Open repository to verify it exists and is valid
    let _repo = Repository::open(repo_path)
        .map_err(|e| FileManagementError::Git(crate::git::GitServiceError::Git(e)))?;

    let mut renames = Vec::new();
    let mut commit_message_parts = Vec::new();

    // First pass: determine all renames
    for story in stories {
        let new_filename = file_naming::generate_filename(story.new_order, &story.title);

        // Only rename if filename actually changes
        if story.current_filename != new_filename {
            renames.push(FileRename {
                old_filename: story.current_filename.clone(),
                new_filename: new_filename.clone(),
            });
        }
    }

    // If no renames needed, return empty list
    if renames.is_empty() {
        return Ok(renames);
    }

    // Second pass: perform renames
    // We need to be careful about the order to avoid conflicts
    // Strategy: rename to temporary names first, then to final names
    let mut temp_renames = Vec::new();

    // Step 1: Rename all to temporary names
    for rename in &renames {
        let temp_name = format!("temp-{}", rename.old_filename);
        let old_path = repo_path.join(&rename.old_filename);
        let temp_path = repo_path.join(&temp_name);

        // Check if old file exists
        if !old_path.exists() {
            return Err(FileManagementError::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("File not found: {}", rename.old_filename),
            )));
        }

        fs::rename(&old_path, &temp_path)?;
        temp_renames.push((temp_name, rename.new_filename.clone()));
    }

    // Step 2: Rename from temporary names to final names
    for (temp_name, final_name) in temp_renames {
        let temp_path = repo_path.join(&temp_name);
        let final_path = repo_path.join(&final_name);
        fs::rename(&temp_path, &final_path)?;
    }

    // Build commit message
    commit_message_parts.push("Reorder story files\n".to_string());
    for rename in &renames {
        commit_message_parts.push(format!(
            "- {} → {}",
            rename.old_filename, rename.new_filename
        ));
    }

    let commit_message = commit_message_parts.join("\n");

    // Commit all changes
    GitService::commit_all(repo_path, &commit_message)?;

    Ok(renames)
}

/// Story metadata for storage in Git repository
///
/// This struct contains key story information that is stored as metadata.json
/// in each story's Git repository. It provides context about the story without
/// including the full content.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StoryMetadata {
    pub id: String,
    pub universe_id: String,
    pub title: String,
    pub description: String,
    pub story_type: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
    pub word_count: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub target_word_count: Option<u32>,
    /// Maps variation branch names (slugs) to their display names
    /// e.g., "what-if-sarah-lived" -> "What if Sarah lived?"
    /// This allows the UI to show friendly names while Git uses branch-safe slugs
    #[serde(default, skip_serializing_if = "std::collections::HashMap::is_empty")]
    pub variations: std::collections::HashMap<String, String>,
}

impl StoryMetadata {
    /// Create metadata from a Story
    #[allow(dead_code)]
    pub fn from_story(story: &Story) -> Self {
        StoryMetadata {
            id: story.id.clone(),
            universe_id: story.universe_id.clone(),
            title: story.title.clone(),
            description: story.description.clone(),
            story_type: format!("{:?}", story.story_type),
            status: format!("{:?}", story.status),
            created_at: story.created_at.clone(),
            updated_at: story.updated_at.clone(),
            word_count: story.word_count,
            target_word_count: story.target_word_count,
            variations: std::collections::HashMap::new(),
        }
    }
}

/// Write metadata.json file to a Git repository
///
/// Creates or updates the metadata.json file in the repository root with
/// story information. The file is formatted as pretty-printed JSON for
/// human readability and committed to Git.
///
/// On first creation, initializes the variations mapping with "original" -> "Original"
/// to establish the default branch name mapping for the Version System UX Abstraction.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `story` - The story to generate metadata from
///
/// # Returns
/// The relative path to the metadata file ("metadata.json")
///
/// # Errors
/// Returns an error if:
/// - JSON serialization fails
/// - File write fails
/// - Git commit fails
#[allow(dead_code)]
pub fn write_metadata_file(repo_path: &Path, story: &Story) -> FileManagementResult<String> {
    let metadata_path = repo_path.join("metadata.json");
    let is_new_metadata = !metadata_path.exists();

    let mut metadata = StoryMetadata::from_story(story);

    // Initialize variations mapping on first creation
    if is_new_metadata && metadata.variations.is_empty() {
        metadata.variations.insert("original".to_string(), "Original".to_string());
    }

    // Serialize to pretty JSON
    let json = serde_json::to_string_pretty(&metadata).map_err(|e| {
        FileManagementError::Io(std::io::Error::other(format!(
            "Failed to serialize metadata: {e}"
        )))
    })?;

    fs::write(&metadata_path, &json)?;

    // Commit to Git
    let commit_message = format!("Update metadata for story: {}", story.title);
    GitService::commit_file(repo_path, "metadata.json", &json, &commit_message)?;

    Ok("metadata.json".to_string())
}

/// Update metadata.json file in a Git repository
///
/// This is an alias for write_metadata_file, as the operation is the same
/// whether creating or updating the metadata file.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `story` - The story with updated metadata
///
/// # Returns
/// The relative path to the metadata file ("metadata.json")
#[allow(dead_code)]
pub fn update_metadata_file(repo_path: &Path, story: &Story) -> FileManagementResult<String> {
    write_metadata_file(repo_path, story)
}

/// Read metadata.json file from a Git repository
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// StoryMetadata parsed from the metadata.json file
///
/// # Errors
/// Returns an error if:
/// - File doesn't exist
/// - File cannot be read
/// - JSON parsing fails
#[allow(dead_code)]
pub fn read_metadata_file(repo_path: &Path) -> FileManagementResult<StoryMetadata> {
    let metadata_path = repo_path.join("metadata.json");
    let json_content = fs::read_to_string(&metadata_path)?;
    let metadata: StoryMetadata = serde_json::from_str(&json_content).map_err(|e| {
        FileManagementError::Io(std::io::Error::other(format!(
            "Failed to parse metadata: {e}"
        )))
    })?;
    Ok(metadata)
}

/// Information about a story variation (Git branch with display name)
///
/// This struct represents a variation/branch in a story's Git repository,
/// combining the Git branch name (slug) with its user-friendly display name.
#[derive(Debug, Clone, Serialize, Deserialize, TS, PartialEq)]
#[ts(export, export_to = "../../src/types/")]
pub struct VariationInfo {
    /// Git branch name (slug), e.g., "what-if-sarah-lived"
    pub slug: String,
    /// User-facing display name, e.g., "What if Sarah lived?"
    pub display_name: String,
    /// Is this the currently active branch?
    pub is_current: bool,
    /// Is this the original/main branch?
    pub is_original: bool,
}

/// Save or update a variation mapping in metadata.json
///
/// Adds or updates the variation mapping in the metadata file, then commits
/// the change to Git. If the variations field doesn't exist, it will be created.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `slug` - The Git branch name (e.g., "what-if-sarah-lived")
/// * `display_name` - The user-friendly name (e.g., "What if Sarah lived?")
///
/// # Returns
/// Success or error
///
/// # Errors
/// Returns an error if:
/// - Metadata file doesn't exist
/// - File cannot be read or written
/// - Git commit fails
#[allow(dead_code)]
pub fn save_variation_mapping(
    repo_path: &Path,
    slug: &str,
    display_name: &str,
) -> FileManagementResult<()> {
    // Read existing metadata
    let mut metadata = read_metadata_file(repo_path)?;

    // Update variations mapping
    metadata
        .variations
        .insert(slug.to_string(), display_name.to_string());

    // Serialize to pretty JSON
    let json = serde_json::to_string_pretty(&metadata).map_err(|e| {
        FileManagementError::Io(std::io::Error::other(format!(
            "Failed to serialize metadata: {e}"
        )))
    })?;

    // Write to file
    let metadata_path = repo_path.join("metadata.json");
    fs::write(&metadata_path, &json)?;

    // Commit to Git
    let commit_message = format!("Save variation mapping: {} -> {}", slug, display_name);
    GitService::commit_file(repo_path, "metadata.json", &json, &commit_message)?;

    Ok(())
}

/// Get the display name for a variation
///
/// Retrieves the display name from the metadata file. If the mapping doesn't
/// exist, returns the slug as the display name (for backward compatibility).
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `slug` - The Git branch name
///
/// # Returns
/// The display name if found, or the slug if not found
///
/// # Errors
/// Returns an error if:
/// - Metadata file doesn't exist
/// - File cannot be read
#[allow(dead_code)]
pub fn get_variation_display_name(repo_path: &Path, slug: &str) -> FileManagementResult<String> {
    // Read metadata
    let metadata = read_metadata_file(repo_path)?;

    // Return display name if found, otherwise return slug as fallback
    Ok(metadata
        .variations
        .get(slug)
        .cloned()
        .unwrap_or_else(|| slug.to_string()))
}

/// List all variations in the repository
///
/// Returns information about all Git branches (variations) including their
/// display names, current status, and whether they're the original branch.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// Vector of VariationInfo structs
///
/// # Errors
/// Returns an error if:
/// - Repository doesn't exist
/// - Git operations fail
/// - Metadata cannot be read
#[allow(dead_code)]
pub fn list_variations(repo_path: &Path) -> FileManagementResult<Vec<VariationInfo>> {
    // Get all branches from Git
    let branches = GitService::list_branches(repo_path)?;

    // Get current branch
    let current_branch = GitService::get_current_branch(repo_path)?;

    // Read metadata (handle missing file gracefully)
    let metadata = read_metadata_file(repo_path).unwrap_or_else(|_| StoryMetadata {
        id: String::new(),
        universe_id: String::new(),
        title: String::new(),
        description: String::new(),
        story_type: String::new(),
        status: String::new(),
        created_at: String::new(),
        updated_at: String::new(),
        word_count: 0,
        target_word_count: None,
        variations: HashMap::new(),
    });

    // Build VariationInfo for each branch
    let variations = branches
        .into_iter()
        .map(|slug| {
            let display_name = metadata
                .variations
                .get(&slug)
                .cloned()
                .unwrap_or_else(|| slug.clone());

            let is_current = slug == current_branch;
            let is_original = slug == "original" || slug == "main";

            VariationInfo {
                slug,
                display_name,
                is_current,
                is_original,
            }
        })
        .collect();

    Ok(variations)
}

/// Remove a variation mapping from metadata.json
///
/// Removes the variation mapping when a branch is deleted. This should be called
/// after the Git branch is deleted to keep metadata in sync.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `slug` - The Git branch name to remove
///
/// # Returns
/// Success or error
///
/// # Errors
/// Returns an error if:
/// - Metadata file doesn't exist
/// - File cannot be read or written
/// - Git commit fails
#[allow(dead_code)]
pub fn remove_variation_mapping(repo_path: &Path, slug: &str) -> FileManagementResult<()> {
    // Read existing metadata
    let mut metadata = read_metadata_file(repo_path)?;

    // Remove the variation mapping
    metadata.variations.remove(slug);

    // Serialize to pretty JSON
    let json = serde_json::to_string_pretty(&metadata).map_err(|e| {
        FileManagementError::Io(std::io::Error::other(format!(
            "Failed to serialize metadata: {e}"
        )))
    })?;

    // Write to file
    let metadata_path = repo_path.join("metadata.json");
    fs::write(&metadata_path, &json)?;

    // Commit to Git
    let commit_message = format!("Remove variation mapping: {}", slug);
    GitService::commit_file(repo_path, "metadata.json", &json, &commit_message)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::git::GitService;
    use tempfile::TempDir;

    #[test]
    fn test_create_story_file_basic() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let filename = create_story_file(
            &repo_path,
            1,
            "First Chapter",
            "# First Chapter\n\nContent here",
        )
        .unwrap();

        assert_eq!(filename, "001-first-chapter.md");

        // Verify file exists
        let file_path = repo_path.join(&filename);
        assert!(file_path.exists());

        // Verify content
        let content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(content, "# First Chapter\n\nContent here");
    }

    #[test]
    fn test_create_story_file_committed_to_git() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        create_story_file(&repo_path, 1, "First Chapter", "# Content").unwrap();

        // Get git history and verify commit was created
        let history = {
            let repo = git2::Repository::open(&repo_path).unwrap();
            let head_name = repo.head().unwrap().shorthand().unwrap().to_string();
            GitService::get_history(&repo_path, &head_name).unwrap()
        };

        // Should have 2 commits: initial + our new file
        assert_eq!(history.len(), 2);
        assert!(history[0].message.contains("001-first-chapter.md"));
        assert!(history[0].message.contains("First Chapter"));
    }

    #[test]
    fn test_create_story_file_with_special_chars() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let filename = create_story_file(&repo_path, 5, "The Knight's Tale!", "Content").unwrap();

        assert_eq!(filename, "005-the-knights-tale.md");

        let file_path = repo_path.join(&filename);
        assert!(file_path.exists());
    }

    #[test]
    fn test_create_story_file_fails_if_exists() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Create file first time
        create_story_file(&repo_path, 1, "Chapter", "Content").unwrap();

        // Try to create again - should fail
        let result = create_story_file(&repo_path, 1, "Chapter", "Different content");

        assert!(result.is_err());
        match result.unwrap_err() {
            FileManagementError::FileExists(path) => {
                assert!(path.ends_with("001-chapter.md"));
            }
            _ => panic!("Expected FileExists error"),
        }
    }

    #[test]
    fn test_create_story_file_multiple_files() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let file1 = create_story_file(&repo_path, 1, "First", "Content 1").unwrap();
        let file2 = create_story_file(&repo_path, 2, "Second", "Content 2").unwrap();
        let file3 = create_story_file(&repo_path, 3, "Third", "Content 3").unwrap();

        assert_eq!(file1, "001-first.md");
        assert_eq!(file2, "002-second.md");
        assert_eq!(file3, "003-third.md");

        // Verify all files exist
        assert!(repo_path.join(&file1).exists());
        assert!(repo_path.join(&file2).exists());
        assert!(repo_path.join(&file3).exists());
    }

    #[test]
    fn test_create_story_file_returns_relative_path() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let filename = create_story_file(&repo_path, 42, "The Answer", "42").unwrap();

        // Returned filename should be relative, not absolute
        assert_eq!(filename, "042-the-answer.md");
        assert!(!filename.contains('/'));
        assert!(!filename.contains('\\'));
    }

    #[test]
    fn test_reorder_story_files_basic() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Create three files in order
        create_story_file(&repo_path, 1, "First", "Content 1").unwrap();
        create_story_file(&repo_path, 2, "Second", "Content 2").unwrap();
        create_story_file(&repo_path, 3, "Third", "Content 3").unwrap();

        // Reorder: swap first and third
        let stories = vec![
            StoryFileToReorder {
                current_filename: "001-first.md".to_string(),
                new_order: 3,
                title: "First".to_string(),
            },
            StoryFileToReorder {
                current_filename: "002-second.md".to_string(),
                new_order: 2,
                title: "Second".to_string(),
            },
            StoryFileToReorder {
                current_filename: "003-third.md".to_string(),
                new_order: 1,
                title: "Third".to_string(),
            },
        ];

        let renames = reorder_story_files(&repo_path, &stories).unwrap();

        // Should have 2 renames (second doesn't change)
        assert_eq!(renames.len(), 2);

        // Verify the renames
        assert!(renames.contains(&FileRename {
            old_filename: "001-first.md".to_string(),
            new_filename: "003-first.md".to_string(),
        }));
        assert!(renames.contains(&FileRename {
            old_filename: "003-third.md".to_string(),
            new_filename: "001-third.md".to_string(),
        }));

        // Verify files exist with new names
        assert!(repo_path.join("001-third.md").exists());
        assert!(repo_path.join("002-second.md").exists());
        assert!(repo_path.join("003-first.md").exists());

        // Verify old files don't exist
        assert!(!repo_path.join("001-first.md").exists());
        assert!(!repo_path.join("003-third.md").exists());

        // Verify content is preserved
        let content1 = fs::read_to_string(repo_path.join("001-third.md")).unwrap();
        assert_eq!(content1, "Content 3");
        let content3 = fs::read_to_string(repo_path.join("003-first.md")).unwrap();
        assert_eq!(content3, "Content 1");
    }

    #[test]
    fn test_reorder_story_files_no_changes() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        create_story_file(&repo_path, 1, "First", "Content").unwrap();

        // Reorder with same position
        let stories = vec![StoryFileToReorder {
            current_filename: "001-first.md".to_string(),
            new_order: 1,
            title: "First".to_string(),
        }];

        let renames = reorder_story_files(&repo_path, &stories).unwrap();

        // No renames should occur
        assert_eq!(renames.len(), 0);
    }

    #[test]
    fn test_reorder_story_files_committed_to_git() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        create_story_file(&repo_path, 1, "Chapter A", "Content A").unwrap();
        create_story_file(&repo_path, 2, "Chapter B", "Content B").unwrap();

        // Swap them
        let stories = vec![
            StoryFileToReorder {
                current_filename: "001-chapter-a.md".to_string(),
                new_order: 2,
                title: "Chapter A".to_string(),
            },
            StoryFileToReorder {
                current_filename: "002-chapter-b.md".to_string(),
                new_order: 1,
                title: "Chapter B".to_string(),
            },
        ];

        reorder_story_files(&repo_path, &stories).unwrap();

        // Get git history and verify commit was created
        let history = {
            let repo = git2::Repository::open(&repo_path).unwrap();
            let head_name = repo.head().unwrap().shorthand().unwrap().to_string();
            GitService::get_history(&repo_path, &head_name).unwrap()
        };

        // Should have commits: initial + file1 + file2 + reorder
        assert_eq!(history.len(), 4);
        assert!(history[0].message.contains("Reorder story files"));
    }

    #[test]
    fn test_reorder_story_files_fails_if_file_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Try to reorder a file that doesn't exist
        let stories = vec![StoryFileToReorder {
            current_filename: "999-nonexistent.md".to_string(),
            new_order: 1,
            title: "Nonexistent".to_string(),
        }];

        let result = reorder_story_files(&repo_path, &stories);

        assert!(result.is_err());
        match result.unwrap_err() {
            FileManagementError::Io(err) => {
                assert_eq!(err.kind(), std::io::ErrorKind::NotFound);
            }
            _ => panic!("Expected IO error"),
        }
    }

    #[test]
    fn test_reorder_story_files_complex_reordering() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Create 5 files
        for i in 1..=5 {
            create_story_file(
                &repo_path,
                i,
                &format!("Chapter {i}"),
                &format!("Content {i}"),
            )
            .unwrap();
        }

        // Completely reverse the order
        let stories = vec![
            StoryFileToReorder {
                current_filename: "001-chapter-1.md".to_string(),
                new_order: 5,
                title: "Chapter 1".to_string(),
            },
            StoryFileToReorder {
                current_filename: "002-chapter-2.md".to_string(),
                new_order: 4,
                title: "Chapter 2".to_string(),
            },
            StoryFileToReorder {
                current_filename: "003-chapter-3.md".to_string(),
                new_order: 3,
                title: "Chapter 3".to_string(),
            },
            StoryFileToReorder {
                current_filename: "004-chapter-4.md".to_string(),
                new_order: 2,
                title: "Chapter 4".to_string(),
            },
            StoryFileToReorder {
                current_filename: "005-chapter-5.md".to_string(),
                new_order: 1,
                title: "Chapter 5".to_string(),
            },
        ];

        let renames = reorder_story_files(&repo_path, &stories).unwrap();

        // Should have 4 renames (middle one stays same)
        assert_eq!(renames.len(), 4);

        // Verify all new files exist with correct content
        let content1 = fs::read_to_string(repo_path.join("001-chapter-5.md")).unwrap();
        assert_eq!(content1, "Content 5");

        let content5 = fs::read_to_string(repo_path.join("005-chapter-1.md")).unwrap();
        assert_eq!(content5, "Content 1");
    }

    // Helper function to create a test Story
    fn create_test_story() -> Story {
        use crate::models::{StoryStatus, StoryType, VariationType};
        Story {
            id: "test-story-123".to_string(),
            universe_id: "universe-456".to_string(),
            title: "Test Story".to_string(),
            description: "A test story description".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-02T00:00:00Z".to_string(),
            story_type: StoryType::Novel,
            status: StoryStatus::InProgress,
            word_count: 1000,
            target_word_count: Some(50000),
            content: "Story content".to_string(),
            notes: Some("Story notes".to_string()),
            outline: None,
            order: None,
            tags: None,
            color: None,
            favorite: None,
            related_element_ids: None,
            parent_story_id: None,
            series_name: None,
            last_edited_at: "2024-01-02T00:00:00Z".to_string(),
            version: 1,
            variation_group_id: "var-group-789".to_string(),
            variation_type: VariationType::Original,
            parent_variation_id: None,
            git_repo_path: String::new(),
            current_branch: "main".to_string(),
            staged_changes: false,
        }
    }

    #[test]
    fn test_write_metadata_file_creates_json() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        let filename = write_metadata_file(&repo_path, &story).unwrap();

        assert_eq!(filename, "metadata.json");

        // Verify file exists
        let metadata_path = repo_path.join("metadata.json");
        assert!(metadata_path.exists());

        // Verify content is valid JSON
        let json_content = fs::read_to_string(&metadata_path).unwrap();
        let metadata: StoryMetadata = serde_json::from_str(&json_content).unwrap();

        assert_eq!(metadata.id, "test-story-123");
        assert_eq!(metadata.title, "Test Story");
        assert_eq!(metadata.universe_id, "universe-456");
        assert_eq!(metadata.word_count, 1000);
        assert_eq!(metadata.target_word_count, Some(50000));
    }

    #[test]
    fn test_write_metadata_file_pretty_printed() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Read the file content
        let metadata_path = repo_path.join("metadata.json");
        let json_content = fs::read_to_string(&metadata_path).unwrap();

        // Verify it's pretty-printed (has newlines and indentation)
        assert!(json_content.contains('\n'));
        assert!(json_content.contains("  ")); // Has indentation

        // Verify it's valid JSON
        let _metadata: StoryMetadata = serde_json::from_str(&json_content).unwrap();
    }

    #[test]
    fn test_write_metadata_file_committed_to_git() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Get git history and verify commit was created
        let history = {
            let repo = git2::Repository::open(&repo_path).unwrap();
            let head_name = repo.head().unwrap().shorthand().unwrap().to_string();
            GitService::get_history(&repo_path, &head_name).unwrap()
        };

        // Should have 2 commits: initial + metadata
        assert_eq!(history.len(), 2);
        assert!(history[0].message.contains("Update metadata"));
        assert!(history[0].message.contains("Test Story"));
    }

    #[test]
    fn test_update_metadata_file_updates_existing() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let mut story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Update story
        story.title = "Updated Title".to_string();
        story.word_count = 2000;
        update_metadata_file(&repo_path, &story).unwrap();

        // Read metadata and verify it's updated
        let metadata_path = repo_path.join("metadata.json");
        let json_content = fs::read_to_string(&metadata_path).unwrap();
        let metadata: StoryMetadata = serde_json::from_str(&json_content).unwrap();

        assert_eq!(metadata.title, "Updated Title");
        assert_eq!(metadata.word_count, 2000);
    }

    #[test]
    fn test_story_metadata_from_story() {
        let story = create_test_story();
        let metadata = StoryMetadata::from_story(&story);

        assert_eq!(metadata.id, story.id);
        assert_eq!(metadata.universe_id, story.universe_id);
        assert_eq!(metadata.title, story.title);
        assert_eq!(metadata.description, story.description);
        assert_eq!(metadata.created_at, story.created_at);
        assert_eq!(metadata.updated_at, story.updated_at);
        assert_eq!(metadata.word_count, story.word_count);
        assert_eq!(metadata.target_word_count, story.target_word_count);
    }

    #[test]
    fn test_story_metadata_serialization() {
        let metadata = StoryMetadata {
            id: "test-123".to_string(),
            universe_id: "uni-456".to_string(),
            title: "Test".to_string(),
            description: "Desc".to_string(),
            story_type: "Book".to_string(),
            status: "InProgress".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-02T00:00:00Z".to_string(),
            word_count: 1000,
            target_word_count: Some(50000),
            variations: std::collections::HashMap::new(),
        };

        // Serialize and deserialize
        let json = serde_json::to_string_pretty(&metadata).unwrap();
        let deserialized: StoryMetadata = serde_json::from_str(&json).unwrap();

        assert_eq!(metadata, deserialized);
    }

    #[test]
    fn test_story_metadata_variations_field() {
        let mut variations = std::collections::HashMap::new();
        variations.insert(
            "what-if-sarah-lived".to_string(),
            "What if Sarah lived?".to_string(),
        );
        variations.insert(
            "alternate-ending".to_string(),
            "Alternate Ending".to_string(),
        );

        let metadata = StoryMetadata {
            id: "test-123".to_string(),
            universe_id: "uni-456".to_string(),
            title: "Test".to_string(),
            description: "Desc".to_string(),
            story_type: "Book".to_string(),
            status: "InProgress".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-02T00:00:00Z".to_string(),
            word_count: 1000,
            target_word_count: Some(50000),
            variations,
        };

        // Serialize and deserialize
        let json = serde_json::to_string_pretty(&metadata).unwrap();
        let deserialized: StoryMetadata = serde_json::from_str(&json).unwrap();

        assert_eq!(metadata, deserialized);
        assert_eq!(deserialized.variations.len(), 2);
        assert_eq!(
            deserialized.variations.get("what-if-sarah-lived"),
            Some(&"What if Sarah lived?".to_string())
        );
    }

    #[test]
    fn test_story_metadata_variations_empty_not_serialized() {
        // Empty variations should not appear in JSON
        let metadata = StoryMetadata {
            id: "test-123".to_string(),
            universe_id: "uni-456".to_string(),
            title: "Test".to_string(),
            description: "Desc".to_string(),
            story_type: "Book".to_string(),
            status: "InProgress".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-02T00:00:00Z".to_string(),
            word_count: 1000,
            target_word_count: Some(50000),
            variations: std::collections::HashMap::new(),
        };

        let json = serde_json::to_string_pretty(&metadata).unwrap();
        // Variations field should not be present in JSON when empty
        assert!(!json.contains("variations"));
    }

    #[test]
    fn test_story_metadata_backward_compatibility() {
        // Old metadata.json without variations field should still parse
        let old_json = r#"{
            "id": "test-123",
            "universe_id": "uni-456",
            "title": "Test",
            "description": "Desc",
            "story_type": "Book",
            "status": "InProgress",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-02T00:00:00Z",
            "word_count": 1000,
            "target_word_count": 50000
        }"#;

        let metadata: StoryMetadata = serde_json::from_str(old_json).unwrap();
        assert_eq!(metadata.id, "test-123");
        assert_eq!(metadata.variations.len(), 0);
    }

    #[test]
    fn test_read_metadata_file() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Read metadata back
        let metadata = read_metadata_file(&repo_path).unwrap();

        assert_eq!(metadata.id, story.id);
        assert_eq!(metadata.title, story.title);
        assert_eq!(metadata.word_count, story.word_count);
    }

    #[test]
    fn test_read_metadata_file_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = temp_dir.path().join("nonexistent");

        let result = read_metadata_file(&repo_path);
        assert!(result.is_err());
    }

    // Tests for variation CRUD functions

    #[test]
    fn test_save_variation_mapping_adds_new_variation() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Create initial metadata
        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Save a variation mapping
        save_variation_mapping(
            &repo_path,
            "what-if-sarah-lived",
            "What if Sarah lived?",
        )
        .unwrap();

        // Read metadata and verify
        let metadata = read_metadata_file(&repo_path).unwrap();
        // Should have "original" (auto-created) + "what-if-sarah-lived"
        assert!(metadata.variations.len() >= 1);
        assert_eq!(
            metadata.variations.get("what-if-sarah-lived"),
            Some(&"What if Sarah lived?".to_string())
        );
    }

    #[test]
    fn test_save_variation_mapping_updates_existing_variation() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Save initial mapping
        save_variation_mapping(&repo_path, "alternate-ending", "Alternate Ending").unwrap();

        // Update with new display name
        save_variation_mapping(&repo_path, "alternate-ending", "Alternate Ending v2").unwrap();

        // Verify update
        let metadata = read_metadata_file(&repo_path).unwrap();
        assert_eq!(
            metadata.variations.get("alternate-ending"),
            Some(&"Alternate Ending v2".to_string())
        );
    }

    #[test]
    fn test_save_variation_mapping_multiple_variations() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Save multiple variations
        save_variation_mapping(&repo_path, "variation-1", "Variation One").unwrap();
        save_variation_mapping(&repo_path, "variation-2", "Variation Two").unwrap();
        save_variation_mapping(&repo_path, "variation-3", "Variation Three").unwrap();

        // Verify all variations
        let metadata = read_metadata_file(&repo_path).unwrap();
        assert!(metadata.variations.len() >= 3); // At least the 3 we added
        assert_eq!(
            metadata.variations.get("variation-1"),
            Some(&"Variation One".to_string())
        );
        assert_eq!(
            metadata.variations.get("variation-2"),
            Some(&"Variation Two".to_string())
        );
        assert_eq!(
            metadata.variations.get("variation-3"),
            Some(&"Variation Three".to_string())
        );
    }

    #[test]
    fn test_save_variation_mapping_commits_to_git() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        save_variation_mapping(&repo_path, "test-variation", "Test Variation").unwrap();

        // Get git history and verify commit
        let history = {
            let repo = git2::Repository::open(&repo_path).unwrap();
            let head_name = repo.head().unwrap().shorthand().unwrap().to_string();
            GitService::get_history(&repo_path, &head_name).unwrap()
        };

        // Should have commits: initial + metadata + variation
        assert!(history.len() >= 3);
        assert!(history[0].message.contains("Save variation mapping"));
        assert!(history[0].message.contains("test-variation"));
    }

    #[test]
    fn test_get_variation_display_name_returns_display_name() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        save_variation_mapping(&repo_path, "my-variation", "My Variation").unwrap();

        let display_name = get_variation_display_name(&repo_path, "my-variation").unwrap();
        assert_eq!(display_name, "My Variation");
    }

    #[test]
    fn test_get_variation_display_name_returns_slug_if_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Query a variation that doesn't have a mapping
        let display_name = get_variation_display_name(&repo_path, "nonexistent").unwrap();
        assert_eq!(display_name, "nonexistent");
    }

    #[test]
    fn test_list_variations_returns_all_branches() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Get the actual current branch name after init
        let current_branch = GitService::get_current_branch(&repo_path).unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Create some branches from the current branch
        GitService::create_branch(&repo_path, &current_branch, "variation-1").unwrap();
        GitService::create_branch(&repo_path, &current_branch, "variation-2").unwrap();

        // Save mappings for some (but not all) branches
        save_variation_mapping(&repo_path, "variation-1", "Variation One").unwrap();

        // List variations
        let variations = list_variations(&repo_path).unwrap();

        // Should have 3 branches: current_branch, variation-1, variation-2
        assert_eq!(variations.len(), 3);

        // Find each variation
        let main_var = variations
            .iter()
            .find(|v| v.slug == current_branch)
            .unwrap();
        let var1 = variations
            .iter()
            .find(|v| v.slug == "variation-1")
            .unwrap();
        let var2 = variations
            .iter()
            .find(|v| v.slug == "variation-2")
            .unwrap();

        // Verify current branch (main)
        assert!(main_var.is_original);
        assert!(main_var.is_current);
        assert_eq!(main_var.slug, current_branch);

        // Verify variation-1 (has mapping)
        assert!(!var1.is_original);
        assert!(!var1.is_current);
        assert_eq!(var1.display_name, "Variation One");

        // Verify variation-2 (no mapping, uses slug)
        assert!(!var2.is_original);
        assert!(!var2.is_current);
        assert_eq!(var2.display_name, "variation-2");
    }

    #[test]
    fn test_list_variations_marks_current_branch() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Get the actual current branch name after init
        let current_branch = GitService::get_current_branch(&repo_path).unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Create and checkout a branch
        GitService::create_branch(&repo_path, &current_branch, "feature-branch").unwrap();
        GitService::checkout_branch(&repo_path, "feature-branch").unwrap();

        // List variations
        let variations = list_variations(&repo_path).unwrap();

        // Find feature-branch
        let feature = variations
            .iter()
            .find(|v| v.slug == "feature-branch")
            .unwrap();
        let main = variations
            .iter()
            .find(|v| v.slug == current_branch)
            .unwrap();

        // Verify current status
        assert!(feature.is_current);
        assert!(!main.is_current);
    }

    #[test]
    fn test_list_variations_handles_missing_metadata() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Delete metadata.json
        fs::remove_file(repo_path.join("metadata.json")).unwrap();

        // Should still work, returning empty variations map
        let variations = list_variations(&repo_path).unwrap();

        // Should have 1 branch: original (renamed from main/master during init_repo)
        assert_eq!(variations.len(), 1);
        assert_eq!(variations[0].slug, "original");
        assert_eq!(variations[0].display_name, "original"); // Uses slug as fallback
    }

    #[test]
    fn test_list_variations_marks_original_for_main_and_original() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        // Get the actual current branch name after init
        let current_branch = GitService::get_current_branch(&repo_path).unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Create branches - note: "original" might already exist, so try to create it but don't fail if it exists
        let _ = GitService::create_branch(&repo_path, &current_branch, "original");
        GitService::create_branch(&repo_path, &current_branch, "other-branch").unwrap();

        let variations = list_variations(&repo_path).unwrap();

        let main = variations
            .iter()
            .find(|v| v.slug == current_branch)
            .unwrap();
        let other = variations
            .iter()
            .find(|v| v.slug == "other-branch")
            .unwrap();

        // Current branch (main) should be marked as original
        assert!(main.is_original);
        assert!(!other.is_original);

        // If "original" branch exists, it should also be marked as original
        if let Some(original) = variations.iter().find(|v| v.slug == "original") {
            assert!(original.is_original);
        }
    }

    #[test]
    fn test_remove_variation_mapping_removes_variation() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Add variations
        save_variation_mapping(&repo_path, "var-1", "Variation One").unwrap();
        save_variation_mapping(&repo_path, "var-2", "Variation Two").unwrap();

        // Remove one
        remove_variation_mapping(&repo_path, "var-1").unwrap();

        // Verify removal
        let metadata = read_metadata_file(&repo_path).unwrap();
        assert!(metadata.variations.get("var-1").is_none());
        assert_eq!(
            metadata.variations.get("var-2"),
            Some(&"Variation Two".to_string())
        );
    }

    #[test]
    fn test_remove_variation_mapping_commits_to_git() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        save_variation_mapping(&repo_path, "test-var", "Test Variation").unwrap();
        remove_variation_mapping(&repo_path, "test-var").unwrap();

        // Get git history and verify commit
        let history = {
            let repo = git2::Repository::open(&repo_path).unwrap();
            let head_name = repo.head().unwrap().shorthand().unwrap().to_string();
            GitService::get_history(&repo_path, &head_name).unwrap()
        };

        // Should have commits including the remove commit
        assert!(history[0].message.contains("Remove variation mapping"));
        assert!(history[0].message.contains("test-var"));
    }

    #[test]
    fn test_remove_variation_mapping_nonexistent_is_ok() {
        let temp_dir = TempDir::new().unwrap();
        let repo_path = GitService::init_repo(temp_dir.path(), "test-story").unwrap();

        let story = create_test_story();
        write_metadata_file(&repo_path, &story).unwrap();

        // Remove a variation that doesn't exist - should succeed silently
        let result = remove_variation_mapping(&repo_path, "nonexistent");
        assert!(result.is_ok());
    }

    #[test]
    fn test_variation_info_struct() {
        let info = VariationInfo {
            slug: "what-if-sarah-lived".to_string(),
            display_name: "What if Sarah lived?".to_string(),
            is_current: true,
            is_original: false,
        };

        assert_eq!(info.slug, "what-if-sarah-lived");
        assert_eq!(info.display_name, "What if Sarah lived?");
        assert!(info.is_current);
        assert!(!info.is_original);
    }

    #[test]
    fn test_variation_info_serialization() {
        let info = VariationInfo {
            slug: "test".to_string(),
            display_name: "Test Variation".to_string(),
            is_current: false,
            is_original: true,
        };

        // Serialize and deserialize
        let json = serde_json::to_string(&info).unwrap();
        let deserialized: VariationInfo = serde_json::from_str(&json).unwrap();

        assert_eq!(info, deserialized);
    }
}
