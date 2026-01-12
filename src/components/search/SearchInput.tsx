'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SearchInputProps {
  initialQuery?: string
  placeholder?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
  className?: string
}

export default function SearchInput({
  initialQuery = '',
  placeholder = 'Search articles, authors, teams...',
  autoFocus = false,
  onSearch,
  className = '',
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      if (onSearch) {
        onSearch(trimmedQuery)
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
      }
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div
        className={`relative flex items-center overflow-hidden rounded-2xl border-2 bg-white transition-all dark:bg-zinc-900 ${
          isFocused
            ? 'border-[#8B0000] shadow-lg shadow-[#8B0000]/10 dark:border-[#FF6666] dark:shadow-[#FF6666]/10'
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
      >
        {/* Search icon */}
        <div className="flex items-center pl-4">
          <svg
            className={`h-5 w-5 transition-colors ${
              isFocused
                ? 'text-[#8B0000] dark:text-[#FF6666]'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-4 text-lg text-zinc-900 placeholder-zinc-400 outline-none dark:text-white dark:placeholder-zinc-500"
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Search button */}
        <button
          type="submit"
          className="mr-2 flex h-10 items-center gap-2 rounded-xl bg-[#8B0000] px-4 font-semibold text-white transition-colors hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
        >
          <span className="hidden sm:inline">Search</span>
          <svg
            className="h-4 w-4 sm:hidden"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Press <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">Enter</kbd> to search
      </p>
    </form>
  )
}
