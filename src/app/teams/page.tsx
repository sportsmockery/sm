import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllTeams } from '@/lib/teams';
import { getTeamRecord, getNextGame } from '@/lib/sportsApi';

export const metadata: Metadata = {
  title: 'Chicago Teams | Sports Mockery',
  description: 'Follow all Chicago sports teams - Bears, Bulls, Cubs, White Sox, and Blackhawks. Schedules, rosters, stats, and standings.',
};

export default async function TeamsPage() {
  const teams = getAllTeams();

  // Fetch records for all teams
  const teamsWithData = await Promise.all(
    teams.map(async (team) => {
      const [record, nextGame] = await Promise.all([
        getTeamRecord(team.slug),
        getNextGame(team.slug),
      ]);
      return { ...team, record, nextGame };
    })
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--sm-text)' }}>
          Chicago Teams
        </h1>
        <p className="mt-2" style={{ color: 'var(--sm-text-muted)' }}>
          Follow all your favorite Chicago sports teams
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamsWithData.map((team) => (
          <div
            key={team.slug}
            className="group overflow-hidden rounded-2xl transition-all"
            style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
          >
            {/* Team Header - Main link */}
            <Link
              href={`/teams/${team.slug}`}
              className="block relative p-6"
              style={{
                background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
                  <Image
                    src={team.logo}
                    alt={team.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">{team.league}</p>
                  <h2 className="text-xl font-bold text-white">{team.name}</h2>
                  <p className="text-sm text-white/70">{team.division}</p>
                </div>
              </div>

              {/* Record */}
              {team.record && (team.record.wins > 0 || team.record.losses > 0) && (
                <div className="mt-4">
                  <p className="text-2xl font-bold text-white">
                    {team.record.wins}-{team.record.losses}
                    {team.record.ties > 0 ? `-${team.record.ties}` : ''}
                  </p>
                </div>
              )}
            </Link>

            {/* Quick Links */}
            <div className="grid grid-cols-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
              {[
                { label: 'Schedule', href: `/teams/${team.slug}/schedule` },
                { label: 'Roster', href: `/teams/${team.slug}/roster` },
                { label: 'Stats', href: `/teams/${team.slug}/stats` },
                { label: 'News', href: `/${team.slug}` },
              ].map((link, idx) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="py-3 text-center text-xs font-medium transition-colors"
                  style={{
                    color: 'var(--sm-text-muted)',
                    borderRight: idx < 3 ? '1px solid var(--sm-border)' : 'none',
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
                className="block p-4 transition-colors"
                style={{ borderTop: '1px solid var(--sm-border)' }}
              >
                <p className="mb-1 text-xs font-medium uppercase" style={{ color: 'var(--sm-text-muted)' }}>
                  Next Game
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6">
                      <Image
                        src={team.nextGame.isHome ? team.nextGame.awayTeam.logo : team.nextGame.homeTeam.logo}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                      {team.nextGame.isHome ? 'vs' : '@'}{' '}
                      {team.nextGame.isHome
                        ? team.nextGame.awayTeam.shortName
                        : team.nextGame.homeTeam.shortName}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
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
