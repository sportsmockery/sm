import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm',
]
const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const submissionId = formData.get('submission_id') as string | null
    const assetType = formData.get('asset_type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    if (!submissionId) {
      return NextResponse.json({ error: 'submission_id is required.' }, { status: 400 })
    }
    if (!assetType) {
      return NextResponse.json({ error: 'asset_type is required.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 50MB.' }, { status: 400 })
    }

    // Verify submission exists
    const { data: submission } = await supabaseAdmin
      .from('fan_submissions')
      .select('id')
      .eq('id', submissionId)
      .maybeSingle()

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() || 'bin'
    const randomStr = Math.random().toString(36).slice(2, 10)
    const filename = `fan-showcase/${submissionId}/${Date.now()}-${randomStr}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('media')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      console.error('Upload error:', uploadErr)
      return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('media')
      .getPublicUrl(filename)

    const publicUrl = urlData.publicUrl

    // Save asset record
    const { data: asset, error: assetErr } = await supabaseAdmin
      .from('fan_submission_assets')
      .insert({
        submission_id: submissionId,
        asset_type: assetType,
        asset_url: publicUrl,
        mime_type: file.type,
      })
      .select('id, asset_url')
      .single()

    if (assetErr) {
      console.error('Asset record error:', assetErr)
      return NextResponse.json({ error: 'Failed to save asset record.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, asset })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
