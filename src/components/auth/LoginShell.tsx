'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

const benefits = [
  'Get to Bears, Bulls, Cubs, Sox and Hawks coverage faster — every day.',
  'Personalize the feed around the Chicago teams you actually follow.',
  'Unlock daily rumors, analysis, and the free 6 AM Chicago sports email.',
]

const tags = ['Bears', 'Bulls', 'Cubs', 'White Sox', 'Blackhawks', 'Rumors', 'Analysis', 'Daily Email']

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
      {/* Ambient background — single soft red wash on the editorial side */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-y-0 left-0 w-1/2"
          style={{ background: 'linear-gradient(135deg, rgba(188,0,0,0.06), transparent 55%)' }}
        />
      </div>

      <section className="relative flex min-h-screen items-stretch px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8 xl:px-10 xl:py-10">
        <div
          className="auth-panel-in relative grid w-full grid-cols-1 overflow-hidden lg:grid-cols-[1.1fr_0.9fr]"
          style={{
            border: '1px solid var(--sm-border)',
            background: 'var(--sm-card)',
            borderRadius: '28px',
            boxShadow: '0 20px 50px -20px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.10)',
          }}
        >
          {/* ===== Editorial column ===== */}
          <div
            className="order-2 flex flex-col justify-between border-t p-6 sm:p-8 xl:p-12 lg:order-1 lg:border-r lg:border-t-0"
            style={{ borderColor: 'var(--sm-border)' }}
          >
            <div>
              {/* Small logo */}
              <div className="auth-enter-up mb-8">
                <Link href="/" aria-label="Sports Mockery home" className="inline-flex shrink-0 items-center">
                  <Image
                    src="/logos/SM_Full_v2.png"
                    alt="Sports Mockery"
                    width={120}
                    height={30}
                    className="dark:hidden"
                    priority
                  />
                  <Image
                    src="/logos/v2_SM_Whole.png"
                    alt="Sports Mockery"
                    width={120}
                    height={30}
                    className="hidden dark:block"
                    priority
                  />
                </Link>
              </div>

              {/* One eyebrow only */}
              <span
                className="auth-enter-up inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
                style={{
                  border: '1px solid rgba(188,0,0,0.25)',
                  background: 'rgba(188,0,0,0.08)',
                  color: '#bc0000',
                  letterSpacing: '0.16em',
                }}
              >
                Built for Chicago fans
              </span>

              <h1
                className="auth-enter-up mt-5 max-w-[18ch] text-balance text-[34px] font-bold leading-[1.02] sm:text-5xl xl:text-[58px]"
                style={{ color: 'var(--sm-text)', letterSpacing: '-0.045em' }}
              >
                Get to the stories that matter before everyone else.
              </h1>

              <p
                className="auth-enter-up-delay mt-5 max-w-xl text-base leading-7 sm:text-[17px] sm:leading-8"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                Sports Mockery is the membership wall for fan-powered Chicago coverage —
                rumors, analysis, and the daily 6 AM email, built around the teams you follow.
              </p>

              {/* 3 concise benefit rows */}
              <ul
                className="mt-9 space-y-0 border-b"
                style={{ borderColor: 'var(--sm-border)' }}
              >
                {benefits.map((item, index) => (
                  <li
                    key={item}
                    className="auth-card-in flex items-start gap-3 border-t py-4"
                    style={{
                      borderColor: 'var(--sm-border)',
                      animationDelay: `${index * 70 + 90}ms`,
                    }}
                  >
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(188,0,0,0.12)', color: '#bc0000' }}
                      aria-hidden
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <p className="text-[15px] leading-7" style={{ color: 'var(--sm-text)' }}>
                      {item}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Compact tag grid */}
              <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tags.map((item, index) => (
                  <div
                    key={item}
                    className="auth-chip-in text-center text-xs font-medium sm:text-[13px]"
                    style={{
                      border: '1px solid var(--sm-border)',
                      background: 'var(--sm-surface)',
                      color: 'var(--sm-text-muted)',
                      borderRadius: 'var(--sm-radius-md)',
                      padding: '10px 8px',
                      animationDelay: `${index * 50 + 180}ms`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer line */}
            <div
              className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-6 text-xs sm:text-[13px]"
              style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)' }}
            >
              <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
                Chicago&apos;s home for fan-powered coverage
              </span>
              <span className="hidden h-1 w-1 rounded-full sm:inline-block" style={{ background: 'var(--sm-border)' }} />
              <span>News</span>
              <span className="hidden h-1 w-1 rounded-full sm:inline-block" style={{ background: 'var(--sm-border)' }} />
              <span>Rumors</span>
              <span className="hidden h-1 w-1 rounded-full sm:inline-block" style={{ background: 'var(--sm-border)' }} />
              <span>Analysis</span>
            </div>
          </div>

          {/* ===== Auth column ===== */}
          <div
            className="order-1 flex flex-col justify-center p-6 sm:p-8 xl:p-12 lg:order-2"
            style={{ background: 'var(--sm-surface)' }}
          >
            <div className="mx-auto w-full max-w-md">
              <div className="mb-6">
                <p
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: 'var(--sm-text-muted)', letterSpacing: '0.18em' }}
                >
                  Account access
                </p>
                <h2
                  className="mt-2 text-[28px] font-bold sm:text-3xl"
                  style={{ color: 'var(--sm-text)', letterSpacing: '-0.035em', lineHeight: 1.1 }}
                >
                  {tab === 'signup' ? 'Create your account' : 'Welcome back'}
                </h2>
                <p className="mt-3 text-sm leading-6" style={{ color: 'var(--sm-text-muted)' }}>
                  {tab === 'signup'
                    ? 'Free. ~30 seconds. Includes the daily 6 AM Chicago sports email.'
                    : 'Sign in to get back to your saved teams, takes, and personalized feed.'}
                </p>
              </div>

              {/* Segmented tabs */}
              <div
                role="tablist"
                aria-label="Account access"
                className="mb-6 grid grid-cols-2 gap-1 p-1"
                style={{
                  border: '1px solid var(--sm-border)',
                  background: 'var(--sm-card)',
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
                      className="auth-tab h-11 rounded-[12px] text-sm font-semibold transition-colors"
                      style={{
                        background: isActive ? 'var(--sm-surface)' : 'transparent',
                        color: isActive ? 'var(--sm-text)' : 'var(--sm-text-muted)',
                        boxShadow: isActive
                          ? '0 1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.10)'
                          : 'none',
                        border: isActive ? '1px solid var(--sm-border)' : '1px solid transparent',
                      }}
                    >
                      {value === 'signup' ? 'Create account' : 'Sign in'}
                    </button>
                  )
                })}
              </div>

              {/* Active form — auth logic untouched */}
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
          </div>
        </div>
      </section>
    </main>
  )
}
