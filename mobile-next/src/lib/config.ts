/**
 * Sports Mockery Mobile-Next Configuration
 *
 * Web-built (Next.js + Capacitor) version. Uses NEXT_PUBLIC_ env vars instead
 * of EXPO_PUBLIC_, but otherwise mirrors mobile/lib/config.ts so synced API
 * clients work without modification.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.sportsmockery.com';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';

export const ADMOB_IDS = {
  iosAppId: process.env.NEXT_PUBLIC_ADMOB_IOS_APP_ID || '',
  androidAppId: process.env.NEXT_PUBLIC_ADMOB_ANDROID_APP_ID || '',
  iosBanner: process.env.NEXT_PUBLIC_ADMOB_IOS_BANNER_ID || '',
  androidBanner: process.env.NEXT_PUBLIC_ADMOB_ANDROID_BANNER_ID || '',
};

export const CACHE_DURATIONS = {
  feed: 5 * 60 * 1000,
  article: 30 * 60 * 1000,
  teamData: 15 * 60 * 1000,
  mobileConfig: 60 * 60 * 1000,
  userProfile: 10 * 60 * 1000,
};

export const REFRESH_INTERVALS = {
  feed: 5 * 60 * 1000,
  chat: 0,
  liveGame: 30 * 1000,
};

export const STALE_TIMES = {
  feed: 2 * 60 * 1000,
  article: 10 * 60 * 1000,
  teamData: 5 * 60 * 1000,
};

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
} as const;

export type TeamId = keyof typeof TEAMS;

export const COLORS = {
  primary: '#bc0000',
  primaryDark: '#a00000',
  background: '#f5f5f5',
  backgroundDark: '#111111',
  surface: '#ffffff',
  surfaceDark: '#1e1e1e',
  text: '#1a1a1a',
  textDark: '#fafafa',
  textMuted: '#666666',
  textMutedDark: '#999999',
  border: '#e5e5e5',
  borderDark: '#333333',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  opponent: '#1a73e8',
};
