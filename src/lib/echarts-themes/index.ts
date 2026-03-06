import { lightTheme } from './sportsmockery-light'
import { darkTheme } from './sportsmockery-dark'

export type ThemeMode = 'light' | 'dark'

export function getTheme(mode: ThemeMode) {
  return mode === 'dark' ? darkTheme : lightTheme
}

export function applyTheme(options: Record<string, unknown>, mode: ThemeMode): Record<string, unknown> {
  const theme = getTheme(mode)
  return {
    ...options,
    backgroundColor: theme.backgroundColor,
    textStyle: { ...theme.textStyle, ...(options.textStyle as Record<string, unknown> || {}) },
    tooltip: { ...theme.tooltip, ...(options.tooltip as Record<string, unknown> || {}) },
  }
}

export { lightTheme, darkTheme }
