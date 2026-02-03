'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { dismissDisqusPrompt, isDisqusPromptDismissed, generateOAuthState, storeOAuthState, getDisqusAuthUrl } from '@/lib/disqus'
import { DisqusIcon } from './DisqusConnection'

interface DisqusPromptModalProps {
  /** Show on any page load, not just after login */
  showOnPageLoad?: boolean
  /** Called when modal is closed */
  onClose?: () => void
}

export default function DisqusPromptModal({ showOnPageLoad = false, onClose }: DisqusPromptModalProps) {
  const { isAuthenticated, hasDisqusConnection, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(true) // Start as true to prevent flash

  // Check if modal should be shown
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if user is authenticated and doesn't have Disqus connected
    if (isAuthenticated && !hasDisqusConnection) {
      // Check if prompt was recently dismissed
      const promptDismissed = isDisqusPromptDismissed()
      setDismissed(promptDismissed)

      if (!promptDismissed) {
        // Delay showing modal slightly for better UX
        const timer = setTimeout(() => setIsOpen(true), 1000)
        return () => clearTimeout(timer)
      }
    } else {
      setIsOpen(false)
    }
  }, [isAuthenticated, hasDisqusConnection])

  const handleConnect = () => {
    setLoading(true)

    try {
      // Generate and store OAuth state for security
      const state = generateOAuthState()
      storeOAuthState(state)

      // Build redirect URI
      const redirectUri = `${window.location.origin}/api/auth/disqus/callback`

      // Redirect to Disqus OAuth
      const authUrl = getDisqusAuthUrl(redirectUri, state)
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to initiate Disqus connection:', err)
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    dismissDisqusPrompt()
    setDismissed(true)
    setIsOpen(false)
    onClose?.()
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  // Don't render if conditions aren't met
  if (!isAuthenticated || hasDisqusConnection || dismissed || !isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2e9fff]/20">
            <DisqusIcon className="h-8 w-8 text-[#2e9fff]" />
          </div>
          <h2 className="text-xl font-bold text-white">Connect Disqus to Comment</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! To comment on articles, you&apos;ll need to connect a Disqus account.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-white text-sm">One-time setup</p>
              <p className="text-xs text-zinc-500">Connect once and you&apos;re ready to comment everywhere</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-white text-sm">Join the conversation</p>
              <p className="text-xs text-zinc-500">Engage with other Chicago sports fans</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-zinc-800/50 p-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-white text-sm">Get notifications</p>
              <p className="text-xs text-zinc-500">Stay updated when someone replies to you</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#2e9fff' }}
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <DisqusIcon className="h-5 w-5" />
                Connect Disqus Now
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            Remind me later
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-zinc-600">
          You can always connect Disqus later from your{' '}
          <a href="/profile" className="text-[#2e9fff] hover:underline">
            profile settings
          </a>
        </p>
      </div>
    </div>
  )
}
