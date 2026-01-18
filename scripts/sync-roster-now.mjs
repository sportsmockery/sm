import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'
const ESPN_ROSTER_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/3/roster'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

async function syncRoster() {
  console.log('=== Syncing Bears Roster from ESPN ===\n')

  // Fetch from ESPN
  const response = await fetch(ESPN_ROSTER_URL)
  const espnData = await response.json()

  // Flatten players from all position groups
  const espnPlayers = []
  for (const group of espnData.athletes || []) {
    for (const player of group.items || []) {
      espnPlayers.push(player)
    }
  }

  console.log('Found ' + espnPlayers.length + ' players on ESPN roster\n')

  let updated = 0
  let inserted = 0
  const errors = []

  for (const player of espnPlayers) {
    const playerData = {
      espn_id: player.id,
      name: player.fullName,
      first_name: player.firstName,
      last_name: player.lastName,
      jersey_number: player.jersey ? parseInt(player.jersey) : null,
      position: player.position?.abbreviation || 'UNK',
      headshot_url: player.headshot?.href || null,
      height_inches: player.height || null,
      weight_lbs: player.weight || null,
      college: player.college?.name || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    // Check if player exists by ESPN ID
    const { data: existing } = await supabase
      .from('bears_players')
      .select('id')
      .eq('espn_id', player.id)
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('bears_players')
        .update(playerData)
        .eq('espn_id', player.id)

      if (error) {
        errors.push('Update ' + player.fullName + ': ' + error.message)
      } else {
        updated++
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('bears_players')
        .insert(playerData)

      if (error) {
        errors.push('Insert ' + player.fullName + ': ' + error.message)
      } else {
        inserted++
      }
    }
  }

  // Mark players NOT on ESPN roster as inactive
  const espnIds = espnPlayers.map(p => p.id)
  const { data: deactivated, error: deactivateError } = await supabase
    .from('bears_players')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('is_active', true)
    .not('espn_id', 'in', '(' + espnIds.join(',') + ')')
    .select('name')

  console.log('✓ Updated: ' + updated)
  console.log('✓ Inserted: ' + inserted)
  console.log('✓ Deactivated: ' + (deactivated?.length || 0))

  if (deactivated && deactivated.length > 0) {
    console.log('\nDeactivated players:')
    deactivated.slice(0, 10).forEach(p => console.log('  - ' + p.name))
  }

  if (errors.length > 0) {
    console.log('\nErrors (' + errors.length + '):')
    errors.slice(0, 5).forEach(e => console.log('  - ' + e))
  }

  console.log('\n=== Roster Sync Complete ===')
}

syncRoster()
