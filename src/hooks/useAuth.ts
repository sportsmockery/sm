'use client'

import { useAuthContext } from '@/contexts/AuthContext'

/**
 * Hook to access authentication state and methods
 *
 * @example
 * const { user, loading, signIn, signOut, isAuthenticated } = useAuth()
 *
 * if (loading) return <Loading />
 * if (!isAuthenticated) return <LoginPrompt />
 *
 * return <Dashboard user={user} />
 */
export function useAuth() {
  return useAuthContext()
}

export default useAuth
