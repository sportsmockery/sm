// Diagnostic script: Check author data in sm_posts and sm_authors
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://izwhcuccuwvlqqhpprbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)

async function diagnose() {
  console.log('=== DIAGNOSTIC: Author Data ===\n')

  // 1) Check sm_posts author_id
  console.log('--- 1. sm_posts author_id sample ---')
  const { data: posts, error: postsErr } = await supabase
    .from('sm_posts')
    .select('id, title, author_id')
    .eq('status', 'published')
    .limit(10)
  if (postsErr) console.error('Error:', postsErr.message)
  else posts.forEach(p => console.log(`  [${p.author_id}] ${p.title?.substring(0, 60)}`))

  // 2) Check sm_authors
  console.log('\n--- 2. sm_authors sample ---')
  const { data: authors, error: authErr } = await supabase
    .from('sm_authors')
    .select('id, display_name, slug, avatar_url')
    .limit(20)
  if (authErr) console.error('Error:', authErr.message)
  else authors.forEach(a => console.log(`  [${a.id}] ${a.display_name} | avatar: ${a.avatar_url ? 'YES' : 'NO'}`))

  // 3) Check join match
  console.log('\n--- 3. Join match test ---')
  const { data: joined, error: joinErr } = await supabase
    .from('sm_posts')
    .select('title, author:sm_authors!author_id(display_name, avatar_url)')
    .eq('status', 'published')
    .limit(10)
  if (joinErr) console.error('Error:', joinErr.message)
  else joined.forEach(p => {
    const auth = Array.isArray(p.author) ? p.author[0] : p.author
    console.log(`  ${auth?.display_name || 'NULL'} → ${p.title?.substring(0, 50)}`)
  })

  // 4) Count stats
  console.log('\n--- 4. Stats ---')
  const { count: totalPosts } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: postsWithAuthor } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .not('author_id', 'is', null)

  const { count: totalAuthors } = await supabase
    .from('sm_authors')
    .select('*', { count: 'exact', head: true })

  console.log(`  Total published posts: ${totalPosts}`)
  console.log(`  Posts with author_id: ${postsWithAuthor}`)
  console.log(`  Total authors: ${totalAuthors}`)

  // 5) Check distinct author_ids in posts
  console.log('\n--- 5. Distinct author_ids in sm_posts ---')
  const { data: distinctIds } = await supabase
    .from('sm_posts')
    .select('author_id')
    .eq('status', 'published')
    .not('author_id', 'is', null)
    .limit(1000)

  const uniqueIds = [...new Set(distinctIds?.map(p => p.author_id))]
  console.log(`  Unique author_ids: ${uniqueIds.length}`)
  uniqueIds.slice(0, 10).forEach(id => console.log(`    ${id}`))

  // 6) Check if author IDs from posts match sm_authors IDs
  console.log('\n--- 6. Match check ---')
  const { data: authorIds } = await supabase
    .from('sm_authors')
    .select('id')
    .limit(1000)
  const authorIdSet = new Set(authorIds?.map(a => a.id))

  let matched = 0
  let unmatched = 0
  uniqueIds.forEach(id => {
    if (authorIdSet.has(id)) matched++
    else unmatched++
  })
  console.log(`  Matched: ${matched}, Unmatched: ${unmatched}`)
  if (unmatched > 0) {
    console.log('  Unmatched IDs sample:')
    uniqueIds.filter(id => !authorIdSet.has(id)).slice(0, 5).forEach(id => console.log(`    ${id}`))
  }

  // 7) Check sm_posts columns for alternative author fields
  console.log('\n--- 7. sm_posts columns check ---')
  const { data: cols } = await supabase.rpc('get_table_columns', { table_name: 'sm_posts' }).catch(() => ({ data: null }))
  if (cols) {
    const authorCols = cols.filter(c => c.column_name.includes('author'))
    console.log('  Author-related columns:', authorCols.map(c => c.column_name))
  } else {
    // Fallback: try to select with wildcard and check keys
    const { data: sample } = await supabase.from('sm_posts').select('*').limit(1)
    if (sample?.[0]) {
      const keys = Object.keys(sample[0]).filter(k => k.includes('author') || k.includes('writer'))
      console.log('  Author-related fields in row:', keys)
      console.log('  All fields:', Object.keys(sample[0]).join(', '))
    }
  }

  // 8) Check distinct team_slug values
  console.log('\n--- 8. Distinct team_slug values ---')
  const { data: teamSlugs } = await supabase
    .from('sm_posts')
    .select('team_slug')
    .eq('status', 'published')
    .not('team_slug', 'is', null)
    .limit(1000)
  const uniqueTeamSlugs = [...new Set(teamSlugs?.map(p => p.team_slug))]
  console.log('  team_slug values:', uniqueTeamSlugs)

  // 9) Check distinct content_type values
  console.log('\n--- 9. Distinct content_type values ---')
  const { data: contentTypes } = await supabase
    .from('sm_posts')
    .select('content_type')
    .eq('status', 'published')
    .not('content_type', 'is', null)
    .limit(1000)
  const uniqueContentTypes = [...new Set(contentTypes?.map(p => p.content_type))]
  console.log('  content_type values:', uniqueContentTypes)

  // 10) Check category slugs
  console.log('\n--- 10. Distinct category slugs ---')
  const { data: catSlugs } = await supabase
    .from('sm_categories')
    .select('id, slug, name')
    .limit(50)
  if (catSlugs) catSlugs.forEach(c => console.log(`  [${c.id}] ${c.slug} (${c.name})`))
}

diagnose().catch(console.error)
