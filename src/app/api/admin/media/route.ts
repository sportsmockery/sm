import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import sharp from 'sharp'
import { auditLog, getAuditContext } from '@/lib/audit-log'
import { validateMediaUpload } from '@/lib/validate-upload'

/**
 * Featured-image dimensions enforced by publish guardrails rule #5.
 * Uploads with ?mode=featured are resized + re-encoded so writers never
 * have to think about dimensions or file size.
 */
const FEATURED_WIDTH = 1200
const FEATURED_HEIGHT = 630
const FEATURED_QUALITY = 82

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const ALLOWED_SORT_FIELDS = ['created_at', 'name', 'type', 'size', 'updated_at']
    const rawSortBy = searchParams.get('sortBy') || 'created_at'
    const sortBy = ALLOWED_SORT_FIELDS.includes(rawSortBy) ? rawSortBy : 'created_at'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    const offset = (page - 1) * limit

    let query = supabase
      .from('sm_media')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (type && type !== 'all') {
      query = query.ilike('type', `${type}%`)
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      media: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create auth client with cookies to verify user
    const cookieStore = await cookies()
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    // Check authentication
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type, extension, size, and magic bytes
    const validation = await validateMediaUpload(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Decide whether to resize. Featured-image uploads are resized to the
    // social-card dimensions Google + OG cards expect (1200×630) and
    // re-encoded as WebP for size. Other uploads pass through unchanged.
    const mode = new URL(request.url).searchParams.get('mode')
    const isImage = file.type.startsWith('image/')
    const shouldResize = mode === 'featured' && isImage && file.type !== 'image/svg+xml'

    let uploadBody: Buffer | File = file
    let uploadContentType: string = file.type
    let uploadSize: number = file.size
    let storedExt = file.name.split('.').pop() || 'bin'
    let storedWidth: number | undefined
    let storedHeight: number | undefined

    if (shouldResize) {
      const inputBuffer = Buffer.from(await file.arrayBuffer())
      const transformed = await sharp(inputBuffer, { failOn: 'error' })
        .rotate() // honor EXIF orientation before resize
        .resize(FEATURED_WIDTH, FEATURED_HEIGHT, {
          fit: 'cover',
          position: 'attention',
        })
        .webp({ quality: FEATURED_QUALITY, effort: 5 })
        .toBuffer()
      uploadBody = transformed
      uploadContentType = 'image/webp'
      uploadSize = transformed.byteLength
      storedExt = 'webp'
      storedWidth = FEATURED_WIDTH
      storedHeight = FEATURED_HEIGHT
    } else if (isImage && file.type !== 'image/svg+xml') {
      // Non-featured image upload: still record intrinsic dimensions so
      // the inline-image guardrails (rule #17) have width/height available.
      try {
        const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata()
        if (meta.width) storedWidth = meta.width
        if (meta.height) storedHeight = meta.height
      } catch {
        // Best-effort — leave dims undefined if probe fails.
      }
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${storedExt}`

    // Upload to storage using admin client
    const { error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .upload(filename, uploadBody, {
        cacheControl: '3600',
        upsert: false,
        contentType: uploadContentType,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(filename)

    // Save to database using admin client
    const { data, error: dbError } = await supabaseAdmin
      .from('sm_media')
      .insert({
        name: file.name,
        url: urlData.publicUrl,
        size: uploadSize,
        type: uploadContentType,
        width: storedWidth,
        height: storedHeight,
        alt_text: '',
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      throw dbError
    }

    // Audit log
    auditLog({
      userId: user.id,
      action: 'media_uploaded',
      resourceType: 'media',
      resourceId: data.id,
      details: {
        filename: file.name,
        original_type: file.type,
        stored_type: uploadContentType,
        original_size: file.size,
        stored_size: uploadSize,
        resized: shouldResize,
      },
      ...getAuditContext(request),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
