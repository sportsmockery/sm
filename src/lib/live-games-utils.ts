// Play classification and formatting utilities for live games

export type PlayType = 'scoring' | 'turnover' | 'penalty' | 'period_end' | 'normal'

export function classifyPlay(playType: string, description: string): PlayType {
  const type = playType.toLowerCase()
  const desc = description.toLowerCase()

  // Scoring plays
  if (
    type.includes('score') || type.includes('touchdown') || type.includes('field_goal') ||
    type.includes('goal') || type.includes('basket') || type.includes('free_throw') ||
    type.includes('home_run') || type.includes('run_scored') ||
    desc.includes('scores') || desc.includes('touchdown') || desc.includes('field goal') ||
    desc.includes('makes') || desc.includes('home run')
  ) {
    return 'scoring'
  }

  // Turnovers
  if (
    type.includes('turnover') || type.includes('interception') || type.includes('fumble') ||
    type.includes('steal') || type.includes('error') ||
    desc.includes('turnover') || desc.includes('intercepted') || desc.includes('fumble') ||
    desc.includes('steals')
  ) {
    return 'turnover'
  }

  // Penalties
  if (
    type.includes('penalty') || type.includes('foul') ||
    desc.includes('penalty') || desc.includes('foul')
  ) {
    return 'penalty'
  }

  // Period end
  if (
    type.includes('period_end') || type.includes('quarter_end') || type.includes('half') ||
    type.includes('inning_end') ||
    desc.includes('end of') || desc.includes('halftime')
  ) {
    return 'period_end'
  }

  return 'normal'
}

export function getPlayBorderColor(playType: PlayType): string {
  switch (playType) {
    case 'scoring': return '#bc0000'
    case 'turnover': return '#d97706' // amber
    case 'penalty': return '#eab308' // yellow
    case 'period_end': return '#9ca3af' // gray
    default: return 'transparent'
  }
}

export function formatPeriodLabel(sport: string, period: number): string {
  switch (sport) {
    case 'nfl':
    case 'nba':
      if (period <= 4) return `Q${period}`
      return `OT${period > 5 ? period - 4 : ''}`
    case 'nhl':
      if (period <= 3) return `P${period}`
      if (period === 4) return 'OT'
      return 'SO'
    case 'mlb':
      return `${period}`
    default:
      return `${period}`
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTopPerformers(
  players: Array<any>,
  sport: string,
  limit: number = 3
): Array<{ name: string; stat: string; isHome: boolean }> {
  const sorted = [...players]

  switch (sport) {
    case 'nba':
      sorted.sort((a, b) => ((b.nba_points as number) || 0) - ((a.nba_points as number) || 0))
      return sorted.slice(0, limit).map(p => ({
        name: p.full_name,
        stat: `${p.nba_points || 0} PTS, ${p.nba_reb_total || 0} REB, ${p.nba_assists || 0} AST`,
        isHome: p.is_home_team,
      }))
    case 'nfl':
      sorted.sort((a, b) => {
        const aVal = ((a.nfl_passing_yards as number) || 0) + ((a.nfl_rushing_yards as number) || 0) + ((a.nfl_receiving_yards as number) || 0)
        const bVal = ((b.nfl_passing_yards as number) || 0) + ((b.nfl_rushing_yards as number) || 0) + ((b.nfl_receiving_yards as number) || 0)
        return bVal - aVal
      })
      return sorted.slice(0, limit).map(p => {
        if ((p.nfl_pass_attempts as number) > 0) return { name: p.full_name, stat: `${p.nfl_pass_completions}/${p.nfl_pass_attempts}, ${p.nfl_passing_yards} YDS, ${p.nfl_passing_tds} TD`, isHome: p.is_home_team }
        if ((p.nfl_rushing_yards as number) > 0) return { name: p.full_name, stat: `${p.nfl_rushing_yards} RUSH YDS, ${p.nfl_rushing_tds} TD`, isHome: p.is_home_team }
        return { name: p.full_name, stat: `${p.nfl_receiving_yards || 0} REC YDS`, isHome: p.is_home_team }
      })
    case 'nhl':
      sorted.sort((a, b) => ((b.nhl_points as number) || 0) - ((a.nhl_points as number) || 0))
      return sorted.slice(0, limit).map(p => ({
        name: p.full_name,
        stat: `${p.nhl_goals || 0}G ${p.nhl_assists || 0}A ${p.nhl_points || 0}PTS`,
        isHome: p.is_home_team,
      }))
    case 'mlb':
      sorted.sort((a, b) => ((b.mlb_hits as number) || 0) + ((b.mlb_rbi as number) || 0) - ((a.mlb_hits as number) || 0) - ((a.mlb_rbi as number) || 0))
      return sorted.slice(0, limit).map(p => ({
        name: p.full_name,
        stat: p.mlb_ip ? `${p.mlb_ip} IP, ${p.mlb_k} K, ${p.mlb_er} ER` : `${p.mlb_hits || 0}-${p.mlb_ab || 0}, ${p.mlb_rbi || 0} RBI`,
        isHome: p.is_home_team,
      }))
    default:
      return []
  }
}
