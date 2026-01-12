'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Proposal {
  id: string
  title: string
  description: string
  votesFor: number
  votesAgainst: number
  endsIn: string
  status: 'active' | 'passed' | 'rejected'
  team: string
  teamColor: string
}

interface FanSenateProps {
  proposals?: Proposal[]
}

const defaultProposals: Proposal[] = [
  {
    id: '1',
    title: 'Should the Bears pursue a veteran QB?',
    description: 'Vote on whether the Bears should trade draft capital for an established quarterback.',
    votesFor: 3420,
    votesAgainst: 1890,
    endsIn: '2 days',
    status: 'active',
    team: 'Bears',
    teamColor: '#C83200',
  },
  {
    id: '2',
    title: 'Bulls rebuild or retool?',
    description: 'Should the Bulls commit to a full rebuild or try to retool around current core?',
    votesFor: 2156,
    votesAgainst: 2098,
    endsIn: '5 days',
    status: 'active',
    team: 'Bulls',
    teamColor: '#CE1141',
  },
]

export default function FanSenate({ proposals = defaultProposals }: FanSenateProps) {
  const [votes, setVotes] = useState<Record<string, 'for' | 'against' | null>>({})

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    setVotes(prev => ({
      ...prev,
      [proposalId]: prev[proposalId] === vote ? null : vote,
    }))
  }

  const getPercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst
    if (total === 0) return 50
    return Math.round((votesFor / total) * 100)
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-blue-950/30 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Fan Senate</h3>
            <p className="text-xs text-zinc-500">Your Voice Matters</p>
          </div>
        </div>

        <Link
          href="/governance"
          className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          All Proposals
        </Link>
      </div>

      {/* Proposals */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const percentage = getPercentage(proposal.votesFor, proposal.votesAgainst)
          const userVote = votes[proposal.id]

          return (
            <div
              key={proposal.id}
              className="rounded-xl border border-white/5 bg-white/5 p-4"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span
                    className="mb-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${proposal.teamColor}20`, color: proposal.teamColor }}
                  >
                    {proposal.team}
                  </span>
                  <h4 className="font-semibold text-white">{proposal.title}</h4>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                  {proposal.endsIn} left
                </span>
              </div>

              {/* Description */}
              <p className="mb-4 text-xs text-zinc-400">{proposal.description}</p>

              {/* Vote bar */}
              <div className="mb-3">
                <div className="relative h-2 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-emerald-400">Yes: {percentage}%</span>
                  <span className="text-red-400">No: {100 - percentage}%</span>
                </div>
              </div>

              {/* Vote counts */}
              <div className="mb-4 flex items-center justify-center gap-4 text-xs text-zinc-500">
                <span>{(proposal.votesFor + proposal.votesAgainst).toLocaleString()} votes</span>
              </div>

              {/* Vote buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote(proposal.id, 'for')}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    userVote === 'for'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                  }`}
                >
                  {userVote === 'for' ? 'Voted Yes' : 'Vote Yes'}
                </button>
                <button
                  onClick={() => handleVote(proposal.id, 'against')}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                    userVote === 'against'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-red-500/20 hover:text-red-400'
                  }`}
                >
                  {userVote === 'against' ? 'Voted No' : 'Vote No'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-500/10 p-3">
        <p className="text-xs text-blue-300/70">
          Democracy in action - shape the conversation
        </p>
        <Link
          href="/governance"
          className="text-xs font-semibold text-blue-400 hover:text-blue-300"
        >
          Submit Proposal →
        </Link>
      </div>
    </div>
  )
}
