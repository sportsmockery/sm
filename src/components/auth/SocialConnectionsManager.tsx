'use client'

import { useState } from 'react'
import { useAuth, SocialProvider, LinkedIdentity } from '@/contexts/AuthContext'

interface SocialConnectionsManagerProps {
  compact?: boolean
}

// Provider configurations
const providerConfig: Record<
  SocialProvider,
  { name: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  google: {
    name: 'Google',
    color: '#4285F4',
    bgColor: 'rgba(66, 133, 244, 0.1)',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  facebook: {
    name: 'Facebook',
    color: '#1877f2',
    bgColor: 'rgba(24, 119, 242, 0.1)',
    icon: (
      <svg className="h-5 w-5" fill="#1877f2" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  twitter: {
    name: 'X',
    color: '#000000',
    bgColor: 'rgba(0, 0, 0, 0.1)',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
}

export default function SocialConnectionsManager({ compact = false }: SocialConnectionsManagerProps) {
  const { user, getLinkedProviders, linkSocialProvider, unlinkSocialProvider } = useAuth()
  const [loading, setLoading] = useState<SocialProvider | null>(null)
  const [unlinking, setUnlinking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const linkedProviders = getLinkedProviders()
  const allProviders: SocialProvider[] = ['google', 'facebook', 'twitter']

  const getIdentityForProvider = (provider: SocialProvider): LinkedIdentity | undefined => {
    return user?.identities?.find((i) => i.provider === provider)
  }

  const handleLink = async (provider: SocialProvider) => {
    setLoading(provider)
    setError(null)

    const { error } = await linkSocialProvider(provider)

    if (error) {
      setError(error)
      setLoading(null)
    }
    // If successful, browser will redirect
  }

  const handleUnlink = async (identityId: string, provider: SocialProvider) => {
    if (
      !confirm(
        `Are you sure you want to disconnect ${providerConfig[provider].name}? You can reconnect it later.`
      )
    ) {
      return
    }

    setUnlinking(identityId)
    setError(null)

    const { error } = await unlinkSocialProvider(identityId)

    if (error) {
      setError(error)
    }

    setUnlinking(null)
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {allProviders.map((provider) => {
          const config = providerConfig[provider]
          const isLinked = linkedProviders.includes(provider)
          const identity = getIdentityForProvider(provider)

          return (
            <div key={provider} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: config.bgColor }}
                >
                  {config.icon}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{config.name}</p>
                  <p className="text-xs text-zinc-500">
                    {isLinked ? identity?.email || 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {isLinked && identity ? (
                <button
                  onClick={() => handleUnlink(identity.id, provider)}
                  disabled={unlinking === identity.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {unlinking === identity.id ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : (
                <button
                  onClick={() => handleLink(provider)}
                  disabled={loading === provider}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: config.color }}
                >
                  {loading === provider ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          )
        })}

        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Connect your social accounts to enable quick sign-in options and link your identities.
      </p>

      {error && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="space-y-3">
        {allProviders.map((provider) => {
          const config = providerConfig[provider]
          const isLinked = linkedProviders.includes(provider)
          const identity = getIdentityForProvider(provider)

          return (
            <div
              key={provider}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: config.bgColor }}
                >
                  {config.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{config.name}</p>
                  {isLinked && identity ? (
                    <p className="text-sm text-zinc-400">
                      {identity.email || identity.name || 'Connected'}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500">Not connected</p>
                  )}
                </div>
              </div>

              {isLinked && identity ? (
                <button
                  onClick={() => handleUnlink(identity.id, provider)}
                  disabled={unlinking === identity.id}
                  className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {unlinking === identity.id ? (
                    <span className="flex items-center gap-2">
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
                    'Disconnect'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleLink(provider)}
                  disabled={loading === provider}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: config.color }}
                >
                  {loading === provider ? (
                    <span className="flex items-center gap-2">
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
                      Connecting...
                    </span>
                  ) : (
                    'Connect'
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
