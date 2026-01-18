import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

async function fixRamsGame() {
  console.log('=== Fixing Rams Game - Setting bears_win to NULL ===')
  
  // Try to set just bears_win to null (scores stay at 0)
  const { data, error } = await supabase
    .from('bears_games_master')
    .update({
      bears_win: null,
    })
    .eq('external_id', '401772985')
    .select('game_date, opponent, bears_score, opponent_score, bears_win')
  
  if (error) {
    console.log('Error:', error.message)
    console.log('Full error:', error)
    return
  }
  
  console.log('FIXED:', data[0])
}

fixRamsGame()
