/**
 * SM Edge Mobile Design Tokens
 * Central design system for the React Native mobile app.
 */

// ── Core Brand Colors ──────────────────────────────────────────────
export const Colors = {
  primary: '#BC0000',
  edgeCyan: '#00D4FF',
  gold: '#D6B05E',
  navy: '#0A1F3D',
  black: '#0B0F14',
  white: '#FAFAFB',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',
} as const;

// ── Light Theme ────────────────────────────────────────────────────
export const LightColors = {
  background: '#FAFAFB',
  surface: '#FAFAFB',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#F3F4F6',
  text: '#0B0F14',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: 'rgba(11,15,20,0.08)',
  borderSolid: '#E5E7EB',
} as const;

// ── Dark Theme ─────────────────────────────────────────────────────
export const DarkColors = {
  background: '#0B0F14',
  surface: '#0B0F14',
  surfaceElevated: '#141A22',
  surfaceHighlight: '#1C2430',
  text: '#FAFAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: 'rgba(255,255,255,0.08)',
  borderSolid: '#2A3140',
} as const;

// ── Team Accent Colors ─────────────────────────────────────────────
export const TeamAccents = {
  bears: '#C83803',
  cubs: '#0E3386',
  bulls: '#CE1141',
  blackhawks: '#00833E',
  whitesox: '#FFFFFF',
} as const;

// ── Typography ─────────────────────────────────────────────────────
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const FontSize = {
  heroLarge: 34,
  hero: 28,
  sectionTitle: 22,
  sectionSubtitle: 20,
  cardTitle: 18,
  cardTitleSmall: 17,
  cardBody: 16,
  body: 16,
  bodySmall: 15,
  label: 14,
  badge: 13,
  meta: 13,
  caption: 13,
  tabLabel: 11,
} as const;

export const LineHeight = {
  heroLarge: 42,
  hero: 36,
  sectionTitle: 28,
  cardTitle: 24,
  body: 24,
  bodySmall: 22,
  label: 20,
  meta: 18,
} as const;

// ── Spacing ────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  cardPadding: 16,
  lg: 16,
  cardGap: 16,
  xl: 20,
  paragraph: 20,
  section: 48,
} as const;

// ── Card ───────────────────────────────────────────────────────────
export const Card = {
  borderRadius: 14,
  padding: 20,
  accentBorderWidth: 4,
} as const;

// ── Interactive Targets ────────────────────────────────────────────
export const Interactive = {
  minTapTarget: 44,
  buttonHeight: 48,
  chipHeight: 36,
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 56,
  teamLogoSmall: 32,
  teamLogoMedium: 48,
} as const;

// ── Motion ─────────────────────────────────────────────────────────
export const Motion = {
  fast: 200,
  standard: 300,
  slow: 2000,
} as const;

// ── Helpers ────────────────────────────────────────────────────────
export type TeamId = 'bears' | 'cubs' | 'bulls' | 'blackhawks' | 'whitesox';

export function getTeamAccent(team?: TeamId | string | null): string {
  if (!team) return Colors.primary;
  const key = team.toLowerCase().replace(/\s/g, '') as TeamId;
  return TeamAccents[key] ?? Colors.primary;
}

export type ThemeColors = typeof LightColors;

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? DarkColors : LightColors;
}
