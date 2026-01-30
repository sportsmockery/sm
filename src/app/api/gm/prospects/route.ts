import { NextRequest, NextResponse } from 'next/server'
import type { MLBProspect } from '@/types/gm'

// Placeholder prospect data - will be replaced with Datalab integration
const PLACEHOLDER_PROSPECTS: Record<string, MLBProspect[]> = {
  cubs: [
    { prospect_id: 'cubs-1', name: 'Matt Shaw', position: 'SS', level: 'AAA', age: 23, rank: 1, isTop100: true, eta: '2025' },
    { prospect_id: 'cubs-2', name: 'Moises Ballesteros', position: 'C', level: 'AA', age: 20, rank: 2, isTop100: true, eta: '2026' },
    { prospect_id: 'cubs-3', name: 'Owen Caissie', position: 'OF', level: 'AAA', age: 22, rank: 3, isTop100: true, eta: '2025' },
    { prospect_id: 'cubs-4', name: 'Cade Horton', position: 'SP', level: 'AA', age: 23, rank: 4, isTop100: true, eta: '2025' },
    { prospect_id: 'cubs-5', name: 'James Triantos', position: '2B', level: 'AA', age: 21, rank: 5, isTop100: false, eta: '2026' },
    { prospect_id: 'cubs-6', name: 'Kevin Alcantara', position: 'OF', level: 'AA', age: 22, rank: 6, isTop100: false, eta: '2026' },
    { prospect_id: 'cubs-7', name: 'Cam Smith', position: 'C', level: 'A+', age: 21, rank: 7, isTop100: false, eta: '2027' },
    { prospect_id: 'cubs-8', name: 'Jaxon Wiggins', position: 'SP', level: 'A+', age: 23, rank: 8, isTop100: false, eta: '2026' },
    { prospect_id: 'cubs-9', name: 'Luis Verdugo', position: 'SS', level: 'AA', age: 21, rank: 9, isTop100: false, eta: '2026' },
    { prospect_id: 'cubs-10', name: 'Nazier Mule', position: 'SP', level: 'A', age: 20, rank: 10, isTop100: false, eta: '2027' },
  ],
  whitesox: [
    { prospect_id: 'sox-1', name: 'Colson Montgomery', position: 'SS', level: 'AAA', age: 23, rank: 1, isTop100: true, eta: '2025' },
    { prospect_id: 'sox-2', name: 'Noah Schultz', position: 'SP', level: 'AA', age: 21, rank: 2, isTop100: true, eta: '2026' },
    { prospect_id: 'sox-3', name: 'Drew Thorpe', position: 'SP', level: 'AAA', age: 24, rank: 3, isTop100: true, eta: '2025' },
    { prospect_id: 'sox-4', name: 'Samuel Zavala', position: 'OF', level: 'A+', age: 19, rank: 4, isTop100: true, eta: '2027' },
    { prospect_id: 'sox-5', name: 'Edgar Quero', position: 'C', level: 'AA', age: 21, rank: 5, isTop100: false, eta: '2026' },
    { prospect_id: 'sox-6', name: 'Jairo Iriarte', position: 'SP', level: 'A+', age: 21, rank: 6, isTop100: false, eta: '2026' },
    { prospect_id: 'sox-7', name: 'Hagen Smith', position: 'SP', level: 'A', age: 21, rank: 7, isTop100: false, eta: '2027' },
    { prospect_id: 'sox-8', name: 'Tim Elko', position: '1B', level: 'A+', age: 24, rank: 8, isTop100: false, eta: '2026' },
    { prospect_id: 'sox-9', name: 'Jonathan Cannon', position: 'SP', level: 'AAA', age: 24, rank: 9, isTop100: false, eta: '2025' },
    { prospect_id: 'sox-10', name: 'Brooks Baldwin', position: '2B', level: 'A+', age: 23, rank: 10, isTop100: false, eta: '2026' },
  ],
}

// Generic placeholder for any MLB team not specifically defined
function generatePlaceholderProspects(teamKey: string): MLBProspect[] {
  const positions = ['SP', 'SS', 'OF', 'C', '2B', '3B', 'SP', 'OF', '1B', 'SP']
  const levels: Array<'R' | 'A' | 'A+' | 'AA' | 'AAA'> = ['AAA', 'AA', 'AA', 'A+', 'A+', 'A', 'A', 'A', 'R', 'R']

  return Array.from({ length: 10 }, (_, i) => ({
    prospect_id: `${teamKey}-${i + 1}`,
    name: `Prospect ${i + 1}`,
    position: positions[i],
    level: levels[i],
    age: 19 + Math.floor(Math.random() * 6),
    rank: i + 1,
    isTop100: i < 2,
    eta: String(2025 + Math.floor(i / 3)),
  }))
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teamKey = searchParams.get('team_key')?.toLowerCase()
  const sport = searchParams.get('sport')?.toLowerCase()

  // Only MLB teams have prospects in this context
  if (sport !== 'mlb') {
    return NextResponse.json({ prospects: [], message: 'Prospects only available for MLB teams' })
  }

  if (!teamKey) {
    return NextResponse.json({ error: 'team_key is required' }, { status: 400 })
  }

  // Normalize team key (handle various formats)
  const normalizedKey = teamKey
    .replace('chicago-', '')
    .replace('white-sox', 'whitesox')
    .replace('chi-', '')

  // Get prospects from placeholder data or generate generic ones
  let prospects = PLACEHOLDER_PROSPECTS[normalizedKey]

  if (!prospects) {
    // For any MLB team without specific data, generate placeholder
    prospects = generatePlaceholderProspects(normalizedKey)
  }

  // TODO: Replace with Datalab integration
  // const { data, error } = await datalabAdmin
  //   .from('gm_draft_prospects')
  //   .select('*')
  //   .eq('team_key', normalizedKey)
  //   .order('rank', { ascending: true })
  //   .limit(30)

  return NextResponse.json({ prospects })
}
