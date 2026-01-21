/**
 * Sports Mockery Mobile App Configuration
 *
 * All data is fetched from the website APIs - the app is a thin client.
 * When content is updated on the website, the app syncs automatically.
 */

// API Base URL - points to the dev site
// In production, this would be https://sportsmockery.com
export const API_BASE_URL = 'https://test.sportsmockery.com'

// Supabase configuration (same as web)
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

// OneSignal App ID
export const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || ''

// Cache durations (milliseconds)
export const CACHE_DURATIONS = {
  feed: 5 * 60 * 1000,           // 5 minutes - news feed
  article: 30 * 60 * 1000,       // 30 minutes - individual articles
  teamData: 15 * 60 * 1000,      // 15 minutes - team rosters, schedules
  mobileConfig: 60 * 60 * 1000,  // 1 hour - ad config, feature flags
  userProfile: 10 * 60 * 1000,   // 10 minutes - user data
}

// Auto-refresh intervals
export const REFRESH_INTERVALS = {
  feed: 5 * 60 * 1000,           // Auto-refresh feed every 5 minutes
  chat: 0,                       // Real-time via Supabase
  liveGame: 30 * 1000,           // During live games, refresh every 30 seconds
}

// Stale time for React Query (show cached data while fetching fresh)
export const STALE_TIMES = {
  feed: 2 * 60 * 1000,           // Consider feed stale after 2 minutes
  article: 10 * 60 * 1000,       // Articles stay fresh longer
  teamData: 5 * 60 * 1000,
}

// Team configuration (matches website)
export const TEAMS = {
  bears: {
    id: 'bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    color: '#0B162A',
    secondaryColor: '#C83803',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    sport: 'football',
    aiPersonality: 'BearDownBenny',
    chatRoomName: 'Bears Den',
  },
  bulls: {
    id: 'bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    color: '#CE1141',
    secondaryColor: '#000000',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    sport: 'basketball',
    aiPersonality: 'WindyCityHoops',
    chatRoomName: 'Bulls Pen',
  },
  cubs: {
    id: 'cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    color: '#0E3386',
    secondaryColor: '#CC3433',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    sport: 'baseball',
    aiPersonality: 'WrigleyWill',
    chatRoomName: 'Cubs Corner',
  },
  whitesox: {
    id: 'whitesox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    color: '#27251F',
    secondaryColor: '#C4CED4',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    sport: 'baseball',
    aiPersonality: 'SouthSideSoxSarah',
    chatRoomName: 'South Side Sox',
  },
  blackhawks: {
    id: 'blackhawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    color: '#CF0A2C',
    secondaryColor: '#000000',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    sport: 'hockey',
    aiPersonality: 'MadhouseMike',
    chatRoomName: 'Madhouse',
  },
} as const

export type TeamId = keyof typeof TEAMS

// App theme colors (matches website)
export const COLORS = {
  primary: '#bc0000',
  primaryDark: '#a00000',
  background: '#f5f5f5',
  backgroundDark: '#121212',
  surface: '#ffffff',
  surfaceDark: '#1e1e1e',
  text: '#1a1a1a',
  textDark: '#ffffff',
  textMuted: '#666666',
  textMutedDark: '#999999',
  border: '#e5e5e5',
  borderDark: '#333333',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
}
