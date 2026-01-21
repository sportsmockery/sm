import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  signOut as supabaseSignOut,
  getSession,
} from '@/lib/supabase'
import { api } from '@/lib/api'

type Role = 'admin' | 'editor' | 'author' | 'fan_council' | 'fan'

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  userRole: Role | null
  isAdmin: boolean
  isEditor: boolean
  isStaff: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithApple: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<Role | null>(null)

  // Fetch user role from sm_users table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sm_users')
        .select('role')
        .eq('id', userId)
        .single()

      if (!error && data?.role) {
        setUserRole(data.role as Role)
      } else {
        setUserRole('fan') // Default to fan
      }
    } catch (err) {
      console.warn('Failed to fetch user role:', err)
      setUserRole('fan')
    }
  }

  useEffect(() => {
    // Get initial session
    getSession().then(({ session }) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Set auth token for API client
      if (session?.access_token) {
        api.setAuthToken(session.access_token)
      }

      // Fetch user role
      if (session?.user?.id) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }

      setIsLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Update API client auth token
      if (session?.access_token) {
        api.setAuthToken(session.access_token)
      } else {
        api.setAuthToken(null)
      }

      // Fetch user role
      if (session?.user?.id) {
        fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password)
    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string, username?: string) => {
    const { error } = await signUpWithEmail(email, password)
    // TODO: Update user profile with username after signup
    return { error: error ? new Error(error.message) : null }
  }

  const signInWithGoogle = async () => {
    const { error } = await signInWithOAuth('google')
    return { error: error ? new Error(error.message) : null }
  }

  const signInWithApple = async () => {
    const { error } = await signInWithOAuth('apple')
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    await supabaseSignOut()
    api.setAuthToken(null)
    setUserRole(null)
  }

  // Computed role helpers
  const isAdmin = userRole === 'admin'
  const isEditor = userRole === 'editor'
  const isStaff = userRole === 'admin' || userRole === 'editor' || userRole === 'author'

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!session,
        userRole,
        isAdmin,
        isEditor,
        isStaff,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
