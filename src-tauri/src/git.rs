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

/// Represents a file change in a diff
#[derive(Debug, Clone)]
pub struct FileChange {
    pub path: String,
    pub status: ChangeStatus,
    pub diff: Option<String>,
}

/// Status of a file change
#[derive(Debug, Clone, PartialEq)]
pub enum ChangeStatus {
    Added,
    Modified,
    Deleted,
}

/// Result of a diff operation between two branches
#[derive(Debug)]
pub struct DiffResult {
    pub changes: Vec<FileChange>,
}

/// Result of a merge operation
#[derive(Debug)]
pub struct MergeResult {
    pub success: bool,
    pub conflicts: Vec<String>,
    pub message: String,
}

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

    /// Create a new branch from a parent branch
    ///
    /// # Arguments
    /// * `repo_path` - Path to the Git repository
    /// * `parent_branch` - Name of the parent branch to branch from
    /// * `new_branch` - Name of the new branch to create
    ///
    /// # Returns
    /// Success or error
    pub fn create_branch(
        repo_path: &Path,
        parent_branch: &str,
        new_branch: &str,
    ) -> GitResult<()> {
        // Open repository
        let repo = Repository::open(repo_path).map_err(|_| {
            GitServiceError::RepositoryNotFound(repo_path.to_path_buf())
        })?;

        // Check if new branch already exists
        if repo.find_branch(new_branch, git2::BranchType::Local).is_ok() {
            return Err(GitServiceError::InvalidOperation(
                format!("Branch '{}' already exists", new_branch)
            ));
        }

        // Find parent branch reference
        let parent_ref = repo.find_branch(parent_branch, git2::BranchType::Local)
            .map_err(|_| GitServiceError::InvalidOperation(
                format!("Parent branch '{}' not found", parent_branch)
            ))?;

        let parent_commit = parent_ref.get().peel_to_commit()?;

        // Create new branch
        repo.branch(new_branch, &parent_commit, false)?;

        Ok(())
    }

    /// Checkout (switch to) a different branch
    ///
    /// # Arguments
    /// * `repo_path` - Path to the Git repository
    /// * `branch` - Name of the branch to checkout
    ///
    /// # Returns
    /// Success or error
    pub fn checkout_branch(repo_path: &Path, branch: &str) -> GitResult<()> {
        // Open repository
        let repo = Repository::open(repo_path).map_err(|_| {
            GitServiceError::RepositoryNotFound(repo_path.to_path_buf())
        })?;

        // Check for uncommitted changes
        let statuses = repo.statuses(None)?;
        if !statuses.is_empty() {
            return Err(GitServiceError::InvalidOperation(
                "Cannot checkout branch: uncommitted changes exist".to_string()
            ));
        }

        // Find the branch
        let branch_ref = repo.find_branch(branch, git2::BranchType::Local)
            .map_err(|_| GitServiceError::InvalidOperation(
                format!("Branch '{}' not found", branch)
            ))?;

        let reference = branch_ref.get();
        let commit = reference.peel_to_commit()?;

        // Set HEAD to the branch
        repo.set_head(reference.name().unwrap())?;

        // Checkout the tree
        repo.checkout_tree(commit.as_object(), None)?;

        Ok(())
    }

    /// Get diff between two branches
    ///
    /// # Arguments
    /// * `repo_path` - Path to the Git repository
    /// * `branch_a` - First branch to compare
    /// * `branch_b` - Second branch to compare
    ///
    /// # Returns
    /// DiffResult with file changes between branches
    pub fn diff_branches(
        repo_path: &Path,
        branch_a: &str,
        branch_b: &str,
    ) -> GitResult<DiffResult> {
        // Open repository
        let repo = Repository::open(repo_path).map_err(|_| {
            GitServiceError::RepositoryNotFound(repo_path.to_path_buf())
        })?;

        // Get branch references
        let branch_a_ref = repo.find_branch(branch_a, git2::BranchType::Local)
            .map_err(|_| GitServiceError::InvalidOperation(
                format!("Branch '{}' not found", branch_a)
            ))?;

        let branch_b_ref = repo.find_branch(branch_b, git2::BranchType::Local)
            .map_err(|_| GitServiceError::InvalidOperation(
                format!("Branch '{}' not found", branch_b)
            ))?;

        // Get trees from branches
        let tree_a = branch_a_ref.get().peel_to_tree()?;
        let tree_b = branch_b_ref.get().peel_to_tree()?;

        // Create diff
        let diff = repo.diff_tree_to_tree(Some(&tree_a), Some(&tree_b), None)?;

        let mut changes = Vec::new();

        // Iterate over deltas to collect changes
        for delta in diff.deltas() {
            let status = match delta.status() {
                git2::Delta::Added => ChangeStatus::Added,
                git2::Delta::Modified => ChangeStatus::Modified,
                git2::Delta::Deleted => ChangeStatus::Deleted,
                _ => continue, // Skip other statuses
            };

            let path = delta.new_file().path()
                .or_else(|| delta.old_file().path())
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_else(|| "unknown".to_string());

            changes.push(FileChange {
                path,
                status,
                diff: None, // Simplified - not including full diff content
            });
        }

        Ok(DiffResult { changes })
    }

    /// Merge one branch into another
    ///
    /// # Arguments
    /// * `repo_path` - Path to the Git repository
    /// * `from_branch` - Branch to merge from
    /// * `into_branch` - Branch to merge into
    ///
    /// # Returns
    /// MergeResult indicating success or conflicts
    pub fn merge_branches(
        repo_path: &Path,
        from_branch: &str,
        into_branch: &str,
    ) -> GitResult<MergeResult> {
        // Open repository
        let repo = Repository::open(repo_path).map_err(|_| {
            GitServiceError::RepositoryNotFound(repo_path.to_path_buf())
        })?;

        // Get branch references
        let from_ref = repo.find_branch(from_branch, git2::BranchType::Local)
            .map_err(|_| GitServiceError::InvalidOperation(
                format!("Branch '{}' not found", from_branch)
            ))?;

        let into_ref = repo.find_branch(into_branch, git2::BranchType::Local)
            .map_err(|_| GitServiceError::InvalidOperation(
                format!("Branch '{}' not found", into_branch)
            ))?;

        // Checkout the into_branch first
        Self::checkout_branch(repo_path, into_branch)?;

        // Get the annotated commit from the from_branch
        let from_commit = from_ref.get().peel_to_commit()?;
        let annotated_commit = repo.find_annotated_commit(from_commit.id())?;

        // Perform merge analysis
        let (analysis, _) = repo.merge_analysis(&[&annotated_commit])?;

        if analysis.is_up_to_date() {
            return Ok(MergeResult {
                success: true,
                conflicts: vec![],
                message: "Already up-to-date".to_string(),
            });
        }

        if analysis.is_fast_forward() {
            // Fast-forward merge
            let into_ref_name = into_ref.get().name().unwrap();
            let mut reference = repo.find_reference(into_ref_name)?;
            reference.set_target(from_commit.id(), "Fast-forward merge")?;
            repo.checkout_head(None)?;

            return Ok(MergeResult {
                success: true,
                conflicts: vec![],
                message: format!("Fast-forward merge of {} into {}", from_branch, into_branch),
            });
        }

        // Normal merge
        repo.merge(&[&annotated_commit], None, None)?;

        // Check for conflicts
        let index = repo.index()?;
        if index.has_conflicts() {
            let mut conflicts = Vec::new();
            for entry in index.conflicts()? {
                if let Ok(conflict) = entry {
                    if let Some(our) = conflict.our {
                        if let Some(path) = std::str::from_utf8(&our.path).ok() {
                            conflicts.push(path.to_string());
                        }
                    }
                }
            }

            return Ok(MergeResult {
                success: false,
                conflicts,
                message: "Merge has conflicts".to_string(),
            });
        }

        // Create merge commit
        let mut index = repo.index()?;
        let tree_id = index.write_tree()?;
        let tree = repo.find_tree(tree_id)?;
        let signature = Signature::now("Bright", "noreply@bright.app")?;
        let into_commit = into_ref.get().peel_to_commit()?;

        repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            &format!("Merge {} into {}", from_branch, into_branch),
            &tree,
            &[&into_commit, &from_commit],
        )?;

        // Clean up merge state
        repo.cleanup_state()?;

        Ok(MergeResult {
            success: true,
            conflicts: vec![],
            message: format!("Successfully merged {} into {}", from_branch, into_branch),
        })
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

    #[test]
    fn test_create_branch_from_main() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-branch-create";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get the current branch name (might be "master" or "main")
        let repo = Repository::open(&repo_path).unwrap();
        let head = repo.head().unwrap();
        let current_branch = head.shorthand().unwrap();

        // Create a new branch from current branch
        GitService::create_branch(&repo_path, current_branch, "feature-branch").unwrap();

        // Verify branch was created
        let branch = repo.find_branch("feature-branch", git2::BranchType::Local).unwrap();
        assert!(branch.is_head() == false); // Not checked out yet
    }

    #[test]
    fn test_create_branch_fails_if_already_exists() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-branch-duplicate";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch name
        let repo = Repository::open(&repo_path).unwrap();
        let head = repo.head().unwrap();
        let current_branch = head.shorthand().unwrap();

        // Create branch
        GitService::create_branch(&repo_path, current_branch, "feature").unwrap();

        // Try to create again
        let result = GitService::create_branch(&repo_path, current_branch, "feature");

        assert!(result.is_err());
        match result {
            Err(GitServiceError::InvalidOperation(msg)) => {
                assert!(msg.contains("already exists"));
            }
            _ => panic!("Expected InvalidOperation error"),
        }
    }

    #[test]
    fn test_create_branch_fails_if_parent_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-branch-invalid-parent";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Try to create branch from nonexistent parent
        let result = GitService::create_branch(&repo_path, "nonexistent", "feature");

        assert!(result.is_err());
        match result {
            Err(GitServiceError::InvalidOperation(msg)) => {
                assert!(msg.contains("not found"));
            }
            _ => panic!("Expected InvalidOperation error"),
        }
    }

    #[test]
    fn test_checkout_branch_switches_branch() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-branch-checkout";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch name
        let current_branch = {
            let repo = Repository::open(&repo_path).unwrap();
            let head = repo.head().unwrap();
            head.shorthand().unwrap().to_string()
        };

        // Create and commit a file on current branch
        GitService::commit_file(&repo_path, "main.txt", "Main branch", "Add main file").unwrap();

        // Create a new branch
        GitService::create_branch(&repo_path, &current_branch, "feature").unwrap();

        // Checkout the new branch
        GitService::checkout_branch(&repo_path, "feature").unwrap();

        // Verify we're on the feature branch
        let repo = Repository::open(&repo_path).unwrap();
        let head = repo.head().unwrap();
        assert!(head.shorthand().unwrap() == "feature");
    }

    #[test]
    fn test_checkout_branch_fails_with_uncommitted_changes() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-checkout-dirty";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch name
        let repo = Repository::open(&repo_path).unwrap();
        let head = repo.head().unwrap();
        let current_branch = head.shorthand().unwrap();

        // Create a branch
        GitService::create_branch(&repo_path, current_branch, "feature").unwrap();

        // Create an uncommitted file
        fs::write(repo_path.join("uncommitted.txt"), "Uncommitted").unwrap();

        // Try to checkout - should fail
        let result = GitService::checkout_branch(&repo_path, "feature");

        assert!(result.is_err());
        match result {
            Err(GitServiceError::InvalidOperation(msg)) => {
                assert!(msg.contains("uncommitted changes"));
            }
            _ => panic!("Expected InvalidOperation error"),
        }
    }

    #[test]
    fn test_checkout_branch_fails_if_branch_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-checkout-invalid";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Try to checkout nonexistent branch
        let result = GitService::checkout_branch(&repo_path, "nonexistent");

        assert!(result.is_err());
        match result {
            Err(GitServiceError::InvalidOperation(msg)) => {
                assert!(msg.contains("not found"));
            }
            _ => panic!("Expected InvalidOperation error"),
        }
    }

    #[test]
    fn test_diff_branches_shows_changes() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-diff";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch
        let current_branch = {
            let repo = Repository::open(&repo_path).unwrap();
            let x = repo.head().unwrap().shorthand().unwrap().to_string();
            x
        };

        // Commit a file on current branch
        GitService::commit_file(&repo_path, "file1.txt", "Content A", "Add file1").unwrap();

        // Create feature branch
        GitService::create_branch(&repo_path, &current_branch, "feature").unwrap();
        GitService::checkout_branch(&repo_path, "feature").unwrap();

        // Make changes on feature branch
        GitService::commit_file(&repo_path, "file2.txt", "Content B", "Add file2").unwrap();
        GitService::commit_file(&repo_path, "file1.txt", "Content A Modified", "Modify file1").unwrap();

        // Get diff
        let diff = GitService::diff_branches(&repo_path, &current_branch, "feature").unwrap();

        // Verify changes
        assert_eq!(diff.changes.len(), 2);
        let has_added = diff.changes.iter().any(|c| c.path == "file2.txt" && c.status == ChangeStatus::Added);
        let has_modified = diff.changes.iter().any(|c| c.path == "file1.txt" && c.status == ChangeStatus::Modified);
        assert!(has_added);
        assert!(has_modified);
    }

    #[test]
    fn test_merge_branches_fast_forward() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-merge-ff";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch
        let current_branch = {
            let repo = Repository::open(&repo_path).unwrap();
            let x = repo.head().unwrap().shorthand().unwrap().to_string();
            x
        };

        // Create feature branch and add commits
        GitService::create_branch(&repo_path, &current_branch, "feature").unwrap();
        GitService::checkout_branch(&repo_path, "feature").unwrap();
        GitService::commit_file(&repo_path, "feature.txt", "Feature content", "Add feature").unwrap();

        // Merge feature into main (fast-forward)
        let result = GitService::merge_branches(&repo_path, "feature", &current_branch).unwrap();

        assert!(result.success);
        assert!(result.conflicts.is_empty());
        assert!(result.message.contains("Fast-forward"));
    }

    #[test]
    fn test_merge_branches_already_up_to_date() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-merge-uptodate";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch
        let current_branch = {
            let repo = Repository::open(&repo_path).unwrap();
            let x = repo.head().unwrap().shorthand().unwrap().to_string();
            x
        };

        // Create feature branch (no new commits)
        GitService::create_branch(&repo_path, &current_branch, "feature").unwrap();

        // Try to merge feature into main (already up-to-date)
        let result = GitService::merge_branches(&repo_path, "feature", &current_branch).unwrap();

        assert!(result.success);
        assert!(result.message.contains("up-to-date"));
    }

    #[test]
    fn test_diff_branches_fails_if_branch_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-diff-invalid";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch
        let current_branch = {
            let repo = Repository::open(&repo_path).unwrap();
            let x = repo.head().unwrap().shorthand().unwrap().to_string();
            x
        };

        // Try to diff with nonexistent branch
        let result = GitService::diff_branches(&repo_path, &current_branch, "nonexistent");

        assert!(result.is_err());
    }

    #[test]
    fn test_merge_branches_fails_if_branch_not_found() {
        let temp_dir = TempDir::new().unwrap();
        let story_id = "test-merge-invalid";

        // Initialize repository
        let repo_path = GitService::init_repo(temp_dir.path(), story_id).unwrap();

        // Get current branch
        let current_branch = {
            let repo = Repository::open(&repo_path).unwrap();
            let x = repo.head().unwrap().shorthand().unwrap().to_string();
            x
        };

        // Try to merge from nonexistent branch
        let result = GitService::merge_branches(&repo_path, "nonexistent", &current_branch);

        assert!(result.is_err());
    }
}
