// src/components/homepage/TeamFilterTabs.tsx
'use client';

import Image from 'next/image';

interface TeamFilterTabsProps {
  activeTeam: string;
  onTeamChange: (team: string) => void;
  userPreferredTeam: string | null;
}

const TEAMS = [
  { slug: 'all', label: 'All Teams', logo: null },
  { slug: 'bears', label: 'Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { slug: 'bulls', label: 'Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { slug: 'blackhawks', label: 'Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  { slug: 'cubs', label: 'Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { slug: 'white-sox', label: 'White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
];

export function TeamFilterTabs({
  activeTeam,
  onTeamChange,
  userPreferredTeam
}: TeamFilterTabsProps) {
  return (
    <nav className="team-filter-bar filter-scroll" aria-label="Filter by team">
      {TEAMS.map((team) => (
        <button
          key={team.slug}
          onClick={() => onTeamChange(team.slug)}
          className={`team-pill ${activeTeam === team.slug ? 'active' : ''}`}
          aria-pressed={activeTeam === team.slug}
        >
          {team.logo && (
            <Image
              src={team.logo}
              alt=""
              width={18}
              height={18}
              style={{ borderRadius: '50%', objectFit: 'contain' }}
            />
          )}
          {team.label}
          {userPreferredTeam === team.slug && activeTeam !== team.slug && ' \u2605'}
        </button>
      ))}
    </nav>
  );
}
