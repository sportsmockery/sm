'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { TEAM_INFO } from '@/lib/types'
import BearsAIChat from './BearsAIChat'

export default function BearsAIButton() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const bearsInfo = TEAM_INFO.bears

  // Show on Bears-related pages or home page
  const isBearsPage = pathname?.includes('bears') || pathname === '/'

  if (!isBearsPage) return null

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[250] flex items-center gap-2 px-4 py-3 rounded-full text-white font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${bearsInfo.primaryColor} 0%, #1a2940 100%)`,
        }}
        aria-label="Ask Bears AI"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="hidden sm:inline" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Ask AI
        </span>

        {/* Pulse indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          />
          <span
            className="relative inline-flex rounded-full h-3 w-3"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          />
        </span>
      </button>

      {/* Chat Modal */}
      <BearsAIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
