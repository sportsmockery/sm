/**
 * Simulation Engine - Constants & League Configuration
 */

export const LEAGUE_CONFIG: Record<string, {
  conferences: [string, string]
  divisions: Record<string, string[]>
  playoffTeams: number
  gamesPerSeason: number
  seriesLength: number
  playoffRounds: string[]
}> = {
  nfl: {
    conferences: ['AFC', 'NFC'],
    divisions: {
      'AFC North': ['BAL', 'CIN', 'CLE', 'PIT'],
      'AFC South': ['HOU', 'IND', 'JAX', 'TEN'],
      'AFC East': ['BUF', 'MIA', 'NE', 'NYJ'],
      'AFC West': ['KC', 'LV', 'LAC_NFL', 'DEN'],
      'NFC North': ['CHI', 'DET', 'GB', 'MIN'],
      'NFC South': ['ATL', 'CAR', 'NO', 'TB'],
      'NFC East': ['DAL', 'NYG', 'PHI', 'WAS'],
      'NFC West': ['ARI', 'LA', 'SF', 'SEA'],
    },
    playoffTeams: 7,
    gamesPerSeason: 17,
    seriesLength: 1,
    playoffRounds: ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'],
  },
  nba: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS', 'BKN', 'NYK', 'PHI', 'TOR'],
      'Central': ['CHI_NBA', 'CLE', 'DET_NBA', 'IND_NBA', 'MIL'],
      'Southeast': ['ATL_NBA', 'CHA', 'MIA', 'ORL', 'WAS_NBA'],
      'Northwest': ['DEN_NBA', 'MIN_NBA', 'OKC', 'POR', 'UTA'],
      'Pacific': ['GSW', 'LAC_NBA', 'LAL', 'PHX', 'SAC'],
      'Southwest': ['DAL_NBA', 'HOU_NBA', 'MEM', 'NOP', 'SAS'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Conference Semifinals', 'Conference Finals', 'NBA Finals'],
  },
  nhl: {
    conferences: ['Eastern', 'Western'],
    divisions: {
      'Atlantic': ['BOS_NHL', 'BUF_NHL', 'DET_NHL', 'FLA_NHL', 'MTL', 'OTT', 'TB_NHL', 'TOR_NHL'],
      'Metropolitan': ['CAR', 'CBJ', 'NJ', 'NYI', 'NYR', 'PHI_NHL', 'PIT_NHL', 'WAS_NHL'],
      'Central': ['CHI_NHL', 'COL', 'DAL_NHL', 'MIN_NHL', 'NSH', 'STL_NHL', 'UTA_NHL', 'WPG'],
      'Pacific': ['ANA', 'CGY', 'EDM', 'LA_NHL', 'SJ', 'SEA_NHL', 'VAN', 'VGK'],
    },
    playoffTeams: 8,
    gamesPerSeason: 82,
    seriesLength: 7,
    playoffRounds: ['First Round', 'Second Round', 'Conference Finals', 'Stanley Cup Finals'],
  },
  mlb: {
    conferences: ['American League', 'National League'],
    divisions: {
      'AL East': ['BAL_MLB', 'BOS_MLB', 'NYY', 'TB_MLB', 'TOR_MLB'],
      'AL Central': ['CHW', 'CLE_MLB', 'DET_MLB', 'KC_MLB', 'MIN_MLB'],
      'AL West': ['HOU_MLB', 'LAA', 'OAK', 'SEA_MLB', 'TEX'],
      'NL East': ['ATL_MLB', 'MIA_MLB', 'NYM', 'PHI_MLB', 'WAS_MLB'],
      'NL Central': ['CHC', 'CIN', 'MIL_MLB', 'PIT_MLB', 'STL_MLB'],
      'NL West': ['ARI_MLB', 'COL_MLB', 'LAD', 'SD', 'SF_MLB'],
    },
    playoffTeams: 6,
    gamesPerSeason: 162,
    seriesLength: 5,
    playoffRounds: ['Wild Card', 'Division Series', 'Championship Series', 'World Series'],
  },
}

// Team database using Map to avoid duplicate key issues across sports
// Key format: "sport:ABBREV" -> { teamName, abbrev (canonical for display), color }
const TEAM_DB = new Map<string, { teamName: string; abbrev: string; color: string }>()

