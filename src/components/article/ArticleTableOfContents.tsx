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
}

/**
 * In-article table of contents
 * Extracts h2 and h3 headings from article content
 * Highlights current section based on scroll position
 */
export default function ArticleTableOfContents({
  contentHtml,
  className = '',
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

  return (
    <nav
      className={`bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 ${className}`}
      aria-label="Table of contents"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[#bc0000]"
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
            className="text-[14px] font-bold text-[#222] dark:text-white uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            In This Article
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* TOC items */}
      {isExpanded && (
        <ul className="py-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-5 py-2 text-sm transition-colors ${
                  item.level === 3 ? 'pl-8' : ''
                } ${
                  activeId === item.id
                    ? 'text-[#bc0000] bg-red-50 dark:bg-red-900/20 border-l-2 border-[#bc0000]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#222] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
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
