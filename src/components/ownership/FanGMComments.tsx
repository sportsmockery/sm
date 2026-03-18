'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<FanComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [text, setText] = useState('')
  const [type, setType] = useState<'best' | 'worst'>('best')
  const [submitted, setSubmitted] = useState(false)
  const displayName = (user as any)?.user_metadata?.display_name || (user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Fan'

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
          author: displayName,
          user_id: user?.id,
          type,
          text: text.trim().slice(0, 500),
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setText('')
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

      {/* Submit form or login prompt */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sm-border)' }}>
        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: '0 0 10px' }}>
              Log in to share your take on {gmName}.
            </p>
            <Link
              href="/login?next=/owner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                borderRadius: 8,
                backgroundColor: '#BC0000',
                color: '#FAFAFB',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                lineHeight: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
              Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Posting as */}
            <div style={{ fontSize: 12, color: 'var(--sm-text-dim)', marginBottom: 10 }}>
              Posting as <span style={{ fontWeight: 600, color: 'var(--sm-text)' }}>{displayName}</span>
            </div>

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
        )}
      </div>

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
