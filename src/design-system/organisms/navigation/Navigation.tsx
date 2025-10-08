import React, { useState } from 'react';
import { Home, FileText, Users, Settings, Bell, Search, ChevronLeft, ChevronRight, Menu, Plus, Command, Folder, Star, Clock, X } from 'lucide-react';
import './option1-vertical-sidebar.css';
import './option2-top-toolbar.css';
import './option3-minimal-topbar.css';

export interface NavigationProps {
  variant: 'option1' | 'option2' | 'option3';
  onNavigate?: (route: string) => void;
}

// Option 1: Vertical Sidebar
export const VerticalSidebar: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState('home');

  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    onNavigate?.(route);
  };

  return (
    <>
      <div className={`nav-1__sidebar ${collapsed ? 'nav-1__sidebar--collapsed' : ''}`}>
        <div className="nav-1__header">
          <div className="nav-1__logo">
            <FileText className="nav-1__logo-icon" />
            <span className="nav-1__logo-text">Bright Writer</span>
          </div>
        </div>

        <nav className="nav-1__nav">
          <div className="nav-1__section">
            <div className="nav-1__section-title">Main</div>
            <button
              className={`nav-1__item ${activeRoute === 'home' ? 'nav-1__item--active' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              <Home className="nav-1__item-icon" />
              <span className="nav-1__item-text">Home</span>
            </button>
            <button
              className={`nav-1__item ${activeRoute === 'projects' ? 'nav-1__item--active' : ''}`}
              onClick={() => handleNavigate('projects')}
            >
              <Folder className="nav-1__item-icon" />
              <span className="nav-1__item-text">Projects</span>
            </button>
            <button
              className={`nav-1__item ${activeRoute === 'documents' ? 'nav-1__item--active' : ''}`}
              onClick={() => handleNavigate('documents')}
            >
              <FileText className="nav-1__item-icon" />
              <span className="nav-1__item-text">Documents</span>
              <span className="nav-1__badge">3</span>
            </button>
          </div>

          <div className="nav-1__section">
            <div className="nav-1__section-title">Universe</div>
            <button
              className={`nav-1__item ${activeRoute === 'characters' ? 'nav-1__item--active' : ''}`}
              onClick={() => handleNavigate('characters')}
            >
              <Users className="nav-1__item-icon" />
              <span className="nav-1__item-text">Characters</span>
            </button>
            <button
              className={`nav-1__item ${activeRoute === 'locations' ? 'nav-1__item--active' : ''}`}
              onClick={() => handleNavigate('locations')}
            >
              <Star className="nav-1__item-icon" />
              <span className="nav-1__item-text">Locations</span>
            </button>
          </div>

          <div className="nav-1__section">
            <div className="nav-1__section-title">Recent</div>
            <button
              className={`nav-1__item ${activeRoute === 'recent' ? 'nav-1__item--active' : ''}`}
              onClick={() => handleNavigate('recent')}
            >
              <Clock className="nav-1__item-icon" />
              <span className="nav-1__item-text">Recent Files</span>
            </button>
          </div>
        </nav>

        <div className="nav-1__footer">
          <button className="nav-1__item">
            <Settings className="nav-1__item-icon" />
            <span className="nav-1__item-text">Settings</span>
          </button>
          <button className="nav-1__toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>
      </div>

      <div className="nav-1__content">
        <div style={{ padding: '32px' }}>
          <h2>Main Content Area</h2>
          <p>Content for {activeRoute} goes here</p>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '16px' }}>
            This sidebar is {collapsed ? 'collapsed' : 'expanded'}. Click the toggle button to change it.
          </p>
        </div>
      </div>
    </>
  );
};

// Option 2: Top Toolbar
export const TopToolbar: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('write');
  const [activeSecondary, setActiveSecondary] = useState('outline');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onNavigate?.(tab);
  };

  return (
    <>
      <div className="nav-2__topbar">
        <div className="nav-2__brand">
          <FileText className="nav-2__logo" />
          <span className="nav-2__app-name">Bright Writer</span>
        </div>

        <nav className="nav-2__primary-nav">
          <button
            className={`nav-2__primary-item ${activeTab === 'write' ? 'nav-2__primary-item--active' : ''}`}
            onClick={() => handleTabChange('write')}
          >
            <FileText className="nav-2__primary-icon" />
            Write
          </button>
          <button
            className={`nav-2__primary-item ${activeTab === 'universe' ? 'nav-2__primary-item--active' : ''}`}
            onClick={() => handleTabChange('universe')}
          >
            <Folder className="nav-2__primary-icon" />
            Universe
          </button>
          <button
            className={`nav-2__primary-item ${activeTab === 'research' ? 'nav-2__primary-item--active' : ''}`}
            onClick={() => handleTabChange('research')}
          >
            <Search className="nav-2__primary-icon" />
            Research
          </button>
          <button
            className={`nav-2__primary-item ${activeTab === 'export' ? 'nav-2__primary-item--active' : ''}`}
            onClick={() => handleTabChange('export')}
          >
            <Star className="nav-2__primary-icon" />
            Export
          </button>
        </nav>

        <div className="nav-2__actions">
          <button className="nav-2__action-button">
            <Search className="nav-2__action-icon" />
          </button>
          <button className="nav-2__action-button">
            <Bell className="nav-2__action-icon" />
            <span className="nav-2__notification-badge"></span>
          </button>
          <button className="nav-2__action-button">
            <Settings className="nav-2__action-icon" />
          </button>
        </div>
      </div>

      <div className="nav-2__secondary">
        <nav className="nav-2__secondary-nav">
          <button
            className={`nav-2__secondary-item ${activeSecondary === 'outline' ? 'nav-2__secondary-item--active' : ''}`}
            onClick={() => setActiveSecondary('outline')}
          >
            <Menu className="nav-2__secondary-icon" />
            Outline
          </button>
          <button
            className={`nav-2__secondary-item ${activeSecondary === 'chapters' ? 'nav-2__secondary-item--active' : ''}`}
            onClick={() => setActiveSecondary('chapters')}
          >
            <FileText className="nav-2__secondary-icon" />
            Chapters
          </button>
          <button
            className={`nav-2__secondary-item ${activeSecondary === 'notes' ? 'nav-2__secondary-item--active' : ''}`}
            onClick={() => setActiveSecondary('notes')}
          >
            <Star className="nav-2__secondary-icon" />
            Notes
          </button>
        </nav>

        <div className="nav-2__breadcrumb">
          <span className="nav-2__breadcrumb-item">My Novel</span>
          <ChevronRight className="nav-2__breadcrumb-separator" />
          <span className="nav-2__breadcrumb-item">Chapter 3</span>
        </div>
      </div>

      <div className="nav-2__content">
        <div style={{ padding: '32px' }}>
          <h2>Main Content Area</h2>
          <p>Active Tab: {activeTab}</p>
          <p>Active Secondary: {activeSecondary}</p>
        </div>
      </div>
    </>
  );
};

// Option 3: Minimal Top Bar
export const MinimalTopBar: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  return (
    <>
      <div className={`nav-3__topbar ${isHidden ? 'nav-3__topbar--hidden' : ''}`}>
        <div className="nav-3__left">
          <button className="nav-3__nav-button">
            <Menu className="nav-3__nav-icon" />
            <span>Projects</span>
          </button>
          <div className="nav-3__divider"></div>
          <button className="nav-3__icon-button">
            <ChevronLeft className="nav-3__nav-icon" />
          </button>
          <button className="nav-3__icon-button">
            <ChevronRight className="nav-3__nav-icon" />
          </button>
        </div>

        <div className="nav-3__center">
          <div className="nav-3__breadcrumb">
            <span className="nav-3__breadcrumb-item">My Novel</span>
            <ChevronRight className="nav-3__breadcrumb-separator" />
            <span className="nav-3__breadcrumb-item">Part One</span>
            <ChevronRight className="nav-3__breadcrumb-separator" />
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
            <Command className="nav-3__nav-icon" />
          </button>
          <button className="nav-3__icon-button">
            <Search className="nav-3__nav-icon" />
          </button>
          <button className="nav-3__action-button nav-3__action-button--primary">
            <Plus className="nav-3__action-icon" />
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

// Main Navigation Component
export const Navigation: React.FC<NavigationProps> = ({ variant, onNavigate }) => {
  if (variant === 'option1') {
    return <VerticalSidebar onNavigate={onNavigate} />;
  }
  if (variant === 'option2') {
    return <TopToolbar onNavigate={onNavigate} />;
  }
  if (variant === 'option3') {
    return <MinimalTopBar onNavigate={onNavigate} />;
  }
  return null;
};
