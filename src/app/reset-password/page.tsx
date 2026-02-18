'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--sm-dark)' }}>
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/30">
                <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Password reset successful</h3>
              <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--sm-dark)' }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-black tracking-tight" style={{ color: 'var(--sm-text)' }}>
                SPORTS
                <span className="bg-gradient-to-r from-[#FF0000] to-[#8B0000] bg-clip-text text-transparent">
                  MOCKERY
                </span>
              </span>
            </Link>
            <h2 className="mt-6 text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
              Reset your password
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-900/30 p-4 text-sm text-red-300">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="mt-1 block w-full px-4 py-3 focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text)', borderRadius: '12px' }}
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="mt-1 block w-full px-4 py-3 focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text)', borderRadius: '12px' }}
                placeholder="••••••••"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #bc0000, #ff4444)', color: '#fff', borderRadius: '9999px' }}
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
