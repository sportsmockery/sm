'use client'

import { useThemeContext } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeContext()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bc0000] focus-visible:ring-offset-2"
      style={{
        backgroundColor: isDark ? '#1f2937' : '#e5e7eb',
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon (left side) */}
      <span className="absolute left-1.5 flex items-center justify-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? '#9ca3af' : '#f59e0b'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </span>

      {/* Moon icon (right side) */}
      <span className="absolute right-1.5 flex items-center justify-center">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={isDark ? '#60a5fa' : 'none'}
          stroke={isDark ? '#60a5fa' : '#9ca3af'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>

      {/* Sliding circle with star */}
      <span
        className="inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
        style={{
          transform: isDark ? 'translateX(34px)' : 'translateX(2px)',
        }}
      >
        {/* Chicago star (✶) */}
        <span 
          className="text-sm font-bold transition-colors duration-300"
          style={{ color: isDark ? '#60a5fa' : '#f59e0b' }}
        >
          ✶
        </span>
      </span>
    </button>
  )
}
