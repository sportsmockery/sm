'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for existing session (placeholder)
        const savedUser = localStorage.getItem('sm-user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Sign in
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true)
    try {
      // Placeholder implementation - replace with actual auth
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      }
      setUser(mockUser)
      localStorage.setItem('sm-user', JSON.stringify(mockUser))
      return {}
    } catch (error) {
      console.error('Sign in failed:', error)
      return { error: 'Sign in failed' }
    } finally {
      setLoading(false)
    }
  }

  // Sign up
  const signUp = async (email: string, password: string, options?: string | { full_name?: string }): Promise<{ error?: string }> => {
    setLoading(true)
    try {
      // Handle both string name or options object
      const name = typeof options === 'string' ? options : options?.full_name
      // Placeholder implementation - replace with actual auth
      const mockUser: User = {
        id: '1',
        email,
        name: name || email.split('@')[0],
      }
      setUser(mockUser)
      localStorage.setItem('sm-user', JSON.stringify(mockUser))
      return {}
    } catch (error) {
      console.error('Sign up failed:', error)
      return { error: 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    setLoading(true)
    try {
      setUser(null)
      localStorage.removeItem('sm-user')
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
      // Placeholder implementation - replace with actual password reset
      console.log('Password reset email sent to:', email)
      return {}
    } catch (error) {
      console.error('Password reset failed:', error)
      return { error: 'Failed to send reset email' }
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
