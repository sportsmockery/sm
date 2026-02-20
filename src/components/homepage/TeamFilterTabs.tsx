// src/components/homepage/TeamFilterTabs.tsx
'use client';

import Image from 'next/image';

interface TeamFilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  userPreferredTeam: string | null;
}

const TEAMS = [
  { slug: 'all', label: 'All', logo: null },
  { slug: 'bears', label: 'Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { slug: 'bulls', label: 'Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { slug: 'blackhawks', label: 'Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  { slug: 'cubs', label: 'Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { slug: 'white-sox', label: 'White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
];

const CONTENT_TYPES = [
  { slug: 'article', label: 'News' },
  { slug: 'analysis', label: 'Analysis' },
  { slug: 'video', label: 'Video' },
  { slug: 'podcast', label: 'Podcasts' },
];

export function TeamFilterTabs({
  activeFilter,
  onFilterChange,
  userPreferredTeam
}: TeamFilterTabsProps) {
  return (
    <nav className="feed-filter-bar filter-scroll" aria-label="Filter feed">
      {TEAMS.map((team) => (
        <button
          key={team.slug}
          onClick={() => onFilterChange(team.slug)}
          className={`filter-chip ${activeFilter === team.slug ? 'active' : ''}`}
          aria-pressed={activeFilter === team.slug}
        >
          {team.logo && (
            <Image
              src={team.logo}
              alt=""
              width={16}
              height={16}
              style={{ borderRadius: '50%', objectFit: 'contain' }}
            />
          )}
          {team.label}
          {userPreferredTeam === team.slug && activeFilter !== team.slug && (
            <span style={{ fontSize: '10px', opacity: 0.6 }}>{'\u2605'}</span>
          )}
        </button>
      ))}

      <div className="filter-divider" />

      {CONTENT_TYPES.map((type) => (
        <button
          key={type.slug}
          onClick={() => onFilterChange(type.slug)}
          className={`filter-chip ${activeFilter === type.slug ? 'active' : ''}`}
          aria-pressed={activeFilter === type.slug}
        >
          {type.label}
        </button>
      ))}
    </nav>
  );
}
