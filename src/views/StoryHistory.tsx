/**
 * StoryHistory View
 *
 * STUB: This view is being refactored as part of the Database-Only Versioning (DBV) migration.
 * The Git-based commit history will be replaced with database snapshots.
 *
 * This will be updated in task-112 (dbv-5.2).
 */

import { ArrowLeft, Clock } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryHistory.css';

export function StoryHistory() {
  const goBack = useNavigationStore((state) => state.goBack);

  return (
    <div className="story-history">
      <div className="story-history-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="header-content">
          <h1 className="page-title">Snapshots</h1>
        </div>
      </div>

      <div className="timeline-container">
        <div className="empty-state">
          <Clock size={48} />
          <h2>Feature Unavailable</h2>
          <p className="empty-state-hint">
            This feature is being updated as part of the versioning system migration.
            Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
