import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://izwhcuccuwvlqqhpprbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)

async function diagnose() {
  // 1) All authors with their display_name
  console.log('=== ALL sm_authors ===')
  const { data: authors } = await supabase
    .from('sm_authors')
    .select('id, display_name, avatar_url')
    .order('id')
  authors.forEach(a => console.log(`  [${a.id}] "${a.display_name}" avatar: ${a.avatar_url ? a.avatar_url.substring(0, 60) : 'none'}`))

  // 2) Posts per author
  console.log('\n=== Posts per author_id ===')
  for (const a of authors) {
    const { count } = await supabase
      .from('sm_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('author_id', a.id)
    console.log(`  [${a.id}] ${a.display_name}: ${count} posts`)
  }

  // Count nulls
  const { count: nullCount } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('author_id', null)
  console.log(`  [NULL] No author: ${nullCount} posts`)

  // 3) Check all columns in sm_posts
  console.log('\n=== sm_posts columns ===')
  const { data: sample } = await supabase.from('sm_posts').select('*').limit(1)
  if (sample?.[0]) {
    console.log('  All fields:', Object.keys(sample[0]).sort().join(', '))
  }

  // 4) Check for wp_author or similar field
  console.log('\n=== Check for author name text fields ===')
  const { data: samplePost } = await supabase
    .from('sm_posts')
    .select('*')
    .eq('status', 'published')
    .is('author_id', null)
    .limit(3)
  if (samplePost) {
    samplePost.forEach(p => {
      const authorFields = Object.entries(p).filter(([k]) => k.includes('author') || k.includes('writer') || k.includes('wp_'))
      console.log(`  Post "${p.title?.substring(0, 40)}":`, authorFields.map(([k, v]) => `${k}=${v}`))
    })
  }

  // 5) Check sm_authors columns
  console.log('\n=== sm_authors columns ===')
  const { data: authSample } = await supabase.from('sm_authors').select('*').limit(1)
  if (authSample?.[0]) {
    console.log('  All fields:', Object.keys(authSample[0]).sort().join(', '))
  }

  // 6) Category slugs for team mapping
  console.log('\n=== Categories ===')
  const { data: cats } = await supabase
    .from('sm_categories')
    .select('id, slug, name')
    .order('slug')
  cats?.forEach(c => console.log(`  [${c.id}] slug="${c.slug}" name="${c.name}"`))

  // 7) team_slug on posts (direct column or derived?)
  console.log('\n=== team_slug sample ===')
  const { data: teamPosts } = await supabase
    .from('sm_posts')
    .select('title, team_slug')
    .eq('status', 'published')
    .not('team_slug', 'is', null)
    .limit(5)
  console.log(teamPosts ? 'Has team_slug column' : 'No team_slug column')
  teamPosts?.forEach(p => console.log(`  "${p.team_slug}" → ${p.title?.substring(0, 50)}`))

  // 8) content_type values
  console.log('\n=== content_type distribution ===')
  const { data: allPosts } = await supabase
    .from('sm_posts')
    .select('content_type')
    .eq('status', 'published')
    .limit(5000)
  const typeCounts = {}
  allPosts?.forEach(p => {
    const t = p.content_type || 'NULL'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  })
  Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`))
}

diagnose().catch(console.error)
