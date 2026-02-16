'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function HomeSignupForm() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
  const strengthColors = ['hm-strength-1', 'hm-strength-2', 'hm-strength-3', 'hm-strength-4', 'hm-strength-5']

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

  const inputStyle = {
    width: '100%', padding: '16px 20px', borderRadius: 14,
    background: '#0c0c12', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: 16, fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#22c55e">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Check your email</h3>
        <p style={{ fontSize: 15, color: '#8a8a9a', lineHeight: 1.5 }}>
          We&apos;ve sent a confirmation link to <strong style={{ color: '#fff' }}>{email}</strong>. Click the link to activate your account.
        </p>
        <Link
          href="/home/login"
          style={{ display: 'inline-block', marginTop: 24, fontSize: 15, fontWeight: 600, color: '#ff4444', textDecoration: 'none' }}
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(188, 0, 0, 0.12)',
          border: '1px solid rgba(188, 0, 0, 0.25)',
          fontSize: 14, color: '#ff6666',
        }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label htmlFor="hm-fullname" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#8a8a9a', marginBottom: 10, letterSpacing: 0.2 }}>
          Full Name
        </label>
        <input
          id="hm-fullname"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          placeholder="John Doe"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(188,0,0,0.4)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="hm-signup-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#8a8a9a', marginBottom: 10, letterSpacing: 0.2 }}>
          Email address
        </label>
        <input
          id="hm-signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(188,0,0,0.4)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="hm-signup-password" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#8a8a9a', marginBottom: 10, letterSpacing: 0.2 }}>
          Password
        </label>
        <input
          id="hm-signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(188,0,0,0.4)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        {/* Password strength indicator */}
        {password && (
          <>
            <div className="hm-strength-bar">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`hm-strength-segment ${i < passwordStrength ? strengthColors[passwordStrength - 1] : ''}`}
                />
              ))}
            </div>
            <p style={{ marginTop: 6, fontSize: 12, color: '#8a8a9a' }}>
              Password strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
            </p>
          </>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="hm-confirm-password" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#8a8a9a', marginBottom: 10, letterSpacing: 0.2 }}>
          Confirm Password
        </label>
        <input
          id="hm-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="••••••••"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(188,0,0,0.4)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        {confirmPassword && password !== confirmPassword && (
          <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>Passwords do not match</p>
        )}
      </div>

      {/* Terms checkbox */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          style={{ accentColor: '#bc0000', width: 16, height: 16, marginTop: 2, flexShrink: 0 }}
        />
        <span style={{ fontSize: 14, color: '#8a8a9a', lineHeight: 1.5 }}>
          I agree to the{' '}
          <Link href="/terms" style={{ fontWeight: 600, color: '#ff4444', textDecoration: 'none' }}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" style={{ fontWeight: 600, color: '#ff4444', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
        </span>
      </label>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="hm-btn-primary"
        style={{
          width: '100%', justifyContent: 'center',
          padding: '18px 32px', fontSize: 16,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Login link */}
      <p style={{ textAlign: 'center', fontSize: 15, color: '#8a8a9a', margin: 0 }}>
        Already have an account?{' '}
        <Link href="/home/login" style={{ fontWeight: 600, color: '#ff4444', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>

      {/* Skip divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: 12, color: '#55556a', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Skip */}
      <a
        href="https://test.sportsmockery.com"
        style={{
          display: 'block', textAlign: 'center',
          padding: '16px 32px', borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#8a8a9a', fontSize: 15, fontWeight: 600,
          textDecoration: 'none', transition: 'all 0.2s',
        }}
      >
        Skip Sign Up
      </a>
    </form>
  )
}
