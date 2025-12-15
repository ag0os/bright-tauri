/**
 * StoryCompare View
 *
 * Side-by-side text comparison for story variations.
 * Shows full story content from two selected variations with highlighted differences.
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, WarningCircle } from '@phosphor-icons/react';
import { invoke } from '@tauri-apps/api/core';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useStoriesStore } from '@/stores/useStoriesStore';
import { useToastStore } from '@/stores/useToastStore';
import type { Story, VariationInfo } from '@/types';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryCompare.css';

export function StoryCompare() {
  const currentRoute = useNavigationStore((state) => state.currentRoute);
  const goBack = useNavigationStore((state) => state.goBack);
  const getStory = useStoriesStore((state) => state.getStory);
  const showError = useToastStore((state) => state.error);

  const [story, setStory] = useState<Story | null>(null);
  const [variations, setVariations] = useState<VariationInfo[]>([]);
  const [variationA, setVariationA] = useState<string>('');
  const [variationB, setVariationB] = useState<string>('');
  const [contentA, setContentA] = useState<string>('');
  const [contentB, setContentB] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  // Extract story ID and optional variation selections from route
  const storyId =
    currentRoute.screen === 'story-compare' ? currentRoute.storyId : null;
  const initialVariationA =
    currentRoute.screen === 'story-compare' ? currentRoute.branchA : undefined;
  const initialVariationB =
    currentRoute.screen === 'story-compare' ? currentRoute.branchB : undefined;

  // Load story and variations on mount
  useEffect(() => {
    if (!storyId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedStory = await getStory(storyId);
        setStory(loadedStory);

        // Only fetch variations if story has a Git repo
        if (loadedStory.gitRepoPath) {
          const variationList = await invoke<VariationInfo[]>('git_list_variations', {
            repoPath: loadedStory.gitRepoPath,
          });

          setVariations(variationList);

          // Find current variation
          const currentVariation = variationList.find((v) => v.is_current);

          // Set initial variation selections
          if (initialVariationA) {
            const foundA = variationList.find((v) => v.slug === initialVariationA);
            if (foundA) {
              setVariationA(foundA.slug);
            } else if (currentVariation) {
              setVariationA(currentVariation.slug);
            }
          } else if (currentVariation) {
            setVariationA(currentVariation.slug);
          }

          if (initialVariationB) {
            const foundB = variationList.find((v) => v.slug === initialVariationB);
            if (foundB) {
              setVariationB(foundB.slug);
            } else if (variationList.length > 1) {
              // Select first non-current variation
              const otherVariation = variationList.find(
                (v) => !v.is_current
              );
              setVariationB(otherVariation?.slug || variationList[0].slug);
            }
          } else if (variationList.length > 1) {
            // Select first non-current variation
            const otherVariation = variationList.find((v) => !v.is_current);
            setVariationB(otherVariation?.slug || variationList[0].slug);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load story';
        showError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storyId, getStory, initialVariationA, initialVariationB, showError]);

  const handleCompare = async () => {
    if (!story?.gitRepoPath || !variationA || !variationB) return;

    if (variationA === variationB) {
      showError('Cannot compare a variation with itself');
      return;
    }

    setIsComparing(true);
    setContentA('');
    setContentB('');

    try {
      // Fetch content from both variations
      const [textA, textB] = await Promise.all([
        invoke<string>('git_get_file_content', {
          repoPath: story.gitRepoPath,
          branch: variationA,
          filePath: 'story.md', // Assuming main story file
        }),
        invoke<string>('git_get_file_content', {
          repoPath: story.gitRepoPath,
          branch: variationB,
          filePath: 'story.md',
        }),
      ]);

      setContentA(textA);
      setContentB(textB);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load content';
      showError(message);
    } finally {
      setIsComparing(false);
    }
  };

  // Get display name for a variation slug
  const getDisplayName = (slug: string): string => {
    const variation = variations.find((v) => v.slug === slug);
    return variation?.display_name || slug;
  };

  if (isLoading) {
    return (
      <div className="story-compare-loading">
        <p>Loading variations...</p>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="story-compare-error">
        <p>Story not found</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  if (!story.gitRepoPath) {
    return (
      <div className="story-compare-error">
        <WarningCircle size={48} weight="duotone" />
        <h2>No Version Control</h2>
        <p>This story does not have version control enabled.</p>
        <p>Enable version control to compare story variations.</p>
        <button className="btn btn-outline btn-base" onClick={goBack}>
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="story-compare">
      {/* Header */}
      <div className="story-compare-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Back to Story"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="story-compare-title">Compare Variations</h1>
      </div>

      {/* Content */}
      <div className="story-compare-content">
        {/* Story Info */}
        <div className="story-info">
          <h2>{story.title}</h2>
          <p className="story-subtitle">
            Compare different variations of your story side-by-side
          </p>
        </div>

        {/* Variation Selector */}
        <div className="variation-selector">
          <div className="selector-group">
            <label htmlFor="variation-a">Compare</label>
            <div className="select-wrapper">
              <select
                id="variation-a"
                value={variationA}
                onChange={(e) => setVariationA(e.target.value)}
                disabled={isComparing}
              >
                {variations.map((variation) => (
                  <option key={variation.slug} value={variation.slug}>
                    {variation.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="selector-divider">with</div>

          <div className="selector-group">
            <label htmlFor="variation-b">with</label>
            <div className="select-wrapper">
              <select
                id="variation-b"
                value={variationB}
                onChange={(e) => setVariationB(e.target.value)}
                disabled={isComparing}
              >
                {variations.map((variation) => (
                  <option key={variation.slug} value={variation.slug}>
                    {variation.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary btn-base"
            onClick={handleCompare}
            disabled={
              isComparing || !variationA || !variationB || variationA === variationB
            }
          >
            {isComparing ? 'Loading...' : 'Compare'}
          </button>
        </div>

        {/* Comparison Results */}
        {contentA && contentB && (
          <div className="compare-results">
            <div className="side-by-side-container">
              <div className="comparison-panel">
                <div className="panel-header">{getDisplayName(variationA)}</div>
                <div className="panel-content">{contentA}</div>
              </div>

              <div className="comparison-panel">
                <div className="panel-header">{getDisplayName(variationB)}</div>
                <div className="panel-content">{contentB}</div>
              </div>
            </div>
          </div>
        )}

        {/* Initial empty state */}
        {!contentA && !contentB && !isComparing && (
          <div className="empty-state">
            <p>Select two variations and click Compare to see them side-by-side</p>
          </div>
        )}
      </div>
    </div>
  );
}
