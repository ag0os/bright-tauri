/**
 * StoryVersions View
 *
 * Displays and manages story versions using Database-Only Versioning (DBV).
 * Allows users to:
 * - List all versions for a story
 * - Create new versions (saves current snapshot first)
 * - Switch between versions
 * - Rename versions
 * - Delete versions (with warnings for active version, error for last version)
 */

import { ArrowLeft, Check, Pencil, Plus, StackSimple, Trash, Warning } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import { useStoryVersions } from '@/features/stories/hooks/useStoryVersions';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StoryVersions.css';

export function StoryVersions() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);

  // Extract storyId from route
  const storyId = currentRoute.screen === 'story-versions' ? currentRoute.storyId : '';

  const {
    story,
    versions,
    loading,
    error,
    showCreateForm,
    newVersionName,
    creating,
    createError,
    setShowCreateForm,
    setNewVersionName,
    handleCreateVersion,
    resetCreateForm,
    switching,
    handleSwitchVersion,
    editingVersionId,
    editingName,
    renaming,
    handleStartRename,
    handleSaveRename,
    handleCancelRename,
    setEditingName,
    deleteConfirm,
    deleting,
    deleteError,
    handleRequestDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useStoryVersions(storyId);

  const deleteModalTitleId = 'story-versions-delete-modal-title';
  const deleteModalMessageId = 'story-versions-delete-modal-message';
  const createInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCreateForm) {
      createInputRef.current?.focus();
    }
  }, [showCreateForm]);

  useEffect(() => {
    if (editingVersionId) {
      renameInputRef.current?.focus();
    }
  }, [editingVersionId]);

  // Loading state
  if (loading) {
    return (
      <div className="story-versions-loading">
        <p>Loading versions...</p>
      </div>
    );
  }

  // Error state
  if (error && !story) {
    return (
      <div className="story-versions-error">
        <StackSimple size={48} />
        <h2>Error Loading Story</h2>
        <p>{error}</p>
        <button className="btn btn-primary btn-base" onClick={goBack} type="button">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="story-versions">
      {/* Header */}
      <div className="story-versions-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
          type="button"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Versions</h1>
      </div>

      {/* Content */}
      <div className="story-versions-content">
        {/* Story Info */}
        {story && (
          <div className="story-info">
            <h2>{story.title}</h2>
            <p className="story-subtitle">
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Create Version Form */}
        {showCreateForm ? (
          <div className="create-version-form">
            <h3>Create New Version</h3>
            <form onSubmit={handleCreateVersion}>
              <div className="form-group">
                <label htmlFor="version-name">Version Name</label>
                <input
                  ref={createInputRef}
                  id="version-name"
                  type="text"
                  className="input input-filled"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="e.g., Alternate Ending"
                  disabled={creating}
                />
                <p className="form-hint">
                  This will create a new version with a copy of your current content.
                </p>
                {createError && <p className="form-error">{createError}</p>}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-base"
                  disabled={creating || !newVersionName.trim()}
                >
                  {creating ? 'Creating...' : 'Create Version'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-base"
                  onClick={resetCreateForm}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-base create-version-button"
            onClick={() => setShowCreateForm(true)}
            type="button"
          >
            <Plus size={16} />
            New Version
          </button>
        )}

        {/* Versions List */}
        <div className="versions-section">
          <h3>All Versions</h3>
          {versions.length === 0 ? (
            <p className="empty-message">No versions found.</p>
          ) : (
            <div className="versions-list">
              {versions.map((version) => {
                const isActive = story?.activeVersionId === version.id;
                const isEditing = editingVersionId === version.id;
                const isSwitching = switching === version.id;

                return (
                  <div key={version.id} className={`version-item ${isActive ? 'current' : ''}`}>
                    <div className="version-info">
                      {isEditing ? (
                        <input
                          ref={renameInputRef}
                          type="text"
                          className="input input-filled version-rename-input"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename();
                            if (e.key === 'Escape') handleCancelRename();
                          }}
                          disabled={renaming}
                        />
                      ) : (
                        <span className="version-name">{version.name}</span>
                      )}
                      {isActive && !isEditing && (
                        <span className="current-badge">
                          <Check size={12} weight="bold" />
                          Active
                        </span>
                      )}
                    </div>
                    <div className="version-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleSaveRename}
                            disabled={renaming || !editingName.trim()}
                            title="Save"
                            type="button"
                          >
                            {renaming ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={handleCancelRename}
                            disabled={renaming}
                            title="Cancel"
                            type="button"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {!isActive && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSwitchVersion(version.id)}
                              disabled={!!switching}
                              title="Switch to this version"
                              type="button"
                            >
                              {isSwitching ? 'Switching...' : 'Switch'}
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-sm icon-btn"
                            onClick={() => handleStartRename(version)}
                            title="Rename version"
                            aria-label="Rename version"
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm icon-btn delete-btn"
                            onClick={() => handleRequestDelete(version)}
                            title="Delete version"
                            aria-label="Delete version"
                            type="button"
                          >
                            <Trash size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal-overlay"
          onMouseDown={
            deleting
              ? undefined
              : (e) => {
                  if (e.target === e.currentTarget) {
                    handleCancelDelete();
                  }
                }
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby={deleteModalTitleId}
          aria-describedby={deleteModalMessageId}
        >
          <div className="modal-content">
            <div className="modal-header">
              {deleteConfirm.isActive && <Warning size={24} className="warning-icon" />}
              <h3 id={deleteModalTitleId}>Delete Version</h3>
            </div>
            <div className="modal-body">
              {deleteConfirm.isActive ? (
                <p id={deleteModalMessageId}>
                  <strong>"{deleteConfirm.versionName}"</strong> is your active version. Deleting it
                  will automatically switch to another version. Are you sure you want to continue?
                </p>
              ) : (
                <p id={deleteModalMessageId}>
                  Are you sure you want to delete version{' '}
                  <strong>"{deleteConfirm.versionName}"</strong>? This action cannot be undone.
                </p>
              )}
              {deleteError && <p className="form-error">{deleteError}</p>}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost btn-base"
                onClick={handleCancelDelete}
                disabled={deleting}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-base"
                onClick={handleConfirmDelete}
                disabled={deleting}
                type="button"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switching Overlay */}
      {switching && (
        <div className="switching-overlay">
          <p>Switching version...</p>
        </div>
      )}
    </div>
  );
}
