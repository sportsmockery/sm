'use client'

import { useState, useEffect } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface ArticleTableOfContentsProps {
  contentHtml: string
  className?: string
  variant?: 'default' | 'glass'
}

/**
 * In-article table of contents - Athletic-style
 * Left sidebar placement with minimal design
 * Extracts h2 and h3 headings from article content
 * Highlights current section based on scroll position
 */
export default function ArticleTableOfContents({
  contentHtml,
  className = '',
  variant = 'default',
}: ArticleTableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(true)

  // Extract headings from HTML content
  useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(contentHtml, 'text/html')
    const headings = doc.querySelectorAll('h2, h3')

    const tocItems: TOCItem[] = Array.from(headings).map((heading, index) => {
      const id = heading.id || `heading-${index}`
      return {
        id,
        text: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3,
      }
    })

    setItems(tocItems)

    // Set initial active item
    if (tocItems.length > 0) {
      setActiveId(tocItems[0].id)
    }
  }, [contentHtml])

  // Track scroll position to update active heading
  useEffect(() => {
    if (items.length === 0) return

    const handleScroll = () => {
      const headingElements = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[]

      if (headingElements.length === 0) return

      // Find the heading that's currently in view
      const scrollPosition = window.scrollY + 150 // Offset for header

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i]
        if (element.offsetTop <= scrollPosition) {
          setActiveId(items[i].id)
          return
        }
      }

      // Default to first item
      setActiveId(items[0].id)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [items])

  // Don't render if fewer than 3 headings
  if (items.length < 3) {
    return null
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 120 // Account for sticky header
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const isSidebarMode = variant === 'glass'

  if (isSidebarMode) {
    // Athletic-style left sidebar TOC in glass card wrapper
    return (
      <nav className={`article-glass-card-sm ${className}`} aria-label="Table of contents">
        <div className="mb-4">
          <span
            className="text-[11px] font-semibold tracking-[0.1em] uppercase"
            style={{ color: 'var(--sm-text-muted)', fontFamily: "'Montserrat', sans-serif" }}
          >
            Contents
          </span>
        </div>
        <ul className="space-y-0">
          {items.map((item, index) => (
            <li key={item.id} className="relative">
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`group w-full text-left py-2 text-[13px] leading-snug transition-all duration-200 ${
                  item.level === 3 ? 'pl-3' : ''
                }`}
                style={{
                  color: activeId === item.id ? '#bc0000' : 'var(--sm-text-muted)',
                  fontWeight: activeId === item.id ? 600 : 400,
                }}
              >
                {/* Active indicator line */}
                {activeId === item.id && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full"
                    style={{ backgroundColor: '#bc0000' }}
                  />
                )}
                <span className="line-clamp-2 group-hover:text-[var(--sm-text)] transition-colors pl-3">
                  {item.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {/* Progress indicator */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--sm-border)' }}>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--sm-text-muted)' }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{items.findIndex(i => i.id === activeId) + 1} of {items.length}</span>
          </div>
        </div>
      </nav>
    )
  }

  // Mobile/tablet collapsible TOC
  return (
    <nav
      className={`rounded-lg overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--sm-card)',
        border: '1px solid var(--sm-border)'
      }}
      aria-label="Table of contents"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ borderBottom: isExpanded ? '1px solid var(--sm-border)' : 'none' }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            style={{ color: '#bc0000' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <span
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}
          >
            In This Article
          </span>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}
          >
            {items.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--sm-text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* TOC items */}
      {isExpanded && (
        <ul className="py-1">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-4 py-2 text-[13px] transition-all duration-150 ${
                  item.level === 3 ? 'pl-7' : ''
                }`}
                style={{
                  color: activeId === item.id ? '#bc0000' : 'var(--sm-text-muted)',
                  backgroundColor: activeId === item.id ? 'rgba(188, 0, 0, 0.05)' : 'transparent',
                  borderLeft: activeId === item.id ? '2px solid #bc0000' : '2px solid transparent',
                  fontWeight: activeId === item.id ? 500 : 400,
                }}
              >
                <span className="line-clamp-1">{item.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
