// Sports Mockery Brand Colors
export const brand = {
  primary: '#8B0000', // Dark red
  secondary: '#1a1a1a', // Near black
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#1a1a1a',
  textMuted: '#6b7280',
}

// Team Colors
export const teamColors = {
  'chicago-bears': {
    primary: '#C83200', // Orange
    secondary: '#0B162A', // Navy
    name: 'Bears',
  },
  'chicago-bulls': {
    primary: '#CE1141', // Red
    secondary: '#000000', // Black
    name: 'Bulls',
  },
  'chicago-cubs': {
    primary: '#0E3386', // Blue
    secondary: '#CC3433', // Red
    name: 'Cubs',
  },
  'chicago-white-sox': {
    primary: '#27251F', // Black
    secondary: '#C4CED4', // Silver
    name: 'White Sox',
  },
  'chicago-blackhawks': {
    primary: '#CF0A2C', // Red
    secondary: '#000000', // Black
    name: 'Blackhawks',
  },
} as const

export type TeamSlug = keyof typeof teamColors

export function getTeamColor(slug: string): { primary: string; secondary: string; name: string } | null {
  return teamColors[slug as TeamSlug] || null
}

// Category to team mapping
export const categoryTeamMap: Record<string, TeamSlug> = {
  'chicago-bears': 'chicago-bears',
  'bears': 'chicago-bears',
  'chicago-bulls': 'chicago-bulls',
  'bulls': 'chicago-bulls',
  'chicago-cubs': 'chicago-cubs',
  'cubs': 'chicago-cubs',
  'chicago-white-sox': 'chicago-white-sox',
  'white-sox': 'chicago-white-sox',
  'chicago-blackhawks': 'chicago-blackhawks',
  'blackhawks': 'chicago-blackhawks',
}
