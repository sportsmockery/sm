import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load .env.local
config({ path: '.env.local' })

// Initialize Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// WordPress Export API endpoints
const WP_BASE_URL = 'https://www.sportsmockery.com/wp-json/sm-export/v1'

interface WPCategory {
  id: number
  name: string
  slug: string
  parent_id: number | null
  count: number
}

interface WPAuthor {
  id: number
  email: string
  display_name: string
  bio: string
  avatar_url: string
  role: string
}

interface WPPost {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string
  featured_image: string
  author_id: number
  category_id: number
  seo_title: string
  seo_description: string
  published_at: string
}

interface WPPostsResponse {
  posts: WPPost[]
  page: number
  per_page: number
  total: number
  total_pages: number
}

// === SEO CONTENT BLOCKLIST ===
// These slugs/patterns are blocked from import to prevent casino/betting/spam
// content from contaminating the new site's E-E-A-T signals.

const BLOCKED_CATEGORY_SLUGS = new Set([
  'betmgm-illinois',
  'pointsbet-illinois-sportsbook',
  'draftkings-illinois-sportsbook',
  'sports-betting',
  'chicago-blackhawks-odds',
  'uncategorized',
])

const BLOCKED_AUTHOR_SLUGS = new Set([
  'the-importance-reputable-casino-slot-play',
  'casino-slot-play',
  'soccer-event',
  'hhc-infused',
  'gems-and-mines',
])

const BLOCKED_POST_SLUG_PATTERNS = [
  'betmgm', 'pointsbet', 'draftkings', 'fanduel',
  'sportsbook', 'casino-slot', 'sports-betting',
  'online-casino', 'gambling', 'casino-games',
  'betting-odds', 'parlay', 'wager',
]

function isBlockedPostSlug(slug: string): boolean {
  const lower = slug.toLowerCase()
  return BLOCKED_POST_SLUG_PATTERNS.some(pattern => lower.includes(pattern))
}

function isBlockedAuthor(author: WPAuthor): boolean {
  const slug = author.display_name.toLowerCase().replace(/\s+/g, '-')
  const email = author.email.toLowerCase()
  return [...BLOCKED_AUTHOR_SLUGS].some(
    blocked => slug.includes(blocked) || email.includes(blocked)
  )
}

