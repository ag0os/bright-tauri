/**
 * StoryCompare View
 *
 * STUB: This view will provide version/snapshot comparison functionality.
 * The diff library decision has been deferred until the basic versioning system is complete.
 *
 * See: docs/plans/database-only-versioning-implementation.md (Phase 5.3)
 */

import { ArrowLeft, Clock } from '@phosphor-icons/react';
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
        <h1 className="story-compare-title">Compare Versions</h1>
      </div>

      <div className="story-compare-content">
        <div className="story-info">
          <Clock size={48} weight="duotone" />
          <h2>Coming Soon</h2>
          <p className="story-subtitle">
            Version comparison will be available in a future update.
            You'll be able to see differences between versions and snapshots of your story.
          </p>
        </div>
      </div>
    </div>
  );
}
