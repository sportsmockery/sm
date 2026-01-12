import { Team } from './types/sports';

export const CHICAGO_TEAMS: Record<string, Team> = {
  'chicago-bears': {
    id: 'chi-bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    abbreviation: 'CHI',
    slug: 'chicago-bears',
    sport: 'nfl',
    league: 'NFL',
    division: 'NFC North',
    colors: { primary: '#0B162A', secondary: '#C83200' },
    logo: '/logos/bears.svg',
  },
  'chicago-bulls': {
    id: 'chi-bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    abbreviation: 'CHI',
    slug: 'chicago-bulls',
    sport: 'nba',
    league: 'NBA',
    division: 'Central',
    colors: { primary: '#CE1141', secondary: '#000000' },
    logo: '/logos/bulls.svg',
  },
  'chicago-cubs': {
    id: 'chi-cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    abbreviation: 'CHC',
    slug: 'chicago-cubs',
    sport: 'mlb',
    league: 'MLB',
    division: 'NL Central',
    colors: { primary: '#0E3386', secondary: '#CC3433' },
    logo: '/logos/cubs.svg',
  },
  'chicago-white-sox': {
    id: 'chi-sox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    abbreviation: 'CWS',
    slug: 'chicago-white-sox',
    sport: 'mlb',
    league: 'MLB',
    division: 'AL Central',
    colors: { primary: '#27251F', secondary: '#C4CED4' },
    logo: '/logos/whitesox.svg',
  },
  'chicago-blackhawks': {
    id: 'chi-hawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    abbreviation: 'CHI',
    slug: 'chicago-blackhawks',
    sport: 'nhl',
    league: 'NHL',
    division: 'Central',
    colors: { primary: '#CF0A2C', secondary: '#000000' },
    logo: '/logos/blackhawks.svg',
  },
};

// ESPN team IDs for API calls
export const ESPN_TEAM_IDS: Record<string, string> = {
  'chicago-bears': '3',
  'chicago-bulls': '4',
  'chicago-cubs': '16',
  'chicago-white-sox': '4',
  'chicago-blackhawks': '4',
};

// Sport abbreviations for ESPN API paths
export const SPORT_PATHS: Record<string, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
};

export function getTeamBySlug(slug: string): Team | undefined {
  return CHICAGO_TEAMS[slug];
}

export function getTeamsBySport(sport: Team['sport']): Team[] {
  return Object.values(CHICAGO_TEAMS).filter(t => t.sport === sport);
}

export function getAllTeams(): Team[] {
  return Object.values(CHICAGO_TEAMS);
}

export function getTeamSlugs(): string[] {
  return Object.keys(CHICAGO_TEAMS);
}

export function isValidTeamSlug(slug: string): boolean {
  return slug in CHICAGO_TEAMS;
}

// Position groups by sport
export const POSITION_GROUPS = {
  nfl: {
    offense: ['QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'C'],
    defense: ['DE', 'DT', 'NT', 'OLB', 'ILB', 'MLB', 'CB', 'S', 'FS', 'SS'],
    special: ['K', 'P', 'LS'],
  },
  nba: {
    offense: ['PG', 'SG', 'SF', 'PF', 'C'],
    defense: [],
    special: [],
  },
  mlb: {
    offense: ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'],
    defense: ['SP', 'RP', 'CL'],
    special: [],
  },
  nhl: {
    offense: ['C', 'LW', 'RW'],
    defense: ['D'],
    special: ['G'],
  },
};

// Stat categories by sport
export const STAT_CATEGORIES = {
  nfl: {
    passing: ['CMP', 'ATT', 'YDS', 'TD', 'INT', 'RTG'],
    rushing: ['ATT', 'YDS', 'AVG', 'TD', 'FUM'],
    receiving: ['REC', 'TGT', 'YDS', 'AVG', 'TD'],
    defense: ['TCKL', 'SACK', 'INT', 'FF', 'PD'],
  },
  nba: {
    main: ['PTS', 'REB', 'AST', 'STL', 'BLK', 'TO', 'FG%', '3P%', 'FT%'],
  },
  mlb: {
    batting: ['AVG', 'G', 'AB', 'R', 'H', '2B', '3B', 'HR', 'RBI', 'SB', 'OBP', 'SLG', 'OPS'],
    pitching: ['W', 'L', 'ERA', 'G', 'GS', 'SV', 'IP', 'H', 'R', 'ER', 'HR', 'BB', 'SO', 'WHIP'],
  },
  nhl: {
    skater: ['GP', 'G', 'A', 'PTS', '+/-', 'PIM', 'PPG', 'PPP', 'SOG', 'S%', 'GWG'],
    goalie: ['GP', 'GS', 'W', 'L', 'OTL', 'SV%', 'GAA', 'SO'],
  },
};
