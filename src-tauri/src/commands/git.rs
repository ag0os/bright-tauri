use crate::file_management::{list_variations, save_variation_mapping, VariationInfo, get_variation_display_name};
use crate::file_naming::slugify_unique_variation;
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

/// Create a new branch (variation) from a parent branch
///
/// Takes a display name, generates a unique slug for the branch name,
/// creates the Git branch, and saves the display name mapping.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `parent_branch` - Name of the parent branch to branch from
/// * `display_name` - User-friendly display name for the variation
///
/// # Returns
/// VariationInfo for the newly created branch
#[tauri::command]
pub fn git_create_branch(
    repo_path: String,
    parent_branch: String,
    display_name: String,
) -> Result<VariationInfo, String> {
    let path = PathBuf::from(repo_path);

    // Get list of existing branches
    let existing_branches = GitService::list_branches(&path).map_err(|e| e.to_string())?;

    // Generate unique slug from display name
    let slug = slugify_unique_variation(&display_name, &existing_branches);

    // Create the Git branch
    GitService::create_branch(&path, &parent_branch, &slug).map_err(|e| e.to_string())?;

    // Save the variation mapping
    save_variation_mapping(&path, &slug, &display_name).map_err(|e| e.to_string())?;

    // Return VariationInfo for the new branch
    Ok(VariationInfo {
        slug: slug.clone(),
        display_name: display_name.clone(),
        is_current: false, // Just created, not checked out yet
        is_original: false, // New branches are never the original
    })
}

/// Checkout (switch to) a branch (variation)
///
/// Frontend should pass the slug from VariationInfo.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `branch` - Branch slug to checkout (from VariationInfo)
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

/// Merge one branch (variation) into another
///
/// Uses Git branch slugs for the operation but provides user-friendly error messages.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
/// * `from_branch` - Slug of the branch to merge from
/// * `into_branch` - Slug of the branch to merge into
///
/// # Returns
/// A MergeResult indicating success, conflicts, and a user-friendly message
#[tauri::command]
pub fn git_merge_branches(
    repo_path: String,
    from_branch: String,
    into_branch: String,
) -> Result<MergeResult, String> {
    let path = PathBuf::from(repo_path);

    // Perform the merge
    let result = GitService::merge_branches(&path, &from_branch, &into_branch)
        .map_err(|e| {
            // Make error messages more user-friendly
            let err_str = e.to_string();
            if err_str.contains("Branch") && err_str.contains("not found") {
                format!("Variation not found. Please refresh the variation list.")
            } else {
                // Keep other errors as is
                err_str
            }
        })?;

    // Make success messages more user-friendly
    let friendly_message = if result.message.contains("Already up-to-date") {
        "Already up to date - no changes to merge".to_string()
    } else if result.message.contains("Fast-forward") {
        "Successfully merged without any conflicts".to_string()
    } else if result.message.contains("Merge has conflicts") {
        "Merge completed with conflicting changes that need resolution".to_string()
    } else if result.message.contains("Successfully merged") {
        "Successfully merged all changes".to_string()
    } else {
        result.message.clone()
    };

    Ok(MergeResult {
        success: result.success,
        conflicts: result.conflicts,
        message: friendly_message,
    })
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

/// List all local branches (variations) in the repository
///
/// Returns variation information including display names and status.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// A vector of VariationInfo structs with display names and metadata
#[tauri::command]
pub fn git_list_branches(repo_path: String) -> Result<Vec<VariationInfo>, String> {
    let path = PathBuf::from(repo_path);
    list_variations(&path).map_err(|e| e.to_string())
}

/// Get information about the current branch (variation)
///
/// Returns variation information including display name and status.
///
/// # Arguments
/// * `repo_path` - Path to the Git repository
///
/// # Returns
/// VariationInfo for the current branch
#[tauri::command]
pub fn git_get_current_branch(repo_path: String) -> Result<VariationInfo, String> {
    let path = PathBuf::from(repo_path);

    // Get current branch name (slug)
    let slug = GitService::get_current_branch(&path).map_err(|e| e.to_string())?;

    // Get display name from metadata
    let display_name = get_variation_display_name(&path, &slug)
        .unwrap_or_else(|_| slug.clone()); // Fallback to slug if metadata not found

    // Check if this is the original branch
    let original_branch = crate::git::GitService::get_original_branch(&path)
        .unwrap_or_else(|_| "original".to_string());
    let is_original = slug == original_branch || slug == "main";

    Ok(VariationInfo {
        slug,
        display_name,
        is_current: true, // By definition, this is the current branch
        is_original,
    })
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
