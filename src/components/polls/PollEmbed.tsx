'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import PollResults from './PollResults'
import type { Poll, PollOption, ChicagoTeam, PollResults as PollResultsType } from '@/types/polls'
import { getTeamColors, getRandomMicrocopy } from '@/types/polls'

interface PollEmbedProps {
  id?: string
  poll?: Poll
  className?: string
  compact?: boolean
}

export default function PollEmbed({ id, poll: propPoll, className = '', compact = false }: PollEmbedProps) {
  const [poll, setPoll] = useState<Poll | null>(propPoll || null)
  const [loading, setLoading] = useState(!propPoll && !!id)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVotedOptions, setUserVotedOptions] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  // Get team colors
  const teamColors = getTeamColors(poll?.team_theme || null)

  // Check localStorage for previous vote
  useEffect(() => {
    if (poll) {
      const voteKey = `poll_vote_${poll.id}`
      const storedVote = localStorage.getItem(voteKey)
      if (storedVote) {
        try {
          const voteData = JSON.parse(storedVote)
          setHasVoted(true)
          setUserVotedOptions(voteData.optionIds || [voteData.optionId])
          setShowResults(true)
        } catch (e) {
          // Invalid stored data, ignore
        }
      }
    }
  }, [poll])

  // Fetch poll if ID provided
  useEffect(() => {
    if (id && !propPoll) {
      fetchPoll()
    }
  }, [id, propPoll])

  async function fetchPoll() {
    try {
      setLoading(true)
      const res = await fetch(`/api/polls/${id}`)
      if (!res.ok) throw new Error('Poll not found')
      const data = await res.json()
      setPoll(data.poll)
    } catch (err) {
      setError('Failed to load poll')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleVote() {
    if (!poll || selectedOptions.length === 0) return

    setVoting(true)
    setError(null)
    try {
      // Generate anonymous ID for non-logged-in users
      let anonymousId = localStorage.getItem('sm_anonymous_id')
      if (!anonymousId) {
        anonymousId = crypto.randomUUID()
        localStorage.setItem('sm_anonymous_id', anonymousId)
      }

      const res = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_ids: selectedOptions,
          anonymous_id: anonymousId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      // Update poll with results
      if (data.results?.poll) {
        setPoll(data.results.poll)
      }

      setHasVoted(true)
      setUserVotedOptions(selectedOptions)
      setShowResults(true)
      setSuccessMessage(data.message || getRandomMicrocopy('voted'))

      // Store vote in localStorage
      localStorage.setItem(`poll_vote_${poll.id}`, JSON.stringify({
        optionIds: selectedOptions,
        votedAt: new Date().toISOString(),
      }))

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  function toggleOption(optionId: string) {
    if (!poll) return

    if (poll.poll_type === 'single' || poll.poll_type === 'scale') {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    }
  }

  if (loading) {
    return (
      <div className={`glass-card glass-card-static ${className}`} style={{ padding: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 192 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: `2px solid ${teamColors.primary}`,
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--sm-text-muted)' }}>Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error && !poll) {
    return (
      <div className={`glass-card glass-card-static ${className}`} style={{ padding: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 192, color: 'var(--sm-text-muted)' }}>
          <svg style={{ height: 48, width: 48, marginBottom: 16 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p style={{ fontSize: 14 }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!poll) return null

  const isPollClosed = poll.status === 'closed' || (poll.ends_at && new Date(poll.ends_at) < new Date())
  const canVote = !hasVoted && !isPollClosed && poll.status === 'active'

  // Generate CTA text
  const ctaText = getRandomMicrocopy('vote_cta')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={`glass-card ${className}`}
      style={{
        padding: 0,
        overflow: 'hidden',
        borderTopWidth: 4,
        borderTopStyle: 'solid',
        borderTopColor: teamColors.primary,
      }}
    >
      {/* Poll Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex',
              height: 40,
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--sm-radius-md)',
              background: `${teamColors.primary}15`,
            }}>
              <span style={{ fontSize: 20 }}>
                {poll.poll_type === 'emoji' ? '😊' : poll.poll_type === 'scale' ? '📊' : '🗳️'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: teamColors.primary }}>
                {poll.title || 'Poll'}
              </span>
              {isPollClosed && (
                <span className="sm-tag" style={{ marginLeft: 8, padding: '2px 8px', fontSize: 10 }}>
                  Closed
                </span>
              )}
              {poll.team_theme && (
                <span className="sm-tag" style={{
                  marginLeft: 8,
                  padding: '2px 8px',
                  fontSize: 10,
                  background: `${teamColors.primary}15`,
                  color: teamColors.primary,
                  borderColor: `${teamColors.primary}30`,
                }}>
                  {poll.team_theme.charAt(0).toUpperCase() + poll.team_theme.slice(1)}
                </span>
              )}
            </div>
          </div>
          {poll.show_results && !showResults && !hasVoted && (
            <button
              onClick={() => setShowResults(true)}
              style={{
                fontSize: 12,
                color: teamColors.primary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              View Results
            </button>
          )}
        </div>

        {/* Question */}
        <h3 style={{
          fontWeight: 700,
          color: 'var(--sm-text)',
          fontSize: compact ? 16 : 18,
          marginBottom: compact ? 16 : 24,
          fontFamily: 'var(--sm-font-heading)',
          margin: 0,
          paddingBottom: compact ? 16 : 24,
        }}>
          {poll.question}
        </h3>

        {/* Success message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 'var(--sm-radius-sm)',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600,
                background: `${teamColors.primary}15`,
                color: teamColors.primary,
              }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voting Options or Results */}
      <div style={{ padding: '0 24px 24px' }}>
        {showResults || hasVoted || isPollClosed ? (
          <PollResults
            options={poll.options}
            totalVotes={poll.total_votes}
            userVotedOptions={userVotedOptions}
            teamTheme={poll.team_theme}
            pollType={poll.poll_type}
            showWinner={true}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Scale poll */}
            {poll.poll_type === 'scale' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sm-text-muted)', marginBottom: 8 }}>
                  <span>{poll.scale_labels?.min || poll.scale_min}</span>
                  <span>{poll.scale_labels?.max || poll.scale_max}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                  {poll.options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id)
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleOption(option.id)}
                        disabled={!canVote}
                        whileHover={canVote ? { scale: 1.1 } : {}}
                        whileTap={canVote ? { scale: 0.95 } : {}}
                        style={{
                          flex: 1,
                          aspectRatio: '1',
                          maxWidth: 48,
                          borderRadius: 'var(--sm-radius-sm)',
                          fontSize: 14,
                          fontWeight: 700,
                          transition: 'all 0.2s',
                          border: 'none',
                          cursor: canVote ? 'pointer' : 'not-allowed',
                          opacity: canVote ? 1 : 0.6,
                          background: isSelected ? teamColors.primary : 'var(--sm-surface)',
                          color: isSelected ? '#fff' : 'var(--sm-text)',
                          boxShadow: isSelected ? `0 0 20px ${teamColors.primary}40` : 'none',
                        }}
                      >
                        {option.option_text}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ) : poll.poll_type === 'emoji' ? (
              /* Emoji poll */
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {poll.options.map((option) => {
                  const isSelected = selectedOptions.includes(option.id)
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      disabled={!canVote}
                      whileHover={canVote ? { scale: 1.2 } : {}}
                      whileTap={canVote ? { scale: 0.9 } : {}}
                      style={{
                        fontSize: 36,
                        padding: 12,
                        borderRadius: 'var(--sm-radius-md)',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: canVote ? 'pointer' : 'not-allowed',
                        opacity: canVote ? 1 : 0.6,
                        background: isSelected ? 'var(--sm-surface)' : 'transparent',
                        outline: isSelected ? `2px solid ${teamColors.primary}` : 'none',
                        outlineOffset: isSelected ? 2 : 0,
                        boxShadow: isSelected ? `0 0 20px ${teamColors.primary}30` : 'none',
                      }}
                    >
                      {option.emoji || option.option_text}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              /* Regular options */
              poll.options
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => {
                  const isSelected = selectedOptions.includes(option.id)
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      disabled={!canVote}
                      whileHover={canVote ? { scale: 1.01 } : {}}
                      whileTap={canVote ? { scale: 0.99 } : {}}
                      style={{
                        width: '100%',
                        borderRadius: 'var(--sm-radius-md)',
                        padding: 16,
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        cursor: canVote ? 'pointer' : 'not-allowed',
                        opacity: canVote ? 1 : 0.6,
                        border: `2px solid ${isSelected ? teamColors.primary : 'var(--sm-border)'}`,
                        background: isSelected ? `${teamColors.primary}10` : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          display: 'flex',
                          height: 20,
                          width: 20,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? teamColors.primary : 'var(--sm-border)'}`,
                          background: isSelected ? teamColors.primary : 'transparent',
                          transition: 'all 0.2s',
                        }}>
                          {isSelected && (
                            <svg style={{ height: 12, width: 12, color: '#fff' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {option.option_image && (
                          <img
                            src={option.option_image}
                            alt={option.option_text}
                            style={{ height: 32, width: 32, borderRadius: 4, objectFit: 'cover' }}
                          />
                        )}
                        <span style={{ fontWeight: 600, color: 'var(--sm-text)' }}>
                          {option.option_text}
                        </span>
                        {option.team_tag && (
                          <span className="sm-tag" style={{
                            marginLeft: 'auto',
                            padding: '2px 8px',
                            fontSize: 10,
                            background: `${getTeamColors(option.team_tag).primary}15`,
                            color: getTeamColors(option.team_tag).primary,
                            borderColor: `${getTeamColors(option.team_tag).primary}30`,
                          }}>
                            {option.team_tag}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  )
                })
            )}

            {/* Vote Button */}
            {canVote && (
              <motion.button
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || voting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
                style={{
                  marginTop: 16,
                  width: '100%',
                  borderRadius: 'var(--sm-radius-md)',
                  padding: '14px 0',
                  opacity: (selectedOptions.length === 0 || voting) ? 0.5 : 1,
                  cursor: (selectedOptions.length === 0 || voting) ? 'not-allowed' : 'pointer',
                }}
              >
                {voting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg style={{ height: 16, width: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Vote'
                )}
              </motion.button>
            )}

            {error && (
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--sm-error)', marginTop: 8 }}>{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Poll Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--sm-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'var(--sm-text-muted)',
        background: 'var(--sm-surface)',
      }}>
        <span>
          {!hasVoted && !isPollClosed && ctaText}
          {hasVoted && 'Thanks for voting!'}
          {isPollClosed && !hasVoted && 'This poll is closed'}
        </span>
        {poll.ends_at && !isPollClosed && (
          <span>
            Ends {new Date(poll.ends_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  )
}
