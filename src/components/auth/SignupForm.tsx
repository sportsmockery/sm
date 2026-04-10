'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

type TeamOption = {
  slug: string
  name: string
  sport: string
  color: string
}

const TEAMS: TeamOption[] = [
  { slug: 'bears', name: 'Bears', sport: 'NFL', color: '#C83803' },
  { slug: 'bulls', name: 'Bulls', sport: 'NBA', color: '#CE1141' },
  { slug: 'cubs', name: 'Cubs', sport: 'MLB', color: '#0E3386' },
  { slug: 'blackhawks', name: 'Blackhawks', sport: 'NHL', color: '#00833E' },
  { slug: 'white-sox', name: 'White Sox', sport: 'MLB', color: '#27251F' },
]

type InterestOption = {
  id: string
  label: string
  icon: string
}

const INTERESTS: InterestOption[] = [
  { id: 'breaking_news', label: 'Breaking News & Rumors', icon: '⚡' },
  { id: 'stats_analytics', label: 'Stats & Analytics', icon: '📊' },
  { id: 'trades_fa', label: 'Trades & Free Agency', icon: '🔄' },
  { id: 'game_day', label: 'Game Day Coverage', icon: '🏟️' },
  { id: 'fan_debate', label: 'Fan Debate & Hot Takes', icon: '🔥' },
  { id: 'draft_prospects', label: 'Draft & Prospects', icon: '🎯' },
]

