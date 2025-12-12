import React, { useState } from 'react';
import { List, CaretLeft, CaretRight, Command, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import './minimal-topbar.css';

export interface MinimalTopBarProps {
  onNavigate?: (route: string) => void;
}

// Minimal Top Bar Navigation
export const MinimalTopBar: React.FC<MinimalTopBarProps> = ({ onNavigate: _onNavigate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  return (
    <>
      <div className={`nav-3__topbar ${isHidden ? 'nav-3__topbar--hidden' : ''}`}>
        <div className="nav-3__left">
          <button className="nav-3__nav-button">
            <List className="nav-3__nav-icon" weight="duotone" />
            <span>Projects</span>
          </button>
          <div className="nav-3__divider"></div>
          <button className="nav-3__icon-button">
            <CaretLeft className="nav-3__nav-icon" weight="duotone" />
          </button>
          <button className="nav-3__icon-button">
            <CaretRight className="nav-3__nav-icon" weight="duotone" />
          </button>
        </div>

        <div className="nav-3__center">
          <div className="nav-3__breadcrumb">
            <span className="nav-3__breadcrumb-item">My Novel</span>
            <CaretRight className="nav-3__breadcrumb-separator" weight="duotone" />
            <span className="nav-3__breadcrumb-item">Part One</span>
            <CaretRight className="nav-3__breadcrumb-separator" weight="duotone" />
            <span className="nav-3__breadcrumb-item nav-3__breadcrumb-item--current">Chapter 3</span>
          </div>
        </div>

        <div className="nav-3__right">
          <div className={`nav-3__status ${isSaving ? 'nav-3__status--saving' : ''}`}>
            <div className="nav-3__status-indicator"></div>
            <span>{isSaving ? 'Saving...' : 'Saved'}</span>
          </div>
          <div className="nav-3__divider"></div>
          <button className="nav-3__icon-button">
            <Command className="nav-3__nav-icon" weight="duotone" />
          </button>
          <button className="nav-3__icon-button">
            <MagnifyingGlass className="nav-3__nav-icon" weight="duotone" />
          </button>
          <button className="nav-3__action-button nav-3__action-button--primary">
            <Plus className="nav-3__action-icon" weight="duotone" />
            <span>New</span>
          </button>
        </div>
      </div>

      <div className="nav-3__content">
        <div style={{ padding: '64px 32px', maxWidth: '800px', margin: '0 auto' }}>
          <h2>Main Content Area</h2>
          <p>This is a minimal, distraction-free writing interface.</p>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '16px' }}>
            The navigation bar is slim and unobtrusive, perfect for focused writing.
          </p>
          <button
            onClick={() => setIsSaving(!isSaving)}
            style={{ marginTop: '16px', padding: '8px 16px' }}
          >
            Toggle Saving Status
          </button>
          <button
            onClick={() => setIsHidden(!isHidden)}
            style={{ marginTop: '8px', marginLeft: '8px', padding: '8px 16px' }}
          >
            {isHidden ? 'Show' : 'Hide'} Nav Bar
          </button>
        </div>
      </div>
    </>
  );
};
