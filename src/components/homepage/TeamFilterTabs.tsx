// src/components/homepage/TeamFilterTabs.tsx
'use client';

interface TeamFilterTabsProps {
  activeTeam: string;
  onTeamChange: (team: string) => void;
  userPreferredTeam: string | null;
}

const TEAMS = [
  { slug: 'all', label: 'All' },
  { slug: 'bears', label: 'Bears' },
  { slug: 'bulls', label: 'Bulls' },
  { slug: 'blackhawks', label: 'Blackhawks' },
  { slug: 'cubs', label: 'Cubs' },
  { slug: 'white-sox', label: 'White Sox' }
];

export function TeamFilterTabs({
  activeTeam,
  onTeamChange,
  userPreferredTeam
}: TeamFilterTabsProps) {
  return (
    <nav className="team-filter-bar" aria-label="Filter by team">
      {TEAMS.map((team) => (
        <button
          key={team.slug}
          onClick={() => onTeamChange(team.slug)}
          className={`team-pill ${activeTeam === team.slug ? 'active' : ''}`}
          aria-pressed={activeTeam === team.slug}
        >
          {team.label}
          {userPreferredTeam === team.slug && activeTeam !== team.slug && ' \u2605'}
        </button>
      ))}
    </nav>
  );
}
