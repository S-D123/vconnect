import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'app-theme-preference';

export default function useTheme() {
  const getInitial = () => {
    try {
      // 1. Check LocalStorage first (User preference)
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme) return savedTheme;

      // 2. Check System preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.warn("Theme initialization failed", e);
    }
    return 'light'; // Default fallback
  };

  const [theme, setTheme] = useState(getInitial);

  // Sync theme to HTML attribute AND LocalStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for System Preference Changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (!mq) return;

    const handler = (e) => {
      // Only auto-switch if the user hasn't saved a specific preference yet
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const resetToSystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY); // Remove the override
    // Re-check system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
  }, []);

  return [theme, toggle, resetToSystem];
}