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
  /** Scout-generated TOC stored in DB — used when available, falls back to HTML extraction */
  storedToc?: Array<{ id: string; text: string; level: number }> | null
}

/**
 * In-article table of contents - Athletic-style
 * Left sidebar placement with minimal design
 * Uses Scout-generated TOC if available, otherwise extracts h2/h3 headings from HTML
 * Highlights current section based on scroll position
 */
export default function ArticleTableOfContents({
  contentHtml,
  className = '',
  variant = 'default',
  storedToc,
}: ArticleTableOfContentsProps) {
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(true)

  // Use stored TOC if available, otherwise extract from HTML
  useEffect(() => {
    if (storedToc && storedToc.length >= 3) {
      setItems(storedToc)
      setActiveId(storedToc[0].id)
      return
    }

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

    if (tocItems.length > 0) {
      setActiveId(tocItems[0].id)
    }
  }, [contentHtml, storedToc])

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
    return (
      <nav className={className} aria-label="Table of contents">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex items-center justify-center rounded-md"
            style={{ width: 24, height: 24, backgroundColor: 'rgba(188,0,0,0.08)' }}
          >
            <svg className="w-3.5 h-3.5" style={{ color: '#BC0000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <span
            className="text-[12px] font-bold tracking-[0.08em] uppercase"
            style={{ color: 'var(--sm-text)' }}
          >
            Contents
          </span>
        </div>

        {/* Items */}
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = activeId === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className="group w-full text-left py-1.5 text-[13px] leading-snug transition-all duration-200 flex items-start gap-2"
                  style={{
                    color: isActive ? '#BC0000' : 'var(--sm-text-muted)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {/* Active indicator */}
                  <span
                    className="shrink-0 mt-[5px] rounded-full transition-all duration-200"
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: isActive ? '#BC0000' : 'rgba(11,15,20,0.12)',
                    }}
                  />
                  <span className="line-clamp-2 group-hover:text-[var(--sm-text)] transition-colors">
                    {item.text}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Subtle bottom line */}
        <div className="mt-5 h-px" style={{ background: 'linear-gradient(to right, rgba(188,0,0,0.15), transparent)' }} />
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
            style={{ color: 'var(--sm-text)' }}
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
