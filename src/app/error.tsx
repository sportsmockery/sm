'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Error icon */}
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <svg
            className="h-12 w-12 text-[#8B0000] dark:text-[#FF6666]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 font-[var(--font-montserrat)]">
          Technical Difficulties
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-2">
          Looks like we threw an interception. Something went wrong on our end.
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-8">
          Our team has been notified and is working on it. Please try again.
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4 text-left">
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-zinc-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 px-6 py-3 font-semibold text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-400 dark:hover:border-zinc-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go Home
          </a>
        </div>

        {/* Support info */}
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          If this problem persists,{' '}
          <a href="/contact" className="text-[#8B0000] dark:text-[#FF6666] hover:underline">
            contact our support team
          </a>
          .
        </p>
      </div>
    </div>
  )
}
