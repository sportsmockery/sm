import type { ReactNode } from 'react';
import { BottomTabs } from '@/components/nav/BottomTabs';
import { MiniPlayer } from '@/components/nav/MiniPlayer';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh pb-[calc(80px+env(safe-area-inset-bottom))]">
      {children}
      <MiniPlayer />
      <BottomTabs />
    </div>
  );
}