// NFL Teams
const nflTeams: [string, string, string][] = [
  ['CHI', 'Chicago Bears', '#0B162A'], ['DET', 'Detroit Lions', '#0076B6'],
  ['GB', 'Green Bay Packers', '#203731'], ['MIN', 'Minnesota Vikings', '#4F2683'],
  ['KC', 'Kansas City Chiefs', '#E31837'], ['BUF', 'Buffalo Bills', '#00338D'],
  ['MIA', 'Miami Dolphins', '#008E97'], ['NE', 'New England Patriots', '#002244'],
  ['NYJ', 'New York Jets', '#125740'], ['BAL', 'Baltimore Ravens', '#241773'],
  ['CIN', 'Cincinnati Bengals', '#FB4F14'], ['CLE', 'Cleveland Browns', '#311D00'],
  ['PIT', 'Pittsburgh Steelers', '#FFB612'], ['HOU', 'Houston Texans', '#03202F'],
  ['IND', 'Indianapolis Colts', '#002C5F'], ['JAX', 'Jacksonville Jaguars', '#006778'],
  ['TEN', 'Tennessee Titans', '#4B92DB'], ['LAC_NFL', 'Los Angeles Chargers', '#0080C6'],
  ['LV', 'Las Vegas Raiders', '#A5ACAF'], ['DEN', 'Denver Broncos', '#FB4F14'],
  ['DAL', 'Dallas Cowboys', '#003594'], ['NYG', 'New York Giants', '#0B2265'],
  ['PHI', 'Philadelphia Eagles', '#004C54'], ['WAS', 'Washington Commanders', '#5A1414'],
  ['ATL', 'Atlanta Falcons', '#A71930'], ['CAR', 'Carolina Panthers', '#0085CA'],
  ['NO', 'New Orleans Saints', '#D3BC8D'], ['TB', 'Tampa Bay Buccaneers', '#D50A0A'],
  ['ARI', 'Arizona Cardinals', '#97233F'], ['LA', 'Los Angeles Rams', '#003594'],
  ['SF', 'San Francisco 49ers', '#AA0000'], ['SEA', 'Seattle Seahawks', '#002244'],
]
for (const [k, n, c] of nflTeams) TEAM_DB.set(`nfl:${k}`, { teamName: n, abbrev: k, color: c })

// NBA Teams
const nbaTeams: [string, string, string][] = [
  ['CHI_NBA', 'Chicago Bulls', '#CE1141'], ['CLE', 'Cleveland Cavaliers', '#6F263D'],
  ['DET_NBA', 'Detroit Pistons', '#C8102E'], ['IND_NBA', 'Indiana Pacers', '#002D62'],
  ['MIL', 'Milwaukee Bucks', '#00471B'], ['BOS', 'Boston Celtics', '#007A33'],
  ['BKN', 'Brooklyn Nets', '#000000'], ['NYK', 'New York Knicks', '#006BB6'],
  ['PHI', 'Philadelphia 76ers', '#006BB6'], ['TOR', 'Toronto Raptors', '#CE1141'],
  ['ATL_NBA', 'Atlanta Hawks', '#E03A3E'], ['CHA', 'Charlotte Hornets', '#1D1160'],
  ['MIA', 'Miami Heat', '#98002E'], ['ORL', 'Orlando Magic', '#0077C0'],
  ['WAS_NBA', 'Washington Wizards', '#002B5C'], ['DEN_NBA', 'Denver Nuggets', '#0E2240'],
  ['MIN_NBA', 'Minnesota Timberwolves', '#0C2340'], ['OKC', 'Oklahoma City Thunder', '#007AC1'],
  ['POR', 'Portland Trail Blazers', '#E03A3E'], ['UTA', 'Utah Jazz', '#002B5C'],
  ['GSW', 'Golden State Warriors', '#1D428A'], ['LAC_NBA', 'LA Clippers', '#C8102E'],
  ['LAL', 'Los Angeles Lakers', '#552583'], ['PHX', 'Phoenix Suns', '#1D1160'],
  ['SAC', 'Sacramento Kings', '#5A2D81'], ['DAL_NBA', 'Dallas Mavericks', '#00538C'],
  ['HOU_NBA', 'Houston Rockets', '#CE1141'], ['MEM', 'Memphis Grizzlies', '#5D76A9'],
  ['NOP', 'New Orleans Pelicans', '#0C2340'], ['SAS', 'San Antonio Spurs', '#C4CED4'],
]
for (const [k, n, c] of nbaTeams) TEAM_DB.set(`nba:${k}`, { teamName: n, abbrev: k, color: c })

