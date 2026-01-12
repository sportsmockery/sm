'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Category page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        {/* Error illustration */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#8B0000]/10 dark:bg-[#FF6666]/10">
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
        </div>

        {/* Error message */}
        <h1 className="mb-4 font-heading text-3xl font-bold text-zinc-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          We couldn&apos;t load this category. This might be a temporary issue.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-xl bg-[#8B0000] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Go Home
          </Link>
        </div>

        {/* Error details (dev mode) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Error Details:
            </p>
            <pre className="overflow-auto text-sm text-zinc-700 dark:text-zinc-300">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
