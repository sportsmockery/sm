// src/components/homepage/TeamFilterTabs.tsx
'use client';

interface TeamFilterTabsProps {
  activeTeam: string;
  onTeamChange: (team: string) => void;
  userPreferredTeam: string | null;
}

const TEAMS = [
  { slug: 'all', label: 'All', color: '#1a1a1a' },
  { slug: 'bears', label: 'Bears', color: '#0B162A' },
  { slug: 'bulls', label: 'Bulls', color: '#CE1141' },
  { slug: 'blackhawks', label: 'Blackhawks', color: '#CF0A2C' },
  { slug: 'cubs', label: 'Cubs', color: '#0E3386' },
  { slug: 'white-sox', label: 'White Sox', color: '#27251F' }
];

export function TeamFilterTabs({
  activeTeam,
  onTeamChange,
  userPreferredTeam
}: TeamFilterTabsProps) {
  return (
    <nav className="team-filter-tabs" aria-label="Filter by team">
      <div className="team-filter-scroll-container">
        {TEAMS.map((team) => (
          <button
            key={team.slug}
            onClick={() => onTeamChange(team.slug)}
            className={`team-filter-tab ${activeTeam === team.slug ? 'active' : ''} ${userPreferredTeam === team.slug ? 'preferred' : ''}`}
            style={{
              '--team-color': team.color
            } as React.CSSProperties}
            aria-pressed={activeTeam === team.slug}
          >
            {team.label}
            {userPreferredTeam === team.slug && activeTeam !== team.slug && (
              <span className="preferred-indicator" aria-label="Your team">&#9733;</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