// Fetch with retry logic
async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Retry ${i + 1}/${retries} for ${url}`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

// Get existing wp_ids to skip
async function getExistingWpIds(table: string): Promise<Set<number>> {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('wp_id')

  if (error) {
    console.error(`Error fetching existing ${table}:`, error)
    return new Set()
  }

  return new Set(data?.map(row => row.wp_id) || [])
}

// Import categories
async function importCategories(): Promise<void> {
  console.log('\n📁 Importing categories...')

  const existingIds = await getExistingWpIds('sm_categories')
  console.log(`Found ${existingIds.size} existing categories`)

  const categories = await fetchWithRetry<WPCategory[]>(`${WP_BASE_URL}/categories`)
  console.log(`Fetched ${categories.length} categories from WordPress`)

  // Filter out blocked casino/betting/spam categories
  const allowedCategories = categories.filter(c => {
    if (BLOCKED_CATEGORY_SLUGS.has(c.slug)) {
      console.log(`⛔ Blocked category: ${c.slug}`)
      return false
    }
    return true
  })

  const newCategories = allowedCategories.filter(c => !existingIds.has(c.id))

  if (newCategories.length === 0) {
    console.log('All categories already imported, skipping...')
    return
  }

  // Sort by parent_id to insert parents first (null parents first)
  const sorted = newCategories.sort((a, b) => {
    if (a.parent_id === null && b.parent_id !== null) return -1
    if (a.parent_id !== null && b.parent_id === null) return 1
    return 0
  })

  for (const category of sorted) {
    const { error } = await supabaseAdmin.from('sm_categories').insert({
      wp_id: category.id,
      name: category.name,
      slug: category.slug,
      parent_wp_id: category.parent_id
    })

    if (error) {
      console.error(`Error inserting category ${category.name}:`, error.message)
    }
  }

  console.log(`✅ Imported ${newCategories.length} categories`)
}

// Import authors
async function importAuthors(): Promise<void> {
  console.log('\n👤 Importing authors...')

  const existingIds = await getExistingWpIds('sm_authors')
  console.log(`Found ${existingIds.size} existing authors`)

  const authors = await fetchWithRetry<WPAuthor[]>(`${WP_BASE_URL}/authors`)
  console.log(`Fetched ${authors.length} authors from WordPress`)

  // Filter out blocked spam authors
  const allowedAuthors = authors.filter(a => {
    if (isBlockedAuthor(a)) {
      console.log(`⛔ Blocked author: ${a.display_name} (${a.email})`)
      return false
    }
    return true
  })

  const newAuthors = allowedAuthors.filter(a => !existingIds.has(a.id))

  if (newAuthors.length === 0) {
    console.log('All authors already imported, skipping...')
    return
  }

  for (const author of newAuthors) {
    const { error } = await supabaseAdmin.from('sm_authors').insert({
      wp_id: author.id,
      email: author.email,
      display_name: author.display_name,
      bio: author.bio || null,
      avatar_url: author.avatar_url || null,
      role: author.role
    })

    if (error) {
      console.error(`Error inserting author ${author.display_name}:`, error.message)
    }
  }

  console.log(`✅ Imported ${newAuthors.length} authors`)
}

// Import posts with pagination
async function importPosts(): Promise<void> {
  console.log('\n📝 Importing posts...')

  const existingIds = await getExistingWpIds('sm_posts')
  console.log(`Found ${existingIds.size} existing posts`)

  // Fetch first page to get total count
  const firstPage = await fetchWithRetry<WPPostsResponse>(
    `${WP_BASE_URL}/posts?page=1&per_page=100`
  )

  const total = firstPage.total
  const totalPages = firstPage.total_pages
  console.log(`Total posts to import: ${total} (${totalPages} pages)`)

  let imported = 0
  let skipped = 0

  for (let page = 1; page <= totalPages; page++) {
    const response = page === 1
      ? firstPage
      : await fetchWithRetry<WPPostsResponse>(
          `${WP_BASE_URL}/posts?page=${page}&per_page=100`
        )

    const posts = response.posts

    // Filter out blocked casino/betting/spam posts
    const allowedPosts = posts.filter(p => {
      if (isBlockedPostSlug(p.slug)) {
        console.log(`⛔ Blocked post (slug pattern): ${p.slug} — "${p.title}"`)
        return false
      }
      return true
    })

    const newPosts = allowedPosts.filter(p => !existingIds.has(p.id))
    skipped += posts.length - newPosts.length

    if (newPosts.length > 0) {
      // Batch insert for better performance
      const postsToInsert = newPosts.map(post => ({
        wp_id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || null,
        featured_image: post.featured_image || null,
        author_wp_id: post.author_id,
        category_wp_id: post.category_id,
        seo_title: post.seo_title || null,
        seo_description: post.seo_description || null,
        published_at: post.published_at
      }))

      const { error } = await supabaseAdmin
        .from('sm_posts')
        .insert(postsToInsert)

      if (error) {
        console.error(`Error inserting posts batch on page ${page}:`, error.message)
        // Try individual inserts on batch failure
        for (const post of postsToInsert) {
          const { error: singleError } = await supabaseAdmin
            .from('sm_posts')
            .insert(post)

          if (singleError) {
            console.error(`Error inserting post ${post.slug}:`, singleError.message)
          } else {
            imported++
          }
        }
      } else {
        imported += newPosts.length
      }
    }

    const processed = Math.min(page * 100, total)
    console.log(`Imported ${imported}/${total} posts... (page ${page}/${totalPages}, skipped ${skipped})`)

    // Small delay to avoid rate limiting
    if (page < totalPages) {
      await new Promise(r => setTimeout(r, 100))
    }
  }

  console.log(`\n✅ Imported ${imported} posts (skipped ${skipped} existing)`)
}

// Main migration function
async function migrate(): Promise<void> {
  console.log('🚀 Starting WordPress to Supabase migration...')
  console.log(`WordPress API: ${WP_BASE_URL}`)
  console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

  const startTime = Date.now()

  try {
    // Import in order: categories -> authors -> posts
    await importCategories()
    await importAuthors()
    await importPosts()

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1)
    console.log(`\n🎉 Migration completed in ${duration} minutes`)
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrate()
