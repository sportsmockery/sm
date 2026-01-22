'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

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

// User type
interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt?: string
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Convert Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
    avatar: supabaseUser.user_metadata?.avatar_url,
    createdAt: supabaseUser.created_at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
