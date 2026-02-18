'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function SignupForm() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Password strength calculation
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
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981']

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true)

    const { error } = await signUp(email, password, { full_name: fullName })

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg style={{ width: 32, height: 32, color: '#10b981' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Error message */}
      {error && (
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
          {error}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)', marginBottom: '6px' }}>
          Full Name
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
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)', marginBottom: '6px' }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="sm-input"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)', marginBottom: '6px' }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="sm-input"
          placeholder="********"
        />
        {/* Password strength indicator */}
        {password && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: '6px',
                    flex: 1,
                    borderRadius: '9999px',
                    background: i < passwordStrength ? strengthColors[passwordStrength - 1] : 'var(--sm-surface)',
                  }}
                />
              ))}
            </div>
            <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
              Password strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)', marginBottom: '6px' }}>
          Confirm Password
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
        />
        {confirmPassword && password !== confirmPassword && (
          <p style={{ marginTop: '4px', fontSize: '12px', color: '#ef4444' }}>Passwords do not match</p>
        )}
      </div>

      {/* Terms checkbox */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          style={{ marginTop: 4, width: 16, height: 16, accentColor: '#bc0000' }}
        />
        <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
          I agree to the{' '}
          <Link href="/terms" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary btn-full"
        style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* Login link */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
