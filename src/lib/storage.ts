import { createClient } from '@/lib/supabase'

export interface UploadResult {
  url: string
  path: string
  size: number
  type: string
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const supabase = createClient()

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(filename)

  return {
    url: urlData.publicUrl,
    path: data.path,
    size: file.size,
    type: file.type
  }
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from('media')
    .remove([path])

  if (error) throw error
}

export function getFileUrl(path: string): string {
  const supabase = createClient()

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function listFiles(prefix?: string): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from('media')
    .list(prefix || '', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) throw error

  return data.map(file => file.name)
}

export async function downloadFile(path: string): Promise<Blob> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from('media')
    .download(path)

  if (error) throw error

  return data
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUrl(path, expiresIn)

  if (error) throw error

  return data.signedUrl
}

export async function moveFile(fromPath: string, toPath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from('media')
    .move(fromPath, toPath)

  if (error) throw error
}

export async function copyFile(fromPath: string, toPath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from('media')
    .copy(fromPath, toPath)

  if (error) throw error
}
