// Sports Mockery Brand Colors (per SPORTSMOCKERY-DESIGN-SPEC.md)
export const brand = {
  primary: '#bc0000', // SM Red per design spec
  primaryDark: '#8a0000', // Darker red for hover
  secondary: '#222222', // Near black
  white: '#ffffff',
  background: '#f5f5f5',
  text: '#222222',
  textMuted: '#666666',
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
