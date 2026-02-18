'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await resetPassword(email)

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
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--sm-text)', marginBottom: '8px' }}>Check your email</h3>
        <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
          We&apos;ve sent a password reset link to <strong>{email}</strong>. Click the link to reset your password.
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

      <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

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
            Sending...
          </span>
        ) : (
          'Send reset link'
        )}
      </button>

      {/* Back to login */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
        Remember your password?{' '}
        <Link href="/login" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
