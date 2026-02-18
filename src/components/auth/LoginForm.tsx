'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface LoginFormProps {
  redirectTo?: string
}

export default function LoginForm({ redirectTo = '/admin' }: LoginFormProps) {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password, rememberMe)

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
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
          autoComplete="current-password"
          className="sm-input"
          placeholder="********"
        />
      </div>

      {/* Remember me & Forgot password */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#bc0000' }}
          />
          <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          style={{ fontSize: '14px', fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}
        >
          Forgot password?
        </Link>
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
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Sign up link */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--sm-text-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ fontWeight: 500, color: '#bc0000', textDecoration: 'none' }}>
          Sign up
        </Link>
      </p>
    </form>
  )
}
