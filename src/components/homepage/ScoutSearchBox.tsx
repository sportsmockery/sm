'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export function ScoutSearchBox() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim() || loading) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      setResult(data.response || 'No results found.')
    } catch {
      setResult('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
      {/* Search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(245,245,245,0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(188,0,0,0.3)' : 'rgba(188,0,0,0.15)'}`,
          borderRadius: 0,
          boxShadow: isDark ? '0 0 30px rgba(188,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout"
          width={24}
          height={24}
          style={{ borderRadius: '50%', flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="What does Scout need to find for you today?"
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: 500,
            color: isDark ? '#fff' : '#111',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            padding: '8px 20px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            backgroundColor: '#bc0000',
            color: '#ffffff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
        >
          {loading ? '...' : 'SEARCH'}
        </button>
      </div>

      {/* Search result */}
      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 20,
            background: isDark ? 'rgba(10,10,10,0.6)' : 'rgba(245,245,245,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            fontSize: 14,
            lineHeight: 1.6,
            color: isDark ? '#ddd' : '#333',
            maxHeight: 200,
            overflowY: 'auto' as const,
          }}
        >
          {result}
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button
              onClick={() => router.push(`/scout-ai?q=${encodeURIComponent(query)}`)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#bc0000',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              Continue in Scout AI &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
