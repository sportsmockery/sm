'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sm_recent_searches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) {
          // This is handled by parent component
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    localStorage.setItem('sm_recent_searches', JSON.stringify(updated))

    // Navigate to search page
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    onClose()
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const clearRecentSearches = () => {
    localStorage.removeItem('sm_recent_searches')
    setRecentSearches([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-2xl animate-scale-in">
        <div className="overflow-hidden rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          {/* Search input */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <svg
                className="ml-4 h-5 w-5"
                style={{ color: 'var(--sm-text-dim)' }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, teams, authors..."
                className="flex-1 bg-transparent px-4 py-5 text-lg outline-none"
                style={{ color: 'var(--sm-text)' }}
              />
              <div className="mr-4 flex items-center gap-2">
                <kbd className="hidden rounded px-2 py-1 text-xs sm:inline" style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text-muted)' }}>
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors sm:hidden"
                  style={{ color: 'var(--sm-text-dim)' }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </form>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
                  Recent Searches
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                    style={{ color: 'var(--sm-text)' }}
                  >
                    <svg className="h-4 w-4" style={{ color: 'var(--sm-text-dim)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="p-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
              Quick Links
            </span>
            <div className="flex flex-wrap gap-2">
              {['Bears', 'Bulls', 'Cubs', 'White Sox', 'Blackhawks'].map((team) => (
                <button
                  key={team}
                  onClick={() => handleSearch(team)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[#8B0000] hover:text-white"
                  style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
