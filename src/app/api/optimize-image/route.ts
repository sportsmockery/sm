import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import {
  processImage,
  fetchImageBuffer,
} from '@/lib/image-optimization'

const STORAGE_BUCKET = 'optimized-images'

/**
 * POST /api/optimize-image
 *
 * Accepts { url: string } and runs the image through the sharp pipeline.
 * Uploads optimized variants to Supabase Storage, records metadata in
 * the image_optimizations table, and returns URLs + blur placeholder.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "url" parameter' },
        { status: 400 }
      )
    }

    // Check if already optimized
    const { data: existing } = await supabaseAdmin
      .from('image_optimizations')
      .select('*')
      .eq('original_url', url)
      .single()

    if (existing?.optimized_url) {
      return NextResponse.json({
        optimized_url: existing.optimized_url,
        medium_url: existing.medium_url,
        thumbnail_url: existing.thumbnail_url,
        blur_data_url: existing.blur_data_url,
        cached: true,
      })
    }

    // Download and process
    const inputBuffer = await fetchImageBuffer(url)
    const result = await processImage(inputBuffer)

    // Upload variants to Supabase Storage
    const timestamp = Date.now()
    const urlHash = hashUrl(url)
    const uploads: Record<string, string> = {}

    for (const [variantName, variant] of Object.entries(result.variants)) {
      const storagePath = `${urlHash}/${variantName}_${timestamp}.webp`

      const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, variant.buffer, {
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) {
        console.error(`Upload error for ${variantName}:`, uploadError)
        continue
      }

      const { data: urlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)

      uploads[variantName] = urlData.publicUrl
    }

    // Record in database
    const heroVariant = result.variants.hero
    const { error: dbError } = await supabaseAdmin
      .from('image_optimizations')
      .upsert(
        {
          original_url: url,
          optimized_url: uploads.hero || null,
          medium_url: uploads.medium || null,
          thumbnail_url: uploads.thumbnail || null,
          blur_data_url: result.blur.base64,
          original_size_bytes: inputBuffer.byteLength,
          optimized_size_bytes: heroVariant?.size || null,
          width: result.originalWidth,
          height: result.originalHeight,
          format: 'webp',
          optimized_at: new Date().toISOString(),
        },
        { onConflict: 'original_url' }
      )

    if (dbError) {
      console.error('DB error recording optimization:', dbError)
    }

    return NextResponse.json({
      optimized_url: uploads.hero || null,
      medium_url: uploads.medium || null,
      thumbnail_url: uploads.thumbnail || null,
      blur_data_url: result.blur.base64,
      original_size: inputBuffer.byteLength,
      optimized_size: heroVariant?.size || null,
      width: result.originalWidth,
      height: result.originalHeight,
      cached: false,
    })
  } catch (err) {
    console.error('Image optimization error:', err)
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 }
    )
  }
}

/** Simple hash for URL-safe storage path */
function hashUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}
