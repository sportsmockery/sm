'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import ARTourButton from './ARTourButton'
import { useCanAccess, useSubscription } from '@/contexts/SubscriptionContext'
import Link from 'next/link'

/**
 * FloatingARButton
 *
 * A clearly visible floating button to trigger AR/3D stadium tours.
 * Shows on team pages only. Requires SM+ subscription.
 */
export default function FloatingARButton() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const canAccessAR = useCanAccess('ar_tours')
  const { isLoading } = useSubscription()

  // Determine which team page we're on
  const getTeamFromPath = (): string | null => {
    if (!pathname) return null
    if (pathname.includes('chicago-bears') || pathname.includes('/bears')) return 'chicago-bears'
    if (pathname.includes('chicago-cubs') || pathname.includes('/cubs')) return 'chicago-cubs'
    if (pathname.includes('chicago-bulls') || pathname.includes('/bulls')) return 'chicago-bulls'
    if (pathname.includes('chicago-white-sox') || pathname.includes('/white-sox')) return 'chicago-white-sox'
    if (pathname.includes('chicago-blackhawks') || pathname.includes('/blackhawks')) return 'chicago-blackhawks'
    return null
  }

  const team = getTeamFromPath()

  // Only show on team pages
  if (!team) return null

  // Don't show while loading subscription status
  if (isLoading) return null

  // If user doesn't have access, show upgrade prompt button
  if (!canAccessAR) {
    return (
      <Link
        href="/pricing"
        className="fixed z-[1000] flex items-center gap-3 border-none cursor-pointer no-underline"
        style={{
          bottom: '170px',
          right: '24px',
          padding: '14px 20px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        aria-label="Unlock AR Stadium Tour with SM+"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="hidden sm:inline whitespace-nowrap">AR Tour</span>
        <span
          className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full"
          style={{ background: '#F59E0B', color: 'white' }}
        >
          SM+
        </span>
      </Link>
    )
  }

  return (
    <>
      {/* Floating AR Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-[1000] flex items-center gap-3 border-none cursor-pointer"
        style={{
          bottom: '170px', // Above the chat button
          right: '24px',
          padding: '14px 20px',
          borderRadius: '50px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', // Purple - distinct from orange
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(139, 92, 246, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)'
        }}
        aria-label="Open AR Stadium Tour"
      >
        {/* AR/3D icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>

        {/* Text - hidden on mobile */}
        <span className="hidden sm:inline whitespace-nowrap">
          AR Tour
        </span>

        {/* NEW badge */}
        <span
          className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full"
          style={{
            background: '#10B981',
            color: 'white',
          }}
        >
          NEW
        </span>
      </button>

      {/* AR Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div className="relative w-full max-w-md">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-zinc-300 transition-colors"
              aria-label="Close AR Tour"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* AR Tour Card */}
            <ARTourButton team={team} />
          </div>
        </div>
      )}
    </>
  )
}
