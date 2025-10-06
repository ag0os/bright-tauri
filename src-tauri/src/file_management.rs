/// File management for story content in Git repositories
///
/// This module provides functions to create, update, and manage story content files
/// within Git repositories. Each story can have a Git repository with its chapters
/// and scenes stored as markdown files.

use crate::file_naming;
use crate::git::{GitResult, GitService};
use std::fs;
use std::path::{Path, PathBuf};

/// Error type for file management operations
#[derive(Debug)]
pub enum FileManagementError {
    /// File already exists at the target path
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
            FileManagementError::Io(err) => write!(f, "IO error: {}", err),
            FileManagementError::Git(err) => write!(f, "Git error: {}", err),
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
    let commit_message = format!("Add {}: {}", filename, title);
    GitService::commit_file(repo_path, &filename, content, &commit_message)?;

    // Return relative filename
    Ok(filename)
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

        let filename = create_story_file(&repo_path, 1, "First Chapter", "# First Chapter\n\nContent here")
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
}
