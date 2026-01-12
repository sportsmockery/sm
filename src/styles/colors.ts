// Sports Mockery Brand Palette
export const brand = {
  primary: '#FF0000',
  secondary: '#000000',
  white: '#FFFFFF',
  darkRed: '#8B0000',
  accent: '#FF0000',
}

// Team Color Palettes
export const teams = {
  bears: {
    primary: '#0B162A', // Navy
    secondary: '#C83200', // Orange
    accent: '#C83200',
    gradient: 'linear-gradient(135deg, #0B162A 0%, #C83200 100%)',
    gradientHover: 'linear-gradient(135deg, #0d1c35 0%, #e03800 100%)',
  },
  bulls: {
    primary: '#CE1141', // Red
    secondary: '#000000', // Black
    accent: '#CE1141',
    gradient: 'linear-gradient(135deg, #CE1141 0%, #000000 100%)',
    gradientHover: 'linear-gradient(135deg, #e01548 0%, #1a1a1a 100%)',
  },
  cubs: {
    primary: '#0E3386', // Blue
    secondary: '#CC3433', // Red
    accent: '#0E3386',
    gradient: 'linear-gradient(135deg, #0E3386 0%, #CC3433 100%)',
    gradientHover: 'linear-gradient(135deg, #103d9e 0%, #e03a39 100%)',
  },
  whiteSox: {
    primary: '#27251F', // Black
    secondary: '#C4CED4', // Silver
    accent: '#C4CED4',
    gradient: 'linear-gradient(135deg, #27251F 0%, #4a4a4a 100%)',
    gradientHover: 'linear-gradient(135deg, #333129 0%, #5a5a5a 100%)',
  },
  blackhawks: {
    primary: '#CF0A2C', // Red
    secondary: '#000000', // Black
    accent: '#CF0A2C',
    gradient: 'linear-gradient(135deg, #CF0A2C 0%, #000000 100%)',
    gradientHover: 'linear-gradient(135deg, #e80c31 0%, #1a1a1a 100%)',
  },
} as const

// Team slug mapping
export const teamBySlug: Record<string, keyof typeof teams> = {
  'chicago-bears': 'bears',
  'bears': 'bears',
  'chicago-bulls': 'bulls',
  'bulls': 'bulls',
  'chicago-cubs': 'cubs',
  'cubs': 'cubs',
  'chicago-white-sox': 'whiteSox',
  'white-sox': 'whiteSox',
  'chicago-blackhawks': 'blackhawks',
  'blackhawks': 'blackhawks',
}

export function getTeamColors(slug: string) {
  const teamKey = teamBySlug[slug]
  return teamKey ? teams[teamKey] : null
}

// UI Colors with Light/Dark variants
export const ui = {
  background: {
    light: '#FFFFFF',
    dark: '#0a0a0a',
    muted: '#f5f5f5',
    mutedDark: '#1a1a1a',
  },
  text: {
    primary: '#171717',
    primaryDark: '#FAFAFA',
    secondary: '#6b7280',
    secondaryDark: '#a1a1aa',
    muted: '#9ca3af',
    mutedDark: '#71717a',
    inverse: '#FFFFFF',
    inverseDark: '#000000',
  },
  border: {
    light: '#e5e7eb',
    dark: '#27272a',
    hover: '#d1d5db',
    hoverDark: '#3f3f46',
  },
  accent: {
    light: '#8B0000', // Dark red for light mode
    dark: '#FF6666', // Lighter red for dark mode
    hover: '#a00000',
    hoverDark: '#FF8888',
  },
  card: {
    light: '#FFFFFF',
    dark: '#18181b',
    elevated: '#FFFFFF',
    elevatedDark: '#27272a',
  },
  input: {
    bg: '#FFFFFF',
    bgDark: '#27272a',
    border: '#d1d5db',
    borderDark: '#3f3f46',
    focus: '#8B0000',
    focusDark: '#FF6666',
  },
}

// Dark mode semantic tokens (for CSS variables)
export const darkModeTokens = {
  '--color-bg': ui.background.dark,
  '--color-bg-muted': ui.background.mutedDark,
  '--color-text': ui.text.primaryDark,
  '--color-text-secondary': ui.text.secondaryDark,
  '--color-text-muted': ui.text.mutedDark,
  '--color-border': ui.border.dark,
  '--color-accent': ui.accent.dark,
  '--color-card': ui.card.dark,
}

// Light mode semantic tokens (for CSS variables)
export const lightModeTokens = {
  '--color-bg': ui.background.light,
  '--color-bg-muted': ui.background.muted,
  '--color-text': ui.text.primary,
  '--color-text-secondary': ui.text.secondary,
  '--color-text-muted': ui.text.muted,
  '--color-border': ui.border.light,
  '--color-accent': ui.accent.light,
  '--color-card': ui.card.light,
}

// Gradient presets
export const gradients = {
  brand: 'linear-gradient(135deg, #FF0000 0%, #8B0000 100%)',
  dark: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
  overlay: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
  hero: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
}

// Animation keyframes (for use with Tailwind or CSS)
export const animations = {
  fadeIn: 'fadeIn 0.5s ease-out forwards',
  slideUp: 'slideUp 0.6s ease-out forwards',
  scaleIn: 'scaleIn 0.4s ease-out forwards',
}
