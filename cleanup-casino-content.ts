/**
 * One-time cleanup script to remove casino/betting/spam content
 * that was already imported from WordPress into Supabase.
 *
 * Usage:
 *   npx tsx cleanup-casino-content.ts
 *   npx tsx cleanup-casino-content.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DRY_RUN = process.argv.includes('--dry-run')

async function cleanup() {
  console.log(`🧹 Starting casino/spam content cleanup...${DRY_RUN ? ' (DRY RUN)' : ''}\n`)

  // 1. Find and delete blocked categories and their posts
  const blockedCategorySlugs = [
    'betmgm-illinois', 'pointsbet-illinois-sportsbook',
    'draftkings-illinois-sportsbook', 'sports-betting',
    'chicago-blackhawks-odds', 'uncategorized',
  ]

  const { data: blockedCategories } = await supabase
    .from('sm_categories')
    .select('id, slug, name')
    .in('slug', blockedCategorySlugs)

  if (blockedCategories?.length) {
    console.log(`Found ${blockedCategories.length} blocked categories:`)
    blockedCategories.forEach(c => console.log(`  - ${c.slug} (${c.name})`))

    // Delete posts in these categories first (FK constraint)
    for (const cat of blockedCategories) {
      const { data: posts } = await supabase
        .from('sm_posts')
        .select('id, slug, title')
        .eq('category_id', cat.id)

      if (posts?.length) {
        console.log(`  Found ${posts.length} posts in category "${cat.slug}":`)
        posts.forEach(p => console.log(`    - ${p.slug}: ${p.title}`))

        if (!DRY_RUN) {
          const { error } = await supabase
            .from('sm_posts')
            .delete()
            .eq('category_id', cat.id)

          if (error) console.error(`    ❌ Error deleting posts: ${error.message}`)
          else console.log(`    ✅ Deleted ${posts.length} posts`)
        }
      }
    }

    // Delete the categories themselves
    if (!DRY_RUN) {
      const { error: catErr } = await supabase
        .from('sm_categories')
        .delete()
        .in('slug', blockedCategorySlugs)

      if (!catErr) console.log(`\n✅ Deleted ${blockedCategories.length} blocked categories`)
      else console.error(`❌ Error deleting categories: ${catErr.message}`)
    }
  } else {
    console.log('No blocked categories found in database.')
  }

  // 2. Find and delete posts with casino/betting slugs
  const blockedPatterns = [
    'betmgm', 'pointsbet', 'draftkings', 'fanduel',
    'sportsbook', 'casino-slot', 'sports-betting',
    'online-casino', 'gambling', 'casino-games',
    'betting-odds', 'parlay', 'wager',
  ]

  console.log('\nSearching for posts with blocked slug patterns...')

  for (const pattern of blockedPatterns) {
    const { data: posts } = await supabase
      .from('sm_posts')
      .select('id, slug, title')
      .ilike('slug', `%${pattern}%`)

    if (posts?.length) {
      console.log(`\n  Pattern "${pattern}" — found ${posts.length} posts:`)
      posts.forEach(p => console.log(`    - ${p.slug}: ${p.title}`))

      if (!DRY_RUN) {
        const { error } = await supabase
          .from('sm_posts')
          .delete()
          .ilike('slug', `%${pattern}%`)

        if (!error) console.log(`    ✅ Deleted ${posts.length} posts`)
        else console.error(`    ❌ Error deleting: ${error.message}`)
      }
    }
  }

  // 3. Find and delete spam authors
  const blockedAuthors = [
    'the-importance-reputable-casino-slot-play',
    'casino-slot-play', 'soccer-event',
    'hhc-infused', 'gems-and-mines',
  ]

  console.log('\nSearching for spam authors...')

  for (const author of blockedAuthors) {
    const { data: found } = await supabase
      .from('sm_authors')
      .select('id, display_name, email')
      .or(`display_name.ilike.%${author}%,email.ilike.%${author}%`)

    if (found?.length) {
      console.log(`  Found author matching "${author}":`, found.map(a => a.display_name))

      if (!DRY_RUN) {
        // Nullify author_id on their posts before deleting the author (FK constraint)
        for (const a of found) {
          await supabase.from('sm_posts').update({ author_id: null }).eq('author_id', a.id)
        }

        const { error } = await supabase
          .from('sm_authors')
          .delete()
          .in('id', found.map(a => a.id))

        if (!error) console.log(`    ✅ Deleted ${found.length} spam authors`)
        else console.error(`    ❌ Error deleting: ${error.message}`)
      }
    }
  }

  console.log(`\n🎉 Cleanup ${DRY_RUN ? 'preview' : ''} complete!`)
}

cleanup().catch(console.error)
