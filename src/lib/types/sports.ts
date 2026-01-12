// Team types
export interface Team {
  id: string;
  name: string;
  shortName: string;      // "Bears", "Cubs"
  abbreviation: string;   // "CHI", "CHC"
  slug: string;           // "chicago-bears"
  sport: 'nfl' | 'mlb' | 'nba' | 'nhl';
  league: string;
  division: string;
  colors: { primary: string; secondary: string };
  logo: string;
  record?: { wins: number; losses: number; ties?: number; pct: string };
  standing?: { division: number; conference: number };
}

// Player types
export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  slug: string;
  number: string;
  position: string;
  positionGroup: 'offense' | 'defense' | 'special';
  height: string;
  weight: string;
  age: number;
  birthDate: string;
  birthPlace?: string;
  college: string;
  experience: string;
  draftInfo?: {
    year: number;
    round: number;
    pick: number;
    team: string;
  };
  status: 'active' | 'injured' | 'ir' | 'pup' | 'suspended';
  injuryStatus?: 'out' | 'doubtful' | 'questionable' | 'probable';
  injuryDescription?: string;
  headshot: string;
  team: Team;
}

// Game/Schedule types
export interface Game {
  id: string;
  date: string;
  time: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'final' | 'postponed' | 'delayed';
  venue: string;
  broadcast?: string;
  week?: number;        // NFL
  gameNumber?: number;  // MLB
  isHome: boolean;      // relative to the team being viewed
  result?: 'W' | 'L' | 'T';
  recapUrl?: string;
}

// Stats types
export interface TeamStats {
  season: string;
  offense: Record<string, number | string>;
  defense: Record<string, number | string>;
  rankings: Record<string, number>;
}

export interface PlayerStats {
  season: string;
  team: string;
  games: number;
  gamesStarted?: number;
  stats: Record<string, number | string>;
}

export interface PlayerGameLog {
  gameId: string;
  date: string;
  opponent: Team;
  isHome: boolean;
  result: 'W' | 'L' | 'T';
  score: string;
  stats: Record<string, number | string>;
}

// Standings
export interface StandingsEntry {
  team: Team;
  wins: number;
  losses: number;
  ties?: number;
  otLosses?: number;     // NHL overtime losses
  pct: string;
  gb: string;
  streak: string;
  last10?: string;
  homeRecord: string;
  awayRecord: string;
  divisionRecord: string;
  conferenceRecord?: string;
  pointsFor?: number;
  pointsAgainst?: number;
  runDifferential?: number;  // MLB
}

// Injury Report
export interface InjuryReport {
  player: Player;
  injury: string;
  status: 'out' | 'doubtful' | 'questionable' | 'probable';
  updated: string;
}

// Sport-specific stat categories
export type NFLPassingStats = {
  completions: number;
  attempts: number;
  yards: number;
  touchdowns: number;
  interceptions: number;
  rating: number;
  qbr?: number;
};

export type NFLRushingStats = {
  attempts: number;
  yards: number;
  average: number;
  touchdowns: number;
  fumbles: number;
};

export type NFLReceivingStats = {
  receptions: number;
  targets: number;
  yards: number;
  average: number;
  touchdowns: number;
};

export type NFLDefenseStats = {
  tackles: number;
  sacks: number;
  interceptions: number;
  forcedFumbles: number;
  passesDefensed: number;
};

export type MLBBattingStats = {
  avg: string;
  games: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  stolenBases: number;
  obp: string;
  slg: string;
  ops: string;
};

export type MLBPitchingStats = {
  wins: number;
  losses: number;
  era: string;
  games: number;
  gamesStarted: number;
  saves: number;
  inningsPitched: string;
  hits: number;
  runs: number;
  earnedRuns: number;
  homeRuns: number;
  walks: number;
  strikeouts: number;
  whip: string;
};

export type NBAStats = {
  games: number;
  gamesStarted: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgPct: string;
  threePct: string;
  ftPct: string;
};

export type NHLStats = {
  games: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shots: number;
  shotPct: string;
  gameWinningGoals: number;
};

export type NHLGoalieStats = {
  games: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  savePercentage: string;
  goalsAgainstAverage: string;
  shutouts: number;
};
