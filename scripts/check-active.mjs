import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://siwoqfzzcxmngnseyzpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'
)

async function check() {
  const { data: active } = await supabase
    .from('bears_players')
    .select('id')
    .eq('is_active', true)
  
  const { data: inactive } = await supabase
    .from('bears_players')
    .select('id')
    .eq('is_active', false)
  
  const { data: nullActive } = await supabase
    .from('bears_players')
    .select('id')
    .is('is_active', null)
  
  console.log('Active:', active?.length || 0)
  console.log('Inactive:', inactive?.length || 0)
  console.log('Null:', nullActive?.length || 0)
}

check()
