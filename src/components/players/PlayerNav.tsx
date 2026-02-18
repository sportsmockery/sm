'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Player } from '@/lib/types/sports';

interface PlayerNavProps {
  player: Player;
}

const navItems = [
  { label: 'Overview', href: '' },
  { label: 'Stats', href: '/stats' },
  { label: 'Game Log', href: '/game-log' },
];

export default function PlayerNav({ player }: PlayerNavProps) {
  const pathname = usePathname();
  const basePath = `/players/${player.slug}`;

  const isActive = (href: string) => {
    if (href === '') {
      return pathname === basePath;
    }
    return pathname === `${basePath}${href}`;
  };

  return (
    <nav className="border-b" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={`${basePath}${item.href}`}
                className="relative px-4 py-4 text-sm font-medium transition-colors"
                style={{ color: active ? 'var(--sm-text)' : 'var(--sm-text-muted)' }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: player.team.colors.primary }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
