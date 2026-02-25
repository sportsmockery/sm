// src/components/layout/LiveStrip.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const POLL_INTERVAL = 15_000; // 15s when live games exist

interface LiveGame {
  game_id: string;
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb';
  status: string;
  game_start_time?: string;
  home_team_abbr: string;
  away_team_abbr: string;
  home_score: number;
  away_score: number;
  period_label: string | null;
  clock: string | null;
  chicago_team: string;
  is_chicago_home: boolean;
}

// Chicago Desk fallback links (only pages that already exist)
const DESK_LINKS = [
  { label: 'Cap Tracker', href: '/chicago-bears/cap-tracker' },
  { label: 'Trade Rumors', href: '/chicago-bears/trade-rumors' },
  { label: 'Draft Board', href: '/chicago-bears/draft-tracker' },
  { label: 'Mock Draft', href: '/mock-draft' },
];

function formatGameTime(isoTime: string): string {
  const d = new Date(isoTime);
  const hours = d.getHours();
  const mins = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = mins.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

function getChicagoAbbr(game: LiveGame): string {
  return game.is_chicago_home ? game.home_team_abbr : game.away_team_abbr;
}

function getOpponentAbbr(game: LiveGame): string {
  return game.is_chicago_home ? game.away_team_abbr : game.home_team_abbr;
}

function getChicagoScore(game: LiveGame): number {
  return game.is_chicago_home ? game.home_score : game.away_score;
}

function getOpponentScore(game: LiveGame): number {
  return game.is_chicago_home ? game.away_score : game.home_score;
}

export default function LiveStrip() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/live-games?include_upcoming=true', { cache: 'no-store' });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setGames(data.games || []);
    } catch {
      // Silent fail — fallback UI handles empty state
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    const id = setInterval(fetchGames, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchGames]);

  // Split into live vs upcoming
  const liveGames = games.filter((g) => g.status === 'in_progress');
  const upcomingGames = games.filter((g) => g.status === 'upcoming');
  const hasLive = liveGames.length > 0;
  const hasUpcoming = upcomingGames.length > 0;

  // Determine mode
  const mode: 'live' | 'upcoming' | 'desk' = hasLive
    ? 'live'
    : hasUpcoming
      ? 'upcoming'
      : 'desk';

  // Don't flash on initial load
  if (!loaded) return null;

  return (
    <div className="live-strip" data-mode={mode}>
      <div className="live-strip-inner">
        {/* LIVE mode */}
        {mode === 'live' && liveGames.map((game) => (
          <Link
            key={game.game_id}
            href={`/live/${game.sport}/${game.game_id}`}
            className="live-strip-chip live-strip-chip--live"
          >
            <span className="live-strip-badge">
              <span className="live-strip-pulse" />
              LIVE
            </span>
            <span className="live-strip-matchup">
              {getChicagoAbbr(game)} {getChicagoScore(game)} – {getOpponentScore(game)} {getOpponentAbbr(game)}
            </span>
            <span className="live-strip-status">
              {game.period_label && game.clock
                ? `${game.period_label} ${game.clock}`
                : game.period_label || 'In Progress'}
            </span>
          </Link>
        ))}

        {/* UPCOMING mode */}
        {mode === 'upcoming' && upcomingGames.map((game) => (
          <Link
            key={game.game_id}
            href={`/live/${game.sport}/${game.game_id}`}
            className="live-strip-chip live-strip-chip--upcoming"
          >
            <span className="live-strip-badge live-strip-badge--upcoming">
              TODAY
            </span>
            <span className="live-strip-matchup">
              {getChicagoAbbr(game)} vs {getOpponentAbbr(game)}
            </span>
            <span className="live-strip-status">
              {game.game_start_time ? formatGameTime(game.game_start_time) : 'TBD'}
            </span>
          </Link>
        ))}

        {/* Also show upcoming games alongside live ones */}
        {mode === 'live' && upcomingGames.map((game) => (
          <Link
            key={game.game_id}
            href={`/live/${game.sport}/${game.game_id}`}
            className="live-strip-chip live-strip-chip--upcoming"
          >
            <span className="live-strip-badge live-strip-badge--upcoming">
              NEXT
            </span>
            <span className="live-strip-matchup">
              {getChicagoAbbr(game)} vs {getOpponentAbbr(game)}
            </span>
            <span className="live-strip-status">
              {game.game_start_time ? formatGameTime(game.game_start_time) : 'TBD'}
            </span>
          </Link>
        ))}

        {/* DESK fallback mode */}
        {mode === 'desk' && (
          <>
            <span className="live-strip-desk-label">Chicago Desk</span>
            {DESK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="live-strip-chip live-strip-chip--desk">
                {link.label}
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