// NHL Teams
const nhlTeams: [string, string, string][] = [
  ['CHI_NHL', 'Chicago Blackhawks', '#CF0A2C'], ['COL', 'Colorado Avalanche', '#6F263D'],
  ['DAL_NHL', 'Dallas Stars', '#006847'], ['MIN_NHL', 'Minnesota Wild', '#154734'],
  ['NSH', 'Nashville Predators', '#FFB81C'], ['STL_NHL', 'St. Louis Blues', '#002F87'],
  ['UTA_NHL', 'Utah Hockey Club', '#69B3E7'], ['WPG', 'Winnipeg Jets', '#041E42'],
  ['BOS_NHL', 'Boston Bruins', '#FFB81C'], ['BUF_NHL', 'Buffalo Sabres', '#002654'],
  ['DET_NHL', 'Detroit Red Wings', '#CE1126'], ['FLA_NHL', 'Florida Panthers', '#041E42'],
  ['MTL', 'Montreal Canadiens', '#AF1E2D'], ['OTT', 'Ottawa Senators', '#C52032'],
  ['TB_NHL', 'Tampa Bay Lightning', '#002868'], ['TOR_NHL', 'Toronto Maple Leafs', '#003E7E'],
  ['CAR', 'Carolina Hurricanes', '#CC0000'], ['CBJ', 'Columbus Blue Jackets', '#002654'],
  ['NJ', 'New Jersey Devils', '#CE1126'], ['NYI', 'New York Islanders', '#00539B'],
  ['NYR', 'New York Rangers', '#0038A8'], ['PHI_NHL', 'Philadelphia Flyers', '#F74902'],
  ['PIT_NHL', 'Pittsburgh Penguins', '#FCB514'], ['WAS_NHL', 'Washington Capitals', '#041E42'],
  ['ANA', 'Anaheim Ducks', '#F47A38'], ['CGY', 'Calgary Flames', '#D2001C'],
  ['EDM', 'Edmonton Oilers', '#041E42'], ['LA_NHL', 'Los Angeles Kings', '#111111'],
  ['SJ', 'San Jose Sharks', '#006D75'], ['SEA_NHL', 'Seattle Kraken', '#99D9D9'],
  ['VAN', 'Vancouver Canucks', '#00205B'], ['VGK', 'Vegas Golden Knights', '#B4975A'],
]
for (const [k, n, c] of nhlTeams) TEAM_DB.set(`nhl:${k}`, { teamName: n, abbrev: k, color: c })

// MLB Teams
const mlbTeams: [string, string, string][] = [
  ['CHC', 'Chicago Cubs', '#0E3386'], ['CHW', 'Chicago White Sox', '#27251F'],
  ['CIN', 'Cincinnati Reds', '#C6011F'], ['MIL_MLB', 'Milwaukee Brewers', '#12284B'],
  ['PIT_MLB', 'Pittsburgh Pirates', '#27251F'], ['STL_MLB', 'St. Louis Cardinals', '#C41E3A'],
  ['BAL_MLB', 'Baltimore Orioles', '#DF4601'], ['BOS_MLB', 'Boston Red Sox', '#BD3039'],
  ['NYY', 'New York Yankees', '#003087'], ['TB_MLB', 'Tampa Bay Rays', '#092C5C'],
  ['TOR_MLB', 'Toronto Blue Jays', '#134A8E'], ['CLE_MLB', 'Cleveland Guardians', '#00385D'],
  ['DET_MLB', 'Detroit Tigers', '#0C2340'], ['KC_MLB', 'Kansas City Royals', '#004687'],
  ['MIN_MLB', 'Minnesota Twins', '#002B5C'], ['HOU_MLB', 'Houston Astros', '#002D62'],
  ['LAA', 'Los Angeles Angels', '#BA0021'], ['OAK', 'Oakland Athletics', '#003831'],
  ['SEA_MLB', 'Seattle Mariners', '#0C2C56'], ['TEX', 'Texas Rangers', '#003278'],
  ['ATL_MLB', 'Atlanta Braves', '#CE1141'], ['MIA_MLB', 'Miami Marlins', '#00A3E0'],
  ['NYM', 'New York Mets', '#002D72'], ['PHI_MLB', 'Philadelphia Phillies', '#E81828'],
  ['WAS_MLB', 'Washington Nationals', '#AB0003'], ['ARI_MLB', 'Arizona Diamondbacks', '#A71930'],
  ['COL_MLB', 'Colorado Rockies', '#33006F'], ['LAD', 'Los Angeles Dodgers', '#005A9C'],
  ['SD', 'San Diego Padres', '#2F241D'], ['SF_MLB', 'San Francisco Giants', '#FD5A1E'],
]
for (const [k, n, c] of mlbTeams) TEAM_DB.set(`mlb:${k}`, { teamName: n, abbrev: k, color: c })

