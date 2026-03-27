/**
 * Batch Image Optimization Script
 *
 * Processes all existing post images through the optimization pipeline.
 * Can be run as a one-time migration or incrementally (skips already-optimized).
 *
 * Usage:
 *   npx tsx scripts/batch-optimize-images.ts
 *   npx tsx scripts/batch-optimize-images.ts --limit 100
 *   npx tsx scripts/batch-optimize-images.ts --dry-run
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const STORAGE_BUCKET = 'optimized-images'
const BATCH_SIZE = 10
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3005'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface PostRow {
  id: string
  featured_image: string | null
  optimized_image_url: string | null
  image_optimized_at: string | null
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : undefined

  console.log('=== Batch Image Optimization ===')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  if (limit) console.log(`Limit: ${limit} posts`)
  console.log('')

  // Ensure the storage bucket exists
  if (!dryRun) {
    const { error: bucketError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
    })
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Failed to create storage bucket:', bucketError.message)
    }
  }

  // Query posts with images that haven't been optimized
  let query = supabase
    .from('sm_posts')
    .select('id, featured_image, optimized_image_url, image_optimized_at')
    .not('featured_image', 'is', null)
    .is('image_optimized_at', null)
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data: posts, error: fetchError } = await query

  if (fetchError) {
    console.error('Failed to fetch posts:', fetchError.message)
    process.exit(1)
  }

  if (!posts || posts.length === 0) {
    console.log('No un-optimized posts found. All done!')
    return
  }

  console.log(`Found ${posts.length} posts to optimize\n`)

  let succeeded = 0
  let failed = 0
  let skipped = 0

  // Process in batches
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE)
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} posts)...`)

    const results = await Promise.allSettled(
      batch.map((post) => processPost(post, dryRun))
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value === 'skipped') {
          skipped++
        } else {
          succeeded++
        }
      } else {
        failed++
        console.error(`  Error: ${result.reason}`)
      }
    }

    // Brief pause between batches to avoid overwhelming the server
    if (i + BATCH_SIZE < posts.length) {
      await sleep(1000)
    }
  }

  console.log('\n=== Results ===')
  console.log(`Succeeded: ${succeeded}`)
  console.log(`Skipped:   ${skipped}`)
  console.log(`Failed:    ${failed}`)
  console.log(`Total:     ${posts.length}`)
}

async function processPost(post: PostRow, dryRun: boolean): Promise<string> {
  const { id, featured_image } = post

  if (!featured_image) {
    return 'skipped'
  }

  console.log(`  Post ${id}: ${featured_image.substring(0, 80)}...`)

  if (dryRun) {
    console.log(`    [DRY RUN] Would optimize`)
    return 'skipped'
  }

  try {
    // Use sharp directly for the batch script (avoids HTTP overhead)
    const { processImage, fetchImageBuffer } = await import('../src/lib/image-optimization')

    const inputBuffer = await fetchImageBuffer(featured_image)
    const result = await processImage(inputBuffer)

    // Upload variants to Supabase Storage
    const timestamp = Date.now()
    const urlHash = hashUrl(featured_image)
    const uploads: Record<string, string> = {}

    for (const [variantName, variant] of Object.entries(result.variants)) {
      const storagePath = `${urlHash}/${variantName}_${timestamp}.webp`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, variant.buffer, {
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) {
        console.error(`    Upload error for ${variantName}:`, uploadError.message)
        continue
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      uploads[variantName] = urlData.publicUrl
    }

    // Record in image_optimizations table
    await supabase.from('image_optimizations').upsert(
      {
        original_url: featured_image,
        optimized_url: uploads.hero || null,
        medium_url: uploads.medium || null,
        thumbnail_url: uploads.thumbnail || null,
        blur_data_url: result.blur.base64,
        original_size_bytes: inputBuffer.byteLength,
        optimized_size_bytes: result.variants.hero?.size || null,
        width: result.originalWidth,
        height: result.originalHeight,
        format: 'webp',
        optimized_at: new Date().toISOString(),
      },
      { onConflict: 'original_url' }
    )

    // Update the post record
    await supabase
      .from('sm_posts')
      .update({
        optimized_image_url: uploads.hero || uploads.medium || null,
        image_blur_hash: result.blur.base64,
        image_optimized_at: new Date().toISOString(),
      })
      .eq('id', id)

    const savedPercent = inputBuffer.byteLength > 0
      ? Math.round((1 - (result.variants.hero?.size || 0) / inputBuffer.byteLength) * 100)
      : 0

    console.log(`    Optimized (saved ${savedPercent}%)`)
    return 'success'
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`    Failed: ${message}`)
    throw err
  }
}

function hashUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
