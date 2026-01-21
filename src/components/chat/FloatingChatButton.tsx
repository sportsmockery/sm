'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCanAccess, useSubscription } from '@/contexts/SubscriptionContext'

interface FloatingChatButtonProps {
  teamSlug: string
  teamName: string
}

export default function FloatingChatButton({ teamSlug, teamName }: FloatingChatButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()
  const canAccessChat = useCanAccess('fan_chat')
  const { isLoading } = useSubscription()

  // Hide on /fan-chat page since user is already there
  if (pathname === '/fan-chat') {
    return null
  }

  // Don't show while loading subscription status
  if (isLoading) return null

  // If user doesn't have access, show upgrade prompt
  if (!canAccessChat) {
    return (
      <Link
        href="/pricing"
        className="fixed z-[1000] flex items-center gap-3 border-none cursor-pointer no-underline"
        style={{
          bottom: '100px',
          right: '24px',
          padding: '14px 20px',
          borderRadius: '50px',
          background: '#C83803',
          color: 'white',
          fontSize: '0.95rem',
          fontWeight: 600,
          fontFamily: "'Montserrat', sans-serif",
          boxShadow: '0 4px 20px rgba(200, 56, 3, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        aria-label="Unlock Fan Chat with SM+"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="hidden sm:inline whitespace-nowrap">Fan Chat</span>
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
    <Link
      href="/chat"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed z-[1000] flex items-center gap-3 border-none cursor-pointer no-underline"
      style={{
        bottom: '100px',
        right: '24px',
        padding: '14px 20px',
        borderRadius: '50px',
        background: '#C83803',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 600,
        fontFamily: "'Montserrat', sans-serif",
        boxShadow: '0 4px 20px rgba(200, 56, 3, 0.4)',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      aria-label={`Open ${teamName} fan chat in new tab`}
    >
      {/* Chat icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* Text - hidden on mobile */}
      <span className="hidden sm:inline whitespace-nowrap">
        Fan Chat
      </span>

      {/* External link indicator */}
      <svg className="w-4 h-4 hidden sm:block opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>

      {/* Pulse indicator */}
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
        />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
      </span>
    </Link>
  )
}
