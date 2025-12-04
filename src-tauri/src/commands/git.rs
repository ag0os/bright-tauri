use crate::git::{CommitInfo, DiffResult, GitService, MergeResult};
use std::path::PathBuf;

/// Initialize a Git repository for a story
///
/// # Arguments
/// * `base_path` - The base directory where Git repositories are stored
/// * `story_id` - The unique identifier for the story
///
/// # Returns
/// The path to the created repository
#[tauri::command]
pub fn git_init_repo(base_path: String, story_id: String) -> Result<String, String> {
    let base = PathBuf::from(base_path);
    GitService::init_repo(&base, &story_id)
        .map(|path| path.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

/// Commit a specific file with content
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `file_path` - Relative path to the file within the repository
/// * `content` - Content to write to the file
/// * `message` - Commit message
///
/// # Returns
/// The commit hash (OID) as a string
#[tauri::command]
pub fn git_commit_file(
    repo_path: String,
    file_path: String,
    content: String,
    message: String,
) -> Result<String, String> {
    let path = PathBuf::from(repo_path);
    GitService::commit_file(&path, &file_path, &content, &message).map_err(|e| e.to_string())
}

/// Commit all changes in the repository
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `message` - Commit message
///
/// # Returns
/// The commit hash (OID) as a string
#[tauri::command]
pub fn git_commit_all(repo_path: String, message: String) -> Result<String, String> {
    let path = PathBuf::from(repo_path);
    GitService::commit_all(&path, &message).map_err(|e| e.to_string())
}

/// Create a new branch from a parent branch
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `parent_branch` - Name of the parent branch to branch from
/// * `new_branch` - Name for the new branch
#[tauri::command]
pub fn git_create_branch(
    repo_path: String,
    parent_branch: String,
    new_branch: String,
) -> Result<(), String> {
    let path = PathBuf::from(repo_path);
    GitService::create_branch(&path, &parent_branch, &new_branch).map_err(|e| e.to_string())
}

/// Checkout (switch to) a branch
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `branch` - Name of the branch to checkout
///
/// # Errors
/// Returns an error if there are uncommitted changes
#[tauri::command]
pub fn git_checkout_branch(repo_path: String, branch: String) -> Result<(), String> {
    let path = PathBuf::from(repo_path);
    GitService::checkout_branch(&path, &branch).map_err(|e| e.to_string())
}

/// Get the diff between two branches
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `branch_a` - Name of the first branch
/// * `branch_b` - Name of the second branch
///
/// # Returns
/// A DiffResult containing all file changes between the branches
#[tauri::command]
pub fn git_diff_branches(
    repo_path: String,
    branch_a: String,
    branch_b: String,
) -> Result<DiffResult, String> {
    let path = PathBuf::from(repo_path);
    GitService::diff_branches(&path, &branch_a, &branch_b).map_err(|e| e.to_string())
}

/// Merge one branch into another
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `from_branch` - Name of the branch to merge from
/// * `into_branch` - Name of the branch to merge into
///
/// # Returns
/// A MergeResult indicating success, conflicts, and a message
#[tauri::command]
pub fn git_merge_branches(
    repo_path: String,
    from_branch: String,
    into_branch: String,
) -> Result<MergeResult, String> {
    let path = PathBuf::from(repo_path);
    GitService::merge_branches(&path, &from_branch, &into_branch).map_err(|e| e.to_string())
}

/// Get commit history for a branch
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `branch` - Name of the branch
///
/// # Returns
/// A vector of CommitInfo structs ordered from newest to oldest
#[tauri::command]
pub fn git_get_history(repo_path: String, branch: String) -> Result<Vec<CommitInfo>, String> {
    let path = PathBuf::from(repo_path);
    GitService::get_history(&path, &branch).map_err(|e| e.to_string())
}

/// Restore the repository to a specific commit
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `commit_hash` - The commit hash to restore to
///
/// # Errors
/// Returns an error if there are uncommitted changes
#[tauri::command]
pub fn git_restore_commit(repo_path: String, commit_hash: String) -> Result<(), String> {
    let path = PathBuf::from(repo_path);
    GitService::restore_commit(&path, &commit_hash).map_err(|e| e.to_string())
}

/// List all local branches in the repository
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// A vector of branch names
#[tauri::command]
pub fn git_list_branches(repo_path: String) -> Result<Vec<String>, String> {
    let path = PathBuf::from(repo_path);
    GitService::list_branches(&path).map_err(|e| e.to_string())
}

/// Get the name of the current branch
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// The current branch name
#[tauri::command]
pub fn git_get_current_branch(repo_path: String) -> Result<String, String> {
    let path = PathBuf::from(repo_path);
    GitService::get_current_branch(&path).map_err(|e| e.to_string())
}

/// Resolve a file conflict by choosing ours or theirs version
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `file_path` - Relative path to the conflicted file
/// * `take_theirs` - If true, use theirs version; if false, use ours
#[tauri::command]
pub fn git_resolve_conflict(
    repo_path: String,
    file_path: String,
    take_theirs: bool,
) -> Result<(), String> {
    let path = PathBuf::from(repo_path);
    GitService::resolve_conflict(&path, &file_path, take_theirs).map_err(|e| e.to_string())
}

/// Abort a merge in progress
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
#[tauri::command]
pub fn git_abort_merge(repo_path: String) -> Result<(), String> {
    let path = PathBuf::from(repo_path);
    GitService::abort_merge(&path).map_err(|e| e.to_string())
}

/// Get the content of a conflicted file with conflict markers
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `file_path` - Relative path to the conflicted file
///
/// # Returns
/// File content with conflict markers
#[tauri::command]
pub fn git_get_conflict_content(repo_path: String, file_path: String) -> Result<String, String> {
    let path = PathBuf::from(repo_path);
    GitService::get_conflict_content(&path, &file_path).map_err(|e| e.to_string())
}
