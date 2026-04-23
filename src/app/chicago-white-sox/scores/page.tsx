import { Metadata } from 'next'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxRecentScores, getWhiteSoxRecord } from '@/lib/whitesoxData'
import { datalabAdmin } from '@/lib/supabase-datalab'
import BoxScoreClient from './BoxScoreClient'

export const metadata: Metadata = {
  title: 'Chicago White Sox Scores 2026 | Box Scores & Results | SportsMockery',
  description: 'Chicago White Sox box scores with detailed player stats. View batting, pitching, and more for every game.',
}

export const revalidate = 300

export default async function WhiteSoxScoresPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [scores, soxRecord, nextGame] = await Promise.all([
    getWhiteSoxRecentScores(10),
    getWhiteSoxRecord(),
    fetchNextGame('whitesox'),
  ])

  const record = {
    wins: soxRecord.wins,
    losses: soxRecord.losses,
  }

  // Pick the most recent game with player stats already synced.
  let initialGameId: string | null = scores[0]?.gameId || null
  if (datalabAdmin && scores.length > 0) {
    try {
      const { data: gameRows } = await datalabAdmin
        .from('whitesox_games_master')
        .select('id, game_id')
        .in('id', scores.map(s => Number(s.gameId)).filter(n => !isNaN(n)))
      if (gameRows && gameRows.length > 0) {
        const { data: statRows } = await datalabAdmin
          .from('whitesox_player_game_stats')
          .select('game_id')
          .in('game_id', gameRows.map((g: any) => g.game_id).filter(Boolean))
          .eq('is_opponent', false)
          .limit(5000)
        const gameIdsWithStats = new Set((statRows || []).map((r: any) => r.game_id))
        const idToGameId = new Map(gameRows.map((g: any) => [g.id, g.game_id]))
        for (const s of scores) {
          const gameId = idToGameId.get(Number(s.gameId))
          if (gameId && gameIdsWithStats.has(gameId)) {
            initialGameId = s.gameId
            break
          }
        }
      }
    } catch {}
  }

  const games = scores.map(game => ({
    gameId: game.gameId,
    date: game.date,
    opponent: game.opponent,
    opponentFullName: game.opponentFullName,
    opponentLogo: game.opponentLogo,
    teamScore: game.whitesoxScore,
    oppScore: game.oppScore,
    result: game.result,
    homeAway: game.homeAway,
  }))

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="scores">
      <div className="pb-12">
        <div className="glass-card glass-card-sm glass-card-static"  >
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--sm-text-muted)' }}>{new Date().getFullYear()} Season</div>
              <div className="text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
                {soxRecord.wins}-{soxRecord.losses}
              </div>
            </div>
          </div>
        </div>

        {games.length > 0 ? (
          <BoxScoreClient games={games} initialGameId={initialGameId} />
        ) : (
          <div className="glass-card glass-card-static" >
            <p style={{ color: 'var(--sm-text-muted)' }}>No completed games yet</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/chicago-white-sox/schedule"
            className="btn btn-md btn-primary"
            style={{ display: 'inline-flex', textDecoration: 'none' }}>
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

