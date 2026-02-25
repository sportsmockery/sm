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
    '--sm-time-card': 'rgba(19, 19, 29, 0.75)',
    '--sm-time-glass-glow': 'rgba(255, 255, 255, 0.04)',
    '--sm-time-hero-haze': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
  },
  night: {
    '--sm-time-card': 'rgba(30, 5, 5, 0.85)',
    '--sm-time-glass-glow': 'rgba(188, 0, 0, 0.08)',
    '--sm-time-hero-haze': 'linear-gradient(135deg, rgba(188,0,0,0.06) 0%, rgba(0,0,0,0.9) 100%)',
  },
  dawn: {
    '--sm-time-card': 'rgba(15, 10, 25, 0.8)',
    '--sm-time-glass-glow': 'rgba(188, 0, 0, 0.04)',
    '--sm-time-hero-haze': 'linear-gradient(180deg, rgba(40,20,60,0.06) 0%, transparent 50%)',
  },
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day')
  const [mounted, setMounted] = useState(false)

  // On mount, check localStorage
  useEffect(() => {
    setMounted(true)

    const stored = localStorage.getItem('sm-theme') as Theme | null
    if (stored === 'light') {
      setThemeState('light')
    }
    // Default is dark (no action needed)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // Remove both classes first
    root.classList.remove('light', 'dark')

    if (theme === 'light') {
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
      localStorage.setItem('sm-theme', 'light')
    } else {
      root.classList.add('dark')
      root.removeAttribute('data-theme')
      localStorage.setItem('sm-theme', 'dark')
    }
  }, [theme, mounted])

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

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

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
