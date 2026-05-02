'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(): { theme: Theme; isDark: boolean; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('sm-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    } else {
      const prefers = window.matchMedia('(prefers-color-scheme: light)').matches;
      const t: Theme = prefers ? 'light' : 'dark';
      setTheme(t);
      document.documentElement.dataset.theme = t;
    }
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') document.documentElement.dataset.theme = next;
      try { window.localStorage.setItem('sm-theme', next); } catch { /* noop */ }
      return next;
    });
  }

  return { theme, isDark: theme === 'dark', toggle };
}
