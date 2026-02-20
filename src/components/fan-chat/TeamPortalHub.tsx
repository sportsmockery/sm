// src/components/fan-chat/TeamPortalHub.tsx
'use client';

import Image from 'next/image';

interface TeamPortalHubProps {
  activeTeam: string;
  onSelectTeam: (slug: string) => void;
}

const teams = [
  { slug: 'bears', name: 'Bears Den', color: '#C83803', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', angle: 270 },
  { slug: 'bulls', name: 'Bulls Court', color: '#CE1126', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', angle: 342 },
  { slug: 'cubs', name: 'Cubs Dugout', color: '#0E3386', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', angle: 54 },
  { slug: 'whitesox', name: 'Sox Lounge', color: '#27251F', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', angle: 126 },
  { slug: 'blackhawks', name: 'Hawks Nest', color: '#CF0A2C', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', angle: 198 },
];

export function TeamPortalHub({ activeTeam, onSelectTeam }: TeamPortalHubProps) {
  const activeInfo = teams.find(t => t.slug === activeTeam);

  return (
    <div className="portal-hub">
      <div className="portal-ring" />
      <div className="portal-center">
        <span className="portal-label">
          {activeInfo ? activeInfo.name : 'Choose Your Room'}
        </span>
      </div>
      {teams.map((team) => {
        // Position orbs in a circle
        const radius = 42; // % from center
        const rad = (team.angle * Math.PI) / 180;
        const top = 50 - radius * Math.cos(rad);
        const left = 50 + radius * Math.sin(rad);

        return (
          <button
            key={team.slug}
            className={`portal-orb ${activeTeam === team.slug ? 'active' : ''}`}
            style={{
              '--orb-color': team.color,
              top: `${top}%`,
              left: `${left}%`,
            } as React.CSSProperties}
            onClick={() => onSelectTeam(team.slug)}
            aria-label={`Enter ${team.name}`}
          >
            <Image
              src={team.logo}
              alt={team.name}
              width={32}
              height={32}
              unoptimized
            />
            <span className="orb-name">{team.name}</span>
          </button>
        );
      })}
    </div>
  );
}
