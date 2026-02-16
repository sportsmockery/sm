'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import SkipLoginModal from '@/components/home/SkipLoginModal'

interface HomeLoginFormProps {
  redirectTo?: string
}

export default function HomeLoginForm({ redirectTo = '/admin' }: HomeLoginFormProps) {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

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

  const inputStyle = {
    width: '100%', padding: '16px 20px', borderRadius: 14,
    background: '#0c0c12', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: 16, fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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

      {/* Email */}
      <div>
        <label htmlFor="hm-email" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#8a8a9a', marginBottom: 10, letterSpacing: 0.2 }}>
          Email address
        </label>
        <input
          id="hm-email"
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
        <label htmlFor="hm-password" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#8a8a9a', marginBottom: 10, letterSpacing: 0.2 }}>
          Password
        </label>
        <input
          id="hm-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = 'rgba(188,0,0,0.4)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Remember me & Forgot password */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: '#bc0000', width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, color: '#8a8a9a' }}>Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          style={{ fontSize: 14, fontWeight: 600, color: '#ff4444', textDecoration: 'none' }}
        >
          Forgot password?
        </Link>
      </div>

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
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Sign up link */}
      <p style={{ textAlign: 'center', fontSize: 15, color: '#8a8a9a', margin: 0 }}>
        Don&apos;t have an account?{' '}
        <Link href="/home/signup" style={{ fontWeight: 600, color: '#ff4444', textDecoration: 'none' }}>
          Sign up
        </Link>
      </p>

      {/* Skip login divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: 12, color: '#55556a', textTransform: 'uppercase', letterSpacing: 1 }}>or</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Skip Login */}
      <button
        type="button"
        onClick={() => setShowSkipModal(true)}
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          padding: '16px 32px', borderRadius: 100,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'transparent',
          color: '#8a8a9a', fontSize: 15, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
      >
        Skip Login
      </button>

      <SkipLoginModal open={showSkipModal} onClose={() => setShowSkipModal(false)} />
    </form>
  )
}
