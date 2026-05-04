import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  isDisposableEmail,
  isValidEmail,
  DISPOSABLE_EMAIL_ERROR,
} from '@/lib/security/disposable-email'
import {
  HONEYPOT_FIELD_NAME,
  isHoneypotTriggered,
  HONEYPOT_GENERIC_ERROR,
} from '@/lib/security/honeypot'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface SignupBody {
  email?: string
  password?: string
  full_name?: string
  captchaToken?: string
  emailRedirectTo?: string
  [HONEYPOT_FIELD_NAME]?: string
}

// Generic 200-style response shape. We mirror Supabase's
// `{ error: string }` convention so the existing auth library can
// surface server messages without special-casing.
function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: NextRequest) {
  let body: SignupBody
  try {
    body = (await request.json()) as SignupBody
  } catch {
    return fail(400, 'Invalid request body')
  }

  // 1. Honeypot — cheapest possible reject. Runs BEFORE captcha or any
  // network call. Bots that fill the hidden field get the generic
  // failure copy so they can't infer why we rejected them.
  if (isHoneypotTriggered(body[HONEYPOT_FIELD_NAME])) {
    return fail(400, HONEYPOT_GENERIC_ERROR)
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  // 2. Shape check — Supabase will validate too but we want a clean
  // error before reaching out to disposable list / network.
  if (!isValidEmail(email)) {
    return fail(400, 'Please enter a valid email address.')
  }
  if (!password || password.length < 8) {
    return fail(400, 'Password must be at least 8 characters.')
  }

  // 3. Disposable-domain blocklist. Subdomain matching covers
  // foo.mailinator.com via the mailinator.com entry.
  if (isDisposableEmail(email)) {
    return fail(400, DISPOSABLE_EMAIL_ERROR)
  }

  // 4. Delegate to Supabase. We keep the captchaToken plumbing the
  // existing client used so Cloudflare Turnstile + Supabase Auth's
  // CAPTCHA integration continue to work.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return fail(500, 'Sign up is temporarily unavailable. Please try again shortly.')
  }

  // Use the anon key (not service role) so Supabase Auth runs the
  // standard signup flow: email confirmation, captcha verification,
  // and the per-IP rate limit. Service role would bypass all three.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const fullName =
    typeof body.full_name === 'string' && body.full_name.trim().length > 0
      ? body.full_name.trim()
      : email.split('@')[0]

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      ...(body.captchaToken ? { captchaToken: body.captchaToken } : {}),
      ...(body.emailRedirectTo ? { emailRedirectTo: body.emailRedirectTo } : {}),
    },
  })

  if (error) {
    return fail(400, error.message)
  }

  return NextResponse.json({
    ok: true,
    requiresEmailConfirmation: !data.session,
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  })
}
