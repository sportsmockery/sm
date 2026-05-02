'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface LoginShellProps {
  redirectTo?: string
  defaultTab?: 'signup' | 'signin'
  /** "12,000+" — pre-formatted, "" hides the social-proof line */
  subscriberLabel?: string
  /** Latest published brief headline — overrides primary card title when present */
  latestBriefTitle?: string
  /** "Today · Bears" — overrides primary card meta when present */
  latestBriefMeta?: string
}

// Product preview cards — primary (red brand) > secondary (cyan intel) > tertiary (gold premium).
// Order matters: index 0 → reel-card-1 (dominant), index 1 → -2, index 2 → -3.
const reel = [
  {
    accent: 'red' as const,
    eyebrow: 'Daily 6 AM Brief',
    eyebrowMeta: 'Today · Bears',
    title: 'Caleb Williams just had his sharpest half of the season.',
    meta: 'Free morning email · 5-min read',
  },
  {
    accent: 'cyan' as const,
    eyebrow: 'Scout AI',
    eyebrowMeta: 'Bulls · Live',
    title: "Why Chicago's offensive efficiency quietly jumped 18% in November.",
    meta: 'Ask anything about your teams',
  },
  {
    accent: 'gold' as const,
    eyebrow: 'GM Trade Simulator',
    eyebrowMeta: 'Grade A · 91',
    title: 'Bulls send DeMar to Phoenix — model rates the deal Top 5%.',
    meta: 'Grade your own trade',
  },
]

const teamChips: Array<{ name: string; dot: string }> = [
  { name: 'Bears', dot: '#C83803' },
  { name: 'Bulls', dot: '#CE1141' },
  { name: 'Cubs', dot: '#0E3386' },
  { name: 'White Sox', dot: '#9CA3AF' },
  { name: 'Blackhawks', dot: '#00833E' },
]

