'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { updatePassword } from '@/lib/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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

    setLoading(true)

    const { error } = await updatePassword(password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  if (success) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
        <div className="sm-grid-overlay" />
        <div className="glass-card glass-card-static" style={{ position: 'relative', width: '100%', maxWidth: '420px', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg style={{ width: 32, height: 32, color: '#10b981' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--sm-text)', marginBottom: '8px' }}>Password reset successful</h3>
          <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div className="sm-grid-overlay" />
      <div className="glass-card glass-card-static" style={{ position: 'relative', width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <Image
              src="/logos/SM_Full_v2.png"
              alt="Sports Mockery"
              width={180}
              height={45}
              className="dark:hidden"
              priority
            />
            <Image
              src="/logos/v2_SM_Whole.png"
              alt="Sports Mockery"
              width={180}
              height={45}
              className="hidden dark:block"
              priority
            />
          </Link>
          <h2 style={{
            marginTop: '24px',
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
            color: 'var(--sm-text)',
          }}>
            Choose a new password
          </h2>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
            Enter your new password below.
          </p>
        </div>

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

          {/* New Password */}
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)', marginBottom: '6px' }}>
              New Password
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
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--sm-text)', marginBottom: '6px' }}>
              Confirm New Password
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
                Resetting...
              </span>
            ) : (
              'Reset password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
