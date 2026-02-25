// src/components/layout/LiveStrip.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

// Teams for the picker
const TEAMS = [
  { key: 'bears', name: 'Bears', slug: 'chicago-bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { key: 'bulls', name: 'Bulls', slug: 'chicago-bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { key: 'blackhawks', name: 'Blackhawks', slug: 'chicago-blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  { key: 'cubs', name: 'Cubs', slug: 'chicago-cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { key: 'whitesox', name: 'White Sox', slug: 'chicago-white-sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
];

// Pills that need a team picker (route pattern: /{team-slug}/{path})
const TEAM_PILLS: { label: string; path: string }[] = [
  { label: 'Cap Tracker', path: 'cap-tracker' },
  { label: 'Trade Rumors', path: 'trade-rumors' },
  { label: 'Draft Board', path: 'draft-tracker' },
];

// Pills that go directly to a fixed route
const DIRECT_PILLS: { label: string; href: string }[] = [
  { label: 'Mock Draft', href: '/mock-draft' },
  { label: 'Trade Simulator', href: '/gm' },
  { label: 'Fan Chat', href: '/fan-chat' },
];

const FAV_TEAM_KEY = 'sm-desk-favorite-team';

function getFavoriteTeamSlug(): string | null {
  try {
    return localStorage.getItem(FAV_TEAM_KEY);
  } catch {
    return null;
  }
}

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
  const router = useRouter();
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null); // path of open picker
  const pickerRef = useRef<HTMLDivElement>(null);
  const [focusedIdx, setFocusedIdx] = useState(-1);

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

  // Close picker on outside click or ESC
  useEffect(() => {
    if (!pickerOpen) return;

    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(null);
        setFocusedIdx(-1);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPickerOpen(null);
        setFocusedIdx(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, TEAMS.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && focusedIdx >= 0) {
        e.preventDefault();
        const team = TEAMS[focusedIdx];
        handleTeamSelect(team.slug, pickerOpen!);
      }
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [pickerOpen, focusedIdx]);

  function handleTeamPillClick(path: string) {
    const favSlug = getFavoriteTeamSlug();
    if (favSlug) {
      router.push(`/${favSlug}/${path}`);
    } else {
      setPickerOpen(pickerOpen === path ? null : path);
      setFocusedIdx(-1);
    }
  }

  function handleTeamSelect(teamSlug: string, path: string) {
    try {
      localStorage.setItem(FAV_TEAM_KEY, teamSlug);
    } catch {
      // Ignore storage errors
    }
    setPickerOpen(null);
    setFocusedIdx(-1);
    router.push(`/${teamSlug}/${path}`);
  }

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

            {/* Team-picker pills */}
            {TEAM_PILLS.map((pill) => (
              <div key={pill.path} style={{ position: 'relative' }} ref={pickerOpen === pill.path ? pickerRef : undefined}>
                <button
                  className="live-strip-chip live-strip-chip--desk"
                  onClick={() => handleTeamPillClick(pill.path)}
                  aria-expanded={pickerOpen === pill.path}
                  aria-haspopup="true"
                >
                  {pill.label}
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                    style={{ marginLeft: 2, opacity: 0.5 }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Team picker dropdown */}
                {pickerOpen === pill.path && (
                  <div className="desk-team-picker">
                    <span className="desk-team-picker-title">Choose your team</span>
                    <div className="desk-team-picker-grid">
                      {TEAMS.map((team, idx) => (
                        <button
                          key={team.key}
                          className={`desk-team-picker-btn${focusedIdx === idx ? ' desk-team-picker-btn--focused' : ''}`}
                          onClick={() => handleTeamSelect(team.slug, pill.path)}
                        >
                          <Image src={team.logo} alt={team.name} width={20} height={20} style={{ borderRadius: 4 }} />
                          <span>{team.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Direct pills */}
            {DIRECT_PILLS.map((link) => (
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
