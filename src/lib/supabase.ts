import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Export null if env vars are not set to prevent build errors
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createSupabaseClient(supabaseUrl, supabaseKey)
    : null

export function createClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  return createSupabaseClient(supabaseUrl, supabaseKey)
}
