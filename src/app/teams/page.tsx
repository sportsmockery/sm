import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllTeams } from '@/lib/teams';
import { fetchTeamRecord } from '@/lib/team-config';

export const metadata: Metadata = {
  title: 'Chicago Teams | Sports Mockery',
  description: 'Follow all Chicago sports teams - Bears, Bulls, Cubs, White Sox, and Blackhawks. Schedules, rosters, stats, and standings.',
};

// Map team slugs to team-config keys
const SLUG_TO_KEY: Record<string, string> = {
  'chicago-bears': 'bears',
  'chicago-bulls': 'bulls',
  'chicago-cubs': 'cubs',
  'chicago-white-sox': 'whitesox',
  'chicago-blackhawks': 'blackhawks',
};

export default async function TeamsPage() {
  const teams = getAllTeams();

  // Fetch records for all teams from DataLab (real data, not mock)
  const teamsWithData = await Promise.all(
    teams.map(async (team) => {
      const teamKey = SLUG_TO_KEY[team.slug];
      const record = teamKey ? await fetchTeamRecord(teamKey) : null;
      return { ...team, record, nextGame: null as any };
    })
  );

  return (
    <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
          Chicago Teams
        </h1>
        <p style={{ marginTop: '8px', color: 'var(--sm-text-muted)' }}>
          Follow all your favorite Chicago sports teams
        </p>
      </div>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {teamsWithData.map((team) => (
          <div
            key={team.slug}
            className="glass-card"
            style={{ overflow: 'hidden' }}
          >
            {/* Team Header - Main link */}
            <Link
              href={`/teams/${team.slug}`}
              style={{
                display: 'block',
                position: 'relative',
                padding: '24px',
                background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`,
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }} />
                  <Image
                    src={team.logo}
                    alt={team.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{team.league}</p>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#fff' }}>{team.name}</h2>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>{team.division}</p>
                </div>
              </div>

              {/* Record */}
              {team.record && (team.record.wins > 0 || team.record.losses > 0) && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: '#fff' }}>
                    {team.record.wins}-{team.record.losses}
                    {team.record.otLosses ? `-${team.record.otLosses}` : ''}
                    {team.record.ties ? `-${team.record.ties}` : ''}
                  </p>
                </div>
              )}
            </Link>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--sm-border)' }}>
              {[
                { label: 'Schedule', href: `/teams/${team.slug}/schedule` },
                { label: 'Roster', href: `/teams/${team.slug}/roster` },
                { label: 'Stats', href: `/teams/${team.slug}/stats` },
                { label: 'News', href: `/${team.slug}` },
              ].map((link, idx) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--sm-text-muted)',
                    textDecoration: 'none',
                    borderRight: idx < 3 ? '1px solid var(--sm-border)' : 'none',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Next Game */}
            {team.nextGame && (
              <Link
                href={`/teams/${team.slug}/schedule`}
                style={{
                  display: 'block',
                  padding: '16px',
                  borderTop: '1px solid var(--sm-border)',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                <p style={{ marginBottom: '4px', fontSize: 'var(--text-xs)', fontWeight: 500, textTransform: 'uppercase', color: 'var(--sm-text-muted)' }}>
                  Next Game
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                      <Image
                        src={team.nextGame.isHome ? team.nextGame.awayTeam.logo : team.nextGame.homeTeam.logo}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--sm-text)' }}>
                      {team.nextGame.isHome ? 'vs' : '@'}{' '}
                      {team.nextGame.isHome
                        ? team.nextGame.awayTeam.shortName
                        : team.nextGame.homeTeam.shortName}
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--sm-text-muted)' }}>
                    {new Date(team.nextGame.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
