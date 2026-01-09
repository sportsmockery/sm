'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bc0000] focus-visible:ring-offset-2"
      style={{
        backgroundColor: isDark ? '#27272a' : '#e5e7eb',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sliding circle with star */}
      <span
        className="inline-flex h-5 w-5 transform items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{
          transform: isDark ? 'translateX(26px)' : 'translateX(4px)',
          backgroundColor: isDark ? '#0a0a0b' : '#ffffff',
        }}
      >
        {/* Chicago star (✶) */}
        <span
          className="text-xs font-black transition-colors duration-300"
          style={{ color: '#bc0000' }}
        >
          ✶
        </span>
      </span>
    </button>
  )
}