export default function SignupForm() {
  const { signUp } = useAuth()

  // Step tracking
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 — Account
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Step 2 — Personalization
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [notifPrefs, setNotifPrefs] = useState({
    breaking_news: true,
    game_alerts: true,
    weekly_digest: true,
    trade_rumors: false,
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Password strength
  const getPasswordStrength = (pass: string) => {
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.match(/[a-z]/)) strength++
    if (pass.match(/[A-Z]/)) strength++
    if (pass.match(/[0-9]/)) strength++
    if (pass.match(/[^a-zA-Z0-9]/)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['#BC0000', '#BC0000', '#eab308', '#84cc16', '#00D4FF']

  // Step 1 validation
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!acceptTerms) {
      setError('You must accept the terms and conditions')
      return
    }

    setStep(2)
  }

  // Toggle team selection
  const toggleTeam = (slug: string) => {
    setSelectedTeams(prev =>
      prev.includes(slug)
        ? prev.filter(t => t !== slug)
        : [...prev, slug]
    )
  }

  // Toggle interest selection
  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  // Toggle notification pref
  const toggleNotif = (key: string) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  // Final submit — create account + save preferences
  const handleSubmit = async () => {
    setError('')

    if (selectedTeams.length === 0) {
      setError('Pick at least one team')
      return
    }

    setLoading(true)

    // 1. Create account
    const { error: signUpError } = await signUp(email, password, { full_name: fullName })
    if (signUpError) {
      setError(signUpError)
      setLoading(false)
      return
    }

    // 2. Save preferences via API (uses cookie auth from signup)
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoriteTeams: selectedTeams,
          notificationPrefs: notifPrefs,
          contentInterests: selectedInterests,
        }),
      })
    } catch {
      // Non-blocking — preferences can be set later
      console.warn('Could not save initial preferences')
    }

    setSuccess(true)
    setLoading(false)
  }

  // ── Success state ──
  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: 32, height: 32, color: '#00D4FF' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--sm-text)', marginBottom: '8px' }}>Check your email</h3>
        <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
          We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
        <Link
          href="/login"
          style={{ display: 'inline-block', marginTop: '24px', fontSize: '14px', fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}
        >
          Back to login
        </Link>
      </div>
    )
  }

  // ── Step indicator ──
  const stepIndicator = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700,
        background: step === 1 ? '#BC0000' : 'rgba(188,0,0,0.15)',
        color: step === 1 ? '#fff' : '#BC0000',
        transition: 'all 0.2s',
      }}>1</div>
      <div style={{ width: 32, height: 2, background: step === 2 ? '#BC0000' : 'var(--sm-surface, rgba(255,255,255,0.08))', transition: 'background 0.2s' }} />
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700,
        background: step === 2 ? '#BC0000' : 'rgba(188,0,0,0.15)',
        color: step === 2 ? '#fff' : 'var(--sm-text-dim, #999)',
        transition: 'all 0.2s',
      }}>2</div>
    </div>
  )

  // ── Step 1: Account ──
  if (step === 1) {
    return (
      <>
        {stepIndicator}
        <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <ErrorBanner message={error} />}

          <div>
            <label htmlFor="fullName" style={labelStyle}>Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              required autoComplete="name" className="sm-input" placeholder="John Doe" />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" className="sm-input" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="new-password" className="sm-input" placeholder="********" />
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      height: '6px', flex: 1, borderRadius: '9999px',
                      background: i < passwordStrength ? strengthColors[passwordStrength - 1] : 'var(--sm-surface)',
                    }} />
                  ))}
                </div>
                <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
                  Password strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              required autoComplete="new-password" className="sm-input" placeholder="********" />
            {confirmPassword && password !== confirmPassword && (
              <p style={{ marginTop: '4px', fontSize: '12px', color: '#BC0000' }}>Passwords do not match</p>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
              style={{ marginTop: 4, width: 16, height: 16, accentColor: '#bc0000' }} />
            <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
              I agree to the{' '}
              <Link href="/terms" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>Privacy Policy</Link>
            </span>
          </label>

          <button type="submit" className="btn-primary btn-full">
            Continue
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </form>
      </>
    )
  }

  // ── Step 2: Personalization ──
  return (
    <>
      {stepIndicator}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {error && <ErrorBanner message={error} />}

        {/* Teams */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sm-text)', marginBottom: '4px' }}>
            Which teams do you follow?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--sm-text-dim)', marginBottom: '12px' }}>
            Pick at least one. This shapes your entire feed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TEAMS.map(team => {
              const selected = selectedTeams.includes(team.slug)
              return (
                <button
                  key={team.slug}
                  type="button"
                  onClick={() => toggleTeam(team.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${selected ? team.color : 'var(--sm-surface, rgba(255,255,255,0.08))'}`,
                    background: selected ? `${team.color}12` : 'transparent',
                    color: 'var(--sm-text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: '15px',
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: `2px solid ${selected ? team.color : 'var(--sm-text-dim, #666)'}`,
                    background: selected ? team.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span>{team.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, color: 'var(--sm-text-dim)', letterSpacing: '0.05em' }}>
                    {team.sport}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Interests */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sm-text)', marginBottom: '4px' }}>
            What are you most interested in?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--sm-text-dim)', marginBottom: '12px' }}>
            Pick 2-3 to tune your feed. You can change these anytime.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {INTERESTS.map(interest => {
              const selected = selectedInterests.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: `2px solid ${selected ? '#BC0000' : 'var(--sm-surface, rgba(255,255,255,0.08))'}`,
                    background: selected ? 'rgba(188,0,0,0.08)' : 'transparent',
                    color: 'var(--sm-text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    width: '100%',
                    fontSize: '13px',
                    fontWeight: selected ? 600 : 400,
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{interest.icon}</span>
                  <span style={{ lineHeight: 1.3 }}>{interest.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sm-text)', marginBottom: '4px' }}>
            Notifications
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--sm-text-dim)', marginBottom: '12px' }}>
            What should we alert you about?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([
              { key: 'breaking_news', label: 'Breaking news', desc: 'Major trades, injuries, signings' },
              { key: 'game_alerts', label: 'Game day alerts', desc: 'Scores, starts, and finishes' },
              { key: 'weekly_digest', label: 'Weekly digest', desc: 'Top stories you may have missed' },
              { key: 'trade_rumors', label: 'Trade rumors', desc: 'Speculation and front office intel' },
            ] as const).map(notif => (
              <label
                key={notif.key}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: notifPrefs[notif.key] ? 'rgba(188,0,0,0.05)' : 'transparent',
                  border: '1px solid var(--sm-surface, rgba(255,255,255,0.06))',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)' }}>{notif.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--sm-text-dim)', marginTop: '2px' }}>{notif.desc}</div>
                </div>
                <div
                  onClick={(e) => { e.preventDefault(); toggleNotif(notif.key) }}
                  style={{
                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                    background: notifPrefs[notif.key] ? '#BC0000' : 'var(--sm-surface, rgba(255,255,255,0.12))',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: notifPrefs[notif.key] ? 20 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
              background: 'transparent', color: 'var(--sm-text-dim)',
              border: '1px solid var(--sm-surface, rgba(255,255,255,0.1))',
              fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{
              flex: 1,
              ...(loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Shared styles ──
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '14px', fontWeight: 500,
  color: 'var(--sm-text)', marginBottom: '6px',
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      borderRadius: 'var(--sm-radius-md)',
      background: 'rgba(188,0,0,0.1)',
      border: '1px solid rgba(188,0,0,0.2)',
      padding: '14px 16px',
      fontSize: '14px',
      color: '#ff6666',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }}>
      <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      {message}
    </div>
  )
}
