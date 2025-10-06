use git2::{Repository, Oid, Signature, Error as GitError};
use std::path::{Path, PathBuf};
use std::fmt;
use std::fs;

/// Custom error type for Git operations
#[derive(Debug)]
pub enum GitServiceError {
    /// Git2 library error
    Git(GitError),
    /// IO error
    Io(std::io::Error),
    /// Repository not found
    RepositoryNotFound(PathBuf),
    /// Invalid operation
    InvalidOperation(String),
}

impl fmt::Display for GitServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GitServiceError::Git(e) => write!(f, "Git error: {}", e),
            GitServiceError::Io(e) => write!(f, "IO error: {}", e),
            GitServiceError::RepositoryNotFound(path) => {
                write!(f, "Repository not found at: {}", path.display())
            }
            GitServiceError::InvalidOperation(msg) => write!(f, "Invalid operation: {}", msg),
        }
    }
}

impl std::error::Error for GitServiceError {}

impl From<GitError> for GitServiceError {
    fn from(err: GitError) -> Self {
        GitServiceError::Git(err)
    }
}

impl From<std::io::Error> for GitServiceError {
    fn from(err: std::io::Error) -> Self {
        GitServiceError::Io(err)
    }
}

/// Result type alias for Git operations
pub type GitResult<T> = Result<T, GitServiceError>;

/// Service for managing Git operations on story repositories
pub struct GitService;

impl GitService {
    /// Create a new GitService instance
    pub fn new() -> Self {
        GitService
    }

    /// Initialize a new Git repository for a story variation
    ///
    /// Creates a new repository at `{base_path}/git-repos/{story_id}/`
    /// and makes an initial commit with metadata.json
    ///
    /// # Arguments
    /// * `base_path` - Base directory (e.g., app data directory)
    /// * `story_id` - Unique identifier for the story
    ///
    /// # Returns
    /// PathBuf to the created repository
    pub fn init_repo(base_path: &Path, story_id: &str) -> GitResult<PathBuf> {
        // Create repository path: {base_path}/git-repos/{story_id}
        let repo_path = base_path.join("git-repos").join(story_id);

        // Check if repository already exists
        if repo_path.exists() {
            return Err(GitServiceError::InvalidOperation(
                format!("Repository already exists at: {}", repo_path.display())
            ));
        }

        // Create directory structure
        fs::create_dir_all(&repo_path)?;

        // Initialize Git repository
        let repo = Repository::init(&repo_path)?;

        // Create initial metadata.json file
        let metadata_path = repo_path.join("metadata.json");
        let metadata_content = format!(
            r#"{{
  "story_id": "{}",
  "created_at": "{}",
  "version": "1.0.0"
}}"#,
            story_id,
            chrono::Utc::now().to_rfc3339()
        );
        fs::write(&metadata_path, metadata_content)?;

        // Create initial commit
        let mut index = repo.index()?;
        index.add_path(Path::new("metadata.json"))?;
        index.write()?;

        let tree_id = index.write_tree()?;
        let tree = repo.find_tree(tree_id)?;

        let signature = Signature::now("Bright", "noreply@bright.app")?;

        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            "Initial commit",
            &tree,
            &[],
        )?;

        Ok(repo_path)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_git_service_creation() {
        let service = GitService::new();
        // Basic smoke test to ensure the module compiles
        assert!(true);
    }

    #[test]
    fn test_init_repo_creates_repository() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-story-123";

        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Verify repository was created
        assert!(repo_path.exists());
        assert!(repo_path.join(".git").exists());
        assert!(repo_path.join("metadata.json").exists());

        // Verify we can open the repository
        let repo = Repository::open(&repo_path).unwrap();
        assert!(!repo.is_bare());
    }

    #[test]
    fn test_init_repo_creates_initial_commit() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-story-456";

        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();
        let repo = Repository::open(&repo_path).unwrap();

        // Verify HEAD exists and points to a commit
        let head = repo.head().unwrap();
        assert!(head.is_branch());

        let commit = head.peel_to_commit().unwrap();
        assert_eq!(commit.message().unwrap(), "Initial commit");
    }

    #[test]
    fn test_init_repo_metadata_contains_story_id() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-story-789";

        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();
        let metadata_content = fs::read_to_string(repo_path.join("metadata.json")).unwrap();

        assert!(metadata_content.contains(story_id));
        assert!(metadata_content.contains("created_at"));
    }

    #[test]
    fn test_init_repo_fails_if_already_exists() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-story-duplicate";

        // First init should succeed
        GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Second init should fail
        let result = GitService::init_repo(temp_dir.path(), story_id);
        assert!(result.is_err());

        match result {
            Err(GitServiceError::InvalidOperation(msg)) => {
                assert!(msg.contains("already exists"));
            }
            _ => panic!("Expected InvalidOperation error"),
        }
    }

    #[test]
    fn test_init_repo_path_structure() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-story-path";

        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Verify path structure: {base}/git-repos/{story_id}
        assert!(repo_path.ends_with(format!("git-repos/{}", story_id)));
    }
}
