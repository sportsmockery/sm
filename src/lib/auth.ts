import { getBrowserClient } from './supabase-browser'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  status?: number
}

export interface AuthResult {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface CaptchaOpts {
  captchaToken?: string
}

export async function signIn(
  email: string,
  password: string,
  opts: CaptchaOpts = {}
): Promise<AuthResult> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: opts.captchaToken ? { captchaToken: opts.captchaToken } : undefined,
  })
  if (error) return { user: null, session: null, error: { message: error.message, status: error.status } }
  return { user: data.user, session: data.session, error: null }
}

export async function signUp(
  email: string,
  password: string,
  metadata?: { full_name?: string },
  opts: CaptchaOpts = {}
): Promise<AuthResult> {
  const supabase = getBrowserClient()
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      ...(opts.captchaToken ? { captchaToken: opts.captchaToken } : {}),
    },
  })
  if (error) return { user: null, session: null, error: { message: error.message, status: error.status } }
  return { user: data.user, session: data.session, error: null }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = getBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) return { error: { message: error.message, status: error.status } }
  return { error: null }
}

export async function resetPassword(
  email: string,
  opts: CaptchaOpts = {}
): Promise<{ error: AuthError | null }> {
  const supabase = getBrowserClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
    ...(opts.captchaToken ? { captchaToken: opts.captchaToken } : {}),
  })
  if (error) return { error: { message: error.message, status: error.status } }
  return { error: null }
}

export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const supabase = getBrowserClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: { message: error.message, status: error.status } }
  return { error: null }
}

export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  const supabase = getBrowserClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return { user: null, error: { message: error.message, status: error.status } }
  return { user, error: null }
}

export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const supabase = getBrowserClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) return { session: null, error: { message: error.message, status: error.status } }
  return { session, error: null }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const supabase = getBrowserClient()
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}
