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
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // On mount, check localStorage or system preference
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage first
    const stored = localStorage.getItem('sm-theme') as Theme | null
    if (stored && (stored === 'light' || stored === 'dark')) {
      setThemeState(stored)
      return
    }
    
    // Default to light mode (don't check system preference - we want light as default)
    setThemeState('light')
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    
    // Remove both classes first
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(theme)
    
    // Also set data attribute for CSS variable switching
    root.setAttribute('data-theme', theme)
    
    // Store preference
    localStorage.setItem('sm-theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // Always provide context, but hide content until mounted to prevent flash
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
