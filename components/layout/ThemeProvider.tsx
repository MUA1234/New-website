'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.add('light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.remove('light');
    }
  }, [theme]);

  return <>{children}</>;
}
