'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import SocialLoginButtons, { AuthDivider } from './SocialLoginButtons'

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
  const [socialLoading, setSocialLoading] = useState(false)

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
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Social Login Buttons */}
      <SocialLoginButtons
        mode="login"
        redirectTo={redirectTo}
        onError={setError}
        onLoading={setSocialLoading}
      />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
          placeholder="you@example.com"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
          placeholder="••••••••"
        />
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-[#8B0000] focus:ring-[#8B0000] dark:border-zinc-600 dark:bg-zinc-700 dark:focus:ring-[#FF6666]"
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#8B0000] hover:text-red-700 dark:text-[#FF6666] dark:hover:text-red-400"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || socialLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B0000] px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#FF6666] dark:text-zinc-900 dark:hover:bg-red-400"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </>
        ) : (
          'Sign in with email'
        )}
      </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-[#8B0000] hover:text-red-700 dark:text-[#FF6666] dark:hover:text-red-400"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
