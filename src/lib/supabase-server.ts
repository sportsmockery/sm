import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Create supabase admin client
// Uses placeholder values during build, real values at runtime
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

// Server-side client options optimized for scalability
const serverClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
}

export const supabaseAdmin = createClient(url, key, serverClientOptions)

// Alias for compatibility with existing code
export const createServerClient = () => supabaseAdmin
