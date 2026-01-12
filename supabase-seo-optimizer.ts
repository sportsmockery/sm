/**
 * SM SEO Optimizer for Supabase
 *
 * Applies SEO fixes to posts imported into Supabase.
 * SAFETY: Only fills in EMPTY fields - never overwrites existing data.
 *
 * Usage:
 *   npx ts-node supabase-seo-optimizer.ts
 *
 * Or copy to your project and run:
 *   npm run seo-optimize
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Validate environment
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Configuration
const CONFIG = {
  batchSize: 100,          // Posts per batch
  delayBetweenBatches: 100, // ms delay between batches
  metaDescMaxLength: 155,
  metaDescMinLength: 50,
  logProgress: true
}

// Stats tracking
const stats = {
  totalPosts: 0,
  processed: 0,
  seoTitleAdded: 0,
  seoDescriptionAdded: 0,
  excerptAdded: 0,
  skipped: 0,
  errors: 0
}

interface SMPost {
  id: string
  wp_id: number
  slug: string
  title: string
  content: string
  excerpt: string | null
  seo_title: string | null
  seo_description: string | null
  featured_image: string | null
  author_wp_id: number
  category_wp_id: number
  published_at: string
}

/**
 * Generate a meta description from content
 * NEVER overwrites - only generates for empty fields
 */
function generateMetaDescription(title: string, content: string, excerpt: string | null): string {
  // Prefer excerpt if available and reasonable length
  if (excerpt && excerpt.length >= CONFIG.metaDescMinLength) {
    let desc = stripHtml(excerpt).trim()
    if (desc.length > CONFIG.metaDescMaxLength) {
      desc = truncateAtWord(desc, CONFIG.metaDescMaxLength)
    }
    return desc
  }

  // Fall back to content
  let desc = stripHtml(content).trim()

  // Remove extra whitespace
  desc = desc.replace(/\s+/g, ' ')

  // Truncate at word boundary
  if (desc.length > CONFIG.metaDescMaxLength) {
    desc = truncateAtWord(desc, CONFIG.metaDescMaxLength)
  }

  // If still too short, use title + beginning of content
  if (desc.length < CONFIG.metaDescMinLength) {
    desc = `${title}. ${desc}`.substring(0, CONFIG.metaDescMaxLength)
  }

  return desc
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string): string {
  let excerpt = stripHtml(content).trim()
  excerpt = excerpt.replace(/\s+/g, ' ')

  if (excerpt.length > 300) {
    excerpt = truncateAtWord(excerpt, 300)
  }

  return excerpt
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
}

/**
 * Truncate string at word boundary
 */
function truncateAtWord(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str

  const truncated = str.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Process a single post - ONLY adds missing SEO data
 */
async function processPost(post: SMPost): Promise<{ updated: boolean; changes: string[] }> {
  const changes: string[] = []
  const updates: Partial<SMPost> = {}

  // SAFETY: Only update if field is empty/null

  // 1. SEO Title - only if empty
  if (!post.seo_title || post.seo_title.trim() === '') {
    updates.seo_title = post.title
    changes.push('seo_title')
    stats.seoTitleAdded++
  }

  // 2. SEO Description - only if empty
  if (!post.seo_description || post.seo_description.trim() === '') {
    updates.seo_description = generateMetaDescription(post.title, post.content, post.excerpt)
    changes.push('seo_description')
    stats.seoDescriptionAdded++
  }

  // 3. Excerpt - only if empty
  if (!post.excerpt || post.excerpt.trim() === '') {
    updates.excerpt = generateExcerpt(post.content)
    changes.push('excerpt')
    stats.excerptAdded++
  }

  // Only update if there are changes
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('sm_posts')
      .update(updates)
      .eq('id', post.id)

    if (error) {
      console.error(`❌ Error updating post ${post.id} (${post.slug}):`, error.message)
      stats.errors++
      return { updated: false, changes: [] }
    }

    return { updated: true, changes }
  }

  stats.skipped++
  return { updated: false, changes: [] }
}

/**
 * Process all posts in batches
 */
