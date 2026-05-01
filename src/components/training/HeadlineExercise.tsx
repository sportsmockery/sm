'use client'

import { useState } from 'react'

interface HeadlineCase {
  headline: string
  verdict: 'bait' | 'integrity'
  rationale: string
}

const CASES: HeadlineCase[] = [
  {
    headline: 'You Won’t Believe What Caleb Williams Just Did',
    verdict: 'bait',
    rationale:
      'No specifics, no claim to verify — pure curiosity bait. Violates headline integrity.',
  },
  {
    headline:
      'Caleb Williams’ Latest Comments Reveal How He Views the Bears’ Offensive Reset',
    verdict: 'integrity',
    rationale: 'Specific claim, honest framing, and the article must deliver on it.',
  },
  {
    headline: 'BREAKING: Bears Trade Confirmed (rumor unverified)',
    verdict: 'bait',
    rationale: 'Frames a rumor as confirmed news. Trust violation.',
  },
  {
    headline:
      'Why the Bulls’ Bench Rotation Is Quietly Reshaping the Eastern Conference Race',
    verdict: 'integrity',
    rationale: 'Clear thesis, specific subject, deliverable promise.',
  },
]

export function HeadlineExercise() {
  const [picks, setPicks] = useState<Record<number, 'bait' | 'integrity'>>({})

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <h3 className="text-xl font-bold">Headline Exercise</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Tag each headline as bait-and-switch or integrity-passing.
      </p>

      <div className="mt-5 space-y-3">
        {CASES.map((c, idx) => {
          const pick = picks[idx]
          const correct = pick === c.verdict
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <p className="text-sm font-semibold text-white">“{c.headline}”</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPicks((prev) => ({ ...prev, [idx]: 'bait' }))
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    pick === 'bait'
                      ? 'border-red-400/70 bg-red-900/40 text-red-100'
                      : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Bait-and-switch
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPicks((prev) => ({ ...prev, [idx]: 'integrity' }))
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    pick === 'integrity'
                      ? 'border-cyan-400/70 bg-cyan-900/40 text-cyan-100'
                      : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Integrity
                </button>
              </div>
              {pick ? (
                <p
                  className={`mt-3 text-xs ${
                    correct ? 'text-cyan-300' : 'text-red-300'
                  }`}
                >
                  {correct ? 'Correct.' : 'Reconsider.'} {c.rationale}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
