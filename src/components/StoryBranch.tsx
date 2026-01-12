'use client'

import { useState } from 'react'

interface StoryChoice {
  id: string
  text: string
  nextNodeId: string
}

interface StoryNode {
  id: string
  title: string
  content: string
  choices?: StoryChoice[]
  isEnding?: boolean
  sentiment?: 'positive' | 'neutral' | 'negative'
}

interface StoryBranchProps {
  title: string
  description: string
  nodes: Record<string, StoryNode>
  startNodeId: string
}

// Example story structure for demonstration
const demoStory: StoryBranchProps = {
  title: 'The Bears Quarterback Decision',
  description: 'You are the Bears GM. The draft is approaching and you need to make a crucial decision about the quarterback position.',
  startNodeId: 'start',
  nodes: {
    start: {
      id: 'start',
      title: 'Draft Day Approaches',
      content: 'The Bears hold the #1 overall pick. Every analyst expects you to take the top QB prospect. But there\'s also a generational defensive talent available. Your phone rings - it\'s a team wanting to trade up. What do you do?',
      choices: [
        { id: 'c1', text: 'Take the QB - Franchise quarterbacks are rare', nextNodeId: 'take-qb' },
        { id: 'c2', text: 'Take the defender - Build from the trenches', nextNodeId: 'take-def' },
        { id: 'c3', text: 'Answer the trade call - Accumulate picks', nextNodeId: 'trade-down' },
      ],
    },
    'take-qb': {
      id: 'take-qb',
      title: 'The Franchise QB',
      content: 'You select the quarterback. The crowd roars, but your offensive line is still a concern. Year one is tough - the rookie takes too many hits. Do you address the line aggressively or trust the development process?',
      choices: [
        { id: 'c4', text: 'Trade multiple picks for a proven tackle', nextNodeId: 'qb-protected' },
        { id: 'c5', text: 'Draft and develop - patience is key', nextNodeId: 'qb-struggle' },
      ],
    },
    'take-def': {
      id: 'take-def',
      title: 'Defensive Foundation',
      content: 'The defensive star transforms your unit. But the QB position remains unsettled. A veteran becomes available mid-season. Your defense is good enough to contend. Take the risk?',
      choices: [
        { id: 'c6', text: 'Trade for the veteran - Win now', nextNodeId: 'def-vet-qb' },
        { id: 'c7', text: 'Stay the course - Next year\'s draft class is better', nextNodeId: 'def-wait' },
      ],
    },
    'trade-down': {
      id: 'trade-down',
      title: 'Asset Accumulation',
      content: 'You land three first-round picks over two years. The flexibility is intoxicating, but fans are restless. Year one passes without a playoff appearance. The pressure mounts.',
      choices: [
        { id: 'c8', text: 'Use picks to trade for a star QB', nextNodeId: 'trade-for-star' },
        { id: 'c9', text: 'Execute the long-term plan - Draft smart', nextNodeId: 'trade-build' },
      ],
    },
    'qb-protected': {
      id: 'qb-protected',
      title: 'The Protected Investment',
      content: 'With elite protection, your QB flourishes in year two. The Bears make the playoffs. The city is electric. Your gamble paid off.',
      isEnding: true,
      sentiment: 'positive',
    },
    'qb-struggle': {
      id: 'qb-struggle',
      title: 'Growing Pains',
      content: 'The young line struggles. Your QB shows flashes but takes a beating. Three years later, you\'re still rebuilding. The fans\' patience has run out.',
      isEnding: true,
      sentiment: 'negative',
    },
    'def-vet-qb': {
      id: 'def-vet-qb',
      title: 'The Veteran Savior',
      content: 'The veteran QB provides stability. Combined with your dominant defense, the Bears become contenders. A conference championship appearance follows. Close, but not quite.',
      isEnding: true,
      sentiment: 'neutral',
    },
    'def-wait': {
      id: 'def-wait',
      title: 'Patience Rewarded',
      content: 'You wait and land a top QB in the next draft. Your defense is still elite. Year one together - the Bears win their first Super Bowl in decades.',
      isEnding: true,
      sentiment: 'positive',
    },
    'trade-for-star': {
      id: 'trade-for-star',
      title: 'The Star Arrives',
      content: 'The star QB brings immediate credibility. But you gave up your future to get him. It\'s Super Bowl or bust. The pressure is immense, but the talent is real.',
      isEnding: true,
      sentiment: 'neutral',
    },
    'trade-build': {
      id: 'trade-build',
      title: 'The Dynasty Blueprint',
      content: 'You resist the urge to rush. Smart drafts build a core. By year four, you have a homegrown contender with cap space to spare. Sustainable success.',
      isEnding: true,
      sentiment: 'positive',
    },
  },
}

