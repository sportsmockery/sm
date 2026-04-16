import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const supabase = supabaseAdmin

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('public')
      .getPublicUrl(filePath)

    // Update sm_users avatar_url
    const { error: updateError } = await supabase
      .from('sm_users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('Avatar update error:', updateError)
      return NextResponse.json({ error: 'Failed to update user avatar' }, { status: 500 })
    }

    return NextResponse.json({ success: true, avatarUrl: publicUrl })
  } catch (error) {
    console.error('Admin avatar upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
