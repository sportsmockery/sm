import { supabaseAdmin } from '@/lib/supabase-server'
import { TOTAL_MODULES } from './curriculum'

export interface ModuleProgressRow {
  module_slug: string
  completed: boolean
  quiz_score: number
  quiz_attempts: number
  completed_at: string | null
}

export type ProgressMap = Record<string, ModuleProgressRow>

export interface CertificationRow {
  certified: boolean
  overall_score: number
  completed_modules: number
  certified_at: string | null
}

export async function fetchUserProgress(userId: string): Promise<ProgressMap> {
  const { data, error } = await supabaseAdmin
    .from('writer_training_progress')
    .select('module_slug, completed, quiz_score, quiz_attempts, completed_at')
    .eq('user_id', userId)

  if (error || !data) return {}

  const map: ProgressMap = {}
  for (const row of data as ModuleProgressRow[]) {
    map[row.module_slug] = row
  }
  return map
}

export async function fetchUserCertification(
  userId: string,
): Promise<CertificationRow | null> {
  const { data, error } = await supabaseAdmin
    .from('writer_training_certifications')
    .select('certified, overall_score, completed_modules, certified_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as CertificationRow
}

export function countCompletedModules(progress: ProgressMap): number {
  return Object.values(progress).filter((p) => p.completed).length
}

export function averageScore(progress: ProgressMap): number {
  const completed = Object.values(progress).filter((p) => p.completed)
  if (completed.length === 0) return 0
  const sum = completed.reduce((acc, p) => acc + (p.quiz_score || 0), 0)
  return Math.round(sum / completed.length)
}

export function isFullyCertified(progress: ProgressMap): boolean {
  const completed = countCompletedModules(progress)
  return completed >= TOTAL_MODULES && averageScore(progress) >= 80
}
