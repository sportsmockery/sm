'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
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
        aria-label="Scout AI"
      >
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        <span className="hidden sm:inline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Scout AI
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
