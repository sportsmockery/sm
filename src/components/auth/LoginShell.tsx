'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Flame } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

const valueProps = [
  {
    title: 'Follow your teams',
    body: 'Save your favorite Chicago teams and surface the news, rumors, and analysis that matter to you.',
  },
  {
    title: 'Get in faster',
    body: 'Skip the noise — return to the latest coverage, your saved articles, and Scout AI in one tap.',
  },
  {
    title: 'Personalized experience',
    body: 'Tune the feed, vote in fan polls, post takes, and shape the platform around how you follow Chicago.',
  },
  {
    title: 'Free Daily 6 AM Email',
    body: 'Wake up to the top Chicago sports stories, edge insights, and what matters today — delivered every morning.',
  },
]

const teamChips = ['Bears', 'Cubs', 'Bulls', 'White Sox', 'Blackhawks']

interface LoginShellProps {
  redirectTo?: string
  defaultTab?: 'signup' | 'signin'
}

export default function LoginShell({ redirectTo = '/admin', defaultTab = 'signup' }: LoginShellProps) {
  const [tab, setTab] = useState<'signup' | 'signin'>(defaultTab)

  return (
    <main
      className="auth-shell relative min-h-screen flex-1 overflow-hidden"
      style={{ background: 'var(--sm-surface)', color: 'var(--sm-text)' }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0 h-32"
          style={{ background: 'linear-gradient(to bottom, rgba(188,0,0,0.08), transparent)' }}
        />
        <div
          className="auth-orb auth-orb-1 absolute"
          style={{
            top: '-5rem',
            right: '-6rem',
            width: '20rem',
            height: '20rem',
            borderRadius: '50%',
            background: 'rgba(188,0,0,0.10)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="auth-orb auth-orb-2 absolute"
          style={{
            bottom: '-7rem',
            left: '8%',
            width: '18rem',
            height: '18rem',
            borderRadius: '50%',
            background: 'rgba(188,0,0,0.07)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Top header bar */}
        <header
          className="px-4 py-4 sm:px-6 lg:px-10"
          style={{ borderBottom: '1px solid var(--sm-border)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/" aria-label="Sports Mockery home" className="flex shrink-0 items-center">
                <Image
                  src="/logos/SM_Full_v2.png"
                  alt="Sports Mockery"
                  width={140}
                  height={35}
                  className="dark:hidden"
                  priority
                />
                <Image
                  src="/logos/v2_SM_Whole.png"
                  alt="Sports Mockery"
                  width={140}
                  height={35}
                  className="hidden dark:block"
                  priority
                />
              </Link>
              <span
                className="hidden truncate text-[11px] font-semibold uppercase sm:inline"
                style={{ color: 'var(--sm-text-muted)', letterSpacing: '0.18em' }}
              >
                · Account access
              </span>
            </div>

            <span
              className="hidden rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex"
              style={{
                border: '1px solid var(--sm-border)',
                background: 'var(--sm-card)',
                color: 'var(--sm-text-muted)',
                backdropFilter: 'blur(12px)',
              }}
            >
              Fan-powered Chicago sports coverage
            </span>
          </div>
        </header>

        {/* Body */}
        <section className="flex flex-1 items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid w-full items-stretch gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,520px)] lg:gap-10 xl:gap-12">
            {/* Marketing column — second on mobile, first on desktop */}
            <div className="order-2 flex max-w-2xl flex-col justify-center lg:order-1">
              <div
                className="auth-enter-up mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase sm:text-xs"
                style={{
                  border: '1px solid rgba(188,0,0,0.25)',
                  background: 'rgba(188,0,0,0.08)',
                  color: '#bc0000',
                  letterSpacing: '0.14em',
                }}
              >
                <Flame className="h-3.5 w-3.5" aria-hidden />
                Built for Chicago fans
              </div>

              <h1
                className="auth-enter-up max-w-[14ch] text-3xl font-bold sm:text-4xl lg:text-5xl xl:text-6xl"
                style={{ color: 'var(--sm-text)', letterSpacing: '-0.04em', lineHeight: 1.05 }}
              >
                Create your account and follow Chicago sports your way.
              </h1>

              <p
                className="auth-enter-up-delay mt-5 max-w-xl text-sm leading-7 sm:text-base sm:leading-8 lg:text-lg"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                Sports Mockery brings Chicago sports news, rumors, analytics, Scout AI, and fan
                debate together in one place. Creating an account makes the experience faster,
                cleaner, and more personal — and gets you the free 6 AM daily email.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {valueProps.map((item, index) => (
                  <div
                    key={item.title}
                    className="auth-card-in p-5"
                    style={{
                      border: '1px solid var(--sm-border)',
                      background: 'var(--sm-card)',
                      borderRadius: 'var(--sm-radius-lg)',
                      animationDelay: `${index * 70 + 90}ms`,
                    }}
                  >
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--sm-text)', letterSpacing: '-0.01em' }}>
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--sm-text-muted)' }}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
                {teamChips.map((team, index) => (
                  <span
                    key={team}
                    className="auth-chip-in rounded-full px-3 py-2 text-xs font-medium sm:text-sm"
                    style={{
                      border: '1px solid var(--sm-border)',
                      background: 'var(--sm-card)',
                      color: 'var(--sm-text)',
                      animationDelay: `${index * 60 + 180}ms`,
                    }}
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>

            {/* Auth card — first on mobile, second on desktop */}
            <div className="order-1 flex items-center justify-center lg:order-2 lg:justify-end">
              <div
                className="auth-panel-in w-full max-w-[520px] p-5 sm:p-7 lg:p-8"
                style={{
                  border: '1px solid var(--sm-border)',
                  background: 'var(--sm-card)',
                  borderRadius: 'var(--sm-radius-xl)',
                  boxShadow: '0 20px 50px -20px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase sm:text-xs"
                      style={{ color: 'var(--sm-text-muted)', letterSpacing: '0.18em' }}
                    >
                      Join Sports Mockery
                    </p>
                    <h2
                      className="mt-2 text-2xl font-bold sm:text-3xl"
                      style={{ color: 'var(--sm-text)', letterSpacing: '-0.03em' }}
                    >
                      {tab === 'signup' ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-6" style={{ color: 'var(--sm-text-muted)' }}>
                      {tab === 'signup'
                        ? 'Free, takes ~30 seconds. Includes the daily 6 AM Chicago sports email.'
                        : 'Sign in to get back to your saved teams, takes, and personalized feed.'}
                    </p>
                  </div>

                  <span
                    className="hidden rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase sm:inline-flex"
                    style={{
                      border: '1px solid rgba(188,0,0,0.25)',
                      background: 'rgba(188,0,0,0.08)',
                      color: '#bc0000',
                      letterSpacing: '0.14em',
                    }}
                  >
                    Free
                  </span>
                </div>

                {/* Segmented tabs */}
                <div
                  role="tablist"
                  aria-label="Account access"
                  className="mt-6 grid grid-cols-2 gap-1 p-1"
                  style={{
                    border: '1px solid var(--sm-border)',
                    background: 'var(--sm-surface)',
                    borderRadius: 'var(--sm-radius-md)',
                  }}
                >
                  {(['signup', 'signin'] as const).map((value) => {
                    const isActive = tab === value
                    return (
                      <button
                        key={value}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`auth-panel-${value}`}
                        id={`auth-tab-${value}`}
                        type="button"
                        onClick={() => setTab(value)}
                        className="auth-tab h-11 rounded-[12px] text-sm font-medium transition-colors"
                        style={{
                          background: isActive ? 'var(--sm-card)' : 'transparent',
                          color: isActive ? 'var(--sm-text)' : 'var(--sm-text-muted)',
                          boxShadow: isActive
                            ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)'
                            : 'none',
                          border: isActive ? '1px solid var(--sm-border)' : '1px solid transparent',
                        }}
                      >
                        {value === 'signup' ? 'Create account' : 'Sign in'}
                      </button>
                    )
                  })}
                </div>

                {/* Tab panels — render only the active one to keep DOM clean and forms focused */}
                <div className="mt-6">
                  {tab === 'signup' ? (
                    <div
                      key="signup"
                      role="tabpanel"
                      id="auth-panel-signup"
                      aria-labelledby="auth-tab-signup"
                      className="auth-form-swap"
                    >
                      <SignupForm />
                    </div>
                  ) : (
                    <div
                      key="signin"
                      role="tabpanel"
                      id="auth-panel-signin"
                      aria-labelledby="auth-tab-signin"
                      className="auth-form-swap"
                    >
                      <LoginForm redirectTo={redirectTo} />
                    </div>
                  )}
                </div>

                <p className="mt-5 text-center text-xs leading-5" style={{ color: 'var(--sm-text-muted)' }}>
                  By continuing, you agree to our{' '}
                  <Link href="/terms" style={{ color: '#bc0000', textDecoration: 'none', fontWeight: 500 }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" style={{ color: '#bc0000', textDecoration: 'none', fontWeight: 500 }}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
