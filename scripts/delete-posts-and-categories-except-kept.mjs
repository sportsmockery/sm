/**
 * Delete all posts and all categories EXCEPT the 6 kept team/sports categories.
 * Kept slugs: chicago-bears, chicago-blackhawks, chicago-bulls, chicago-cubs, chicago-sports, chicago-white-sox
 *
 * Run: node scripts/delete-posts-and-categories-except-kept.mjs
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key)

const KEEP_SLUGS = [
  'chicago-bears',
  'chicago-blackhawks',
  'chicago-bulls',
  'chicago-cubs',
  'chicago-sports',
  'chicago-white-sox',
]

async function main() {
  console.log('Fetching all categories...')
  const { data: categories, error: catError } = await supabase
    .from('sm_categories')
    .select('id, name, slug')

  if (catError) {
    console.error('Categories fetch error:', catError.message)
    process.exit(1)
  }

  const kept = (categories || []).filter((c) => KEEP_SLUGS.includes(c.slug))
  const toDelete = (categories || []).filter((c) => !KEEP_SLUGS.includes(c.slug))
  const keptIds = new Set(kept.map((c) => c.id))

  console.log('\nKept categories:', kept.length)
  kept.forEach((c) => console.log(`  - ${c.name} /${c.slug} (${c.id})`))
  console.log('\nCategories to delete:', toDelete.length)
  toDelete.forEach((c) => console.log(`  - ${c.name} /${c.slug} (${c.id})`))

  // Posts to delete: category_id not in kept IDs, or null (paginate to get all)
  console.log('\nFetching all posts (paginated)...')
  const allPosts = []
  const PAGE = 1000
  let offset = 0
  while (true) {
    const { data: page, error: pageError } = await supabase
      .from('sm_posts')
      .select('id, title, category_id')
      .range(offset, offset + PAGE - 1)
    if (pageError) {
      console.error('Posts fetch error:', pageError.message)
      process.exit(1)
    }
    if (!page?.length) break
    allPosts.push(...page)
    if (page.length < PAGE) break
    offset += PAGE
  }

  const postsToDelete = allPosts.filter(
    (p) => p.category_id == null || !keptIds.has(p.category_id)
  )
  const postIdsToDelete = postsToDelete.map((p) => p.id)

  console.log(`Posts to delete: ${postsToDelete.length} (of ${allPosts.length} total)`)

  if (postIdsToDelete.length === 0 && toDelete.length === 0) {
    console.log('\nNothing to delete. Exiting.')
    return
  }

  // Delete posts in batches of 100
  const BATCH = 100
  if (postIdsToDelete.length > 0) {
    console.log('\nDeleting posts in batches of', BATCH, '...')
    for (let i = 0; i < postIdsToDelete.length; i += BATCH) {
      const chunk = postIdsToDelete.slice(i, i + BATCH)
      const { error: delErr } = await supabase.from('sm_posts').delete().in('id', chunk)
      if (delErr) {
        console.error('Post delete error:', delErr.message)
        process.exit(1)
      }
      console.log(`  Deleted posts ${i + 1}–${i + chunk.length} / ${postIdsToDelete.length}`)
    }
    console.log('Posts deleted.')
  }

  // Delete categories not in keep list (in batches if many)
  if (toDelete.length > 0) {
    const catIdsToDelete = toDelete.map((c) => c.id)
    console.log('\nDeleting', catIdsToDelete.length, 'categories...')
    const { error: catDelErr } = await supabase
      .from('sm_categories')
      .delete()
      .in('id', catIdsToDelete)
    if (catDelErr) {
      console.error('Category delete error:', catDelErr.message)
      process.exit(1)
    }
    console.log('Categories deleted.')
  }

  console.log('\nDone. Kept:', kept.length, 'categories. Deleted:', postsToDelete.length, 'posts,', toDelete.length, 'categories.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
