import { createBrowserClient } from '@supabase/ssr'
import type { User, Session, Provider } from '@supabase/supabase-js'

export type SocialProvider = 'google' | 'facebook' | 'twitter'

// Create a browser client for auth operations
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface AuthError {
  message: string
  status?: number
}

export interface AuthResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      user: null,
      session: null,
      error: { message: error.message, status: error.status },
    }
  }

  return {
    user: data.user,
    session: data.session,
    error: null,
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { full_name?: string }
): Promise<AuthResult> {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  })

  if (error) {
    return {
      user: null,
      session: null,
      error: { message: error.message, status: error.status },
    }
  }

  return {
    user: data.user,
    session: data.session,
    error: null,
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/**
 * Update password (for reset password flow)
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return { user: null, error: { message: error.message, status: error.status } }
  }

  return { user, error: null }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const supabase = createClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    return { session: null, error: { message: error.message, status: error.status } }
  }

  return { session, error: null }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = createClient()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}

/**
 * Sign in with a social provider (Google, Facebook, Twitter)
 */
export async function signInWithSocialProvider(
  provider: SocialProvider,
  redirectTo: string = '/profile'
): Promise<{ error: AuthError | null }> {
  const supabase = createClient()

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
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/**
 * Link a social provider to the current user's account
 */
export async function linkSocialProvider(
  provider: SocialProvider
): Promise<{ error: AuthError | null }> {
  const supabase = createClient()

  const { error } = await supabase.auth.linkIdentity({
    provider: provider as Provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/profile`,
    },
  })

  if (error) {
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/**
 * Unlink a social provider from the current user's account
 */
export async function unlinkSocialProvider(
  identityId: string
): Promise<{ error: AuthError | null }> {
  const supabase = createClient()

  const { error } = await supabase.auth.unlinkIdentity({
    id: identityId,
    // These fields are required by the type but not actually used in the unlink operation
    user_id: '',
    identity_data: {},
    provider: '',
    created_at: '',
    updated_at: '',
  } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

  if (error) {
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/**
 * Get all identities (linked social providers) for the current user
 */
export async function getUserIdentities(): Promise<{
  identities: Array<{
    id: string
    provider: string
    created_at: string
    identity_data: Record<string, unknown>
  }> | null
  error: AuthError | null
}> {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return { identities: null, error: { message: error.message, status: error.status } }
  }

  return {
    identities: user?.identities?.map((identity) => ({
      id: identity.id,
      provider: identity.provider,
      created_at: identity.created_at || new Date().toISOString(),
      identity_data: (identity.identity_data || {}) as Record<string, unknown>,
    })) || [],
    error: null,
  }
}
