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

/* ─── Tag Type Classification ─── */
const TOPIC_SLUGS = new Set([
  'trade', 'rumor', 'draft', 'injury', 'analysis', 'free-agency', 'film-room',
  'recap', 'preview', 'roster', 'contract', 'signing', 'release', 'suspension',
  'playoff', 'offseason', 'breaking', 'schedule', 'standings', 'coaching',
])
const CONTENT_SLUGS = new Set([
  'analytics', 'debate', 'prediction', 'scout-report', 'hot-take',
  'breakdown', 'comparison', 'stat-deep-dive', 'opinion', 'poll',
])

function classifyTag(slug: string): 'player' | 'topic' | 'content' | 'tag' {
  if (TOPIC_SLUGS.has(slug)) return 'topic'
  if (CONTENT_SLUGS.has(slug)) return 'content'
  // Player heuristic: two+ hyphenated parts, all alphabetic, e.g. "caleb-williams"
  const parts = slug.split('-')
  if (parts.length >= 2 && parts.every(p => /^[a-z]{2,}$/.test(p))) return 'player'
  return 'tag'
}

function tagTypeLabel(type: 'player' | 'topic' | 'content' | 'tag'): string | null {
  if (type === 'player') return 'Player'
  if (type === 'topic') return 'Topic'
  if (type === 'content') return 'Content'
  return null
}

