import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://izwhcuccuwvlqqhpprbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)

const { data, error } = await supabase
  .from('sm_posts')
  .select('id, slug, content')
  .eq('slug', 'trade-garrett-bradbury-why-the-bears-could-change-plans-at-center')
  .single()

if (error) {
  console.error(error)
  process.exit(1)
}

const c = data.content || ''
console.log(`post id=${data.id}, content len=${c.length}`)

const re = /<a[^>]*>[^<]*Chicago Bears[^<]*<\/a>/gi
const matches = c.match(re) || []
console.log(`\nanchors wrapping "Chicago Bears": ${matches.length}`)
for (const m of matches.slice(0, 10)) console.log('---\n' + m)

const autolink = (c.match(/data-postiq-autolink/g) || []).length
console.log(`\npostiq-autolink markers: ${autolink}`)

const allAnchors = c.match(/<a[^>]+href="[^"]*"[^>]*>/gi) || []
console.log(`all anchors: ${allAnchors.length}`)

const hrefBears = c.match(/href="[^"]*chicago-bears[^"]*"/gi) || []
console.log(`hrefs containing "chicago-bears": ${hrefBears.length}`)
for (const h of hrefBears.slice(0, 8)) console.log('  ' + h)
