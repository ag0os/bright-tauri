/**
 * useTheme Hook
 *
 * Manages light/dark theme state with localStorage persistence.
 * Applies theme to document root via data-theme attribute.
 */

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'bright-theme';

/**
 * Get the initial theme from localStorage or default to 'dark'
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  // Could also check system preference here:
  // if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  //   return 'light';
  // }

  return 'dark';
}

/**
 * Apply theme to the document root element
 */
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    isLight,
  };
}
