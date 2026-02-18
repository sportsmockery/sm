'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GifPickerProps {
  onSelect: (gifUrl: string) => void
  onClose: () => void
}

interface GifResult {
  id: string
  url: string
  preview: string
  width: number
  height: number
}

const TRENDING_GIFS: GifResult[] = [
  { id: '1', url: 'https://media.giphy.com/media/3o7aCVYGR1gUvJh9BK/giphy.gif', preview: 'https://media.giphy.com/media/3o7aCVYGR1gUvJh9BK/200w.gif', width: 200, height: 200 },
  { id: '2', url: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif', preview: 'https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/200w.gif', width: 200, height: 200 },
  { id: '3', url: 'https://media.giphy.com/media/3oEdv4hwWTzBhWvaU0/giphy.gif', preview: 'https://media.giphy.com/media/3oEdv4hwWTzBhWvaU0/200w.gif', width: 200, height: 200 },
]

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState<GifResult[]>(TRENDING_GIFS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchGifs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setGifs(TRENDING_GIFS)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/gifs/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      if (!res.ok) throw new Error('Failed to search GIFs')

      const data = await res.json()
      setGifs(data.gifs || [])
    } catch (err) {
      setError('Failed to load GIFs')
      setGifs(TRENDING_GIFS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchGifs(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, searchGifs])

  return (
    <div className="gif-picker">
      <div className="gif-picker__header">
        <div className="gif-picker__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="gif-picker__input"
            autoFocus
          />
        </div>
        <button className="gif-picker__close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="gif-picker__content">
        {isLoading ? (
          <div className="gif-picker__loading">
            <span className="gif-picker__spinner" />
          </div>
        ) : error ? (
          <div className="gif-picker__error">{error}</div>
        ) : gifs.length === 0 ? (
          <div className="gif-picker__empty">No GIFs found</div>
        ) : (
          <div className="gif-picker__grid">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                className="gif-picker__gif"
                onClick={() => onSelect(gif.url)}
              >
                <img
                  src={gif.preview}
                  alt="GIF"
                  loading="lazy"
                  className="gif-picker__gif-img"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="gif-picker__footer">
        <span className="gif-picker__powered">Powered by GIPHY</span>
      </div>

      <style jsx>{`
        .gif-picker {
          background: var(--sm-card, #1a1a2e);
          border: 1px solid var(--sm-border, #333);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          max-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .gif-picker__header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--sm-border, #333);
        }

        .gif-picker__search {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--sm-surface, #111);
          border-radius: 8px;
          padding: 6px 10px;
          color: var(--sm-text-muted, #888);
        }

        .gif-picker__input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--sm-text, #fff);
          font-size: 0.85rem;
          outline: none;
        }

        .gif-picker__input::placeholder {
          color: var(--sm-text-muted, #888);
        }

        .gif-picker__close {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--sm-text-muted, #888);
          transition: background 0.15s;
        }

        .gif-picker__close:hover {
          background: var(--sm-card-hover, #2a2a2a);
        }

        .gif-picker__content {
          flex: 1;
          overflow-y: auto;
          min-height: 200px;
        }

        .gif-picker__loading,
        .gif-picker__error,
        .gif-picker__empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--sm-text-muted, #888);
          font-size: 0.85rem;
        }

        .gif-picker__spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--sm-border, #333);
          border-top-color: var(--accent, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gif-picker__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          padding: 10px;
        }

        .gif-picker__gif {
          background: var(--sm-surface, #111);
          border: none;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.15s;
          aspect-ratio: 1;
        }

        .gif-picker__gif:hover {
          transform: scale(1.02);
        }

        .gif-picker__gif-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gif-picker__footer {
          padding: 8px 12px;
          border-top: 1px solid var(--sm-border, #333);
          text-align: center;
        }

        .gif-picker__powered {
          font-size: 0.7rem;
          color: var(--sm-text-muted, #888);
        }

        /* Light mode */
        :global(body.theme-light) .gif-picker,
        :global(:root:not(.dark)) .gif-picker {
          --bg-card: #fff;
          --border-subtle: #e5e7eb;
          --bg-subtle: #f9fafb;
          --text-main: #111;
        }

        @media (max-width: 768px) {
          .gif-picker__grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  )
}
