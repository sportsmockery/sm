import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS } from '@/lib/config'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  mode: ThemeMode
  isDark: boolean
  setMode: (mode: ThemeMode) => void
  colors: typeof COLORS & { background: string; surface: string; text: string; textMuted: string; border: string }
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const THEME_STORAGE_KEY = 'theme_mode'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')

  // Determine if dark mode based on mode and system preference
  const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark')

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setModeState(saved as ThemeMode)
      }
    })
  }, [])

  // Save theme preference
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode)
  }

  // Compute colors based on theme
  const colors = {
    ...COLORS,
    background: isDark ? COLORS.backgroundDark : COLORS.background,
    surface: isDark ? COLORS.surfaceDark : COLORS.surface,
    surfaceHighlight: isDark ? COLORS.surfaceHighlightDark : COLORS.surfaceHighlight,
    text: isDark ? COLORS.textDark : COLORS.text,
    textMuted: isDark ? COLORS.textMutedDark : COLORS.textMuted,
    border: isDark ? COLORS.borderDark : COLORS.border,
  }

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
