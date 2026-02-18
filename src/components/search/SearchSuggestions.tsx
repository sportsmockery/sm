'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Suggestion {
  type: 'article' | 'category' | 'author'
  title: string
  slug: string
  image?: string
  subtitle?: string
}

interface SearchSuggestionsProps {
  query: string
  suggestions: Suggestion[]
  isLoading?: boolean
  onSelect?: (suggestion: Suggestion) => void
  className?: string
}

export default function SearchSuggestions({
  query,
  suggestions,
  isLoading = false,
  onSelect,
  className = '',
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!suggestions.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
          if (selectedIndex >= 0 && onSelect) {
            e.preventDefault()
            onSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          setSelectedIndex(-1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [suggestions, selectedIndex, onSelect])

  if (!query) return null

  // Group suggestions by type
  const groupedSuggestions = suggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.type]) {
        acc[suggestion.type] = []
      }
      acc[suggestion.type].push(suggestion)
      return acc
    },
    {} as Record<string, Suggestion[]>
  )

  const typeLabels: Record<string, string> = {
    article: 'Articles',
    category: 'Categories',
    author: 'Authors',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    article: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    category: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    author: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  }

  let flatIndex = -1

  return (
    <div
      ref={listRef}
      className={`overflow-hidden rounded-xl border shadow-lg ${className}`}
      style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-[#8B0000] dark:border-t-[#FF6666]" style={{ borderColor: 'var(--sm-border)' }} />
          <span className="ml-2 text-sm" style={{ color: 'var(--sm-text-muted)' }}>Searching...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="p-4 text-center text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          No suggestions found for &ldquo;{query}&rdquo;
        </div>
      ) : (
        Object.entries(groupedSuggestions).map(([type, items]) => (
          <div key={type}>
            <div className="border-b px-3 py-2" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
                {typeIcons[type]}
                {typeLabels[type]}
              </h4>
            </div>
            <ul>
              {items.map((suggestion) => {
                flatIndex++
                const currentIndex = flatIndex
                const isSelected = currentIndex === selectedIndex

                const href =
                  type === 'article'
                    ? `/${suggestion.slug}`
                    : type === 'category'
                    ? `/${suggestion.slug}`
                    : `/author/${suggestion.slug}`

                return (
                  <li key={`${type}-${suggestion.slug}`}>
                    <Link
                      href={href}
                      onClick={() => onSelect?.(suggestion)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isSelected
                          ? 'bg-[#8B0000]/5 dark:bg-[#FF6666]/5'
                          : ''
                      }`}
                    >
                      {suggestion.image && (
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={suggestion.image}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate font-medium ${isSelected ? 'text-[#8B0000] dark:text-[#FF6666]' : ''}`}
                          style={isSelected ? {} : { color: 'var(--sm-text)' }}
                        >
                          {suggestion.title}
                        </p>
                        {suggestion.subtitle && (
                          <p className="truncate text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                            {suggestion.subtitle}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <kbd className="hidden rounded border px-1.5 py-0.5 font-mono text-xs sm:block" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                          Enter
                        </kbd>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}

      {/* View all results link */}
      {suggestions.length > 0 && (
        <Link
          href={`/search?q=${encodeURIComponent(query)}`}
          className="flex items-center justify-center gap-2 border-t px-4 py-3 text-sm font-medium text-[#8B0000] transition-colors dark:text-[#FF6666]"
          style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}
        >
          View all results for &ldquo;{query}&rdquo;
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
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      )}
    </div>
  )
}
