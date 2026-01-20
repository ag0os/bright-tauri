/**
 * StoryEditor View
 *
 * Full-screen story editing interface with minimal chrome and auto-save.
 * Provides a distraction-free writing experience.
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { ArrowLeft, FloppyDisk, Check, WarningCircle, Clock, Gear } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useAutoSave, useAutoSnapshot } from '@/hooks';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StoryEditor.css';

export function StoryEditor() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const navigate = useNavigationStore((state) => state.navigate);
  const goBack = useNavigationStore((state) => state.goBack);
  const updateStory = useStoriesStore((state) => state.updateStory);
  const getStory = useStoriesStore((state) => state.getStory);
  const showError = useToastStore((state) => state.error);

  // Get snapshot settings from store
  const snapshotTrigger = useSettingsStore((state) => state.snapshotTrigger);
  const snapshotCharacterThreshold = useSettingsStore((state) => state.snapshotCharacterThreshold);

  const [story, setStory] = useState<Story | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-editor' ? currentRoute.storyId : null;

  // Load story on mount - content comes from activeSnapshot (DBV system)
  useEffect(() => {
    if (!storyId) return;

    const loadStoryData = async () => {
      setIsLoadingStory(true);
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);
        // Load content from active snapshot (DBV) - null means empty content
        const snapshotContent = loadedStory.activeSnapshot?.content || '';
        setContent(snapshotContent);
        setTitle(loadedStory.title);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load story';
        showError(message);
      } finally {
        setIsLoadingStory(false);
      }
    };

    loadStoryData();
  }, [storyId, getStory]);

  // Calculate word count from Lexical editor state JSON
  const calculateWordCount = useCallback((editorContent: string): number => {
    if (!editorContent) return 0;

    try {
      const editorState = JSON.parse(editorContent);

      // Recursively extract text from Lexical nodes
      const extractText = (node: unknown): string => {
        if (!node || typeof node !== 'object') return '';

        const n = node as Record<string, unknown>;

        // If node has text property, return it
        if (typeof n.text === 'string') {
          return n.text;
        }

        // If node has children, recursively extract text
        if (Array.isArray(n.children)) {
          return n.children.map(extractText).join(' ');
        }

        return '';
      };

      const text = extractText(editorState.root);

      // Split by whitespace and filter empty strings
      return text.split(/\s+/).filter((word) => word.length > 0).length;
    } catch {
      return 0;
    }
  }, []);

  // Memoized save callback - saves to snapshot via DBV system
  // Backend resolves the active snapshot internally from storyId
  const handleSaveContent = useCallback(async (newContent: string) => {
    if (!storyId) return;
    const wordCountValue = calculateWordCount(newContent);
    await invoke('update_snapshot_content', {
      storyId,
      content: newContent,
      wordCount: wordCountValue,
    });
  }, [storyId, calculateWordCount]);

  // Auto-save content changes to database via DBV system (30s debounce)
  // This updates the current snapshot in place for crash protection
  const { saveState } = useAutoSave({
    content,
    onSave: handleSaveContent,
    enabled: !isLoadingStory && !!storyId,
  });

  // Auto-snapshot: creates new snapshots for history restore points
  // Works alongside useAutoSave (two-layer model):
  // - useAutoSave (30s): Updates current snapshot in place (crash protection)
  // - useAutoSnapshot: Creates new snapshots for history restore points
  useAutoSnapshot({
    storyId: storyId ?? '',
    content,
    enabled: !isLoadingStory && !!storyId,
    trigger: snapshotTrigger,
    characterThreshold: snapshotCharacterThreshold,
  });

  // Handle title changes
  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (!storyId || title === story?.title) return;

    try {
      await updateStory(storyId, { title });
      if (story) {
        setStory({ ...story, title });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update title';
      showError(message);
      // Revert title on error
      if (story) {
        setTitle(story.title);
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      if (story) {
        setTitle(story.title);
      }
    }
  };

  // Calculate word count by extracting text from Lexical editor state
  const wordCount = useMemo(() => calculateWordCount(content), [content, calculateWordCount]);

  // Render save state indicator
  const renderSaveIndicator = () => {
    switch (saveState) {
      case 'saving':
        return (
          <div className="save-indicator saving">
            <FloppyDisk size={16} weight="duotone" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="save-indicator saved">
            <Check size={16} />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="save-indicator error">
            <WarningCircle size={16} weight="duotone" />
            <span>Error saving</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoadingStory) {
    return (
      <div className="story-editor-loading">
        <p>Loading story...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-editor-error">
        <p>Story not found</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="story-editor">
      {/* Top Chrome - Minimal */}
      <div className="story-editor-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Stories"
        >
          <ArrowLeft size={20} />
        </button>

        {isEditingTitle ? (
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h1
            className="story-title"
            onClick={() => setIsEditingTitle(true)}
            title="Click to edit title"
          >
            {title}
          </h1>
        )}

        <div className="header-actions">
          {renderSaveIndicator()}

          <button
            className="icon-button"
            onClick={() => storyId && navigate({ screen: 'story-settings', storyId })}
            aria-label="Story settings"
            title="Story settings"
          >
            <Gear size={18} weight="duotone" />
          </button>

          <button
            className="icon-button"
            onClick={() => storyId && navigate({ screen: 'story-history', storyId })}
            aria-label="View history"
            title="View version history"
          >
            <Clock size={18} />
          </button>
        </div>
      </div>

      {/* Editor - Main Area */}
      <div className="story-editor-content">
        <RichTextEditor
          initialContent={content}
          onChange={setContent}
          placeholder="Start writing your story..."
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="story-editor-footer">
        <div className="word-count">
          {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
        </div>
      </div>
    </div>
  );
}
