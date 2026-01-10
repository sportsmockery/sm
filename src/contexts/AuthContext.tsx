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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signOut: () => Promise<void>
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
  const signIn = async (email: string, password: string) => {
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
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up
  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true)
    try {
      // Placeholder implementation - replace with actual auth
      const mockUser: User = {
        id: '1',
        email,
        name: name || email.split('@')[0],
      }
      setUser(mockUser)
      localStorage.setItem('sm-user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
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
