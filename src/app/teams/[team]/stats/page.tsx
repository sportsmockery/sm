import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTeamBySlug } from '@/lib/teams';
import { getTeamStats, getTeamRoster, getPlayerStats } from '@/lib/sportsApi';
import { TeamStatsDisplay, SeasonSelector } from '@/components/teams';
import Link from 'next/link';
import Image from 'next/image';

interface StatsPageProps {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params }: StatsPageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  return {
    title: `${team.name} Stats | Sports Mockery`,
    description: `${team.name} team statistics, rankings, and stat leaders.`,
  };
}

export default async function StatsPage({ params, searchParams }: StatsPageProps) {
  const { team: teamSlug } = await params;
  const { season } = await searchParams;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  const [stats, roster] = await Promise.all([
    getTeamStats(teamSlug, season),
    getTeamRoster(teamSlug),
  ]);

  // Get stat leaders (would come from player stats in real implementation)
  const statLeaders = [
    { category: 'Passing Yards', player: roster.find(p => p.position === 'QB'), value: '2,567' },
    { category: 'Rushing Yards', player: roster.find(p => p.position === 'RB'), value: '654' },
    { category: 'Receiving Yards', player: roster.find(p => p.position === 'WR'), value: '789' },
    { category: 'Sacks', player: roster.find(p => p.position === 'DE'), value: '8.5' },
    { category: 'Tackles', player: roster.find(p => p.position === 'ILB'), value: '78' },
    { category: 'Interceptions', player: roster.find(p => p.position === 'CB'), value: '4' },
  ].filter(l => l.player);

  return (
    <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
            {team.shortName} Stats
          </h1>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            {stats.season} Season Statistics
          </p>
        </div>

        <SeasonSelector team={team} currentSeason={season} />
      </div>

      {/* Team Stats Display */}
      <TeamStatsDisplay stats={stats} team={team} />

      {/* Stat Leaders */}
      {statLeaders.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--sm-text)' }}>
            Team Leaders
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statLeaders.map((leader) => (
              <Link
                key={leader.category}
                href={`/players/${leader.player?.slug}`}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0, overflow: 'hidden', borderRadius: '50%', background: 'var(--sm-surface)' }}>
                  {leader.player && (
                    <Image
                      src={leader.player.headshot}
                      alt={leader.player.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 500, textTransform: 'uppercase', color: 'var(--sm-text-muted)' }}>
                    {leader.category}
                  </p>
                  <p className="truncate" style={{ fontWeight: 600, color: 'var(--sm-text)' }}>
                    {leader.player?.name}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
                    {leader.value}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
