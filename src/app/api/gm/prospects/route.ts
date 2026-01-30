import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const DATALAB_BASE_URL = 'https://datalab.sportsmockery.com'

// Map Chicago team keys to Datalab abbreviations
const TEAM_KEY_TO_ABBREV: Record<string, string> = {
  'cubs': 'chc',
  'whitesox': 'chw',
  'chicago-cubs': 'chc',
  'chicago-white-sox': 'chw',
  'white-sox': 'chw',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let teamKey = searchParams.get('team_key') || searchParams.get('team')
  const sport = searchParams.get('sport')?.toLowerCase()
  const limit = parseInt(searchParams.get('limit') || '30', 10)
  const minGrade = searchParams.get('min_grade')

  // Only MLB teams have prospects in this context
  if (sport && sport !== 'mlb') {
    return NextResponse.json({ prospects: [], message: 'Prospects only available for MLB teams' })
  }

  if (!teamKey) {
    return NextResponse.json({ error: 'team_key is required' }, { status: 400 })
  }

  // Normalize team key to Datalab format
  const normalizedKey = teamKey.toLowerCase()
  const datalabKey = TEAM_KEY_TO_ABBREV[normalizedKey] || normalizedKey

  try {
    // Query directly from Datalab Supabase (gm_mlb_prospects table)
    let query = datalabAdmin
      .from('gm_mlb_prospects')
      .select('*')
      .eq('team_key', datalabKey)
      .order('team_rank', { ascending: true })
      .limit(limit)

    if (minGrade) {
      // Filter by minimum grade (A+, A, A-, B+, etc.)
      query = query.gte('prospect_grade', minGrade)
    }

    const { data: prospects, error } = await query

    if (error) {
      console.error('[prospects API] Supabase error:', error)
      return NextResponse.json({ prospects: [], error: 'Failed to fetch prospects' })
    }

    return NextResponse.json({
      success: true,
      team: datalabKey,
      sport: 'mlb',
      prospects: prospects || [],
      count: prospects?.length || 0,
    })
  } catch (error) {
    console.error('[prospects API] Error:', error)
    return NextResponse.json({ prospects: [], error: 'Failed to fetch prospects' })
  }
}
