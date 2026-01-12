'use client'

import { useState, useEffect } from 'react'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  question: string
  options: PollOption[]
}

const samplePoll: Poll = {
  question: "Will the Bears make the playoffs?",
  options: [
    { id: 'yes', text: 'Yes, definitely', votes: 1234 },
    { id: 'no', text: 'No way', votes: 567 },
    { id: 'maybe', text: 'Maybe, depends on injuries', votes: 890 },
    { id: 'who-cares', text: 'Who cares at this point', votes: 345 },
  ],
}

interface PollWidgetProps {
  poll?: Poll
  className?: string
}

export default function PollWidget({ poll = samplePoll, className = '' }: PollWidgetProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votes, setVotes] = useState(poll.options)

  useEffect(() => {
    // Check if user has already voted (from localStorage)
    const voted = localStorage.getItem('sm_poll_voted')
    if (voted) {
      setHasVoted(true)
      setSelectedOption(voted)
    }
  }, [])

  const totalVotes = votes.reduce((sum, opt) => sum + opt.votes, 0)

  const handleVote = () => {
    if (!selectedOption || hasVoted) return

    // Update votes
    setVotes((prev) =>
      prev.map((opt) =>
        opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
      )
    )
    setHasVoted(true)
    localStorage.setItem('sm_poll_voted', selectedOption)
  }

  return (
    <div className={className}>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-[#8B0000] dark:text-[#FF6666]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">
            Weekly Poll
          </h3>
        </div>

        {/* Question */}
        <p className="mb-4 font-semibold text-zinc-900 dark:text-white">
          {poll.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {votes.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

            return (
              <button
                key={option.id}
                onClick={() => !hasVoted && setSelectedOption(option.id)}
                disabled={hasVoted}
                className={`
                  relative w-full overflow-hidden rounded-lg border-2 p-3 text-left transition-all
                  ${hasVoted
                    ? 'cursor-default border-zinc-200 dark:border-zinc-700'
                    : selectedOption === option.id
                    ? 'border-[#8B0000] dark:border-[#FF6666]'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }
                `}
              >
                {/* Progress bar (shown after voting) */}
                {hasVoted && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[#8B0000]/10 to-transparent dark:from-[#FF6666]/10"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {option.text}
                  </span>
                  {hasVoted && (
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Vote button */}
        {!hasVoted && (
          <button
            onClick={handleVote}
            disabled={!selectedOption}
            className="mt-4 w-full rounded-lg bg-[#8B0000] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#a00000] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
          >
            Vote
          </button>
        )}

        {/* Total votes */}
        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {totalVotes.toLocaleString()} votes
        </p>
      </div>
    </div>
  )
}
