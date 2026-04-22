/**
 * StoryEditor View
 *
 * Full-screen story editing interface with minimal chrome and auto-save.
 * Provides a distraction-free writing experience.
 */

import {
  ArrowLeft,
  Check,
  Clock,
  FloppyDisk,
  Gear,
  StackSimple,
  WarningCircle,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RichTextEditor } from '@/editor/RichTextEditor';
import { useSettingsStore } from '@/features/settings/stores/useSettingsStore';
import { updateSnapshotContent } from '@/features/stories/api/snapshots';
import { useAutoSave } from '@/features/stories/hooks/useAutoSave';
import { useAutoSnapshot } from '@/features/stories/hooks/useAutoSnapshot';
import { useStoriesStore } from '@/features/stories/stores/useStoriesStore';
import { useNavigationStore } from '@/shared/stores/useNavigationStore';
import { useToastStore } from '@/shared/stores/useToastStore';
import { countLexicalWords } from '@/shared/utils/lexicalWordCount';
import type { StoryDetail } from '@/types';
import '@/design-system/tokens/colors/ink-and-paper.css';
import '@/design-system/tokens/typography/newsreader-geist.css';
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
  const maxSnapshotsPerVersion = useSettingsStore((state) => state.maxSnapshotsPerVersion);

  const [story, setStory] = useState<StoryDetail | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Extract story ID from route
  const storyId = currentRoute.screen === 'story-editor' ? currentRoute.storyId : null;

  // Load story on mount - content comes from activeSnapshot (DBV system)
  useEffect(() => {
    if (!storyId) return;

    const loadStoryData = async () => {
      setIsLoadingStory(true);
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);
        // Load content from active snapshot (DBV) - guaranteed present in StoryDetail
        const snapshotContent = loadedStory.activeSnapshot.content || '';
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
  }, [storyId, getStory, showError]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
    }
  }, [isEditingTitle]);

  // Memoized save callback - saves to snapshot via DBV system
  // Backend resolves the active snapshot internally from storyId
  const handleSaveContent = useCallback(
    async (newContent: string) => {
      if (!storyId) return;
      const wordCountValue = countLexicalWords(newContent);
      await updateSnapshotContent(storyId, newContent, wordCountValue);
    },
    [storyId],
  );

  // Auto-save content changes to database via DBV system (30s debounce)
  // This updates the current snapshot in place for crash protection
  const { saveState } = useAutoSave({
    content,
    onSave: handleSaveContent,
    enabled: !isLoadingStory && !!storyId,
  });

  // Calculate word count by extracting text from Lexical editor state
  const wordCount = useMemo(() => countLexicalWords(content), [content]);

  // Auto-snapshot: creates new snapshots for history restore points
  // Works alongside useAutoSave (two-layer model):
  // - useAutoSave (30s): Updates current snapshot in place (crash protection)
  // - useAutoSnapshot: Creates new snapshots for history restore points
  useAutoSnapshot({
    storyId: storyId ?? '',
    content,
    wordCount,
    enabled: !isLoadingStory && !!storyId,
    trigger: snapshotTrigger,
    characterThreshold: snapshotCharacterThreshold,
    maxSnapshots: maxSnapshotsPerVersion,
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

  // Render save state indicator
  const renderSaveIndicator = () => {
    switch (saveState) {
      case 'saving':
        return (
          <div className="save-indicator saving">
            <FloppyDisk size={16} />
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
            <WarningCircle size={16} />
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
        <button type="button" className="btn btn-outline btn-base" onClick={goBack}>
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
          type="button"
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Stories"
        >
          <ArrowLeft size={20} />
        </button>

        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
          />
        ) : (
          <h1 className="story-title">
            <button
              type="button"
              className="story-title-button"
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit title"
            >
              {title}
            </button>
          </h1>
        )}

        <div className="header-actions">
          {renderSaveIndicator()}

          <button
            type="button"
            className="icon-button"
            onClick={() => storyId && navigate({ screen: 'story-versions', storyId })}
            aria-label="Manage versions"
            title="Manage versions"
          >
            <StackSimple size={18} />
          </button>

          <button
            type="button"
            className="icon-button"
            onClick={() => storyId && navigate({ screen: 'story-settings', storyId })}
            aria-label="Story settings"
            title="Story settings"
          >
            <Gear size={18} />
          </button>

          <button
            type="button"
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
