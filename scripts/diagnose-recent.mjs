import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://izwhcuccuwvlqqhpprbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)

async function check() {
  // Most recent 20 published posts
  console.log('=== 20 Most Recent Published Posts ===')
  const { data: recent } = await supabase
    .from('sm_posts')
    .select('id, title, author_id, author_wp_id, published_at, created_at, wp_id')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  recent?.forEach(p => {
    console.log(`  [${p.published_at?.substring(0, 10)}] author_id=${p.author_id} wp_author=${p.author_wp_id} wp_id=${p.wp_id} "${p.title?.substring(0, 50)}"`)
  })

  // Check if these are WP imports or SM-created
  console.log('\n=== Posts from last 30 days ===')
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: recentPosts, count } = await supabase
    .from('sm_posts')
    .select('id, author_id', { count: 'exact' })
    .eq('status', 'published')
    .gte('published_at', thirtyDaysAgo.toISOString())
    .limit(1000)

  const withAuthor = recentPosts?.filter(p => p.author_id !== null).length
  console.log(`Last 30 days: ${count} posts, ${withAuthor} with author_id, ${count - withAuthor} without`)

  // Get the WP author IDs that are missing from sm_authors
  // Try to get author names from the WP site
  console.log('\n=== Top unmatched author_wp_ids by post count ===')
  const { data: nullPosts } = await supabase
    .from('sm_posts')
    .select('author_wp_id')
    .eq('status', 'published')
    .is('author_id', null)
    .not('author_wp_id', 'is', null)
    .limit(5000)

  const wpIdCounts = {}
  nullPosts?.forEach(p => {
    wpIdCounts[p.author_wp_id] = (wpIdCounts[p.author_wp_id] || 0) + 1
  })

  const sorted = Object.entries(wpIdCounts).sort((a, b) => b[1] - a[1])
  sorted.slice(0, 15).forEach(([wpId, count]) => {
    console.log(`  wp_id=${wpId}: ${count} posts`)
  })
}

check().catch(console.error)
