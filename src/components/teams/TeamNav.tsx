'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Team } from '@/lib/types/sports';

interface TeamNavProps {
  team: Team;
}

const navItems = [
  { label: 'Overview', href: '' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Roster', href: '/roster' },
  { label: 'Stats', href: '/stats' },
  { label: 'Standings', href: '/standings' },
  { label: 'News', href: '', external: true },
];

export default function TeamNav({ team }: TeamNavProps) {
  const pathname = usePathname();
  const basePath = `/teams/${team.slug}`;

  const isActive = (href: string, external?: boolean) => {
    if (external) return false;
    if (href === '') {
      return pathname === basePath;
    }
    return pathname === `${basePath}${href}`;
  };

  return (
    <nav className="border-b" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="scrollbar-hide flex overflow-x-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.external);
            const href = item.external ? `/${team.slug}` : `${basePath}${item.href}`;

            return (
              <Link
                key={item.label}
                href={href}
                className="relative flex-shrink-0 px-4 py-4 text-sm font-medium transition-colors"
                style={{ color: active ? 'var(--sm-text)' : 'var(--sm-text-muted)' }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: team.colors.primary }}
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
