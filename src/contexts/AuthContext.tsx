'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

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
}

// Auth context type
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, options?: string | { full_name?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
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
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient())
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth session check failed:', error.message)
          setUser(null)
        } else if (session?.user) {
          setUser(mapSupabaseUser(session.user))
        } else {
          setUser(null)
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
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
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
