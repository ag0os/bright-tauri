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

    /// Commit a specific file with content to the repository
    ///
    /// # Arguments
    /// * `repo_path` - Path to the Git repository
    /// * `file_path` - Relative path of the file within the repository
    /// * `content` - Content to write to the file
    /// * `message` - Commit message
    ///
    /// # Returns
    /// Commit hash (OID as string)
    pub fn commit_file(
        repo_path: &Path,
        file_path: &str,
        content: &str,
        message: &str,
    ) -> GitResult<String> {
        // Open repository
        let repo = Repository::open(repo_path).map_err(|_| {
            GitServiceError::RepositoryNotFound(repo_path.to_path_buf())
        })?;

        // Write content to file
        let full_file_path = repo_path.join(file_path);

        // Create parent directories if needed
        if let Some(parent) = full_file_path.parent() {
            fs::create_dir_all(parent)?;
        }

        fs::write(&full_file_path, content)?;

        // Stage the file
        let mut index = repo.index()?;
        index.add_path(Path::new(file_path))?;
        index.write()?;

        // Create commit
        let tree_id = index.write_tree()?;
        let tree = repo.find_tree(tree_id)?;

        let signature = Signature::now("Bright", "noreply@bright.app")?;

        // Get parent commit (HEAD)
        let parent_commit = repo.head()?.peel_to_commit()?;

        let oid = repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[&parent_commit],
        )?;

        Ok(oid.to_string())
    }

    /// Commit all changes in the repository
    ///
    /// # Arguments
    /// * `repo_path` - Path to the Git repository
    /// * `message` - Commit message
    ///
    /// # Returns
    /// Commit hash (OID as string)
    pub fn commit_all(repo_path: &Path, message: &str) -> GitResult<String> {
        // Open repository
        let repo = Repository::open(repo_path).map_err(|_| {
            GitServiceError::RepositoryNotFound(repo_path.to_path_buf())
        })?;

        // Stage all changes (modified, new, deleted files)
        let mut index = repo.index()?;
        index.add_all(["*"].iter(), git2::IndexAddOption::DEFAULT, None)?;
        index.write()?;

        // Create commit
        let tree_id = index.write_tree()?;
        let tree = repo.find_tree(tree_id)?;

        let signature = Signature::now("Bright", "noreply@bright.app")?;

        // Get parent commit (HEAD)
        let parent_commit = repo.head()?.peel_to_commit()?;

        let oid = repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &[&parent_commit],
        )?;

        Ok(oid.to_string())
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

    #[test]
    fn test_commit_file_creates_file_and_commits() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-commit-file";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Commit a file
        let file_content = "# Chapter 1\n\nThis is the first chapter.";
        let commit_hash = GitService::commit_file(
            &repo_path,
            "chapter1.md",
            file_content,
            "Add chapter 1"
        ).unwrap();

        // Verify file was created
        let file_path = repo_path.join("chapter1.md");
        assert!(file_path.exists());

        let content = fs::read_to_string(&file_path).unwrap();
        assert_eq!(content, file_content);

        // Verify commit was created
        assert!(!commit_hash.is_empty());

        let repo = Repository::open(&repo_path).unwrap();
        let commit = repo.find_commit(Oid::from_str(&commit_hash).unwrap()).unwrap();
        assert_eq!(commit.message().unwrap(), "Add chapter 1");
    }

    #[test]
    fn test_commit_file_creates_subdirectories() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-commit-nested";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Commit a file in a nested directory
        let commit_hash = GitService::commit_file(
            &repo_path,
            "chapters/part1/chapter1.md",
            "Content",
            "Add nested file"
        ).unwrap();

        // Verify nested directory and file were created
        assert!(repo_path.join("chapters/part1/chapter1.md").exists());
        assert!(!commit_hash.is_empty());
    }

    #[test]
    fn test_commit_all_stages_multiple_files() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-commit-all";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Create multiple files
        fs::write(repo_path.join("file1.txt"), "Content 1").unwrap();
        fs::write(repo_path.join("file2.txt"), "Content 2").unwrap();
        fs::write(repo_path.join("file3.txt"), "Content 3").unwrap();

        // Commit all files
        let commit_hash = GitService::commit_all(&repo_path, "Add three files").unwrap();

        // Verify commit was created
        assert!(!commit_hash.is_empty());

        let repo = Repository::open(&repo_path).unwrap();
        let commit = repo.find_commit(Oid::from_str(&commit_hash).unwrap()).unwrap();
        assert_eq!(commit.message().unwrap(), "Add three files");

        // Verify all files are in the commit
        let tree = commit.tree().unwrap();
        assert!(tree.get_name("file1.txt").is_some());
        assert!(tree.get_name("file2.txt").is_some());
        assert!(tree.get_name("file3.txt").is_some());
    }

    #[test]
    fn test_commit_file_returns_error_for_invalid_repo() {
        let temp_dir = TempDir::new().unwrap();
        let invalid_path = temp_dir.path().join("nonexistent");

        let result = GitService::commit_file(
            &invalid_path,
            "file.txt",
            "content",
            "message"
        );

        assert!(result.is_err());
        match result {
            Err(GitServiceError::RepositoryNotFound(_)) => {},
            _ => panic!("Expected RepositoryNotFound error"),
        }
    }

    #[test]
    fn test_commit_all_returns_error_for_invalid_repo() {
        let temp_dir = TempDir::new().unwrap();
        let invalid_path = temp_dir.path().join("nonexistent");

        let result = GitService::commit_all(&invalid_path, "message");

        assert!(result.is_err());
        match result {
            Err(GitServiceError::RepositoryNotFound(_)) => {},
            _ => panic!("Expected RepositoryNotFound error"),
        }
    }
}
