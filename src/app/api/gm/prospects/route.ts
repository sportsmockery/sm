import { NextRequest, NextResponse } from 'next/server'

const DATALAB_BASE_URL = 'https://datalab.sportsmockery.com'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teamKey = searchParams.get('team_key') || searchParams.get('team')
  const sport = searchParams.get('sport')?.toLowerCase()
  const limit = searchParams.get('limit') || '30'
  const minGrade = searchParams.get('min_grade')

  // Only MLB teams have prospects in this context
  if (sport && sport !== 'mlb') {
    return NextResponse.json({ prospects: [], message: 'Prospects only available for MLB teams' })
  }

  if (!teamKey) {
    return NextResponse.json({ error: 'team_key is required' }, { status: 400 })
  }

  try {
    // Build Datalab URL
    const params = new URLSearchParams({ team: teamKey, limit })
    if (minGrade) params.append('min_grade', minGrade)

    const response = await fetch(`${DATALAB_BASE_URL}/api/gm/prospects?${params}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('[prospects API] Datalab error:', response.status)
      return NextResponse.json({ prospects: [], error: 'Failed to fetch prospects' })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[prospects API] Error:', error)
    return NextResponse.json({ prospects: [], error: 'Failed to fetch prospects' })
  }
}