// Keys match the short form used by the UI ('bears', 'bulls', etc.)
export const CHICAGO_TEAMS: Record<string, { abbrev: string; sport: string }> = {
  'bears': { abbrev: 'CHI', sport: 'nfl' },
  'bulls': { abbrev: 'CHI_NBA', sport: 'nba' },
  'blackhawks': { abbrev: 'CHI_NHL', sport: 'nhl' },
  'cubs': { abbrev: 'CHC', sport: 'mlb' },
  'whitesox': { abbrev: 'CHW', sport: 'mlb' },
}

export function getTeamInfo(abbrev: string, sport: string): { teamKey: string; teamName: string; abbreviation: string; logoUrl: string; primaryColor: string } {
  const entry = TEAM_DB.get(`${sport}:${abbrev}`)
  const displayAbbrev = abbrev.replace(/_(?:NFL|NBA|NHL|MLB)$/, '')
  if (entry) {
    return {
      teamKey: displayAbbrev.toLowerCase(),
      teamName: entry.teamName,
      abbreviation: displayAbbrev,
      logoUrl: `https://a.espncdn.com/i/teamlogos/${sport}/500/${displayAbbrev.toLowerCase()}.png`,
      primaryColor: entry.color,
    }
  }
  return {
    teamKey: displayAbbrev.toLowerCase(),
    teamName: displayAbbrev,
    abbreviation: displayAbbrev,
    logoUrl: `https://a.espncdn.com/i/teamlogos/${sport}/500/${displayAbbrev.toLowerCase()}.png`,
    primaryColor: '#666666',
  }
}

export const SCORE_RANGES: Record<string, { avgTeam: number; variance: number; minScore: number; maxScore: number }> = {
  nfl: { avgTeam: 22, variance: 8, minScore: 3, maxScore: 45 },
  nba: { avgTeam: 110, variance: 12, minScore: 80, maxScore: 140 },
  nhl: { avgTeam: 3, variance: 1.5, minScore: 0, maxScore: 8 },
  mlb: { avgTeam: 4.5, variance: 2.5, minScore: 0, maxScore: 15 },
}

export const HOME_ADVANTAGE: Record<string, number> = {
  nfl: 3.0, nba: 3.5, nhl: 2.5, mlb: 2.0,
}

// Approximate win percentages for all teams (realistic 2025-26 estimates)
const WIN_PCT_DB = new Map<string, number>()
// NFL
const nflWinPcts: [string, number][] = [
  ['CHI', 0.647], ['DET', 0.706], ['GB', 0.647], ['MIN', 0.588],
  ['KC', 0.765], ['BUF', 0.706], ['BAL', 0.706], ['PHI', 0.647],
  ['SF', 0.588], ['DAL', 0.471], ['MIA', 0.529], ['CIN', 0.588],
  ['HOU', 0.588], ['PIT', 0.588], ['CLE', 0.353], ['LAC_NFL', 0.588],
  ['DEN', 0.588], ['LV', 0.471], ['NYJ', 0.353], ['NE', 0.294],
  ['IND', 0.471], ['JAX', 0.353], ['TEN', 0.353], ['ATL', 0.529],
  ['TB', 0.588], ['NO', 0.471], ['CAR', 0.294], ['WAS', 0.647],
  ['NYG', 0.235], ['ARI', 0.471], ['LA', 0.588], ['SEA', 0.588],
]
for (const [k, v] of nflWinPcts) WIN_PCT_DB.set(`nfl:${k}`, v)

