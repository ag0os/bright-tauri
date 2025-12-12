/**
 * TopBar Component
 *
 * Main navigation top bar with universe selector following the Minimal Top Bar design (48px height).
 * Provides navigation between Stories and Universe sections.
 */

import { useEffect } from 'react';
import { ChevronDown, BookOpen, Globe, Sun, Moon } from 'lucide-react';
import { useUniverseStore } from '@/stores/useUniverseStore';
import { useTheme } from '@/hooks';
import './TopBar.css';

export type NavigationTab = 'stories' | 'universe';

interface TopBarProps {
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
}

export function TopBar({ activeTab = 'stories', onTabChange }: TopBarProps) {
  const { currentUniverse, universes, loadUniverses, setCurrentUniverse } = useUniverseStore();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadUniverses();
  }, [loadUniverses]);

  const handleUniverseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUniverse = universes.find(u => u.id === event.target.value);
    if (selectedUniverse) {
      setCurrentUniverse(selectedUniverse);
    }
  };

  const handleTabClick = (tab: NavigationTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__logo">Bright</h1>

        <div className="topbar__universe-selector">
          <select
            value={currentUniverse?.id || ''}
            onChange={handleUniverseChange}
            className="topbar__select"
            disabled={universes.length === 0}
          >
            {universes.length === 0 ? (
              <option value="">No Universes</option>
            ) : (
              <>
                {!currentUniverse && <option value="">Select Universe</option>}
                {universes.map((universe) => (
                  <option key={universe.id} value={universe.id}>
                    {universe.name}
                  </option>
                ))}
              </>
            )}
          </select>
          <ChevronDown className="topbar__select-icon" size={16} />
        </div>
      </div>

      <nav className="topbar__nav">
        <button
          className={`topbar__nav-button ${activeTab === 'stories' ? 'topbar__nav-button--active' : ''}`}
          onClick={() => handleTabClick('stories')}
        >
          <BookOpen size={16} />
          <span>Stories</span>
        </button>

        <button
          className={`topbar__nav-button ${activeTab === 'universe' ? 'topbar__nav-button--active' : ''}`}
          onClick={() => handleTabClick('universe')}
        >
          <Globe size={16} />
          <span>Universe</span>
        </button>

        <div className="topbar__divider" />

        <button
          className="topbar__theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>
    </div>
  );
}
