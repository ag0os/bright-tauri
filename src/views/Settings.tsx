/**
 * Settings View
 *
 * Application settings and preferences management.
 * Focused single-purpose view for managing app configuration.
 */

import { ArrowLeft, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useSettingsStore, type AutoCommitMode } from '@/stores/useSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import '@/design-system/tokens/colors/modern-indigo.css';
import '@/design-system/tokens/typography/classic-serif.css';
import '@/design-system/tokens/icons/phosphor.css';
import '@/design-system/tokens/atoms/button/minimal-squared.css';
import '@/design-system/tokens/atoms/input/filled-background.css';
import '@/design-system/tokens/spacing.css';
import './Settings.css';

// Preset delay options in milliseconds
const DELAY_PRESETS = [
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '2 minutes', value: 120000 },
  { label: '5 minutes', value: 300000 },
];

export function Settings() {
  const goBack = useNavigationStore((state) => state.goBack);
  const canGoBack = useNavigationStore((state) => state.canGoBack);
  const navigate = useNavigationStore((state) => state.navigate);
  const showSuccess = useToastStore((state) => state.success);

  const {
    autoCommitEnabled,
    autoCommitMode,
    autoCommitDelay,
    setAutoCommitEnabled,
    setAutoCommitMode,
    setAutoCommitDelay,
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

  const handleToggleAutoCommit = () => {
    setAutoCommitEnabled(!autoCommitEnabled);
    showSuccess(
      autoCommitEnabled
        ? 'Auto-save disabled'
        : 'Auto-save enabled'
    );
  };

  const handleModeChange = (mode: AutoCommitMode) => {
    setAutoCommitMode(mode);
    showSuccess(
      mode === 'on-close'
        ? 'Auto-save: when leaving editor'
        : 'Auto-save: periodically'
    );
  };

  const handleDelayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDelay = parseInt(event.target.value, 10);
    setAutoCommitDelay(newDelay);
    showSuccess(`Save frequency set to ${formatDelay(newDelay)}`);
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    showSuccess('Settings reset to defaults');
  };

  const formatDelay = (ms: number): string => {
    const preset = DELAY_PRESETS.find((p) => p.value === ms);
    return preset ? preset.label : `${ms / 1000}s`;
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
          <h2 className="section-title">Auto-Save</h2>
          <p className="section-description">
            Configure automatic saving of your stories
          </p>

          {/* Auto-commit Toggle */}
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="auto-commit-toggle" className="setting-label">
                Auto-save snapshots
              </label>
              <p className="setting-description">
                Automatically save snapshots to track your changes
              </p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  id="auto-commit-toggle"
                  type="checkbox"
                  checked={autoCommitEnabled}
                  onChange={handleToggleAutoCommit}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Auto-commit Mode */}
          <div className={`setting-item ${!autoCommitEnabled ? 'setting-item--disabled' : ''}`}>
            <div className="setting-info">
              <label className="setting-label">
                Save timing
              </label>
              <p className="setting-description">
                Choose when to save your work
              </p>
            </div>
            <div className="setting-control">
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="commit-mode"
                    value="on-close"
                    checked={autoCommitMode === 'on-close'}
                    onChange={() => handleModeChange('on-close')}
                    disabled={!autoCommitEnabled}
                  />
                  <span className="radio-label">When leaving editor</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="commit-mode"
                    value="timed"
                    checked={autoCommitMode === 'timed'}
                    onChange={() => handleModeChange('timed')}
                    disabled={!autoCommitEnabled}
                  />
                  <span className="radio-label">Periodically</span>
                </label>
              </div>
            </div>
          </div>

          {/* Auto-commit Delay (only visible when mode is 'timed') */}
          {autoCommitMode === 'timed' && (
            <div className={`setting-item ${!autoCommitEnabled ? 'setting-item--disabled' : ''}`}>
              <div className="setting-info">
                <label htmlFor="auto-commit-delay" className="setting-label">
                  Save frequency
                </label>
                <p className="setting-description">
                  Time to wait after last edit before saving
                </p>
              </div>
              <div className="setting-control">
                <select
                  id="auto-commit-delay"
                  className="input-filled delay-select"
                  value={autoCommitDelay}
                  onChange={handleDelayChange}
                  disabled={!autoCommitEnabled}
                >
                  {DELAY_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
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
