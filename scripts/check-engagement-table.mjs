import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://izwhcuccuwvlqqhpprbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)
async function check() {
  const { data, error } = await supabase
    .from('user_engagement_profile')
    .select('*')
    .limit(1)
  console.log('user_engagement_profile:', error ? `ERROR: ${error.message}` : `OK, ${data?.length} rows`)
  if (data?.[0]) console.log('  Columns:', Object.keys(data[0]).join(', '))
}
check()
