'use client'

import { useState, useEffect, useCallback } from 'react'

interface FanVoteWidgetProps {
  gradeId: string
  teamSlug: string
  agreeCount: number
  disagreeCount: number
}

export default function FanVoteWidget({ gradeId, teamSlug, agreeCount: initialAgree, disagreeCount: initialDisagree }: FanVoteWidgetProps) {
  const [fingerprint, setFingerprint] = useState<string | null>(null)
  const [voted, setVoted] = useState<'agree' | 'disagree' | null>(null)
  const [agreeCount, setAgreeCount] = useState(initialAgree)
  const [disagreeCount, setDisagreeCount] = useState(initialDisagree)
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)

  useEffect(() => {
    async function loadFingerprint() {
      try {
        const FingerprintJS = (await import('@fingerprintjs/fingerprintjs')).default
        const fp = await FingerprintJS.load()
        const result = await fp.get()
        setFingerprint(result.visitorId)

        // Check if already voted (stored in localStorage)
        const stored = localStorage.getItem(`ownership_vote_${gradeId}`)
        if (stored) setVoted(stored as 'agree' | 'disagree')
      } catch {
        // Fallback: generate a simple fingerprint from user agent + screen
        const fallback = btoa(`${navigator.userAgent}${screen.width}${screen.height}`).slice(0, 32)
        setFingerprint(fallback)
      }
    }
    loadFingerprint()
  }, [gradeId])

  const submitVote = useCallback(async (vote: 'agree' | 'disagree') => {
    if (!fingerprint || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/ownership/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade_id: gradeId,
          team_slug: teamSlug,
          fingerprint,
          vote,
          comment: comment || null,
        }),
      })

      if (res.ok) {
        // Update counts locally
        if (voted) {
          // Changing vote
          if (voted === 'agree') setAgreeCount(c => c - 1)
          else setDisagreeCount(c => c - 1)
        }
        if (vote === 'agree') setAgreeCount(c => c + 1)
        else setDisagreeCount(c => c + 1)

        setVoted(vote)
        localStorage.setItem(`ownership_vote_${gradeId}`, vote)
        setShowComment(false)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    }
    setSubmitting(false)
  }, [fingerprint, submitting, gradeId, teamSlug, comment, voted])

  const total = agreeCount + disagreeCount
  const agreePct = total > 0 ? Math.round((agreeCount / total) * 100) : 50

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: 'var(--sm-text-muted)', marginBottom: 8, fontWeight: 500 }}>
        Do you agree with this grade?
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => submitVote('agree')}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: voted === 'agree' ? '2px solid #00d084' : '1px solid var(--sm-border)',
            background: voted === 'agree' ? 'rgba(0, 208, 132, 0.12)' : 'var(--sm-surface)',
            color: voted === 'agree' ? '#00d084' : 'var(--sm-text)',
            fontSize: 13,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            lineHeight: 1,
          }}
        >
          Agree {agreeCount > 0 && `(${agreeCount})`}
        </button>
        <button
          onClick={() => submitVote('disagree')}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: voted === 'disagree' ? '2px solid #ef4444' : '1px solid var(--sm-border)',
            background: voted === 'disagree' ? 'rgba(239, 68, 68, 0.12)' : 'var(--sm-surface)',
            color: voted === 'disagree' ? '#ef4444' : 'var(--sm-text)',
            fontSize: 13,
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            lineHeight: 1,
          }}
        >
          Disagree {disagreeCount > 0 && `(${disagreeCount})`}
        </button>
      </div>

      {/* Vote bar */}
      {total > 0 && (
        <div style={{ height: 4, borderRadius: 2, overflow: 'hidden', display: 'flex', marginBottom: 8 }}>
          <div style={{ width: `${agreePct}%`, background: '#00d084', transition: 'width 0.4s' }} />
          <div style={{ width: `${100 - agreePct}%`, background: '#ef4444', transition: 'width 0.4s' }} />
        </div>
      )}

      {/* Optional comment */}
      {voted && !showComment && (
        <button
          onClick={() => setShowComment(true)}
          style={{
            fontSize: 12,
            color: 'var(--sm-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
          Add a comment
        </button>
      )}
      {showComment && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Your take (optional)..."
            maxLength={500}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--sm-border)',
              background: 'var(--sm-surface)',
              color: 'var(--sm-text)',
              fontSize: 13,
              lineHeight: 1,
            }}
          />
          <button
            onClick={() => voted && submitVote(voted)}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#BC0000',
              color: '#FAFAFB',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}
