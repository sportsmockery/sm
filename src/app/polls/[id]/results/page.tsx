'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Poll, PollResults } from '@/types/polls'
import { getTeamColors, getRandomMicrocopy } from '@/types/polls'

export default function PollResultsPage() {
  const params = useParams()
  const id = params.id as string

  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPoll()
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchPoll, 5000)
    return () => clearInterval(interval)
  }, [id])

  async function fetchPoll() {
    try {
      const res = await fetch(`/api/polls/${id}`)
      if (!res.ok) throw new Error('Failed to load poll')
      const data = await res.json()
      setPoll(data.poll)
    } catch (err) {
      setError('Failed to load poll results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--sm-red)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--sm-text)', marginBottom: 8 }}>Poll not found</h2>
          <Link href="/polls" style={{ color: 'var(--sm-red-light)', textDecoration: 'none' }}>
            Back to polls
          </Link>
        </div>
      </div>
    )
  }

  const teamColors = getTeamColors(poll.team_theme || null)
  const maxVotes = Math.max(...poll.options.map(o => o.vote_count || 0))
  const winningOption = poll.options.find(o => o.vote_count === maxVotes && maxVotes > 0)

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
        {/* Breadcrumb */}
        <nav style={{ marginBottom: 24 }}>
          <ol style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
              <Link href="/polls" style={{ color: 'var(--sm-text-muted)', textDecoration: 'none' }}>
                Polls
              </Link>
            </li>
            <li style={{ color: 'var(--sm-text-dim)' }}>
              <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li style={{ color: 'var(--sm-text)', fontWeight: 600 }}>Results</li>
          </ol>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', fontFamily: 'var(--sm-font-heading)', margin: 0 }}>
                {poll.title || 'Poll Results'}
              </h1>
              <p style={{ color: 'var(--sm-text-muted)', marginTop: 4, fontSize: 15 }}>{poll.question}</p>
            </div>
            <Link href={`/polls/${id}/edit`} className="btn-secondary btn-sm">
              Edit Poll
            </Link>
          </div>

          {/* Live indicator & team tag */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            {poll.status === 'active' && (
              <span className="sm-tag">
                <span className="pulse-dot" />
                Live
              </span>
            )}
            {poll.team_theme && (
              <span className="sm-tag" style={{
                background: `${teamColors.primary}15`,
                color: teamColors.primary,
                borderColor: `${teamColors.primary}30`,
              }}>
                {poll.team_theme.charAt(0).toUpperCase() + poll.team_theme.slice(1)}
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="glass-card glass-card-sm glass-card-static">
            <p style={{ fontSize: 28, fontWeight: 800, color: teamColors.primary, margin: 0 }}>
              {poll.total_votes.toLocaleString()}
            </p>
            <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: 0 }}>Total Votes</p>
          </div>
          <div className="glass-card glass-card-sm glass-card-static">
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', margin: 0 }}>
              {poll.options.length}
            </p>
            <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: 0 }}>Options</p>
          </div>
          <div className="glass-card glass-card-sm glass-card-static">
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', margin: 0, textTransform: 'capitalize' }}>
              {poll.poll_type}
            </p>
            <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: 0 }}>Poll Type</p>
          </div>
          <div className="glass-card glass-card-sm glass-card-static">
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', margin: 0, textTransform: 'capitalize' }}>
              {poll.status}
            </p>
            <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: 0 }}>Status</p>
          </div>
        </div>

        {/* Results Chart */}
        <div className="glass-card glass-card-static" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 24, margin: 0, paddingBottom: 24 }}>
            {getRandomMicrocopy('results_header')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {poll.options
              .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
              .map((option, index) => {
                const percentage = poll.total_votes > 0
                  ? Math.round(((option.vote_count || 0) / poll.total_votes) * 100)
                  : 0
                const isWinner = option.id === winningOption?.id

                return (
                  <div key={option.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {option.emoji && <span style={{ fontSize: 22 }}>{option.emoji}</span>}
                        <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: 15 }}>
                          {option.option_text}
                        </span>
                        {isWinner && (
                          <span className="sm-tag" style={{
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            borderColor: 'rgba(245, 158, 11, 0.3)',
                            padding: '4px 10px',
                            fontSize: 11,
                          }}>
                            Winner
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: 'var(--sm-text)', fontSize: 16 }}>
                          {percentage}%
                        </span>
                        <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--sm-text-muted)' }}>
                          ({(option.vote_count || 0).toLocaleString()})
                        </span>
                      </div>
                    </div>
                    <div style={{
                      height: 40,
                      background: 'var(--sm-surface)',
                      borderRadius: 'var(--sm-radius-pill)',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                        style={{
                          height: '100%',
                          borderRadius: 'var(--sm-radius-pill)',
                          position: 'relative',
                          background: isWinner
                            ? 'var(--sm-gradient)'
                            : (option.team_tag
                              ? getTeamColors(option.team_tag).primary
                              : teamColors.primary),
                        }}
                      >
                        {isWinner && (
                          <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '33%',
                              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
                              transform: 'skewX(12deg)',
                            }}
                          />
                        )}
                      </motion.div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Embed Code */}
        <div className="glass-card glass-card-static">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16, margin: 0, paddingBottom: 16 }}>
            Embed This Poll
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--sm-text-muted)', marginBottom: 8 }}>
                Shortcode (for articles)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <code style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'var(--sm-surface)',
                  borderRadius: 'var(--sm-radius-sm)',
                  fontSize: 14,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'var(--sm-text)',
                  border: '1px solid var(--sm-border)',
                }}>
                  [poll:{poll.id}]
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`[poll:${poll.id}]`)}
                  className="btn-primary btn-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--sm-text-muted)', marginBottom: 8 }}>
                Embed URL
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <code style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'var(--sm-surface)',
                  borderRadius: 'var(--sm-radius-sm)',
                  fontSize: 14,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'var(--sm-text)',
                  border: '1px solid var(--sm-border)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/polls/embed/${poll.id}` : `/polls/embed/${poll.id}`}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/polls/embed/${poll.id}`)}
                  className="btn-primary btn-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
