import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksRecentScores, getBlackhawksRecord, type BlackhawksGame } from '@/lib/blackhawksData'

const BLACKHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Scores 2024-25 | Game Results | SportsMockery',
  description: 'Chicago Blackhawks game scores and results. View recent games, final scores, and game summaries.',
}

export const revalidate = 1800

export default async function BlackhawksScoresPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [scores, hawksRecord, nextGame] = await Promise.all([
    getBlackhawksRecentScores(20),
    getBlackhawksRecord(),
    fetchNextGame('blackhawks'),
  ])

  const record = {
    wins: hawksRecord.wins,
    losses: hawksRecord.losses,
    otLosses: hawksRecord.otLosses,
  }

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      <div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Recent Games
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              Last {scores.length} games
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No completed games yet this season.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {scores.map((game) => (
                <div key={game.gameId} className="p-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[var(--text-muted)]">
                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      <div className="flex items-center gap-3">
                        <Image
                          src={BLACKHAWKS_LOGO}
                          alt="Chicago Blackhawks"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          unoptimized
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          {game.homeAway === 'home' ? 'vs' : '@'}
                        </span>
                        {game.opponentLogo && (
                          <Image
                            src={game.opponentLogo}
                            alt={game.opponent}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            unoptimized
                          />
                        )}
                        <span className="font-medium text-[var(--text-primary)]">
                          {game.opponentFullName || game.opponent}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        game.result === 'W'
                          ? 'bg-green-500/10 text-green-500'
                          : game.result === 'OTL'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                      }`}>
                        {game.result}{game.overtime ? ' (OT)' : ''}{game.shootout ? ' (SO)' : ''}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {game.blackhawksScore} - {game.oppScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chicago-blackhawks/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#CF0A2C] hover:bg-[#a50823] text-white font-semibold rounded-xl transition-colors"
          >
            View Full Schedule
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