async function processAllPosts(): Promise<void> {
  console.log('📊 Fetching post count...')

  // Get total count
  const { count, error: countError } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Error fetching post count:', countError.message)
    process.exit(1)
  }

  stats.totalPosts = count || 0
  console.log(`📝 Total posts to process: ${stats.totalPosts}`)

  if (stats.totalPosts === 0) {
    console.log('No posts found in database.')
    return
  }

  const totalBatches = Math.ceil(stats.totalPosts / CONFIG.batchSize)
  console.log(`📦 Processing in ${totalBatches} batches of ${CONFIG.batchSize}...\n`)

  for (let batch = 0; batch < totalBatches; batch++) {
    const offset = batch * CONFIG.batchSize

    // Fetch batch of posts
    const { data: posts, error: fetchError } = await supabase
      .from('sm_posts')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + CONFIG.batchSize - 1)

    if (fetchError) {
      console.error(`❌ Error fetching batch ${batch + 1}:`, fetchError.message)
      continue
    }

    if (!posts || posts.length === 0) {
      continue
    }

    // Process each post in the batch
    for (const post of posts) {
      const result = await processPost(post as SMPost)
      stats.processed++

      if (CONFIG.logProgress && result.updated) {
        console.log(`✅ Updated: ${post.slug} [${result.changes.join(', ')}]`)
      }
    }

    // Progress update
    const progress = Math.round((stats.processed / stats.totalPosts) * 100)
    console.log(`📈 Progress: ${stats.processed}/${stats.totalPosts} (${progress}%) - Batch ${batch + 1}/${totalBatches}`)

    // Delay between batches
    if (batch < totalBatches - 1) {
      await new Promise(r => setTimeout(r, CONFIG.delayBetweenBatches))
    }
  }
}

/**
 * Print final report
 */
function printReport(): void {
  console.log('\n' + '='.repeat(50))
  console.log('📊 SEO OPTIMIZATION COMPLETE')
  console.log('='.repeat(50))
  console.log('')
  console.log('SAFETY GUARANTEE:')
  console.log('  ✅ URLs/slugs were NOT changed')
  console.log('  ✅ Titles were NOT changed')
  console.log('  ✅ Content was NOT changed')
  console.log('  ✅ Only EMPTY fields were filled')
  console.log('')
  console.log('RESULTS:')
  console.log(`  Total posts processed: ${stats.processed}`)
  console.log(`  SEO titles added:      ${stats.seoTitleAdded}`)
  console.log(`  SEO descriptions added: ${stats.seoDescriptionAdded}`)
  console.log(`  Excerpts added:        ${stats.excerptAdded}`)
  console.log(`  Already complete:      ${stats.skipped}`)
  console.log(`  Errors:                ${stats.errors}`)
  console.log('')
  console.log('='.repeat(50))
}

/**
 * Dry run - show what would be changed without making changes
 */
async function dryRun(): Promise<void> {
  console.log('🔍 DRY RUN - No changes will be made\n')

  const { data: posts, error } = await supabase
    .from('sm_posts')
    .select('id, slug, title, excerpt, seo_title, seo_description')
    .or('seo_title.is.null,seo_description.is.null,excerpt.is.null')
    .limit(20)

  if (error) {
    console.error('Error:', error.message)
    return
  }

  console.log(`Found ${posts?.length || 0} posts that need SEO data:\n`)

  for (const post of posts || []) {
    const missing: string[] = []
    if (!post.seo_title) missing.push('seo_title')
    if (!post.seo_description) missing.push('seo_description')
    if (!post.excerpt) missing.push('excerpt')

    console.log(`  - ${post.slug}`)
    console.log(`    Missing: ${missing.join(', ')}`)
  }

  // Count all posts needing fixes
  const { count: missingTitle } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .is('seo_title', null)

  const { count: missingDesc } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .is('seo_description', null)

  const { count: missingExcerpt } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .is('excerpt', null)

  console.log('\n📊 SUMMARY:')
  console.log(`  Posts missing SEO title:       ${missingTitle || 0}`)
  console.log(`  Posts missing SEO description: ${missingDesc || 0}`)
  console.log(`  Posts missing excerpt:         ${missingExcerpt || 0}`)
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🚀 SM SEO Optimizer for Supabase')
  console.log('================================\n')

  const args = process.argv.slice(2)

  if (args.includes('--dry-run') || args.includes('-d')) {
    await dryRun()
    return
  }

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npx ts-node supabase-seo-optimizer.ts [options]')
    console.log('')
    console.log('Options:')
    console.log('  --dry-run, -d   Show what would be changed without making changes')
    console.log('  --help, -h      Show this help message')
    console.log('')
    console.log('Environment variables required:')
    console.log('  NEXT_PUBLIC_SUPABASE_URL')
    console.log('  SUPABASE_SERVICE_ROLE_KEY')
    return
  }

  console.log('⚠️  This will add SEO data to posts with EMPTY fields.')
  console.log('   Existing data will NOT be overwritten.\n')

  const startTime = Date.now()

  try {
    await processAllPosts()
    printReport()

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`⏱️  Completed in ${duration} seconds`)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run
main()
