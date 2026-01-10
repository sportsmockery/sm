import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Only create client if env vars are available (not during build)
const createSupabaseAdmin = (): SupabaseClient | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn('Supabase environment variables not set')
    return null
  }

  return createClient(url, key)
}

export const supabaseAdmin = createSupabaseAdmin()
