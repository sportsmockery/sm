'use client'

import { motion } from 'framer-motion'
import type { PollOption, ChicagoTeam, PollType } from '@/types/polls'
import { getTeamColors, getRandomMicrocopy } from '@/types/polls'

interface PollResultsProps {
  options: PollOption[]
  totalVotes: number
  userVotedOptions?: string[]
  teamTheme?: ChicagoTeam
  pollType?: PollType
  showWinner?: boolean
}

export default function PollResults({
  options,
  totalVotes,
  userVotedOptions = [],
  teamTheme,
  pollType = 'single',
  showWinner = true,
}: PollResultsProps) {
  const teamColors = getTeamColors(teamTheme || null)

  // Find the winning option
  const maxVotes = Math.max(...options.map(o => o.vote_count || 0))
  const winningOptions = options.filter(o => (o.vote_count || 0) === maxVotes && maxVotes > 0)

  // Generate colors for options
  const generateOptionColor = (index: number, option: PollOption) => {
    if (option.team_tag) {
      return getTeamColors(option.team_tag).primary
    }
    return teamColors.primary
  }

  // Emoji poll results
  if (pollType === 'emoji') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0
            const isWinner = showWinner && winningOptions.some(w => w.id === option.id)
            const isUserVote = userVotedOptions.includes(option.id)

            return (
              <motion.div
                key={option.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 16,
                  borderRadius: 'var(--sm-radius-md)',
                  background: isWinner
                    ? 'rgba(245, 158, 11, 0.1)'
                    : isUserVote
                      ? 'var(--sm-surface)'
                      : 'transparent',
                  border: isWinner ? '2px solid rgba(245, 158, 11, 0.4)' : '2px solid transparent',
                }}
              >
                <span style={{ fontSize: 36, marginBottom: 8 }}>{option.emoji || option.option_text}</span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ textAlign: 'center' }}
                >
                  <span style={{ fontSize: 18, fontWeight: 800, color: teamColors.primary }}>
                    {percentage}%
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--sm-text-muted)' }}>
                    {(option.vote_count || 0).toLocaleString()}
                  </span>
                </motion.div>
                {isUserVote && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 'var(--sm-radius-pill)',
                    background: 'var(--sm-red)',
                    color: '#fff',
                    fontWeight: 700,
                  }}>
                    You
                  </span>
                )}
                {isWinner && (
                  <span style={{ position: 'absolute', top: -4, left: -4, fontSize: 14 }}>🏆</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Total votes */}
        <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--sm-border)', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>
            {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    )
  }

  // Scale poll results
  if (pollType === 'scale') {
    const avgScore = totalVotes > 0
      ? options.reduce((sum, opt) => sum + (parseInt(opt.option_text) * (opt.vote_count || 0)), 0) / totalVotes
      : 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Average score display */}
        <div style={{ textAlign: 'center', padding: 16 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              color: '#fff',
              fontSize: 28,
              fontWeight: 800,
              background: teamColors.primary,
            }}
          >
            {avgScore.toFixed(1)}
          </motion.div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--sm-text-muted)' }}>Average score</p>
        </div>

        {/* Distribution bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0
            const isUserVote = userVotedOptions.includes(option.id)

            return (
              <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 24, fontSize: 12, color: 'var(--sm-text-muted)', textAlign: 'right' }}>
                  {option.option_text}
                </span>
                <div style={{ flex: 1, height: 24, background: 'var(--sm-surface)', borderRadius: 'var(--sm-radius-pill)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    style={{
                      height: '100%',
                      borderRadius: 'var(--sm-radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 8,
                      background: teamColors.primary,
                      opacity: 0.5 + (parseInt(option.option_text) / 20),
                    }}
                  >
                    {percentage > 10 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{percentage}%</span>
                    )}
                  </motion.div>
                </div>
                {isUserVote && (
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 'var(--sm-radius-pill)',
                    background: `${teamColors.primary}20`,
                    color: teamColors.primary,
                    fontWeight: 600,
                  }}>
                    You
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Total votes */}
        <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--sm-border)', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>
            {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    )
  }

  // Standard poll results
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {options.map((option, index) => {
        const percentage = totalVotes > 0 ? Math.round(((option.vote_count || 0) / totalVotes) * 100) : 0
        const isWinner = showWinner && winningOptions.some(w => w.id === option.id)
        const isUserVote = userVotedOptions.includes(option.id)
        const barColor = generateOptionColor(index, option)

        return (
          <div key={option.id} style={{ position: 'relative' }}>
            {/* Option label and percentage */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {option.option_image && (
                  <img
                    src={option.option_image}
                    alt={option.option_text}
                    style={{ height: 24, width: 24, borderRadius: 4, objectFit: 'cover' }}
                  />
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text)' }}>
                  {option.option_text}
                </span>
                {option.team_tag && (
                  <span className="sm-tag" style={{
                    padding: '2px 8px',
                    fontSize: 10,
                    background: `${getTeamColors(option.team_tag).primary}15`,
                    color: getTeamColors(option.team_tag).primary,
                    borderColor: `${getTeamColors(option.team_tag).primary}30`,
                  }}>
                    {option.team_tag}
                  </span>
                )}
                {isUserVote && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 'var(--sm-radius-pill)',
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    background: `${teamColors.primary}15`,
                    color: teamColors.primary,
                  }}>
                    <svg style={{ height: 12, width: 12 }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Your vote
                  </span>
                )}
                {isWinner && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 'var(--sm-radius-pill)',
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                  }}>
                    <svg style={{ height: 12, width: 12 }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Leading
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 800, color: 'var(--sm-text)' }}>
                  {percentage}%
                </span>
                <span style={{ color: 'var(--sm-text-muted)' }}>
                  ({(option.vote_count || 0).toLocaleString()} {(option.vote_count || 0) === 1 ? 'vote' : 'votes'})
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 32,
              overflow: 'hidden',
              borderRadius: 'var(--sm-radius-pill)',
              background: 'var(--sm-surface)',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                style={{
                  height: '100%',
                  borderRadius: 'var(--sm-radius-pill)',
                  position: 'relative',
                  background: isWinner ? 'var(--sm-gradient)' : barColor,
                }}
              >
                {/* Shimmer effect for winner */}
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

      {/* Total votes with microcopy */}
      <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--sm-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: teamColors.primary }}>
            {getRandomMicrocopy('results_header')}
          </span>
          <span style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>
            {totalVotes.toLocaleString()} total {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    </div>
  )
}
