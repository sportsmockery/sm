import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const DATALAB_BASE_URL = 'https://datalab.sportsmockery.com'

// Map NHL team keys (from gm_league_teams) to DataLab format (with hyphens)
const NHL_TEAM_KEY_MAP: Record<string, string> = {
  // Teams with multi-word names need hyphen conversion
  'redwings': 'red-wings',
  'mapleleafs': 'maple-leafs',
  'bluejackets': 'blue-jackets',
  'goldenknights': 'golden-knights',
  // Single word teams pass through as-is
  'blackhawks': 'blackhawks',
  'bruins': 'bruins',
  'sabres': 'sabres',
  'panthers': 'panthers',
  'canadiens': 'canadiens',
  'senators': 'senators',
  'lightning': 'lightning',
  'hurricanes': 'hurricanes',
  'devils': 'devils',
  'islanders': 'islanders',
  'rangers': 'rangers',
  'flyers': 'flyers',
  'penguins': 'penguins',
  'capitals': 'capitals',
  'avalanche': 'avalanche',
  'stars': 'stars',
  'wild': 'wild',
  'predators': 'predators',
  'blues': 'blues',
  'utah': 'utah',
  'jets': 'jets',
  'ducks': 'ducks',
  'flames': 'flames',
  'oilers': 'oilers',
  'kings': 'kings',
  'sharks': 'sharks',
  'kraken': 'kraken',
  'canucks': 'canucks',
}

// Map team keys (from gm_league_teams) to prospect table abbreviations (gm_mlb_prospects)
const TEAM_KEY_TO_ABBREV: Record<string, string> = {
  // Chicago teams (primary)
  'cubs': 'chc',
  'whitesox': 'chw',
  'chicago-cubs': 'chc',
  'chicago-white-sox': 'chw',
  'white-sox': 'chw',
  // AL East
  'orioles': 'bal',
  'redsox': 'bos',
  'yankees': 'nyy',
  'rays': 'tb',
  'bluejays': 'tor',
  // AL Central
  'guardians': 'cle',
  'tigers': 'det',
  'royals': 'kc',
  'twins': 'min',
  // AL West
  'astros': 'hou',
  'angels': 'laa',
  'athletics': 'oak',
  'mariners': 'sea',
  'rangers': 'tex',
  // NL Central
  'reds': 'cin',
  'brewers': 'mil',
  'pirates': 'pit',
  'cardinals': 'stl',
  // NL East
  'braves': 'atl',
  'marlins': 'mia',
  'mets': 'nym',
  'phillies': 'phi',
  'nationals': 'wsh',
  // NL West
  'diamondbacks': 'ari',
  'rockies': 'col',
  'dodgers': 'lad',
  'padres': 'sd',
  'giants': 'sf',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  let teamKey = searchParams.get('team_key') || searchParams.get('team')
  const sport = searchParams.get('sport')?.toLowerCase()
  const limit = parseInt(searchParams.get('limit') || '30', 10)
  const minGrade = searchParams.get('min_grade')

  if (!teamKey) {
    return NextResponse.json({ error: 'team_key is required' }, { status: 400 })
  }

  // NHL prospects - proxy to DataLab API
  if (sport === 'nhl') {
    try {
      // Convert team key to DataLab format (e.g., 'redwings' -> 'red-wings')
      const normalizedKey = teamKey.toLowerCase()
      const datalabTeamKey = NHL_TEAM_KEY_MAP[normalizedKey] || normalizedKey

      const url = new URL(`${DATALAB_BASE_URL}/api/gm/prospects`)
      url.searchParams.set('team_key', datalabTeamKey)
      url.searchParams.set('sport', 'nhl')
      url.searchParams.set('limit', String(limit))

      const response = await fetch(url.toString(), {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 300 }, // Cache for 5 minutes
      })

      if (!response.ok) {
        console.error('[prospects API] DataLab NHL error:', response.status)
        return NextResponse.json({ prospects: [], error: 'Failed to fetch NHL prospects' })
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (error) {
      console.error('[prospects API] NHL fetch error:', error)
      return NextResponse.json({ prospects: [], error: 'Failed to fetch NHL prospects' })
    }
  }

  // NBA and NFL don't have traditional prospects in this context
  if (sport && sport !== 'mlb') {
    return NextResponse.json({ prospects: [], message: `Prospects not available for ${sport.toUpperCase()} teams` })
  }

  // MLB prospects - query directly from Datalab Supabase
  // Normalize team key to Datalab format
  const normalizedKey = teamKey.toLowerCase()
  const datalabKey = TEAM_KEY_TO_ABBREV[normalizedKey] || normalizedKey

  try {
    // Query directly from Datalab Supabase (gm_mlb_prospects table)
    // Fields: name, position, team_key, team_name, org_rank, age,
    //         prospect_grade, prospect_grade_numeric, trade_value, source
    let query = datalabAdmin
      .from('gm_mlb_prospects')
      .select('*')
      .eq('team_key', datalabKey)
      .order('org_rank', { ascending: true })
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
