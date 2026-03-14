import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase singleton.
 * ALWAYS import this instead of creating new clients.
 *
 * For server-side (API routes, server components), use supabase-server.ts instead.
 */
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * @deprecated Use the `supabase` singleton export instead.
 * Kept temporarily for compatibility — returns the same singleton.
 */
export function createClient() {
  return supabase
}
