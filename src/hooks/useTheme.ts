'use client'

import { useThemeContext } from '@/contexts/ThemeContext'

export function useTheme() {
  return useThemeContext()
}

export default useTheme
