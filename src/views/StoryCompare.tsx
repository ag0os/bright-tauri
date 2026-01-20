/**
 * StoryCompare View
 *
 * STUB: This view is being refactored as part of the Database-Only Versioning (DBV) migration.
 * The Git-based comparison will be replaced with version-based comparison.
 *
 * This will be updated in task-113 (dbv-5.3).
 */

import { ArrowLeft, Warning } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryCompare.css';

export function StoryCompare() {
  const goBack = useNavigationStore((state) => state.goBack);

  return (
    <div className="story-compare">
      <div className="story-compare-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="story-compare-title">Compare Variations</h1>
      </div>

      <div className="story-compare-content">
        <div className="story-info">
          <Warning size={48} weight="duotone" />
          <h2>Feature Unavailable</h2>
          <p className="story-subtitle">
            This feature is being updated as part of the versioning system migration.
            Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