export default function StoryBranch({
  title = demoStory.title,
  description = demoStory.description,
  nodes = demoStory.nodes,
  startNodeId = demoStory.startNodeId,
}: Partial<StoryBranchProps>) {
  const [currentNodeId, setCurrentNodeId] = useState(startNodeId)
  const [history, setHistory] = useState<string[]>([])
  const [isStarted, setIsStarted] = useState(false)

  const currentNode = nodes[currentNodeId]

  const handleChoice = (nextNodeId: string) => {
    setHistory(prev => [...prev, currentNodeId])
    setCurrentNodeId(nextNodeId)
  }

  const handleRestart = () => {
    setCurrentNodeId(startNodeId)
    setHistory([])
    setIsStarted(false)
  }

  const handleBack = () => {
    if (history.length > 0) {
      const prevNodeId = history[history.length - 1]
      setHistory(prev => prev.slice(0, -1))
      setCurrentNodeId(prevNodeId)
    }
  }

  const sentimentStyles = {
    positive: {
      bg: 'from-emerald-900/50 to-emerald-800/30',
      border: 'border-emerald-500/30',
      icon: '🏆',
    },
    neutral: {
      bg: 'from-amber-900/50 to-amber-800/30',
      border: 'border-amber-500/30',
      icon: '⚖️',
    },
    negative: {
      bg: 'from-red-900/50 to-red-800/30',
      border: 'border-red-500/30',
      icon: '💔',
    },
  }

  if (!isStarted) {
    return (
      <div className="rounded-2xl border border-[#8B0000]/30 bg-gradient-to-br from-zinc-900 to-[#8B0000]/10 p-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B0000] to-[#FF0000] shadow-lg shadow-[#8B0000]/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6666]">Interactive Story</span>
            <h3 className="font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-zinc-400">{description}</p>

        {/* Start button */}
        <button
          onClick={() => setIsStarted(true)}
          className="w-full rounded-xl bg-gradient-to-r from-[#8B0000] to-[#FF0000] py-3 font-bold text-white transition-all hover:from-[#a00000] hover:to-[#FF3333]"
        >
          Begin Your Story
        </button>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl border ${
        currentNode.isEnding && currentNode.sentiment
          ? sentimentStyles[currentNode.sentiment].border
          : 'border-zinc-800'
      } bg-gradient-to-br ${
        currentNode.isEnding && currentNode.sentiment
          ? sentimentStyles[currentNode.sentiment].bg
          : 'from-zinc-900 to-zinc-800'
      } p-6`}
    >
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={handleBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <span className="text-xs text-zinc-500">
            Step {history.length + 1}
          </span>
        </div>

        <button
          onClick={handleRestart}
          className="text-xs font-semibold text-[#FF6666] transition-colors hover:text-[#FF0000]"
        >
          Restart
        </button>
      </div>

      {/* Ending indicator */}
      {currentNode.isEnding && currentNode.sentiment && (
        <div className="mb-4 flex items-center justify-center gap-2 text-2xl">
          <span>{sentimentStyles[currentNode.sentiment].icon}</span>
        </div>
      )}

      {/* Node title */}
      <h4 className="mb-3 text-xl font-bold text-white">{currentNode.title}</h4>

      {/* Node content */}
      <p className="mb-6 leading-relaxed text-zinc-300">{currentNode.content}</p>

      {/* Choices or ending */}
      {currentNode.isEnding ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-sm text-zinc-400">You&apos;ve reached an ending</p>
            <p className="mt-1 font-bold text-white">
              {currentNode.sentiment === 'positive' && 'A triumphant conclusion!'}
              {currentNode.sentiment === 'neutral' && 'A balanced outcome.'}
              {currentNode.sentiment === 'negative' && 'A cautionary tale.'}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="w-full rounded-xl bg-gradient-to-r from-[#8B0000] to-[#FF0000] py-3 font-bold text-white transition-all hover:from-[#a00000] hover:to-[#FF3333]"
          >
            Try a Different Path
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Choose your path:
          </p>
          {currentNode.choices?.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.nextNodeId)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left font-medium text-white transition-all hover:border-[#8B0000]/50 hover:bg-white/10"
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
