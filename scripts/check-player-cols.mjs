import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'

const env = fs.readFileSync('.env.local', 'utf8')
for (const l of env.split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const dl = createClient(
  process.env.DATALAB_SUPABASE_URL,
  process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY
)

for (const t of [
  'bears_players',
  'bulls_players',
  'blackhawks_players',
  'cubs_players',
  'whitesox_players',
]) {
  const { data, error } = await dl.from(t).select('*').limit(1)
  if (error) { console.log(t, 'ERROR:', error.message); continue }
  const cols = Object.keys(data?.[0] || {})
  console.log(t, '→', cols.filter(k => /name|active|status|current/i.test(k)).join(', '))
}
