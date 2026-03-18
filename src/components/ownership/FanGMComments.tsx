'use client'

import { useState, useEffect, useCallback } from 'react'

interface FanGMCommentsProps {
  teamSlug: string
  gmName: string
}

interface FanComment {
  id: string
  author: string
  type: 'best' | 'worst'
  text: string
  created_at: string
  likes: number
}

export default function FanGMComments({ teamSlug, gmName }: FanGMCommentsProps) {
  const [comments, setComments] = useState<FanComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [type, setType] = useState<'best' | 'worst'>('best')
  const [submitted, setSubmitted] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/ownership/comments?team=${teamSlug}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [teamSlug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/ownership/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_slug: teamSlug,
          author: name.trim() || 'Anonymous Fan',
          type,
          text: text.trim().slice(0, 500),
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setText('')
        setName('')
        fetchComments()
        setTimeout(() => setSubmitted(false), 3000)
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const bestComments = comments.filter(c => c.type === 'best')
  const worstComments = comments.filter(c => c.type === 'worst')

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid var(--sm-border)',
      background: 'var(--sm-card)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--sm-border)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sm-text)', margin: '0 0 4px' }}>
          Fan Verdict on {gmName}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--sm-text-dim)', margin: 0 }}>
          What&apos;s the best and worst move {gmName} has made?
        </p>
      </div>

      {/* Submit form */}
      <form onSubmit={handleSubmit} style={{ padding: '16px 20px', borderBottom: '1px solid var(--sm-border)' }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setType('best')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              border: `2px solid ${type === 'best' ? '#16a34a' : 'var(--sm-border)'}`,
              background: type === 'best' ? 'rgba(22,163,106,0.1)' : 'transparent',
              color: type === 'best' ? '#16a34a' : 'var(--sm-text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              lineHeight: 1,
              transition: 'all 0.2s',
            }}
          >
            Best Move
          </button>
          <button
            type="button"
            onClick={() => setType('worst')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              border: `2px solid ${type === 'worst' ? '#BC0000' : 'var(--sm-border)'}`,
              background: type === 'worst' ? 'rgba(188,0,0,0.1)' : 'transparent',
              color: type === 'worst' ? '#BC0000' : 'var(--sm-text-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              lineHeight: 1,
              transition: 'all 0.2s',
            }}
          >
            Worst Move
          </button>
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={50}
            style={{
              width: 120,
              flexShrink: 0,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--sm-border)',
              background: 'var(--sm-surface)',
              color: 'var(--sm-text)',
              fontSize: 13,
            }}
          />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={type === 'best' ? `Best move ${gmName} made...` : `Worst move ${gmName} made...`}
            maxLength={500}
            required
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--sm-border)',
              background: 'var(--sm-surface)',
              color: 'var(--sm-text)',
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#BC0000',
              color: '#FAFAFB',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: submitting || !text.trim() ? 0.5 : 1,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {submitting ? '...' : 'Post'}
          </button>
        </div>

        {submitted && (
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 8, fontWeight: 500 }}>
            Your take has been submitted!
          </div>
        )}
      </form>

      {/* Comments */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--sm-text-muted)' }}>
            Loading fan takes...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--sm-text-muted)' }}>
            No takes yet. Be the first to weigh in.
          </div>
        ) : (
          <div>
            {/* Best moves */}
            {bestComments.length > 0 && (
              <div>
                <div style={{ padding: '10px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#16a34a', borderBottom: '1px solid var(--sm-border)', background: 'rgba(22,163,106,0.04)' }}>
                  Best Moves ({bestComments.length})
                </div>
                {bestComments.map((c, i) => (
                  <div key={c.id || i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--sm-border)', fontSize: 13 }}>
                    <div style={{ color: 'var(--sm-text)', lineHeight: 1.5 }}>{c.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginTop: 4 }}>
                      &mdash; {c.author}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Worst moves */}
            {worstComments.length > 0 && (
              <div>
                <div style={{ padding: '10px 20px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#BC0000', borderBottom: '1px solid var(--sm-border)', background: 'rgba(188,0,0,0.04)' }}>
                  Worst Moves ({worstComments.length})
                </div>
                {worstComments.map((c, i) => (
                  <div key={c.id || i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--sm-border)', fontSize: 13 }}>
                    <div style={{ color: 'var(--sm-text)', lineHeight: 1.5 }}>{c.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--sm-text-dim)', marginTop: 4 }}>
                      &mdash; {c.author}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
