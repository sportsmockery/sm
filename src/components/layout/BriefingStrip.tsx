'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Modal from '@/components/ui/Modal'

interface Briefing {
  id: string
  title: string
  summary: string
  slug: string
  category_slug: string | null
}

export default function BriefingStrip() {
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [activeBriefing, setActiveBriefing] = useState<Briefing | null>(null)

  useEffect(() => {
    fetch('/api/briefing?limit=3')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.briefings?.length) {
          setBriefings(data.briefings)
        }
      })
      .catch(() => {})
  }, [])

  if (!briefings.length) return null

  return (
    <>
      <div className="briefing-strip" aria-label="Today's briefing">
        <div className="briefing-strip-inner">
          {briefings.map((b) => (
            <button
              key={b.id}
              className="briefing-chip"
              onClick={() => setActiveBriefing(b)}
              style={{
                background: 'none',
                border: '1px solid rgba(188, 0, 0, 0.3)',
                borderRadius: '100px',
                padding: '4px 14px',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                fontWeight: 400,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '320px',
                transition: 'all 0.2s',
              }}
            >
              {b.title}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-sheet modal for briefing summary */}
      <Modal
        isOpen={!!activeBriefing}
        onClose={() => setActiveBriefing(null)}
        title={activeBriefing?.title || ''}
        size="sm"
      >
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--sm-text-muted)',
          marginBottom: '16px',
        }}>
          {activeBriefing?.summary || 'No summary available.'}
        </p>
        {activeBriefing && (
          <Link
            href={
              activeBriefing.category_slug
                ? `/${activeBriefing.category_slug}/${activeBriefing.slug}`
                : `/${activeBriefing.slug}`
            }
            onClick={() => setActiveBriefing(null)}
            style={{
              display: 'inline-block',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#bc0000',
              textDecoration: 'none',
            }}
          >
            Read full story &rarr;
          </Link>
        )}
      </Modal>
    </>
  )
}
