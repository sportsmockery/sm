import { datalabAdmin } from '@/lib/supabase-datalab'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DepthChartEntry {
  id: number
  sport: string
  position: string
  positionGroup: string
  depthOrder: number
  playerName: string
  isStarter: boolean
  injuryStatus: string | null
  injuryDetail: string | null
  espnId: string | null
  jerseyNumber: number | null
  headshotUrl: string | null
  // Joined from players table:
  height: string | null
  weight: number | null
  age: number | null
  college: string | null
  experience: string | null
  slug: string
  // Sport-specific:
  bats?: string | null
  throws?: string | null
  birthCountry?: string | null
}

export interface DepthChartPositionGroup {
  key: string
  name: string
  positions: { position: string; players: DepthChartEntry[] }[]
}

// ─── Team Config ─────────────────────────────────────────────────────────────

type TeamKey = 'bears' | 'bulls' | 'blackhawks' | 'cubs' | 'whitesox'

interface TeamPlayerConfig {
  table: string
  espnIdCol: string
  selectCols: string
}

const TEAM_PLAYER_CONFIG: Record<TeamKey, TeamPlayerConfig> = {
  bears: {
    table: 'bears_players',
    espnIdCol: 'espn_id',
    selectCols: 'espn_id, height_inches, weight_lbs, birth_date, college, draft_year, birth_country',
  },
  bulls: {
    table: 'bulls_players',
    espnIdCol: 'espn_player_id',
    selectCols: 'espn_player_id, height_display, height_inches, weight_lbs, birth_date, college, years_pro',
  },
  blackhawks: {
    table: 'blackhawks_players',
    espnIdCol: 'espn_id',
    selectCols: 'espn_id, height, height_inches, weight_lbs, birth_date, college, nationality, draft_year',
  },
  cubs: {
    table: 'cubs_players',
    espnIdCol: 'espn_id',
    selectCols: 'espn_id, height, weight_lbs, birth_date, college, bats, throws',
  },
  whitesox: {
    table: 'whitesox_players',
    espnIdCol: 'espn_id',
    selectCols: 'espn_id, height, weight_lbs, birth_date, college, bats, throws',
  },
}

// Position group display order by team
const GROUP_ORDER: Record<TeamKey, string[]> = {
  bears: ['Offense', 'Defense', 'Special Teams'],
  bulls: ['Starters'],
  blackhawks: ['Forwards', 'Defensemen', 'Goaltenders'],
  cubs: ['Lineup', 'Starting Pitchers', 'Relief Pitchers'],
  whitesox: ['Lineup', 'Starting Pitchers', 'Relief Pitchers'],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const born = new Date(birthDate)
  if (isNaN(born.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--
  return age
}

function formatHeight(inches: number | null): string | null {
  if (!inches) return null
  const ft = Math.floor(inches / 12)
  const rem = inches % 12
  return `${ft}'${rem}"`
}

function calcExperience(draftYear: number | null, yearsPro: number | null): string | null {
  if (yearsPro != null) return yearsPro === 0 ? 'Rookie' : `${yearsPro} yr${yearsPro > 1 ? 's' : ''}`
  if (draftYear != null) {
    const yrs = new Date().getFullYear() - draftYear
    return yrs <= 0 ? 'Rookie' : `${yrs} yr${yrs > 1 ? 's' : ''}`
  }
  return null
}

// ─── Main Function ───────────────────────────────────────────────────────────

export async function getDepthChart(teamKey: TeamKey): Promise<DepthChartPositionGroup[]> {
  const config = TEAM_PLAYER_CONFIG[teamKey]

  // Fetch depth chart and player bio data in parallel
  const [dcRes, playersRes] = await Promise.all([
    datalabAdmin
      .from('depth_charts')
      .select('*')
      .eq('team_key', teamKey)
      .order('position_group')
      .order('position')
      .order('depth_order'),
    datalabAdmin
      .from(config.table)
      .select(config.selectCols),
  ])

  const depthRows = dcRes.data || []
  const playerRows = playersRes.data || []

  // Build lookup by ESPN ID
  const bioMap = new Map<string, any>()
  for (const p of playerRows) {
    const rec = p as Record<string, any>
    const eid = String(rec[config.espnIdCol] ?? '')
    if (eid) bioMap.set(eid, rec)
  }

  // Enrich depth chart entries with bio data
  const entries: DepthChartEntry[] = depthRows.map((row: any) => {
    const bio = row.espn_id ? bioMap.get(String(row.espn_id)) : null

    // Height: prefer display string columns, fall back to inches
    let height: string | null = null
    if (bio) {
      if (bio.height_display) height = bio.height_display
      else if (bio.height && typeof bio.height === 'string') height = bio.height
      else height = formatHeight(bio.height_inches ?? null)
    }

    return {
      id: row.id,
      sport: row.sport,
      position: row.position,
      positionGroup: row.position_group,
      depthOrder: row.depth_order,
      playerName: row.player_name,
      isStarter: row.is_starter ?? false,
      injuryStatus: row.injury_status,
      injuryDetail: row.injury_detail,
      espnId: row.espn_id,
      jerseyNumber: row.jersey_number,
      headshotUrl: row.headshot_url,
      height,
      weight: bio?.weight_lbs ?? null,
      age: bio ? calcAge(bio.birth_date) : null,
      college: bio?.college ?? null,
      experience: bio ? calcExperience(bio.draft_year ?? null, bio.years_pro ?? null) : null,
      slug: toSlug(row.player_name),
      bats: bio?.bats ?? undefined,
      throws: bio?.throws ?? undefined,
      birthCountry: bio?.nationality ?? bio?.birth_country ?? undefined,
    }
  })

  // Group by position_group, then by position within each group
  const groupMap = new Map<string, Map<string, DepthChartEntry[]>>()
  for (const entry of entries) {
    if (!groupMap.has(entry.positionGroup)) {
      groupMap.set(entry.positionGroup, new Map())
    }
    const posMap = groupMap.get(entry.positionGroup)!
    if (!posMap.has(entry.position)) {
      posMap.set(entry.position, [])
    }
    posMap.get(entry.position)!.push(entry)
  }

  // Build ordered result
  const orderedGroups = GROUP_ORDER[teamKey]
  const result: DepthChartPositionGroup[] = orderedGroups
    .filter((g) => groupMap.has(g))
    .map((groupName) => {
      const posMap = groupMap.get(groupName)!
      const positions = Array.from(posMap.entries()).map(([pos, players]) => ({
        position: pos,
        players: players.sort((a, b) => a.depthOrder - b.depthOrder),
      }))
      return {
        key: groupName,
        name: groupName,
        positions,
      }
    })

  return result
}
