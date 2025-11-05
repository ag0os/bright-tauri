/**
 * PageLayout Component
 *
 * Reusable layout wrapper for all screens with consistent structure and spacing.
 * Includes TopBar and provides a content area with proper padding.
 */

import { ReactNode } from 'react';
import { TopBar, NavigationTab } from './TopBar';
import './PageLayout.css';

interface PageLayoutProps {
  /** Content to render in the main area */
  children: ReactNode;
  /** Current active navigation tab */
  activeTab?: NavigationTab;
  /** Callback when navigation tab changes */
  onTabChange?: (tab: NavigationTab) => void;
  /** Optional CSS class for the content area */
  contentClassName?: string;
  /** Whether to apply default padding to content area (default: true) */
  applyPadding?: boolean;
}

export function PageLayout({
  children,
  activeTab = 'stories',
  onTabChange,
  contentClassName = '',
  applyPadding = true,
}: PageLayoutProps) {
  const contentClasses = [
    'page-layout__content',
    applyPadding ? 'page-layout__content--padded' : '',
    contentClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="page-layout">
      <TopBar activeTab={activeTab} onTabChange={onTabChange} />
      <main className={contentClasses}>{children}</main>
    </div>
  );
}
