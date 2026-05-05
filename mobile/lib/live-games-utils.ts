// Mirror of src/lib/live-games-utils.ts on web — keeps mobile play-by-play
// classification consistent with the live page.

export type PlayType = 'scoring' | 'turnover' | 'penalty' | 'period_end' | 'normal'

export function classifyPlay(playType: string | undefined | null, description: string | undefined | null): PlayType {
  const type = (playType || '').toLowerCase()
  const desc = (description || '').toLowerCase()

  if (
    type.includes('score') || type.includes('touchdown') || type.includes('field_goal') ||
    type.includes('goal') || type.includes('basket') || type.includes('free_throw') ||
    type.includes('home_run') || type.includes('run_scored') ||
    desc.includes('scores') || desc.includes('touchdown') || desc.includes('field goal') ||
    desc.includes('makes') || desc.includes('home run')
  ) {
    return 'scoring'
  }

  if (
    type.includes('turnover') || type.includes('interception') || type.includes('fumble') ||
    type.includes('steal') || type.includes('error') ||
    desc.includes('turnover') || desc.includes('intercepted') || desc.includes('fumble') ||
    desc.includes('steals')
  ) {
    return 'turnover'
  }

  if (
    type.includes('penalty') || type.includes('foul') ||
    desc.includes('penalty') || desc.includes('foul')
  ) {
    return 'penalty'
  }

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
    case 'scoring': return '#BC0000'
    case 'turnover': return '#D97706'
    case 'penalty': return '#EAB308'
    case 'period_end': return '#9CA3AF'
    default: return 'transparent'
  }
}
