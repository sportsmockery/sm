import { Team, Player, Game, StandingsEntry, TeamStats, PlayerStats, PlayerGameLog, InjuryReport } from '@/lib/types/sports';
import { CHICAGO_TEAMS, getTeamBySlug } from '@/lib/teams';

// ============================================
// MOCK SCHEDULE DATA
// ============================================

const bearsSchedule2025: Game[] = [
  { id: 'bears-wk1', date: '2025-09-07', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Green Bay Packers', 'GB', 'nfl'), status: 'final', homeScore: 24, awayScore: 17, venue: 'Soldier Field', broadcast: 'FOX', week: 1, isHome: true, result: 'W' },
  { id: 'bears-wk2', date: '2025-09-14', time: '12:00 PM', homeTeam: createOpponent('Houston Texans', 'HOU', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'final', homeScore: 20, awayScore: 27, venue: 'NRG Stadium', broadcast: 'CBS', week: 2, isHome: false, result: 'W' },
  { id: 'bears-wk3', date: '2025-09-21', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Indianapolis Colts', 'IND', 'nfl'), status: 'final', homeScore: 31, awayScore: 24, venue: 'Soldier Field', broadcast: 'CBS', week: 3, isHome: true, result: 'W' },
  { id: 'bears-wk4', date: '2025-09-28', time: '12:00 PM', homeTeam: createOpponent('Los Angeles Rams', 'LAR', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'final', homeScore: 28, awayScore: 21, venue: 'SoFi Stadium', broadcast: 'FOX', week: 4, isHome: false, result: 'L' },
  { id: 'bears-wk5', date: '2025-10-05', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Carolina Panthers', 'CAR', 'nfl'), status: 'final', homeScore: 35, awayScore: 14, venue: 'Soldier Field', broadcast: 'FOX', week: 5, isHome: true, result: 'W' },
  { id: 'bears-wk6', date: '2025-10-12', time: '7:20 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Jacksonville Jaguars', 'JAX', 'nfl'), status: 'final', homeScore: 17, awayScore: 23, venue: 'Soldier Field', broadcast: 'NBC', week: 6, isHome: true, result: 'L' },
  { id: 'bears-wk7', date: '2025-10-19', time: '3:25 PM', homeTeam: createOpponent('Arizona Cardinals', 'ARI', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'final', homeScore: 14, awayScore: 28, venue: 'State Farm Stadium', broadcast: 'FOX', week: 7, isHome: false, result: 'W' },
  { id: 'bears-wk8', date: '2025-10-26', time: '12:00 PM', homeTeam: createOpponent('Washington Commanders', 'WAS', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'final', homeScore: 20, awayScore: 24, venue: 'Northwest Stadium', broadcast: 'FOX', week: 8, isHome: false, result: 'W' },
  { id: 'bears-wk9', date: '2025-11-02', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('New England Patriots', 'NE', 'nfl'), status: 'final', homeScore: 27, awayScore: 17, venue: 'Soldier Field', broadcast: 'CBS', week: 9, isHome: true, result: 'W' },
  { id: 'bears-wk10', date: '2025-11-09', time: '12:00 PM', homeTeam: createOpponent('Minnesota Vikings', 'MIN', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'final', homeScore: 31, awayScore: 28, venue: 'U.S. Bank Stadium', broadcast: 'FOX', week: 10, isHome: false, result: 'L' },
  { id: 'bears-wk11', date: '2025-11-16', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Detroit Lions', 'DET', 'nfl'), status: 'final', homeScore: 21, awayScore: 24, venue: 'Soldier Field', broadcast: 'FOX', week: 11, isHome: true, result: 'L' },
  { id: 'bears-wk12', date: '2025-11-27', time: '11:30 AM', homeTeam: createOpponent('Detroit Lions', 'DET', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'scheduled', venue: 'Ford Field', broadcast: 'CBS', week: 12, isHome: false },
  { id: 'bears-wk13', date: '2025-12-07', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('San Francisco 49ers', 'SF', 'nfl'), status: 'scheduled', venue: 'Soldier Field', broadcast: 'FOX', week: 13, isHome: true },
  { id: 'bears-wk14', date: '2025-12-14', time: '7:20 PM', homeTeam: createOpponent('Minnesota Vikings', 'MIN', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'scheduled', venue: 'U.S. Bank Stadium', broadcast: 'NBC', week: 14, isHome: false },
  { id: 'bears-wk15', date: '2025-12-21', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Seattle Seahawks', 'SEA', 'nfl'), status: 'scheduled', venue: 'Soldier Field', broadcast: 'FOX', week: 15, isHome: true },
  { id: 'bears-wk16', date: '2025-12-28', time: '12:00 PM', homeTeam: CHICAGO_TEAMS['chicago-bears'], awayTeam: createOpponent('Green Bay Packers', 'GB', 'nfl'), status: 'scheduled', venue: 'Soldier Field', broadcast: 'FOX', week: 16, isHome: true },
  { id: 'bears-wk18', date: '2026-01-04', time: '12:00 PM', homeTeam: createOpponent('Atlanta Falcons', 'ATL', 'nfl'), awayTeam: CHICAGO_TEAMS['chicago-bears'], status: 'scheduled', venue: 'Mercedes-Benz Stadium', broadcast: 'FOX', week: 18, isHome: false },
];

// ============================================
// MOCK ROSTER DATA
// ============================================

const bearsRoster: Player[] = [
  // Offense - Quarterbacks
  createPlayer('caleb-williams', 'Caleb', 'Williams', '18', 'QB', 'offense', '6-1', '215', 23, '1/27/2002', 'USC', '1st year', CHICAGO_TEAMS['chicago-bears'], { year: 2024, round: 1, pick: 1, team: 'CHI' }),
  createPlayer('tyson-bagent', 'Tyson', 'Bagent', '9', 'QB', 'offense', '6-3', '215', 25, '8/7/1999', 'Shepherd', '2nd year', CHICAGO_TEAMS['chicago-bears']),

  // Offense - Running Backs
  createPlayer('khalil-herbert', 'Khalil', 'Herbert', '24', 'RB', 'offense', '5-9', '212', 26, '5/3/1998', 'Virginia Tech', '4th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('roschon-johnson', 'Roschon', 'Johnson', '23', 'RB', 'offense', '6-1', '219', 24, '10/11/2000', 'Texas', '2nd year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('darrynton-evans', 'Darrynton', 'Evans', '36', 'RB', 'offense', '5-10', '203', 26, '8/18/1998', 'Appalachian State', '5th year', CHICAGO_TEAMS['chicago-bears']),

  // Offense - Wide Receivers
  createPlayer('dj-moore', 'DJ', 'Moore', '2', 'WR', 'offense', '5-11', '215', 27, '4/14/1997', 'Maryland', '7th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('rome-odunze', 'Rome', 'Odunze', '15', 'WR', 'offense', '6-3', '215', 22, '6/19/2002', 'Washington', '1st year', CHICAGO_TEAMS['chicago-bears'], { year: 2024, round: 1, pick: 9, team: 'CHI' }),
  createPlayer('keenan-allen', 'Keenan', 'Allen', '13', 'WR', 'offense', '6-2', '211', 32, '4/27/1992', 'California', '12th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('tyler-scott', 'Tyler', 'Scott', '19', 'WR', 'offense', '5-10', '175', 23, '3/7/2001', 'Cincinnati', '2nd year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('velus-jones', 'Velus', 'Jones Jr.', '12', 'WR', 'offense', '6-0', '204', 27, '5/11/1997', 'Tennessee', '3rd year', CHICAGO_TEAMS['chicago-bears']),

  // Offense - Tight Ends
  createPlayer('cole-kmet', 'Cole', 'Kmet', '85', 'TE', 'offense', '6-6', '262', 25, '3/10/1999', 'Notre Dame', '5th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('gerald-everett', 'Gerald', 'Everett', '81', 'TE', 'offense', '6-3', '240', 30, '6/25/1994', 'South Alabama', '8th year', CHICAGO_TEAMS['chicago-bears']),

  // Offense - Offensive Line
  createPlayer('braxton-jones', 'Braxton', 'Jones', '70', 'OT', 'offense', '6-5', '310', 25, '5/9/1999', 'Southern Utah', '3rd year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('teven-jenkins', 'Teven', 'Jenkins', '76', 'OG', 'offense', '6-6', '317', 26, '3/3/1998', 'Oklahoma State', '4th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('coleman-shelton', 'Coleman', 'Shelton', '67', 'C', 'offense', '6-4', '305', 28, '11/20/1996', 'Washington', '6th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('nate-davis', 'Nate', 'Davis', '64', 'OG', 'offense', '6-3', '316', 27, '7/2/1997', 'Charlotte', '6th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('darnell-wright', 'Darnell', 'Wright', '58', 'OT', 'offense', '6-6', '333', 24, '4/19/2000', 'Tennessee', '2nd year', CHICAGO_TEAMS['chicago-bears']),

  // Defense - Defensive Line
  createPlayer('montez-sweat', 'Montez', 'Sweat', '98', 'DE', 'defense', '6-6', '265', 28, '9/4/1996', 'Mississippi State', '6th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('demarcus-walker', 'DeMarcus', 'Walker', '95', 'DE', 'defense', '6-4', '280', 29, '9/30/1995', 'Florida State', '8th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('gervon-dexter', 'Gervon', 'Dexter Sr.', '99', 'DT', 'defense', '6-6', '312', 22, '4/29/2002', 'Florida', '2nd year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('andrew-billings', 'Andrew', 'Billings', '97', 'DT', 'defense', '6-1', '311', 29, '3/21/1995', 'Baylor', '8th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('zacch-pickens', 'Zacch', 'Pickens', '96', 'DT', 'defense', '6-4', '305', 23, '3/23/2001', 'South Carolina', '2nd year', CHICAGO_TEAMS['chicago-bears']),

  // Defense - Linebackers
  createPlayer('tremaine-edmunds', 'Tremaine', 'Edmunds', '49', 'ILB', 'defense', '6-4', '250', 26, '5/2/1998', 'Virginia Tech', '7th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('tj-edwards', 'T.J.', 'Edwards', '53', 'ILB', 'defense', '6-1', '242', 28, '4/25/1996', 'Wisconsin', '6th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('jack-sanborn', 'Jack', 'Sanborn', '57', 'ILB', 'defense', '6-2', '237', 25, '5/29/1999', 'Wisconsin', '3rd year', CHICAGO_TEAMS['chicago-bears']),

  // Defense - Defensive Backs
  createPlayer('jaylon-johnson', 'Jaylon', 'Johnson', '1', 'CB', 'defense', '6-0', '196', 25, '3/18/1999', 'Utah', '5th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('tyrique-stevenson', 'Tyrique', 'Stevenson', '29', 'CB', 'defense', '6-0', '198', 23, '4/22/2001', 'Miami', '2nd year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('kyler-gordon', 'Kyler', 'Gordon', '6', 'CB', 'defense', '5-11', '194', 24, '1/16/2000', 'Washington', '3rd year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('kevin-byard', 'Kevin', 'Byard', '31', 'S', 'defense', '5-11', '212', 31, '8/17/1993', 'Middle Tennessee', '9th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('jaquan-brisker', 'Jaquan', 'Brisker', '9', 'S', 'defense', '6-1', '199', 25, '9/23/1999', 'Penn State', '3rd year', CHICAGO_TEAMS['chicago-bears']),

  // Special Teams
  createPlayer('cairo-santos', 'Cairo', 'Santos', '8', 'K', 'special', '5-8', '170', 33, '10/6/1991', 'Tulane', '10th year', CHICAGO_TEAMS['chicago-bears']),
  createPlayer('tory-taylor', 'Tory', 'Taylor', '16', 'P', 'special', '6-4', '229', 25, '2/6/1999', 'Iowa', '1st year', CHICAGO_TEAMS['chicago-bears'], { year: 2024, round: 4, pick: 123, team: 'CHI' }),
  createPlayer('patrick-scales', 'Patrick', 'Scales', '48', 'LS', 'special', '6-2', '230', 36, '11/2/1988', 'Utah State', '10th year', CHICAGO_TEAMS['chicago-bears']),
];

// ============================================
// MOCK STANDINGS DATA
// ============================================

const nfcNorthStandings: StandingsEntry[] = [
  createStandingsEntry('detroit-lions', 'Detroit Lions', 'DET', 11, 1, 0, '3-1', '2', '6-0', '5-1', '3-0', 'W5', 385, 241),
  createStandingsEntry('chicago-bears', 'Chicago Bears', 'CHI', 7, 4, 0, '2-1', '-', '4-2', '3-2', '2-1', 'L1', 255, 213),
  createStandingsEntry('green-bay-packers', 'Green Bay Packers', 'GB', 6, 5, 0, '2-1', '4.5', '4-2', '2-3', '2-2', 'W2', 267, 258),
  createStandingsEntry('minnesota-vikings', 'Minnesota Vikings', 'MIN', 6, 5, 0, '1-2', '4.5', '4-2', '2-3', '1-2', 'W1', 254, 242),
];

// ============================================
// MOCK TEAM STATS
// ============================================

const bearsStats: TeamStats = {
  season: '2025',
  offense: {
    pointsPerGame: 23.2,
    totalYards: 3456,
    yardsPerGame: 345.6,
    passingYards: 2567,
    rushingYards: 889,
    turnovers: 8,
    thirdDownPct: '42.3%',
    redZonePct: '58.8%',
  },
  defense: {
    pointsAllowed: 19.4,
    totalYardsAllowed: 3123,
    yardsPerGameAllowed: 312.3,
    passingYardsAllowed: 2145,
    rushingYardsAllowed: 978,
    takeaways: 14,
    sacks: 28,
    interceptions: 9,
  },
  rankings: {
    offense: 12,
    defense: 8,
    pointsFor: 14,
    pointsAgainst: 9,
    passingOffense: 10,
    rushingOffense: 18,
    passingDefense: 7,
    rushingDefense: 15,
  },
};

// ============================================
// MOCK PLAYER STATS
// ============================================

const playerStats: Record<string, PlayerStats[]> = {
  'caleb-williams': [
    {
      season: '2025',
      team: 'CHI',
      games: 11,
      gamesStarted: 11,
      stats: {
        completions: 234,
        attempts: 352,
        completionPct: '66.5%',
        yards: 2567,
        yardsPerAttempt: 7.3,
        touchdowns: 19,
        interceptions: 6,
        rating: 98.7,
        qbr: 65.4,
        sacks: 21,
        rushAttempts: 42,
        rushYards: 198,
        rushTD: 3,
      },
    },
  ],
  'dj-moore': [
    {
      season: '2025',
      team: 'CHI',
      games: 11,
      gamesStarted: 11,
      stats: {
        receptions: 62,
        targets: 94,
        yards: 789,
        yardsPerReception: 12.7,
        touchdowns: 6,
        firstDowns: 38,
        yardsAfterCatch: 312,
        drops: 2,
        longReception: 56,
      },
    },
    {
      season: '2024',
      team: 'CHI',
      games: 17,
      gamesStarted: 17,
      stats: {
        receptions: 96,
        targets: 143,
        yards: 1364,
        yardsPerReception: 14.2,
        touchdowns: 8,
        firstDowns: 62,
        yardsAfterCatch: 489,
        drops: 4,
        longReception: 62,
      },
    },
  ],
  'montez-sweat': [
    {
      season: '2025',
      team: 'CHI',
      games: 11,
      gamesStarted: 11,
      stats: {
        tackles: 34,
        sacks: 8.5,
        tacklesForLoss: 12,
        qbHits: 22,
        forcedFumbles: 2,
        fumbleRecoveries: 1,
        passesDefensed: 4,
      },
    },
  ],
};

// ============================================
// MOCK GAME LOGS
// ============================================

const playerGameLogs: Record<string, PlayerGameLog[]> = {
  'caleb-williams': [
    { gameId: 'bears-wk11', date: '2025-11-16', opponent: createOpponent('Detroit Lions', 'DET', 'nfl'), isHome: true, result: 'L', score: '21-24', stats: { completions: 24, attempts: 38, yards: 287, touchdowns: 2, interceptions: 1, rating: 91.2 } },
    { gameId: 'bears-wk10', date: '2025-11-09', opponent: createOpponent('Minnesota Vikings', 'MIN', 'nfl'), isHome: false, result: 'L', score: '28-31', stats: { completions: 27, attempts: 41, yards: 312, touchdowns: 3, interceptions: 2, rating: 88.5 } },
    { gameId: 'bears-wk9', date: '2025-11-02', opponent: createOpponent('New England Patriots', 'NE', 'nfl'), isHome: true, result: 'W', score: '27-17', stats: { completions: 21, attempts: 30, yards: 268, touchdowns: 2, interceptions: 0, rating: 112.3 } },
    { gameId: 'bears-wk8', date: '2025-10-26', opponent: createOpponent('Washington Commanders', 'WAS', 'nfl'), isHome: false, result: 'W', score: '24-20', stats: { completions: 23, attempts: 32, yards: 245, touchdowns: 2, interceptions: 0, rating: 108.6 } },
    { gameId: 'bears-wk7', date: '2025-10-19', opponent: createOpponent('Arizona Cardinals', 'ARI', 'nfl'), isHome: false, result: 'W', score: '28-14', stats: { completions: 22, attempts: 29, yards: 298, touchdowns: 3, interceptions: 0, rating: 138.4 } },
  ],
};

// ============================================
// MOCK INJURY REPORT
// ============================================

const bearsInjuries: InjuryReport[] = [
  { player: bearsRoster.find(p => p.id === 'jaquan-brisker')!, injury: 'Concussion', status: 'out', updated: '2025-11-20' },
  { player: bearsRoster.find(p => p.id === 'nate-davis')!, injury: 'Ankle', status: 'questionable', updated: '2025-11-20' },
  { player: bearsRoster.find(p => p.id === 'kyler-gordon')!, injury: 'Hamstring', status: 'probable', updated: '2025-11-20' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function createOpponent(name: string, abbreviation: string, sport: 'nfl' | 'mlb' | 'nba' | 'nhl'): Team {
  return {
    id: abbreviation.toLowerCase(),
    name,
    shortName: name.split(' ').pop() || name,
    abbreviation,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    sport,
    league: sport.toUpperCase(),
    division: '',
    colors: { primary: '#333333', secondary: '#666666' },
    logo: `/logos/${abbreviation.toLowerCase()}.svg`,
  };
}

function createPlayer(
  id: string,
  firstName: string,
  lastName: string,
  number: string,
  position: string,
  positionGroup: 'offense' | 'defense' | 'special',
  height: string,
  weight: string,
  age: number,
  birthDate: string,
  college: string,
  experience: string,
  team: Team,
  draftInfo?: { year: number; round: number; pick: number; team: string }
): Player {
  return {
    id,
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    slug: id,
    number,
    position,
    positionGroup,
    height,
    weight,
    age,
    birthDate,
    college,
    experience,
    draftInfo,
    status: 'active',
    headshot: `/players/${id}.jpg`,
    team,
  };
}

function createStandingsEntry(
  slug: string,
  name: string,
  abbreviation: string,
  wins: number,
  losses: number,
  ties: number,
  divisionRecord: string,
  gb: string,
  homeRecord: string,
  awayRecord: string,
  conferenceRecord: string,
  streak: string,
  pointsFor: number,
  pointsAgainst: number
): StandingsEntry {
  const pct = ((wins / (wins + losses + ties)) || 0).toFixed(3).replace('0.', '.');
  return {
    team: {
      id: slug,
      name,
      shortName: name.split(' ').pop() || name,
      abbreviation,
      slug,
      sport: 'nfl',
      league: 'NFL',
      division: 'NFC North',
      colors: { primary: '#333', secondary: '#666' },
      logo: `/logos/${slug}.svg`,
    },
    wins,
    losses,
    ties,
    pct,
    gb,
    homeRecord,
    awayRecord,
    divisionRecord,
    conferenceRecord,
    streak,
    pointsFor,
    pointsAgainst,
  };
}

// ============================================
// EXPORTED MOCK DATA FUNCTIONS
// ============================================

export function getMockSchedule(teamSlug: string, season?: string): Game[] {
  if (teamSlug === 'chicago-bears') {
    return bearsSchedule2025;
  }
  // Return empty for other teams for now
  return [];
}

export function getMockRoster(teamSlug: string): Player[] {
  if (teamSlug === 'chicago-bears') {
    return bearsRoster;
  }
  return [];
}

export function getMockTeamStats(teamSlug: string, season?: string): TeamStats {
  if (teamSlug === 'chicago-bears') {
    return bearsStats;
  }
  return { season: season || '2025', offense: {}, defense: {}, rankings: {} };
}

export function getMockStandings(teamSlug: string): StandingsEntry[] {
  const team = getTeamBySlug(teamSlug);
  if (!team) return [];

  if (team.sport === 'nfl' && team.division === 'NFC North') {
    return nfcNorthStandings;
  }

  return [];
}

export function getMockPlayer(playerId: string): Player | null {
  // Search through all rosters
  const player = bearsRoster.find(p => p.id === playerId || p.slug === playerId);
  return player || null;
}

export function getMockPlayerStats(playerId: string): PlayerStats[] {
  return playerStats[playerId] || [];
}

export function getMockPlayerGameLog(playerId: string, season?: string): PlayerGameLog[] {
  return playerGameLogs[playerId] || [];
}

export function getMockInjuryReport(teamSlug: string): InjuryReport[] {
  if (teamSlug === 'chicago-bears') {
    return bearsInjuries.filter(i => i.player);
  }
  return [];
}

// Export all players for search functionality
export function getAllMockPlayers(): Player[] {
  return [...bearsRoster];
}