export default function LoginShell({
  redirectTo = '/admin',
  defaultTab = 'signup',
  subscriberLabel = '',
  latestBriefTitle = '',
  latestBriefMeta = '',
}: LoginShellProps) {
  const router = useRouter()
  const { signUp, signIn } = useAuth()

  // Primary card uses live brief data when available; falls back to the static
  // copy so the page still feels finished if the queries fail.
  const liveReel = latestBriefTitle
    ? [
        {
          ...reel[0],
          title: latestBriefTitle,
          eyebrowMeta: latestBriefMeta || reel[0].eyebrowMeta,
        },
        reel[1],
        reel[2],
      ]
    : reel

  const [tab, setTab] = useState<'signup' | 'signin'>(defaultTab)

  // ========== Signup state (email-first 2-step) ==========
  // Step 1 captures email + daily-email opt-in.
  // Step 2 captures name + password + terms (existing Supabase signUp() requires these).
  const [signupStep, setSignupStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [dailyEmail, setDailyEmail] = useState(true) // CHECKED BY DEFAULT
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)

  // ========== Signin state ==========
  const [signinEmail, setSigninEmail] = useState('')
  const [signinPassword, setSigninPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showSigninPassword, setShowSigninPassword] = useState(false)
  const [signinError, setSigninError] = useState('')
  const [signinLoading, setSigninLoading] = useState(false)

  const passwordStrength = (() => {
    let s = 0
    if (password.length >= 8) s++
    if (password.match(/[a-z]/)) s++
    if (password.match(/[A-Z]/)) s++
    if (password.match(/[0-9]/)) s++
    if (password.match(/[^a-zA-Z0-9]/)) s++
    return s
  })()
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['#BC0000', '#BC0000', '#eab308', '#84cc16', '#00D4FF']

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  // Step 1 submit — advances to step 2; doesn't call Supabase yet.
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')
    if (!isValidEmail(email)) {
      setSignupError('Please enter a valid email address')
      return
    }
    setSignupStep(2)
  }

  // Step 2 submit — full account creation via existing Supabase auth, then
  // newsletter subscribe gated on the daily-email checkbox from step 1.
  const handleSignupComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError('')

    if (password !== confirmPassword) {
      setSignupError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setSignupError('Password must be at least 8 characters')
      return
    }
    if (!acceptTerms) {
      setSignupError('You must accept the terms and conditions')
      return
    }

    setSignupLoading(true)

    const { error } = await signUp(email, password, { full_name: fullName })
    if (error) {
      setSignupError(error)
      setSignupLoading(false)
      return
    }

    // Newsletter subscribe — fire only if user kept the daily email checked.
    // Backend integration point: /api/newsletter/subscribe upserts into
    // sm_newsletter_subscribers + email_subscribers (chicago_daily list).
    if (dailyEmail) {
      fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {})
    }

    setSignupSuccess(true)
    setSignupLoading(false)
  }

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSigninError('')
    setSigninLoading(true)
    const { error } = await signIn(signinEmail, signinPassword, rememberMe)
    if (error) {
      setSigninError(error)
      setSigninLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <main
      className="auth-shell auth-motion-root relative min-h-screen flex-1 overflow-hidden"
      style={{ background: 'var(--sm-surface)', color: 'var(--sm-text)' }}
    >
      {/* Ambient background — restrained, no boxed framing */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-y-0 left-0 w-24"
          style={{
            background:
              'linear-gradient(to right, rgba(188,0,0,0.06), transparent)',
          }}
        />
        <div
          className="absolute h-80 w-80 rounded-full"
          style={{
            right: '8%',
            top: '10%',
            background: 'rgba(188,0,0,0.05)',
            filter: 'blur(96px)',
          }}
        />
      </div>

      <section className="relative px-5 pt-6 pb-10 sm:px-8 sm:pt-8 lg:px-10 lg:pt-8 xl:px-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[430px_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[460px_minmax(0,1fr)]">
          {/* =========================================================
               AUTH COLUMN (mobile order 1, desktop left)
             ========================================================= */}
          <div className="order-1 motion-form">
            <div className="max-w-[460px]">
              {/* Eyebrow */}
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
                style={{
                  border: '1px solid rgba(188,0,0,0.25)',
                  background: 'rgba(188,0,0,0.08)',
                  color: '#bc0000',
                  letterSpacing: '0.18em',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Built for Chicago fans
              </div>

              {/* Headline */}
              <h1
                className="text-4xl font-bold leading-[0.94] sm:text-5xl"
                style={{
                  color: 'var(--sm-text)',
                  letterSpacing: '-0.06em',
                }}
              >
                Chicago sports, sharper.
              </h1>

              {subscriberLabel ? (
                <p
                  className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium"
                  style={{ color: 'var(--sm-text-muted)', letterSpacing: '0.005em' }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: '#00D4FF',
                      boxShadow: '0 0 0 4px rgba(0,212,255,0.12)',
                    }}
                  />
                  Join {subscriberLabel} Chicago fans on the daily brief
                </p>
              ) : null}

              <p
                className="mt-4 max-w-md text-[15px] leading-7"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                The free daily 6 AM brief, Scout AI, and the GM trade simulator
                — built for Bears, Bulls, Cubs, White Sox, and Blackhawks fans.
              </p>

              {/* Auth surface — flat, integrated, no heavy panel */}
              <div
                className="mt-7 p-4 sm:p-5"
                style={{
                  border: '1px solid var(--sm-border)',
                  background: 'var(--sm-card)',
                  borderRadius: '20px',
                }}
              >
                {/* Tabs */}
                <div
                  role="tablist"
                  aria-label="Account access"
                  className="mb-5 grid grid-cols-2 gap-1 p-1"
                  style={{
                    background: 'var(--sm-surface)',
                    borderRadius: '16px',
                  }}
                >
                  {(['signup', 'signin'] as const).map((value) => {
                    const isActive = tab === value
                    return (
                      <button
                        key={value}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        aria-controls={`auth-panel-${value}`}
                        id={`auth-tab-${value}`}
                        onClick={() => setTab(value)}
                        className="auth-tab h-11 text-sm font-semibold transition-colors"
                        style={{
                          background: isActive ? 'var(--sm-card)' : 'transparent',
                          color: isActive ? 'var(--sm-text)' : 'var(--sm-text-muted)',
                          border: isActive
                            ? '1px solid var(--sm-border)'
                            : '1px solid transparent',
                          borderRadius: '12px',
                          boxShadow: isActive
                            ? '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.10)'
                            : 'none',
                        }}
                      >
                        {value === 'signup' ? 'Create account' : 'Sign in'}
                      </button>
                    )
                  })}
                </div>

                {/* SIGNUP TAB */}
                {tab === 'signup' && (
                  <div
                    role="tabpanel"
                    id="auth-panel-signup"
                    aria-labelledby="auth-tab-signup"
                    className="auth-form-swap"
                  >
                    {signupSuccess ? (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            margin: '0 auto 16px',
                            background: 'rgba(0,212,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check
                            style={{ width: 32, height: 32, color: '#00D4FF' }}
                            strokeWidth={2.5}
                          />
                        </div>
                        <h3
                          style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: 'var(--sm-text)',
                            marginBottom: '8px',
                          }}
                        >
                          Check your email
                        </h3>
                        <p
                          style={{
                            fontSize: '14px',
                            color: 'var(--sm-text-muted)',
                            lineHeight: 1.55,
                          }}
                        >
                          We&apos;ve sent a confirmation link to{' '}
                          <strong>{email}</strong>. Click the link to activate
                          your account.
                        </p>
                        {dailyEmail && (
                          <p
                            style={{
                              fontSize: '13px',
                              color: 'var(--sm-text-muted)',
                              marginTop: '12px',
                            }}
                          >
                            You&apos;re also subscribed to the SM Edge Daily —
                            Chicago sports delivered every morning at 6 AM CT.
                          </p>
                        )}
                      </div>
                    ) : signupStep === 1 ? (
                      // ===== STEP 1: EMAIL + DAILY EMAIL CHECKBOX =====
                      <form
                        onSubmit={handleStep1}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                      >
                        {signupError && (
                          <div
                            style={{
                              borderRadius: 'var(--sm-radius-md)',
                              background: 'rgba(188,0,0,0.1)',
                              border: '1px solid rgba(188,0,0,0.2)',
                              padding: '12px 14px',
                              fontSize: '14px',
                              color: '#ff6666',
                            }}
                          >
                            {signupError}
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor="email-first"
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: 'var(--sm-text)',
                              marginBottom: '6px',
                            }}
                          >
                            Email address
                          </label>
                          <div style={{ position: 'relative' }}>
                            <Mail
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 16,
                                height: 16,
                                color: 'var(--sm-text-muted)',
                                pointerEvents: 'none',
                              }}
                            />
                            <input
                              id="email-first"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              autoComplete="email"
                              placeholder="you@example.com"
                              className="sm-input"
                              style={{ paddingLeft: 44, height: 48 }}
                            />
                          </div>
                        </div>

                        {/* Daily email checkbox — checked by default */}
                        <div
                          style={{
                            border: '1px solid var(--sm-border)',
                            background: 'var(--sm-surface)',
                            borderRadius: '12px',
                            padding: '9px 12px',
                          }}
                        >
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              id="daily-email"
                              type="checkbox"
                              checked={dailyEmail}
                              onChange={(e) => setDailyEmail(e.target.checked)}
                              style={{
                                marginTop: 3,
                                width: 16,
                                height: 16,
                                accentColor: '#bc0000',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ display: 'block' }}>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '13.5px',
                                  fontWeight: 500,
                                  color: 'var(--sm-text)',
                                  lineHeight: 1.35,
                                }}
                              >
                                Send me the free daily 6 AM Chicago sports brief
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  marginTop: 2,
                                  fontSize: '11.5px',
                                  color: 'var(--sm-text-muted)',
                                  lineHeight: 1.45,
                                }}
                              >
                                The day's top Chicago stories. No spam. Unsubscribe anytime.
                              </span>
                            </span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="motion-cta btn-primary btn-full"
                          style={{
                            height: 48,
                            borderRadius: '16px',
                            fontSize: 14,
                            padding: '0 20px',
                          }}
                        >
                          Create free account
                          <ArrowRight
                            aria-hidden="true"
                            style={{ width: 16, height: 16, marginLeft: 4 }}
                          />
                        </button>

                        <div
                          style={{
                            paddingTop: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <Check
                              style={{
                                width: 14,
                                height: 14,
                                color: '#bc0000',
                                marginTop: 3,
                                flexShrink: 0,
                              }}
                              strokeWidth={2.5}
                            />
                            <p
                              style={{
                                fontSize: 13,
                                color: 'var(--sm-text-muted)',
                                lineHeight: 1.45,
                              }}
                            >
                              Free forever. No credit card.
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <Check
                              style={{
                                width: 14,
                                height: 14,
                                color: '#bc0000',
                                marginTop: 3,
                                flexShrink: 0,
                              }}
                              strokeWidth={2.5}
                            />
                            <p
                              style={{
                                fontSize: 13,
                                color: 'var(--sm-text-muted)',
                                lineHeight: 1.45,
                              }}
                            >
                              Daily 6 AM brief · Scout AI · GM trade grading
                            </p>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: 12,
                            color: 'var(--sm-text-muted)',
                            lineHeight: 1.55,
                          }}
                        >
                          By continuing, you agree to the{' '}
                          <Link
                            href="/terms"
                            style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}
                          >
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link
                            href="/privacy"
                            style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}
                          >
                            Privacy Policy
                          </Link>
                          .
                        </p>
                      </form>
                    ) : (
                      // ===== STEP 2: NAME + PASSWORD + TERMS =====
                      <form
                        onSubmit={handleSignupComplete}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSignupError('')
                              setSignupStep(1)
                            }}
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: 'var(--sm-text-muted)',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            ← Back
                          </button>
                          <span
                            style={{
                              fontSize: 12,
                              color: 'var(--sm-text-muted)',
                              maxWidth: '60%',
                              textAlign: 'right',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={email}
                          >
                            {email}
                          </span>
                        </div>

                        {signupError && (
                          <div
                            style={{
                              borderRadius: 'var(--sm-radius-md)',
                              background: 'rgba(188,0,0,0.1)',
                              border: '1px solid rgba(188,0,0,0.2)',
                              padding: '12px 14px',
                              fontSize: '14px',
                              color: '#ff6666',
                            }}
                          >
                            {signupError}
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor="fullName"
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: 'var(--sm-text)',
                              marginBottom: '6px',
                            }}
                          >
                            Full name
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            autoComplete="name"
                            className="sm-input"
                            placeholder="John Doe"
                            style={{ height: 48 }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="password"
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: 'var(--sm-text)',
                              marginBottom: '6px',
                            }}
                          >
                            Password
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              id="password"
                              type={showSignupPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              autoComplete="new-password"
                              className="sm-input"
                              placeholder="At least 8 characters"
                              style={{ paddingRight: 48, height: 48 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword((v) => !v)}
                              aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                              aria-pressed={showSignupPassword}
                              style={{
                                position: 'absolute',
                                right: 4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--sm-text-muted)',
                                borderRadius: 8,
                                minWidth: 44,
                                minHeight: 44,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {showSignupPassword ? (
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83m-3.97-3.97A9.96 9.96 0 002.458 12c1.274 4.057 5.064 7 9.542 7 1.943 0 3.74-.555 5.255-1.515M21.542 12c-.41-1.31-1.082-2.515-1.96-3.55M16.5 16.5L21 21" />
                                </svg>
                              ) : (
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {password && (
                            <div aria-live="polite" style={{ marginTop: 8 }}>
                              <div
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={5}
                                aria-valuenow={passwordStrength}
                                style={{ display: 'flex', gap: 4 }}
                              >
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <div
                                    key={i}
                                    style={{
                                      height: 6,
                                      flex: 1,
                                      borderRadius: 9999,
                                      background:
                                        i < passwordStrength
                                          ? strengthColors[passwordStrength - 1]
                                          : 'var(--sm-surface)',
                                    }}
                                  />
                                ))}
                              </div>
                              <p
                                style={{
                                  marginTop: 4,
                                  fontSize: 12,
                                  color: 'var(--sm-text-dim)',
                                }}
                              >
                                Password strength:{' '}
                                {strengthLabels[passwordStrength - 1] || 'Too weak'}
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="confirmPassword"
                            style={{
                              display: 'block',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: 'var(--sm-text)',
                              marginBottom: '6px',
                            }}
                          >
                            Confirm password
                          </label>
                          <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="sm-input"
                            placeholder="********"
                            style={{ height: 48 }}
                          />
                          {confirmPassword && password !== confirmPassword && (
                            <p style={{ marginTop: 4, fontSize: 12, color: '#BC0000' }}>
                              Passwords do not match
                            </p>
                          )}
                        </div>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            style={{
                              marginTop: 4,
                              width: 16,
                              height: 16,
                              accentColor: '#bc0000',
                            }}
                          />
                          <span style={{ fontSize: 13, color: 'var(--sm-text-muted)', lineHeight: 1.5 }}>
                            I agree to the{' '}
                            <Link href="/terms" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
                              Privacy Policy
                            </Link>
                            .
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={signupLoading}
                          className="btn-primary btn-full"
                          style={{
                            height: 48,
                            borderRadius: '16px',
                            fontSize: 14,
                            padding: '0 20px',
                            ...(signupLoading
                              ? { opacity: 0.6, cursor: 'not-allowed' }
                              : {}),
                          }}
                        >
                          {signupLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <svg
                                style={{
                                  width: 18,
                                  height: 18,
                                  animation: 'spin 1s linear infinite',
                                }}
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Creating account...
                            </span>
                          ) : (
                            <>
                              Create account
                              <ArrowRight aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 4 }} />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* SIGNIN TAB */}
                {tab === 'signin' && (
                  <div
                    role="tabpanel"
                    id="auth-panel-signin"
                    aria-labelledby="auth-tab-signin"
                    className="auth-form-swap"
                  >
                    <form
                      onSubmit={handleSignin}
                      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                    >
                      {signinError && (
                        <div
                          style={{
                            borderRadius: 'var(--sm-radius-md)',
                            background: 'rgba(188,0,0,0.1)',
                            border: '1px solid rgba(188,0,0,0.2)',
                            padding: '12px 14px',
                            fontSize: 14,
                            color: '#ff6666',
                          }}
                        >
                          {signinError}
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="signin-email"
                          style={{
                            display: 'block',
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--sm-text)',
                            marginBottom: 6,
                          }}
                        >
                          Email address
                        </label>
                        <input
                          id="signin-email"
                          type="email"
                          value={signinEmail}
                          onChange={(e) => setSigninEmail(e.target.value)}
                          required
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="sm-input"
                          style={{ height: 48 }}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                          }}
                        >
                          <label
                            htmlFor="signin-password"
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: 'var(--sm-text)',
                            }}
                          >
                            Password
                          </label>
                          <Link
                            href="/forgot-password"
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: '#bc0000',
                              textDecoration: 'none',
                            }}
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="signin-password"
                            type={showSigninPassword ? 'text' : 'password'}
                            value={signinPassword}
                            onChange={(e) => setSigninPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            className="sm-input"
                            style={{ paddingRight: 48, height: 48 }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSigninPassword((v) => !v)}
                            aria-label={showSigninPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showSigninPassword}
                            style={{
                              position: 'absolute',
                              right: 4,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--sm-text-muted)',
                              borderRadius: 8,
                              minWidth: 44,
                              minHeight: 44,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {showSigninPassword ? (
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83m-3.97-3.97A9.96 9.96 0 002.458 12c1.274 4.057 5.064 7 9.542 7 1.943 0 3.74-.555 5.255-1.515M21.542 12c-.41-1.31-1.082-2.515-1.96-3.55M16.5 16.5L21 21" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#bc0000' }}
                        />
                        <span style={{ fontSize: 14, color: 'var(--sm-text-muted)' }}>
                          Remember me
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={signinLoading}
                        className="btn-primary btn-full"
                        style={{
                          height: 48,
                          borderRadius: '16px',
                          fontSize: 14,
                          padding: '0 20px',
                          ...(signinLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                        }}
                      >
                        {signinLoading ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg
                              style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                          </span>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 4 }} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================
               MARKETING + REEL COLUMN (mobile order 2, desktop right)
             ========================================================= */}
          <div className="order-2 flex items-start">
            <div className="w-full max-w-4xl pt-1">
              <div className="motion-hero">
                <p
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: 'var(--sm-text-muted)', letterSpacing: '0.18em' }}
                >
                  Inside SM Edge
                </p>
                <h2
                  className="mt-3 text-balance text-2xl font-semibold leading-[1.1] sm:text-[28px] xl:text-[32px]"
                  style={{
                    color: 'var(--sm-text)',
                    letterSpacing: '-0.025em',
                    maxWidth: '22ch',
                  }}
                >
                  Sports intelligence, built for Chicago.
                </h2>
              </div>

              {/* Product preview reel — Daily brief (red), Scout AI (cyan), GM Trade Sim (gold) */}
              <div className="reel-stage mt-7" aria-hidden="true">
                <div className="reel-track">
                  {liveReel.map((item, index) => (
                    <article
                      key={item.title}
                      className={`reel-card reel-card-${index + 1} reel-accent-${item.accent}`}
                    >
                      <div className="reel-card-inner">
                        <div className="reel-card-head">
                          <span className="reel-label">{item.eyebrow}</span>
                          <span className="reel-eyebrow-meta">{item.eyebrowMeta}</span>
                        </div>
                        <h3 className="reel-title">{item.title}</h3>
                        <p className="reel-meta">{item.meta}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Team chip row — replaces the marquee ticker, more premium and Chicago-anchored */}
              <div className="reel-team-chips mt-7" aria-hidden="true">
                {teamChips.map((team) => (
                  <span
                    key={team.name}
                    className="reel-chip"
                    style={{ ['--chip-dot' as string]: team.dot }}
                  >
                    <span className="reel-chip-dot" />
                    {team.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
