import type { QuizQuestion } from './curriculum'

export interface QuizGrade {
  correctCount: number
  total: number
  scorePct: number
  passed: boolean
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<number, string>,
  passScore: number,
): QuizGrade {
  const total = questions.length
  const correctCount = questions.reduce(
    (acc, q, idx) => acc + (answers[idx] === q.correct ? 1 : 0),
    0,
  )
  const scorePct = total === 0 ? 0 : Math.round((correctCount / total) * 100)
  return {
    correctCount,
    total,
    scorePct,
    passed: scorePct >= passScore,
  }
}
