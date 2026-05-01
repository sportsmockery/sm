'use client'

import { useState } from 'react'
import type { QuizQuestion } from '@/lib/training/curriculum'

interface QuizCardProps {
  questions: QuizQuestion[]
  passScore: number
  moduleSlug: string
  initialScore?: number
  initialAttempts?: number
  alreadyCompleted?: boolean
  onPassed?: (score: number) => void
}

export function QuizCard({
  questions,
  passScore,
  moduleSlug,
  initialScore,
  initialAttempts = 0,
  alreadyCompleted,
  onPassed,
}: QuizCardProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedScore, setSavedScore] = useState<number | null>(
    alreadyCompleted && typeof initialScore === 'number' ? initialScore : null,
  )
  const [attempts, setAttempts] = useState(initialAttempts)
  const [error, setError] = useState<string | null>(null)

  const correctCount = questions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correct ? 1 : 0),
    0,
  )
  const pct = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0

  const passed = pct >= passScore
  const allAnswered = questions.every((_, idx) => Boolean(answers[idx]))

  async function handleSubmit() {
    if (!allAnswered) {
      setError('Answer every question before submitting.')
      return
    }
    setError(null)
    setSubmitted(true)
    setSaving(true)
    try {
      const res = await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleSlug,
          score: pct,
          passed,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || 'Could not save progress. Try again.')
      } else {
        const body = (await res.json()) as { attempts?: number }
        setAttempts(body.attempts ?? attempts + 1)
        if (passed) {
          setSavedScore(pct)
          onPassed?.(pct)
        }
      }
    } catch {
      setError('Network error saving progress.')
    } finally {
      setSaving(false)
    }
  }

  function handleRetake() {
    setAnswers({})
    setSubmitted(false)
    setError(null)
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Module Quiz</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Score {passScore}% or higher to complete this module.
          </p>
        </div>
        {savedScore !== null ? (
          <div className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Passed · {savedScore}%
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-black/25 p-4"
          >
            <p className="font-semibold text-white">
              <span className="mr-2 text-cyan-300">{idx + 1}.</span>
              {q.question}
            </p>

            <div className="mt-3 grid gap-2">
              {q.options.map((option) => {
                const selected = answers[idx] === option
                const isCorrect = option === q.correct
                let cls =
                  'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]'
                if (selected && !submitted) {
                  cls = 'border-cyan-400 bg-cyan-400/10 text-cyan-100'
                }
                if (submitted) {
                  if (isCorrect) {
                    cls = 'border-cyan-400/70 bg-cyan-400/15 text-cyan-100'
                  } else if (selected) {
                    cls = 'border-red-500/70 bg-red-900/30 text-red-200'
                  } else {
                    cls = 'border-white/5 bg-white/[0.02] text-zinc-400'
                  }
                }
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={submitted || saving}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [idx]: option }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition disabled:cursor-default ${cls}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {submitted && (
              <p
                className={`mt-3 text-sm ${
                  answers[idx] === q.correct ? 'text-cyan-300' : 'text-red-300'
                }`}
              >
                {answers[idx] === q.correct
                  ? 'Correct.'
                  : `Correct answer: ${q.correct}`}
                {q.explanation ? (
                  <span className="ml-2 text-zinc-400">{q.explanation}</span>
                ) : null}
              </p>
            )}
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !allAnswered}
            style={{ backgroundColor: '#bc0000', color: '#FAFAFB' }}
            className="rounded-xl px-5 py-3 text-sm font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRetake}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
          >
            Retake Quiz
          </button>
        )}

        {submitted ? (
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-zinc-400">
              Your score
            </div>
            <div className="text-2xl font-bold text-cyan-300">{pct}%</div>
            <div className="text-xs text-zinc-400">
              {passed
                ? 'Passed. Module complete.'
                : `Need ${passScore}% to pass. Review and try again.`}
            </div>
          </div>
        ) : null}

        {attempts > 0 ? (
          <span className="text-xs text-zinc-500">Attempts: {attempts}</span>
        ) : null}
      </div>
    </div>
  )
}
