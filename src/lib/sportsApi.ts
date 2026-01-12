// API client for fetching live sports data
// Can connect to ESPN API, SportsData.io, or your Data Lab

import { Team, Player, Game, StandingsEntry, TeamStats, PlayerStats, PlayerGameLog, InjuryReport } from './types/sports';
import { CHICAGO_TEAMS, getTeamBySlug } from './teams';
import {
  getMockSchedule,
  getMockRoster,
  getMockTeamStats,
  getMockStandings,
  getMockPlayer,
  getMockPlayerStats,
  getMockPlayerGameLog,
  getMockInjuryReport,
} from '@/data/mockSportsData';

const DATA_LAB_URL = process.env.NEXT_PUBLIC_DATALAB_URL || 'https://datalab.sportsmockery.com';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false';

// Fetch team schedule
export async function getTeamSchedule(teamSlug: string, season?: string): Promise<Game[]> {
  if (USE_MOCK_DATA) {
    return getMockSchedule(teamSlug, season);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/teams/${teamSlug}/schedule?season=${season || 'current'}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    if (!response.ok) throw new Error('Failed to fetch schedule');
    return response.json();
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return getMockSchedule(teamSlug, season);
  }
}

// Fetch team roster
export async function getTeamRoster(teamSlug: string): Promise<Player[]> {
  if (USE_MOCK_DATA) {
    return getMockRoster(teamSlug);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/teams/${teamSlug}/roster`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!response.ok) throw new Error('Failed to fetch roster');
    return response.json();
  } catch (error) {
    console.error('Error fetching roster:', error);
    return getMockRoster(teamSlug);
  }
}

// Fetch team stats
export async function getTeamStats(teamSlug: string, season?: string): Promise<TeamStats> {
  if (USE_MOCK_DATA) {
    return getMockTeamStats(teamSlug, season);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/teams/${teamSlug}/stats?season=${season || 'current'}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to fetch team stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return getMockTeamStats(teamSlug, season);
  }
}

// Fetch division/conference standings
export async function getStandings(teamSlug: string): Promise<StandingsEntry[]> {
  if (USE_MOCK_DATA) {
    return getMockStandings(teamSlug);
  }

  try {
    const team = getTeamBySlug(teamSlug);
    if (!team) return [];

    const response = await fetch(`${DATA_LAB_URL}/api/standings/${team.sport}/${team.division}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to fetch standings');
    return response.json();
  } catch (error) {
    console.error('Error fetching standings:', error);
    return getMockStandings(teamSlug);
  }
}

// Fetch player profile
export async function getPlayer(playerId: string): Promise<Player | null> {
  if (USE_MOCK_DATA) {
    return getMockPlayer(playerId);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/players/${playerId}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching player:', error);
    return getMockPlayer(playerId);
  }
}

// Fetch player stats
export async function getPlayerStats(playerId: string): Promise<PlayerStats[]> {
  if (USE_MOCK_DATA) {
    return getMockPlayerStats(playerId);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/players/${playerId}/stats`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to fetch player stats');
    return response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return getMockPlayerStats(playerId);
  }
}

// Fetch player game log
export async function getPlayerGameLog(playerId: string, season?: string): Promise<PlayerGameLog[]> {
  if (USE_MOCK_DATA) {
    return getMockPlayerGameLog(playerId, season);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/players/${playerId}/gamelog?season=${season || 'current'}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to fetch game log');
    return response.json();
  } catch (error) {
    console.error('Error fetching game log:', error);
    return getMockPlayerGameLog(playerId, season);
  }
}

// Fetch injury report
export async function getInjuryReport(teamSlug: string): Promise<InjuryReport[]> {
  if (USE_MOCK_DATA) {
    return getMockInjuryReport(teamSlug);
  }

  try {
    const response = await fetch(`${DATA_LAB_URL}/api/teams/${teamSlug}/injuries`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error('Failed to fetch injury report');
    return response.json();
  } catch (error) {
    console.error('Error fetching injury report:', error);
    return getMockInjuryReport(teamSlug);
  }
}

// Search players
export async function searchPlayers(query: string, teamSlug?: string): Promise<Player[]> {
  if (USE_MOCK_DATA) {
    // Search through mock data
    const allPlayers: Player[] = [];
    for (const slug of Object.keys(CHICAGO_TEAMS)) {
      if (teamSlug && slug !== teamSlug) continue;
      const roster = await getMockRoster(slug);
      allPlayers.push(...roster);
    }

    const lowerQuery = query.toLowerCase();
    return allPlayers.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery)
    ).slice(0, 10);
  }

  try {
    const params = new URLSearchParams({ q: query });
    if (teamSlug) params.append('team', teamSlug);

    const response = await fetch(`${DATA_LAB_URL}/api/players/search?${params}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error('Failed to search players');
    return response.json();
  } catch (error) {
    console.error('Error searching players:', error);
    return [];
  }
}

// Get team's next game
export async function getNextGame(teamSlug: string): Promise<Game | null> {
  const schedule = await getTeamSchedule(teamSlug);
  const now = new Date();

  return schedule.find(game => {
    const gameDate = new Date(game.date);
    return gameDate >= now && game.status === 'scheduled';
  }) || null;
}

// Get team's last game
export async function getLastGame(teamSlug: string): Promise<Game | null> {
  const schedule = await getTeamSchedule(teamSlug);

  const completedGames = schedule.filter(game => game.status === 'final');
  return completedGames[completedGames.length - 1] || null;
}

// Get team's recent results (last N games)
export async function getRecentResults(teamSlug: string, count: number = 5): Promise<Game[]> {
  const schedule = await getTeamSchedule(teamSlug);

  const completedGames = schedule.filter(game => game.status === 'final');
  return completedGames.slice(-count);
}

// Get team record from schedule
export async function getTeamRecord(teamSlug: string): Promise<{ wins: number; losses: number; ties: number }> {
  const schedule = await getTeamSchedule(teamSlug);

  let wins = 0, losses = 0, ties = 0;

  for (const game of schedule) {
    if (game.status !== 'final') continue;
    if (game.result === 'W') wins++;
    else if (game.result === 'L') losses++;
    else if (game.result === 'T') ties++;
  }

  return { wins, losses, ties };
}
