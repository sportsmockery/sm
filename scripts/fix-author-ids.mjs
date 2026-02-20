import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://izwhcuccuwvlqqhpprbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2hjdWNjdXd2bHFxaHBwcmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk1MTQwNSwiZXhwIjoyMDgzNTI3NDA1fQ.a6eJZOaq8vI18giqTWU951cWBp6LzfXmf6pkPhCQUxc'
)

async function fixAuthorIds() {
  // 1) Build wp_id -> id mapping from sm_authors
  const { data: authors } = await supabase
    .from('sm_authors')
    .select('id, wp_id, display_name')
    .not('wp_id', 'is', null)

  console.log('=== Author wp_id mapping ===')
  const wpToId = {}
  authors.forEach(a => {
    wpToId[a.wp_id] = a.id
    console.log(`  wp_id=${a.wp_id} → id=${a.id} (${a.display_name})`)
  })

  // 2) Get all posts with null author_id but with author_wp_id
  console.log('\n=== Posts with null author_id but author_wp_id ===')
  const { data: nullPosts, count } = await supabase
    .from('sm_posts')
    .select('id, author_wp_id', { count: 'exact' })
    .eq('status', 'published')
    .is('author_id', null)
    .not('author_wp_id', 'is', null)
    .limit(5000)

  console.log(`Found ${count} posts with null author_id but author_wp_id`)

  // 3) Check which wp_ids are in the null posts
  const wpIds = [...new Set(nullPosts?.map(p => p.author_wp_id))]
  console.log(`Unique author_wp_id values:`, wpIds)

  let matchable = 0
  let unmatchable = 0
  wpIds.forEach(wpId => {
    if (wpToId[wpId]) {
      matchable++
      console.log(`  ✓ wp_id=${wpId} → author ${wpToId[wpId]}`)
    } else {
      unmatchable++
      console.log(`  ✗ wp_id=${wpId} → NO MATCH`)
    }
  })
  console.log(`\nMatchable: ${matchable}, Unmatchable: ${unmatchable}`)

  // 4) Count how many we can fix
  let fixable = 0
  let unfixable = 0
  nullPosts?.forEach(p => {
    if (wpToId[p.author_wp_id]) fixable++
    else unfixable++
  })
  console.log(`Fixable posts: ${fixable}, Unfixable: ${unfixable}`)

  // 5) Actually fix them (in batches)
  if (fixable > 0) {
    console.log('\n=== Fixing author_id values ===')
    let fixed = 0
    let errors = 0

    // Group by wp_id for batch updates
    for (const wpId of wpIds) {
      const authorId = wpToId[wpId]
      if (!authorId) continue

      const postsToFix = nullPosts.filter(p => p.author_wp_id === wpId).map(p => p.id)

      // Update in batches of 500
      for (let i = 0; i < postsToFix.length; i += 500) {
        const batch = postsToFix.slice(i, i + 500)
        const { error } = await supabase
          .from('sm_posts')
          .update({ author_id: authorId })
          .in('id', batch)

        if (error) {
          console.error(`  Error updating batch for wp_id=${wpId}:`, error.message)
          errors += batch.length
        } else {
          fixed += batch.length
        }
      }
      console.log(`  Fixed ${postsToFix.length} posts for wp_id=${wpId} (${wpToId[wpId]})`)
    }

    console.log(`\nTotal fixed: ${fixed}, Errors: ${errors}`)
  }

  // 6) Verify
  console.log('\n=== Verification ===')
  const { count: remainingNull } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('author_id', null)
  console.log(`Remaining posts with null author_id: ${remainingNull}`)

  // 7) Verify join works now
  console.log('\n=== Sample join after fix ===')
  const { data: sample } = await supabase
    .from('sm_posts')
    .select('title, author:sm_authors!author_id(display_name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(15)
  sample?.forEach(p => {
    const auth = Array.isArray(p.author) ? p.author[0] : p.author
    console.log(`  ${auth?.display_name || 'NULL'} → ${p.title?.substring(0, 50)}`)
  })
}

fixAuthorIds().catch(console.error)
