import { NextRequest, NextResponse } from 'next/server'
import { requireTrainingAccess } from '@/lib/training-auth'
import {
  fetchUserProgress,
  fetchUserCertification,
  countCompletedModules,
  averageScore,
} from '@/lib/training/progress'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const access = await requireTrainingAccess(request)
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status })
  }

  const [progress, cert] = await Promise.all([
    fetchUserProgress(access.userId),
    fetchUserCertification(access.userId),
  ])

  return NextResponse.json({
    progress,
    completed: countCompletedModules(progress),
    overallScore: averageScore(progress),
    certification: cert,
  })
}
