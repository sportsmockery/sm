import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://siwoqfzzcxmngnseyzpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'
)

const ESPN_ROSTER_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/3/roster'

async function fixRoster() {
  console.log('=== Fixing Bears Roster Active Status ===\n')

  // Step 1: Mark ALL players as inactive
  console.log('Step 1: Marking all players as inactive...')
  const { error: resetError } = await supabase
    .from('bears_players')
    .update({ is_active: false })
    .neq('id', 0) // Match all rows

  if (resetError) {
    console.log('Reset error:', resetError)
    return
  }
  console.log('Done - all players marked inactive\n')

  // Step 2: Fetch ESPN roster
  console.log('Step 2: Fetching ESPN roster...')
  const response = await fetch(ESPN_ROSTER_URL)
  const espnData = await response.json()

  const espnPlayers = []
  for (const group of espnData.athletes || []) {
    for (const player of group.items || []) {
      espnPlayers.push(player)
    }
  }
  console.log('Found ' + espnPlayers.length + ' players on ESPN\n')

  // Step 3: Mark ESPN players as active (by ESPN ID)
  console.log('Step 3: Marking ESPN players as active...')
  const espnIds = espnPlayers.map(p => p.id)

  const { data: updated, error: updateError } = await supabase
    .from('bears_players')
    .update({ is_active: true })
    .in('espn_id', espnIds)
    .select('id')

  if (updateError) {
    console.log('Update error:', updateError)
    return
  }

  console.log('Marked ' + (updated?.length || 0) + ' players as active\n')

  // Step 4: Verify counts
  console.log('Step 4: Verifying...')
  const { data: active } = await supabase
    .from('bears_players')
    .select('id')
    .eq('is_active', true)

  const { data: inactive } = await supabase
    .from('bears_players')
    .select('id')
    .eq('is_active', false)

  console.log('Final counts:')
  console.log('  Active: ' + (active?.length || 0))
  console.log('  Inactive: ' + (inactive?.length || 0))

  console.log('\n=== Done ===')
}

fixRoster()
