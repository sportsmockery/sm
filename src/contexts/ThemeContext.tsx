'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: Theme // Alias for theme for compatibility
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
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

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, toggleTheme, setTheme }}>
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
