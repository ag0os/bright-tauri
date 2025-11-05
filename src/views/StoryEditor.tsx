/**
 * StoryEditor View
 *
 * Full-screen story editing interface with minimal chrome and auto-save.
 * Provides a distraction-free writing experience.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Check, AlertCircle } from 'lucide-react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { Story } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/lucide.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StoryEditor.css';

export function StoryEditor() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const updateStory = useStoriesStore((state) => state.updateStory);
  const getStory = useStoriesStore((state) => state.getStory);

  const [story, setStory] = useState<Story | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [isLoadingStory, setIsLoadingStory] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Extract story ID from route
  const storyId =
    currentRoute.screen === 'story-editor' ? currentRoute.storyId : null;

  // Load story on mount
  useEffect(() => {
    if (!storyId) return;

    const loadStoryData = async () => {
      setIsLoadingStory(true);
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);
        setContent(loadedStory.content || '');
        setTitle(loadedStory.title);
      } catch (error) {
        console.error('Failed to load story:', error);
      } finally {
        setIsLoadingStory(false);
      }
    };

    loadStoryData();
  }, [storyId, getStory]);

  // Auto-save content changes
  const { saveState } = useAutoSave({
    content,
    onSave: async (newContent) => {
      if (!storyId) return;
      await updateStory(storyId, {
        title: null,
        description: null,
        storyType: null,
        status: null,
        content: newContent,
        notes: null,
        outline: null,
        targetWordCount: null,
        order: null,
        tags: null,
        color: null,
        favorite: null,
        relatedElementIds: null,
        seriesName: null,
      });
    },
    delay: 2000,
    enabled: !isLoadingStory && !!storyId,
  });

  // Handle title changes
  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (!storyId || title === story?.title) return;

    try {
      await updateStory(storyId, {
        title: title,
        description: null,
        storyType: null,
        status: null,
        content: null,
        notes: null,
        outline: null,
        targetWordCount: null,
        order: null,
        tags: null,
        color: null,
        favorite: null,
        relatedElementIds: null,
        seriesName: null,
      });
      if (story) {
        setStory({ ...story, title });
      }
    } catch (error) {
      console.error('Failed to update title:', error);
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

  // Calculate word count
  const wordCount = content
    ? JSON.stringify(JSON.parse(content))
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;

  // Render save state indicator
  const renderSaveIndicator = () => {
    switch (saveState) {
      case 'saving':
        return (
          <div className="save-indicator saving">
            <Save size={16} />
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
            <AlertCircle size={16} />
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

        {renderSaveIndicator()}
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
