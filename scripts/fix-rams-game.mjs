import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

async function fixRamsGame() {
  console.log('=== Fixing Rams Game Data ===')
  
  // First, check current state
  const { data: before, error: checkError } = await supabase
    .from('bears_games_master')
    .select('*')
    .eq('external_id', '401772985')
    .single()
  
  if (checkError) {
    console.log('Error checking game:', checkError)
    return
  }
  
  console.log('BEFORE:', {
    game_date: before.game_date,
    opponent: before.opponent,
    bears_score: before.bears_score,
    opponent_score: before.opponent_score,
    bears_win: before.bears_win
  })
  
  // Fix the Rams game - set bears_win, bears_score, opponent_score to NULL
  const { data, error } = await supabase
    .from('bears_games_master')
    .update({
      bears_win: null,
      bears_score: null,
      opponent_score: null,
    })
    .eq('external_id', '401772985')
    .select()
  
  if (error) {
    console.log('Error fixing game:', error)
    return
  }
  
  console.log('AFTER:', {
    game_date: data[0].game_date,
    opponent: data[0].opponent,
    bears_score: data[0].bears_score,
    opponent_score: data[0].opponent_score,
    bears_win: data[0].bears_win
  })
  console.log('✓ Rams game fixed!')
}

fixRamsGame()
