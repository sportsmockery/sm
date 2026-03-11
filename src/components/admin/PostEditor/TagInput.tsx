'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Tag {
  id: number
  name: string
  slug: string
}

interface TagInputProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
}

export default function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (search: string) => {
    if (!search.trim()) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/tags?q=${encodeURIComponent(search)}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        // Filter out already-selected tags
        const selectedIds = new Set(selectedTags.map(t => t.id))
        setSuggestions((data.tags || []).filter((t: Tag) => !selectedIds.has(t.id)))
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [selectedTags])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim()) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 200)
    } else {
      setSuggestions([])
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      onChange([...selectedTags, tag])
    }
    setQuery('')
    setSuggestions([])
    setHighlightIndex(-1)
    inputRef.current?.focus()
  }

  const removeTag = (tagId: number) => {
    onChange(selectedTags.filter(t => t.id !== tagId))
  }

  const createTag = async () => {
    const name = query.trim()
    if (!name) return

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })
      if (res.ok) {
        const tag = await res.json()
        addTag(tag)
      }
    } catch {
      // ignore
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        addTag(suggestions[highlightIndex])
      } else if (query.trim()) {
        // Check if exact match exists in suggestions
        const exact = suggestions.find(s => s.name.toLowerCase() === query.trim().toLowerCase())
        if (exact) {
          addTag(exact)
        } else {
          createTag()
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setHighlightIndex(-1)
    } else if (e.key === 'Backspace' && !query && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    }
  }

  const maxRecommended = 8
  const atMax = selectedTags.length >= maxRecommended

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
        Tags
        <span className="ml-1 text-[var(--text-muted)] font-normal">
          ({selectedTags.length}/{maxRecommended})
        </span>
      </label>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs text-[var(--text-primary)]"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-0.5 rounded-full p-0.5 text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setHighlightIndex(-1) }}
          onFocus={() => { if (query.trim()) setShowDropdown(true) }}
          onKeyDown={handleKeyDown}
          placeholder={atMax ? 'Max tags reached' : 'Add tag...'}
          disabled={atMax}
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-red)] disabled:opacity-50"
        />

        {/* Dropdown */}
        {showDropdown && (suggestions.length > 0 || (query.trim() && !loading)) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] shadow-lg"
          >
            {suggestions.map((tag, i) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                  i === highlightIndex
                    ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <span>{tag.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{tag.slug}</span>
              </button>
            ))}
            {query.trim() && !suggestions.find(s => s.name.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={createTag}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  highlightIndex === suggestions.length
                    ? 'bg-[var(--bg-hover)]'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
              >
                <svg className="h-3.5 w-3.5 text-[#00D4FF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[#00D4FF]">Create &quot;{query.trim()}&quot;</span>
              </button>
            )}
          </div>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
