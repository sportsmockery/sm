'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'
type TimeOfDay = 'day' | 'night' | 'dawn'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: Theme // Alias for theme for compatibility
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  timeOfDay: TimeOfDay
}

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 18) return 'day'
  if (hour >= 18 && hour < 22) return 'night'
  return 'dawn'
}

// Time-of-day CSS variable overrides (layered on top of light/dark theme)
const TIME_CSS_VARS: Record<TimeOfDay, Record<string, string>> = {
  day: {
    '--sm-time-card': 'rgba(18, 18, 22, 0.85)',
    '--sm-time-glass-glow': 'rgba(255, 255, 255, 0.02)',
    '--sm-time-hero-haze': 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 60%)',
  },
  night: {
    '--sm-time-card': 'rgba(18, 18, 22, 0.9)',
    '--sm-time-glass-glow': 'rgba(0, 245, 255, 0.04)',
    '--sm-time-hero-haze': 'linear-gradient(135deg, rgba(0,245,255,0.02) 0%, rgba(5,5,8,0.95) 100%)',
  },
  dawn: {
    '--sm-time-card': 'rgba(18, 18, 22, 0.85)',
    '--sm-time-glass-glow': 'rgba(0, 245, 255, 0.02)',
    '--sm-time-hero-haze': 'linear-gradient(180deg, rgba(18,18,22,0.04) 0%, transparent 50%)',
  },
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day')
  const [mounted, setMounted] = useState(false)

  // On mount, force dark mode (Apple-black)
  useEffect(() => {
    setMounted(true)
    localStorage.setItem('sm-theme', 'dark')
  }, [])

  // Apply dark theme to document (always)
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    root.classList.remove('light')
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
    localStorage.setItem('sm-theme', 'dark')
  }, [mounted])

  // Time-of-day reactive CSS vars — checks every 10 minutes
  useEffect(() => {
    if (!mounted) return

    const applyTimeVars = () => {
      const tod = getTimeOfDay()
      setTimeOfDay(tod)
      const root = document.documentElement
      const vars = TIME_CSS_VARS[tod]
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
      root.setAttribute('data-time', tod)
      try { localStorage.setItem('sm-time-of-day', tod) } catch {}
    }

    // Load persisted value for instant first paint, then update
    try {
      const saved = localStorage.getItem('sm-time-of-day') as TimeOfDay | null
      if (saved && TIME_CSS_VARS[saved]) setTimeOfDay(saved)
    } catch {}

    applyTimeVars()
    const interval = setInterval(applyTimeVars, 10 * 60 * 1000) // 10 min
    return () => clearInterval(interval)
  }, [mounted])

  // Light mode is forced — toggle and setTheme are no-ops
  const toggleTheme = () => {}

  const setTheme = (_newTheme: Theme) => {}

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, toggleTheme, setTheme, timeOfDay }}>
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Alias for backward compatibility
export const useThemeContext = useTheme
