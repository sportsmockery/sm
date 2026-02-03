'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User as SupabaseUser, Session, Provider, UserIdentity } from '@supabase/supabase-js'

export type SocialProvider = 'google' | 'facebook' | 'twitter'

// Session persistence constants
const SESSION_KEY = 'sm-session-expiry'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Create Supabase client for browser
function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Linked identity type
export interface LinkedIdentity {
  id: string
  provider: string
  createdAt: string
  email?: string
  name?: string
  avatar?: string
}

// User type
interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt?: string
  identities?: LinkedIdentity[]
}

// Disqus connection type
export interface DisqusConnection {
  isConnected: boolean
  username?: string
  userId?: string
  connectedAt?: string
}

// Auth context type
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>
  signUp: (email: string, password: string, options?: string | { full_name?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  // Social login methods
  signInWithSocial: (provider: SocialProvider, redirectTo?: string) => Promise<{ error?: string }>
  linkSocialProvider: (provider: SocialProvider) => Promise<{ error?: string }>
  unlinkSocialProvider: (identityId: string) => Promise<{ error?: string }>
  getLinkedProviders: () => SocialProvider[]
  // Disqus connection
  disqusConnection: DisqusConnection
  checkDisqusConnection: () => Promise<void>
  hasDisqusConnection: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
    avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    createdAt: supabaseUser.created_at,
    identities: supabaseUser.identities?.map((identity: UserIdentity) => ({
      id: identity.id,
      provider: identity.provider,
      createdAt: identity.created_at || '',
      email: identity.identity_data?.email as string | undefined,
      name: (identity.identity_data?.full_name || identity.identity_data?.name) as string | undefined,
      avatar: (identity.identity_data?.avatar_url || identity.identity_data?.picture) as string | undefined,
    })),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [disqusConnection, setDisqusConnection] = useState<DisqusConnection>({ isConnected: false })

  // Check for existing session on mount and handle session persistence
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a valid "remember me" session
        const sessionExpiry = localStorage.getItem(SESSION_KEY)
        const now = Date.now()

        if (sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry, 10)
          if (now > expiryTime) {
            // Session expired, sign out
            localStorage.removeItem(SESSION_KEY)
            await supabase.auth.signOut()
            setUser(null)
            setLoading(false)
            return
          } else {
            // Session still valid, reset the 24-hour timer on each visit
            localStorage.setItem(SESSION_KEY, (now + SESSION_DURATION).toString())
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth session check failed:', error.message)
          setUser(null)
        } else if (session?.user) {
          setUser(mapSupabaseUser(session.user))
        } else {
          setUser(null)
          // Clean up any stale session expiry
          localStorage.removeItem(SESSION_KEY)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user))
        } else {
          setUser(null)
          // Clean up session expiry on sign out
          localStorage.removeItem(SESSION_KEY)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe: boolean = false): Promise<{ error?: string }> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in failed:', error.message)
        return { error: error.message }
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user))

        // If "Remember me" is checked, store session expiry time (24 hours from now)
        if (rememberMe) {
          const expiryTime = Date.now() + SESSION_DURATION
          localStorage.setItem(SESSION_KEY, expiryTime.toString())
        } else {
          // Remove any existing session expiry (session-only login)
          localStorage.removeItem(SESSION_KEY)
        }
      }

      return {}
    } catch (error) {
      console.error('Sign in failed:', error)
      return { error: 'Sign in failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    options?: string | { full_name?: string }
  ): Promise<{ error?: string }> => {
    setLoading(true)
    try {
      const fullName = typeof options === 'string' ? options : options?.full_name

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      })

      if (error) {
        console.error('Sign up failed:', error.message)
        return { error: error.message }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { error: 'Please check your email to confirm your account.' }
      }

      if (data.user) {
        setUser(mapSupabaseUser(data.user))
      }

      return {}
    } catch (error) {
      console.error('Sign up failed:', error)
      return { error: 'Sign up failed. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out failed:', error.message)
        throw error
      }
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('Password reset failed:', error.message)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Password reset failed:', error)
      return { error: 'Failed to send reset email. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  // Refresh user data (e.g., after avatar update)
  const refreshUser = async () => {
    try {
      const { data: { user: freshUser }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Failed to refresh user:', error.message)
        return
      }
      if (freshUser) {
        setUser(mapSupabaseUser(freshUser))
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  // Sign in with a social provider
  const signInWithSocial = async (
    provider: SocialProvider,
    redirectTo: string = '/profile'
  ): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      })

      if (error) {
        console.error('Social sign in failed:', error.message)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Social sign in failed:', error)
      return { error: 'Social sign in failed. Please try again.' }
    }
  }

  // Link a social provider to the current account
  const linkSocialProvider = async (provider: SocialProvider): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: provider as Provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
        },
      })

      if (error) {
        console.error('Failed to link provider:', error.message)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Failed to link provider:', error)
      return { error: 'Failed to link account. Please try again.' }
    }
  }

  // Unlink a social provider from the current account
  const unlinkSocialProvider = async (identityId: string): Promise<{ error?: string }> => {
    try {
      // Find the identity to unlink
      const identity = user?.identities?.find(i => i.id === identityId)
      if (!identity) {
        return { error: 'Identity not found' }
      }

      // Ensure user has at least one other auth method
      const hasPassword = user?.identities?.some(i => i.provider === 'email')
      const otherProviders = user?.identities?.filter(i => i.id !== identityId) || []

      if (!hasPassword && otherProviders.length === 0) {
        return { error: 'Cannot unlink your only authentication method. Add a password or another provider first.' }
      }

      // Use type assertion since we only need the id for unlinking
      const { error } = await supabase.auth.unlinkIdentity({
        id: identityId,
        identity_id: identityId,
        user_id: user?.id || '',
        identity_data: {},
        provider: identity.provider,
        created_at: identity.createdAt || new Date().toISOString(),
        updated_at: identity.createdAt || new Date().toISOString(),
        last_sign_in_at: null,
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) {
        console.error('Failed to unlink provider:', error.message)
        return { error: error.message }
      }

      // Refresh user to get updated identities
      await refreshUser()

      return {}
    } catch (error) {
      console.error('Failed to unlink provider:', error)
      return { error: 'Failed to unlink account. Please try again.' }
    }
  }

  // Get list of linked social providers
  const getLinkedProviders = useCallback((): SocialProvider[] => {
    if (!user?.identities) return []
    return user.identities
      .map(i => i.provider)
      .filter((p): p is SocialProvider => ['google', 'facebook', 'twitter'].includes(p))
  }, [user?.identities])

  // Check Disqus connection status
  const checkDisqusConnection = useCallback(async () => {
    if (!user?.id) {
      setDisqusConnection({ isConnected: false })
      return
    }

    try {
      const response = await fetch('/api/user/disqus-status')
      if (response.ok) {
        const data = await response.json()
        setDisqusConnection({
          isConnected: data.isConnected,
          username: data.username,
          userId: data.disqusUserId,
          connectedAt: data.connectedAt,
        })
      } else {
        setDisqusConnection({ isConnected: false })
      }
    } catch (error) {
      console.error('Failed to check Disqus connection:', error)
      setDisqusConnection({ isConnected: false })
    }
  }, [user?.id])

  // Check Disqus connection when user changes
  useEffect(() => {
    if (user?.id) {
      checkDisqusConnection()
    } else {
      setDisqusConnection({ isConnected: false })
    }
  }, [user?.id, checkDisqusConnection])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
        isAuthenticated: !!user,
        // Social login methods
        signInWithSocial,
        linkSocialProvider,
        unlinkSocialProvider,
        getLinkedProviders,
        // Disqus connection
        disqusConnection,
        checkDisqusConnection,
        hasDisqusConnection: disqusConnection.isConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Alias for compatibility with existing code
export const useAuthContext = useAuth
