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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Chicago Teams
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Follow all your favorite Chicago sports teams
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamsWithData.map((team) => (
          <div
            key={team.slug}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
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
            <div className="grid grid-cols-4 divide-x divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
              {[
                { label: 'Schedule', href: `/teams/${team.slug}/schedule` },
                { label: 'Roster', href: `/teams/${team.slug}/roster` },
                { label: 'Stats', href: `/teams/${team.slug}/stats` },
                { label: 'News', href: `/${team.slug}` },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="py-3 text-center text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Next Game */}
            {team.nextGame && (
              <Link
                href={`/teams/${team.slug}/schedule`}
                className="block border-t border-zinc-100 p-4 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <p className="mb-1 text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
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
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {team.nextGame.isHome ? 'vs' : '@'}{' '}
                      {team.nextGame.isHome
                        ? team.nextGame.awayTeam.shortName
                        : team.nextGame.homeTeam.shortName}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
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
