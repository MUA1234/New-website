'use client';

import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/useAppStore';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const theme = useAppStore((s) => s.theme);

  return (
    <div className={cn('flex h-screen overflow-hidden', theme === 'light' ? 'light' : 'dark')}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="min-h-full gradient-mesh">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
