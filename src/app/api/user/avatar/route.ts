import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

// POST /api/user/avatar - Upload avatar image and update user profile
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
                   request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${userId}-${Date.now()}.${ext}`
    const filePath = `avatars/${filename}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('user-uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('user-uploads')
      .getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update user profile with new avatar URL
    const { error: updateError } = await supabaseAdmin
      .from('sm_user_preferences')
      .upsert({
        user_id: userId,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Avatar uploaded but profile update failed - still return the URL
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    })
  } catch (error) {
    console.error('Avatar API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/avatar - Remove user avatar
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
                   request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Get current avatar URL to find the file path
    const { data: profile } = await supabaseAdmin
      .from('sm_user_preferences')
      .select('avatar_url')
      .eq('user_id', userId)
      .single()

    if (profile?.avatar_url) {
      // Extract file path from URL
      const urlParts = profile.avatar_url.split('/user-uploads/')
      if (urlParts[1]) {
        // Delete from storage
        await supabaseAdmin.storage
          .from('user-uploads')
          .remove([urlParts[1]])
      }
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabaseAdmin
      .from('sm_user_preferences')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Avatar delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
