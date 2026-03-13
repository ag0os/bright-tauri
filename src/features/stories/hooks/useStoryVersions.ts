import { useState, useEffect, useCallback } from 'react';
import { getStory } from '@/features/stories/api/stories';
import {
  listStoryVersions,
  createStoryVersion,
  switchStoryVersion,
  renameStoryVersion,
  deleteStoryVersion,
} from '@/features/stories/api/versions';
import type { StoryDetail, StoryVersion } from '@/types';

interface DeleteConfirmState {
  versionId: string;
  versionName: string;
  isActive: boolean;
}

interface UseStoryVersionsReturn {
  // Data
  story: StoryDetail | null;
  versions: StoryVersion[];

  // Loading/error
  loading: boolean;
  error: string | null;

  // Create
  showCreateForm: boolean;
  newVersionName: string;
  creating: boolean;
  createError: string | null;
  setShowCreateForm: (show: boolean) => void;
  setNewVersionName: (name: string) => void;
  handleCreateVersion: (e: React.FormEvent) => Promise<void>;
  resetCreateForm: () => void;

  // Switch
  switching: string | null;
  handleSwitchVersion: (versionId: string) => Promise<void>;

  // Rename
  editingVersionId: string | null;
  editingName: string;
  renaming: boolean;
  handleStartRename: (version: StoryVersion) => void;
  handleSaveRename: () => Promise<void>;
  handleCancelRename: () => void;
  setEditingName: (name: string) => void;

  // Delete
  deleteConfirm: DeleteConfirmState | null;
  deleting: boolean;
  deleteError: string | null;
  handleRequestDelete: (version: StoryVersion) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
}

export function useStoryVersions(storyId: string): UseStoryVersionsReturn {
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [versions, setVersions] = useState<StoryVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create version form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Rename state
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Switching state
  const [switching, setSwitching] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!storyId) return;

    setLoading(true);
    setError(null);

    try {
      const [storyData, versionsData] = await Promise.all([
        getStory(storyId),
        listStoryVersions(storyId),
      ]);

      setStory(storyData);
      setVersions(versionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateVersion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storyId || !newVersionName.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      const currentContent = story?.activeSnapshot?.content ?? '';
      await createStoryVersion(storyId, newVersionName.trim(), currentContent);

      setNewVersionName('');
      setShowCreateForm(false);
      await loadData();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }, [storyId, newVersionName, story, loadData]);

  const resetCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setNewVersionName('');
    setCreateError(null);
  }, []);

  const handleSwitchVersion = useCallback(async (versionId: string) => {
    if (!storyId || switching) return;

    setSwitching(versionId);

    try {
      await switchStoryVersion(storyId, versionId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSwitching(null);
    }
  }, [storyId, switching, loadData]);

  const handleStartRename = useCallback((version: StoryVersion) => {
    setEditingVersionId(version.id);
    setEditingName(version.name);
  }, []);

  const handleSaveRename = useCallback(async () => {
    if (!editingVersionId || !editingName.trim() || renaming) return;

    setRenaming(true);

    try {
      await renameStoryVersion(editingVersionId, editingName.trim());
      setEditingVersionId(null);
      setEditingName('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRenaming(false);
    }
  }, [editingVersionId, editingName, renaming, loadData]);

  const handleCancelRename = useCallback(() => {
    setEditingVersionId(null);
    setEditingName('');
  }, []);

  const handleRequestDelete = useCallback((version: StoryVersion) => {
    const isActive = story?.activeVersionId === version.id;
    setDeleteConfirm({
      versionId: version.id,
      versionName: version.name,
      isActive,
    });
    setDeleteError(null);
  }, [story]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm || deleting) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteStoryVersion(deleteConfirm.versionId);
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Cannot delete the last version')) {
        setDeleteError('Cannot delete the only version of this story.');
      } else {
        setDeleteError(errorMessage);
      }
    } finally {
      setDeleting(false);
    }
  }, [deleteConfirm, deleting, loadData]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm(null);
    setDeleteError(null);
  }, []);

  return {
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
  };
}
