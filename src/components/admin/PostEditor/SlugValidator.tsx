'use client'

import { useState, useEffect, useCallback } from 'react'

interface SlugValidatorProps {
  value: string
  onChange: (slug: string) => void
  title: string
  excludeId?: string // Exclude current post when editing
}

interface SlugCheckResult {
  slug: string
  isAvailable: boolean
  existingPost: { id: string; title: string } | null
  suggestions: string[]
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function SlugValidator({
  value,
  onChange,
  title,
  excludeId,
}: SlugValidatorProps) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<SlugCheckResult | null>(null)
  const [manualEdit, setManualEdit] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug) {
      setResult(null)
      return
    }

    setChecking(true)
    try {
      const params = new URLSearchParams({ slug })
      if (excludeId) params.append('exclude', excludeId)

      const response = await fetch(`/api/admin/slugs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      }
    } catch (error) {
      console.error('Error checking slug:', error)
    } finally {
      setChecking(false)
    }
  }, [excludeId])

  // Debounced slug check
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)

    if (value) {
      const timer = setTimeout(() => checkSlug(value), 500)
      setDebounceTimer(timer)
    } else {
      setResult(null)
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!manualEdit && title) {
      const generatedSlug = generateSlug(title)
      if (generatedSlug !== value) {
        onChange(generatedSlug)
      }
    }
  }, [title, manualEdit]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualEdit(true)
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
    onChange(newSlug)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setManualEdit(true)
    onChange(suggestion)
  }

  const regenerateFromTitle = () => {
    setManualEdit(false)
    const generatedSlug = generateSlug(title)
    onChange(generatedSlug)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Slug
        </label>
        {manualEdit && (
          <button
            type="button"
            onClick={regenerateFromTitle}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Auto-generate
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          id="slug"
          value={value}
          onChange={handleChange}
          className={`w-full rounded-lg border px-4 py-2 pr-10 text-zinc-900 focus:outline-none focus:ring-1 dark:bg-zinc-800 dark:text-zinc-100 ${
            result?.isAvailable === false
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
              : result?.isAvailable === true
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500 dark:border-green-700'
              : 'border-zinc-300 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700'
          }`}
          placeholder="post-url-slug"
        />

        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {checking ? (
            <svg
              className="h-5 w-5 animate-spin text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : result?.isAvailable === true ? (
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : result?.isAvailable === false ? (
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : null}
        </div>
      </div>

      {/* Preview URL */}
      {value && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Preview: sportsmockery.com/{value}
        </p>
      )}

      {/* Conflict warning */}
      {result?.isAvailable === false && result.existingPost && (
        <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">
            This slug is already used by: &quot;{result.existingPost.title}&quot;
          </p>
          {result.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-500 dark:text-red-400">
                Try one of these instead:
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {result.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available confirmation */}
      {result?.isAvailable === true && (
        <p className="text-xs text-green-600 dark:text-green-400">
          This slug is available
        </p>
      )}
    </div>
  )
}