// NBA
const nbaWinPcts: [string, number][] = [
  ['CHI_NBA', 0.450], ['CLE', 0.700], ['DET_NBA', 0.300], ['IND_NBA', 0.550],
  ['MIL', 0.600], ['BOS', 0.720], ['BKN', 0.350], ['NYK', 0.650],
  ['PHI', 0.550], ['TOR', 0.350], ['ATL_NBA', 0.500], ['CHA', 0.300],
  ['MIA', 0.550], ['ORL', 0.500], ['WAS_NBA', 0.250], ['DEN_NBA', 0.600],
  ['MIN_NBA', 0.600], ['OKC', 0.720], ['POR', 0.350], ['UTA', 0.400],
  ['GSW', 0.550], ['LAC_NBA', 0.500], ['LAL', 0.550], ['PHX', 0.550],
  ['SAC', 0.500], ['DAL_NBA', 0.550], ['HOU_NBA', 0.600], ['MEM', 0.580],
  ['NOP', 0.350], ['SAS', 0.350],
]
for (const [k, v] of nbaWinPcts) WIN_PCT_DB.set(`nba:${k}`, v)

// NHL
const nhlWinPcts: [string, number][] = [
  ['CHI_NHL', 0.400], ['COL', 0.600], ['DAL_NHL', 0.600], ['MIN_NHL', 0.600],
  ['NSH', 0.500], ['STL_NHL', 0.500], ['UTA_NHL', 0.450], ['WPG', 0.650],
  ['BOS_NHL', 0.550], ['BUF_NHL', 0.450], ['DET_NHL', 0.500], ['FLA_NHL', 0.650],
  ['MTL', 0.450], ['OTT', 0.500], ['TB_NHL', 0.550], ['TOR_NHL', 0.600],
  ['CAR', 0.600], ['CBJ', 0.400], ['NJ', 0.550], ['NYI', 0.450],
  ['NYR', 0.550], ['PHI_NHL', 0.450], ['PIT_NHL', 0.500], ['WAS_NHL', 0.600],
  ['ANA', 0.400], ['CGY', 0.450], ['EDM', 0.650], ['LA_NHL', 0.550],
  ['SJ', 0.350], ['SEA_NHL', 0.500], ['VAN', 0.550], ['VGK', 0.600],
]
for (const [k, v] of nhlWinPcts) WIN_PCT_DB.set(`nhl:${k}`, v)

// MLB
const mlbWinPcts: [string, number][] = [
  ['CHC', 0.568], ['CHW', 0.370], ['CIN', 0.500], ['MIL_MLB', 0.580],
  ['PIT_MLB', 0.480], ['STL_MLB', 0.500], ['BAL_MLB', 0.560], ['BOS_MLB', 0.530],
  ['NYY', 0.580], ['TB_MLB', 0.530], ['TOR_MLB', 0.480], ['CLE_MLB', 0.560],
  ['DET_MLB', 0.530], ['KC_MLB', 0.530], ['MIN_MLB', 0.520], ['HOU_MLB', 0.550],
  ['LAA', 0.470], ['OAK', 0.400], ['SEA_MLB', 0.530], ['TEX', 0.500],
  ['ATL_MLB', 0.560], ['MIA_MLB', 0.450], ['NYM', 0.560], ['PHI_MLB', 0.580],
  ['WAS_MLB', 0.450], ['ARI_MLB', 0.560], ['COL_MLB', 0.400], ['LAD', 0.620],
  ['SD', 0.560], ['SF_MLB', 0.500],
]
for (const [k, v] of mlbWinPcts) WIN_PCT_DB.set(`mlb:${k}`, v)

export function getApproxWinPct(abbrev: string, sport: string): number {
  return WIN_PCT_DB.get(`${sport}:${abbrev}`) ?? 0.500
}
