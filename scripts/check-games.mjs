import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

async function checkGames() {
  // Get all games to understand the data pattern
  const { data, error } = await supabase
    .from('bears_games_master')
    .select('game_date, opponent, bears_score, opponent_score, bears_win')
    .order('game_date', { ascending: false })
    .limit(5)
  
  if (error) {
    console.log('Error:', error)
    return
  }
  
  console.log('Recent games:', JSON.stringify(data, null, 2))
}

checkGames()
