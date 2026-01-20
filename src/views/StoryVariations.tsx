/**
 * StoryVariations View
 *
 * STUB: This view is being refactored as part of the Database-Only Versioning (DBV) migration.
 * The Git-based branch management will be replaced with database versions.
 *
 * This will be renamed to StoryVersions and updated in task-111 (dbv-5.1).
 */

import { ArrowLeft, GitBranch } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './StoryVariations.css';

export function StoryVariations() {
  const goBack = useNavigationStore((state) => state.goBack);

  return (
    <div className="story-branches">
      <div className="story-branches-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Story Variations</h1>
      </div>

      <div className="story-branches-content">
        <div className="empty-state">
          <GitBranch size={48} />
          <h2>Feature Unavailable</h2>
          <p>
            This feature is being updated as part of the versioning system migration.
            Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
