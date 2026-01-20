/**
 * Settings View
 *
 * Application settings and preferences management.
 * Focused single-purpose view for managing app configuration.
 */

import { ArrowLeft, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useSettingsStore, type SnapshotTrigger } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './Settings.css';

// Preset character threshold options
const THRESHOLD_PRESETS = [
  { label: '250 characters', value: 250 },
  { label: '500 characters', value: 500 },
  { label: '1,000 characters', value: 1000 },
  { label: '2,000 characters', value: 2000 },
];

// Preset max snapshots options
const MAX_SNAPSHOTS_PRESETS = [
  { label: '25 snapshots', value: 25 },
  { label: '50 snapshots', value: 50 },
  { label: '100 snapshots', value: 100 },
  { label: '200 snapshots', value: 200 },
];

export function Settings() {
  const goBack = useNavigationStore((state) => state.goBack);
  const canGoBack = useNavigationStore((state) => state.canGoBack);
  const navigate = useNavigationStore((state) => state.navigate);
  const showSuccess = useToastStore((state) => state.success);

  const {
    snapshotTrigger,
    snapshotCharacterThreshold,
    maxSnapshotsPerVersion,
    setSnapshotTrigger,
    setSnapshotCharacterThreshold,
    setMaxSnapshotsPerVersion,
    resetToDefaults,
  } = useSettingsStore();

  const handleBack = () => {
    if (canGoBack()) {
      goBack();
    } else {
      // Fallback to stories list if no history
      navigate({ screen: 'stories-list' });
    }
  };

  const handleTriggerChange = (trigger: SnapshotTrigger) => {
    setSnapshotTrigger(trigger);
    showSuccess(
      trigger === 'on_leave'
        ? 'Snapshots: when leaving editor'
        : 'Snapshots: based on character count'
    );
  };

  const handleThresholdChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newThreshold = parseInt(event.target.value, 10);
    setSnapshotCharacterThreshold(newThreshold);
    showSuccess(`Snapshot threshold set to ${newThreshold.toLocaleString()} characters`);
  };

  const handleMaxSnapshotsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMax = parseInt(event.target.value, 10);
    setMaxSnapshotsPerVersion(newMax);
    showSuccess(`Max snapshots set to ${newMax}`);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    showSuccess('Settings reset to defaults');
  };

  return (
    <div className="settings">
      {/* Header */}
      <div className="settings-header">
        <button
          className="back-button"
          onClick={handleBack}
          aria-label="Go back"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="header-content">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your application preferences</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        <div className="settings-section">
          <h2 className="section-title">Auto-Save Snapshots</h2>
          <p className="section-description">
            Configure automatic snapshot creation to track your writing progress
          </p>

          {/* Snapshot Trigger Mode */}
          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">
                Snapshot trigger
              </label>
              <p className="setting-description">
                Choose when to create automatic snapshots
              </p>
            </div>
            <div className="setting-control">
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="snapshot-trigger"
                    value="on_leave"
                    checked={snapshotTrigger === 'on_leave'}
                    onChange={() => handleTriggerChange('on_leave')}
                  />
                  <span className="radio-label">When leaving editor</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="snapshot-trigger"
                    value="character_count"
                    checked={snapshotTrigger === 'character_count'}
                    onChange={() => handleTriggerChange('character_count')}
                  />
                  <span className="radio-label">Based on character count</span>
                </label>
              </div>
            </div>
          </div>

          {/* Character Threshold (only visible when trigger is 'character_count') */}
          {snapshotTrigger === 'character_count' && (
            <div className="setting-item">
              <div className="setting-info">
                <label htmlFor="snapshot-threshold" className="setting-label">
                  Character threshold
                </label>
                <p className="setting-description">
                  Create a snapshot after typing this many characters
                </p>
              </div>
              <div className="setting-control">
                <select
                  id="snapshot-threshold"
                  className="input-filled delay-select"
                  value={snapshotCharacterThreshold}
                  onChange={handleThresholdChange}
                >
                  {THRESHOLD_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Max Snapshots per Version */}
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="max-snapshots" className="setting-label">
                Maximum snapshots per version
              </label>
              <p className="setting-description">
                Oldest snapshots are removed when this limit is reached
              </p>
            </div>
            <div className="setting-control">
              <select
                id="max-snapshots"
                className="input-filled delay-select"
                value={maxSnapshotsPerVersion}
                onChange={handleMaxSnapshotsChange}
              >
                {MAX_SNAPSHOTS_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
          <button
            className="btn btn-outline btn-base"
            onClick={handleResetToDefaults}
            title="Reset all settings to default values"
          >
            <ArrowCounterClockwise size={18} weight="duotone" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
