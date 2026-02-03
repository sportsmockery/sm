'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { generateOAuthState, storeOAuthState, getDisqusAuthUrl } from '@/lib/disqus'

interface DisqusConnectionProps {
  showTitle?: boolean
  compact?: boolean
}

export default function DisqusConnection({ showTitle = true, compact = false }: DisqusConnectionProps) {
  const { disqusConnection, checkDisqusConnection, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  const handleConnect = () => {
    if (!isAuthenticated) {
      setError('Please log in to connect your Disqus account')
      return
    }

    setLoading(true)
    setError(null)

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
      setError('Failed to initiate Disqus connection')
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Disqus account?')) {
      return
    }

    setDisconnecting(true)
    setError(null)

    try {
      const response = await fetch('/api/user/disqus-disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect Disqus')
      }

      await checkDisqusConnection()
    } catch (err) {
      setError('Failed to disconnect Disqus account')
    } finally {
      setDisconnecting(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2e9fff]/20">
            <DisqusIcon className="h-5 w-5 text-[#2e9fff]" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Disqus</p>
            <p className="text-xs text-zinc-500">
              {disqusConnection.isConnected
                ? `Connected as ${disqusConnection.username}`
                : 'Required for commenting'}
            </p>
          </div>
        </div>

        {disqusConnection.isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#2e9fff] hover:bg-[#1a8ae6] transition-colors disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      {showTitle && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2e9fff]/20">
            <DisqusIcon className="h-6 w-6 text-[#2e9fff]" />
          </div>
          <div>
            <h3 className="font-bold text-white">Disqus Comments</h3>
            <p className="text-sm text-zinc-500">Connect to comment on articles</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {disqusConnection.isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 px-4 py-3">
            <svg
              className="h-5 w-5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium text-emerald-400">Connected</p>
              <p className="text-sm text-zinc-400">
                Signed in as <span className="text-white">{disqusConnection.username}</span>
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-500">
            Your Disqus account is connected. You can comment on any article using your Disqus identity.
          </p>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full rounded-lg bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {disconnecting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Disconnecting...
              </span>
            ) : (
              'Disconnect Disqus'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Connect your Disqus account to comment on articles. You only need to do this once, and
            you&apos;ll be automatically signed in when viewing comments.
          </p>

          <div className="rounded-lg bg-amber-500/10 px-4 py-3">
            <div className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <p className="text-sm text-amber-400">
                A Disqus account is required to comment on articles. If you don&apos;t have one,
                you&apos;ll be prompted to create one.
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: '#2e9fff',
              color: '#ffffff',
            }}
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <DisqusIcon className="h-5 w-5" />
                Connect Disqus Account
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// Disqus icon component
function DisqusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.438 23.654c-5.533 0-10.036-4.091-10.808-9.396L0 14.305l1.63.047C5.532 14.352 12 11.3 12 4.127c0-.757-.066-1.493-.192-2.209l-.207-1.17.958.773a11.957 11.957 0 0 1 4.804 9.611c0 6.627-5.373 12-12 12l.075.001z" />
      <path d="M12 3.584c.035 0 .07.001.105.002C15.866 4.032 18.75 7.2 18.75 11c0 4.004-3.246 7.25-7.25 7.25S4.25 15.004 4.25 11 7.496 3.75 11.5 3.75c.167 0 .333.006.5.016v-.182z" />
    </svg>
  )
}

export { DisqusIcon }
