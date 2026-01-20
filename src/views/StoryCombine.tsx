/**
 * StoryCombine View
 *
 * DEPRECATED: This view is being removed as part of the Database-Only Versioning (DBV) migration.
 * The Git-based merge conflict resolution is no longer needed with the new versioning system.
 *
 * This will be deleted in task-113 (dbv-5.3).
 */

import { ArrowLeft, Warning } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/spacing.css';
import './StoryCombine.css';

export function StoryCombine() {
  const goBack = useNavigationStore((state) => state.goBack);

  return (
    <div className="story-combine">
      <div className="story-combine-header">
        <button
          className="back-button"
          onClick={goBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="story-combine-title">Combine Variations</h1>
      </div>

      <div className="story-combine-content">
        <div className="combine-info">
          <Warning size={24} weight="duotone" className="warning-icon" />
          <div>
            <h2>Feature Unavailable</h2>
            <p>
              This feature is being updated as part of the versioning system migration.
              Please check back later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
