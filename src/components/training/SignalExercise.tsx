'use client'

import { useState } from 'react'

interface SignalCase {
  prompt: string
  answer: 'signal' | 'authority'
  rationale: string
}

const CASES: SignalCase[] = [
  {
    prompt:
      'Beat reporter confirms a Bears practice-squad elevation for Sunday’s game.',
    answer: 'signal',
    rationale: 'Short, sourced, factual — feeds the depth chart evergreen page.',
  },
  {
    prompt:
      'A 1,200-word breakdown arguing the Bulls’ defensive identity has fundamentally shifted.',
    answer: 'authority',
    rationale: 'Original thesis with insight — that is an Authority Article.',
  },
  {
    prompt:
      'A reported rumor that the Cubs are exploring a trade for a controllable starting pitcher.',
    answer: 'signal',
    rationale: 'Rumor + source = Signal Update on the trade rumor evergreen page.',
  },
  {
    prompt:
      'Your take on why the Blackhawks rebuild timeline matters more than fans realize.',
    answer: 'authority',
    rationale: 'A point of view with original framing — Authority Article.',
  },
  {
    prompt: 'Injury status update from the team’s official report.',
    answer: 'signal',
    rationale: 'Sourced, short, fact-driven update — Signal.',
  },
]

export function SignalExercise() {
  const [picks, setPicks] = useState<Record<number, 'signal' | 'authority'>>({})

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <h3 className="text-xl font-bold">Signal vs Authority Exercise</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Decide whether each item should be a Signal Update or an Authority
        Article.
      </p>

      <div className="mt-5 space-y-3">
        {CASES.map((c, idx) => {
          const pick = picks[idx]
          const correct = pick === c.answer
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-black/25 p-4"
            >
              <p className="text-sm text-zinc-200">{c.prompt}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPicks((prev) => ({ ...prev, [idx]: 'signal' }))
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    pick === 'signal'
                      ? 'border-cyan-400/70 bg-cyan-900/40 text-cyan-100'
                      : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Signal Update
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPicks((prev) => ({ ...prev, [idx]: 'authority' }))
                  }
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    pick === 'authority'
                      ? 'border-red-400/70 bg-red-900/40 text-red-100'
                      : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  Authority Article
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
