'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shield, MessageSquare, Cpu, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { name: 'Feed', href: '/', icon: Home, match: (p: string) => p === '/' },
  { name: 'Teams', href: '/teams', icon: Shield, match: (p: string) => p.startsWith('/teams') || p.startsWith('/team/') },
  { name: 'Fan Chat', href: '/chat', icon: MessageSquare, match: (p: string) => p.startsWith('/chat') },
  { name: 'Scout AI', href: '/scout-ai', icon: Cpu, match: (p: string) => p.startsWith('/scout-ai') },
  { name: 'Profile', href: '/profile', icon: User, match: (p: string) => p.startsWith('/profile') },
];

export function BottomTabs() {
  const pathname = usePathname() || '/';

  return (
    <nav
      className={cn(
        'fixed inset-x-3 bottom-3 z-40 liquid-glass-pill',
        'flex justify-between items-center px-4 py-2',
        'safe-bottom',
      )}
      aria-label="Primary navigation"
    >
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.name}
            className={cn(
              'group relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-full',
              'transition-colors duration-150',
            )}
          >
            <Icon
              size={22}
              strokeWidth={active ? 2.4 : 1.8}
              style={{ color: active ? 'var(--color-brand-red)' : 'rgba(255,255,255,0.65)' }}
            />
            <span
              className={cn(
                'text-[10px] font-semibold tracking-wide',
                active ? 'text-white' : 'text-white/55',
              )}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