/* ─── Tag Info Popover ─── */
function TagInfoPopover({ onClose }: { onClose: () => void }) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#0B0F14', marginBottom: 4, marginTop: 16,
  }
  const bodyText: React.CSSProperties = {
    fontSize: 12, lineHeight: 1.6, color: '#4b5563', marginBottom: 0,
  }
  const codeTag: React.CSSProperties = {
    display: 'inline-block', fontSize: 11, fontFamily: 'monospace',
    background: 'rgba(0,212,255,0.08)', color: '#00D4FF',
    padding: '1px 6px', borderRadius: 4, marginRight: 4, marginBottom: 3,
  }
  const badCode: React.CSSProperties = {
    ...codeTag, background: 'rgba(188,0,0,0.06)', color: '#BC0000',
    textDecoration: 'line-through',
  }
  const starBadge = (label: string) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 10, fontWeight: 600, color: '#D6B05E',
      background: 'rgba(214,176,94,0.1)', padding: '1px 6px', borderRadius: 4,
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="#D6B05E" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {label}
    </span>
  )

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={popoverRef}
        className="mx-4 w-full rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 780, maxHeight: '90vh',
          backgroundColor: '#ffffff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0" style={{
          padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0B0F14' }}>Tag Guide</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content — two-column layout */}
        <div style={{ padding: '16px 24px 24px' }}>
          {/* Warning */}
          <p style={{ fontSize: 13, fontWeight: 700, color: '#BC0000', marginBottom: 8 }}>
            DO NOT CREATE NEW TAGS WITHOUT LOOKING FOR TAGS THAT ALREADY EXIST.
          </p>
          {/* Intro */}
          <p style={bodyText}>
            Tags help readers discover your story across SM Edge. They connect your article with related content, player pages, trending topics, and discussions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 16 }}>
            {/* Left column */}
            <div>
              <div style={{ ...sectionTitle, marginTop: 0 }}>How Many Tags</div>
              <p style={bodyText}>
                Use <strong>3–6 tags</strong> per article. Focus on the most important people, topics, or themes.
              </p>

              <div style={{ ...sectionTitle, marginTop: 14 }}>Tag Format</div>
              <p style={{ ...bodyText, marginBottom: 6 }}>Lowercase, short, hyphen-separated.</p>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#0B0F14', marginRight: 6 }}>Good:</span>
                <span style={codeTag}>caleb-williams</span>
                <span style={codeTag}>trade</span>
                <span style={codeTag}>analysis</span>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#0B0F14', marginRight: 6 }}>Avoid:</span>
                <span style={badCode}>Caleb Williams discussion</span>
              </div>

              <div style={{ ...sectionTitle, marginTop: 14 }}>Best Practices</div>
              <ul style={{ ...bodyText, paddingLeft: 16, margin: 0 }}>
                <li>Focus on main players or topics</li>
                <li>Prefer existing tags when possible</li>
                <li>Avoid long or overly specific phrases</li>
                <li>Avoid duplicate variations</li>
              </ul>

              {/* Example */}
              <div style={{
                marginTop: 12, background: 'rgba(0,212,255,0.04)',
                border: '1px solid rgba(0,212,255,0.1)', borderRadius: 8, padding: 10,
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#0B0F14', marginBottom: 4 }}>
                  Example: &quot;Bears Expected to Expand Caleb Williams Passing Concepts&quot;
                </p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span style={codeTag}>caleb-williams</span>
                  <span style={codeTag}>offense</span>
                  <span style={codeTag}>analysis</span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              <div style={{ ...sectionTitle, marginTop: 0 }}>Tags Power</div>
              <div style={{ ...bodyText, marginBottom: 8 }}>
                <div><strong>Search results</strong> — find stories by player, trade, injury</div>
                <div><strong>Trending topics</strong> — what Chicago fans are discussing</div>
                <div><strong>Related stories</strong> — connecting coverage of the same topics</div>
                <div><strong>Feed discovery</strong> — surfacing stories in the SM Edge feed</div>
              </div>

              <div style={sectionTitle}>High-Impact Tag Types</div>
              <p style={{ ...bodyText, fontSize: 11, marginBottom: 8 }}>
                Look for the star indicator in autocomplete suggestions.
              </p>
              <div style={{
                background: '#f8f9fa', borderRadius: 8, padding: 12,
                border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {starBadge('Player')}
                    </div>
                    <p style={{ ...bodyText, fontSize: 11 }}>
                      Connect to player profiles and discussions.
                      <br /><span style={codeTag}>caleb-williams</span><span style={codeTag}>connor-bedard</span>
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {starBadge('Topic')}
                    </div>
                    <p style={{ ...bodyText, fontSize: 11 }}>
                      Major storylines in trending topics and discovery.
                      <br /><span style={codeTag}>trade</span><span style={codeTag}>rumor</span><span style={codeTag}>draft</span><span style={codeTag}>injury</span>
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      {starBadge('Content')}
                    </div>
                    <p style={{ ...bodyText, fontSize: 11 }}>
                      Coverage type for analytical or interactive content.
                      <br /><span style={codeTag}>analytics</span><span style={codeTag}>debate</span><span style={codeTag}>prediction</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [showInfo, setShowInfo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const infoButtonRef = useRef<HTMLButtonElement>(null)

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
    <div className="relative">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
        Tags
        <span className="font-normal">
          ({selectedTags.length}/{maxRecommended})
        </span>
        <button
          ref={infoButtonRef}
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="inline-flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 16, height: 16, padding: 0, border: 'none', cursor: 'pointer',
            background: showInfo ? 'rgba(0,212,255,0.12)' : 'transparent',
            color: showInfo ? '#00D4FF' : 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            if (!showInfo) {
              e.currentTarget.style.color = '#00D4FF'
              e.currentTarget.style.background = 'rgba(0,212,255,0.08)'
            }
          }}
          onMouseLeave={(e) => {
            if (!showInfo) {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }
          }}
          title="Tag guide"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </label>

      {/* Info Popover */}
      {showInfo && <TagInfoPopover onClose={() => setShowInfo(false)} />}

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedTags.map(tag => {
            const type = classifyTag(tag.slug)
            const label = tagTypeLabel(type)
            return (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs text-[var(--text-primary)]"
              >
                {label && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#D6B05E" stroke="none" style={{ marginRight: 1 }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
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
            )
          })}
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
            {suggestions.map((tag, i) => {
              const type = classifyTag(tag.slug)
              const label = tagTypeLabel(type)
              return (
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
                  <span className="flex items-center gap-1.5">
                    {tag.name}
                  </span>
                  <span className="flex items-center gap-2">
                    {label ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        fontSize: 10, fontWeight: 600, color: '#D6B05E',
                        background: 'rgba(214,176,94,0.1)', padding: '1px 6px', borderRadius: 4,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="#D6B05E" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {label}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Tag</span>
                    )}
                  </span>
                </button>
              )
            })}
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
