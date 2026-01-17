/**
 * Database helper for SportsMockery
 * Centralized Supabase client creation and common query patterns
 */

import { createClient } from '@supabase/supabase-js'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

/**
 * Create a Supabase client for public/client-side use
 * Uses the anon key with RLS policies
 */
export function createSupabaseClient() {
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

/**
 * Create a Supabase admin client for server-side use
 * Uses the service role key to bypass RLS
 * Only use in server components and API routes
 */
export function createSupabaseAdmin() {
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, falling back to anon key')
    return createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return createClient(supabaseUrl!, supabaseServiceKey)
}

// Export singleton instances for convenience
export const supabase = createSupabaseClient()
export const supabaseAdmin = createSupabaseAdmin()

/**
 * Common select fields for posts
 * Used across multiple query functions
 */
export const POST_SELECT = `
  id,
  slug,
  title,
  excerpt,
  content,
  featured_image,
  published_at,
  status,
  views,
  importance_score,
  seo_title,
  seo_description,
  author_id,
  category_id
`

export const POST_SELECT_WITH_RELATIONS = `
  id,
  slug,
  title,
  excerpt,
  content,
  featured_image,
  published_at,
  status,
  views,
  importance_score,
  seo_title,
  seo_description,
  author:sm_authors!author_id (
    id,
    display_name,
    bio,
    avatar_url,
    email,
    slug
  ),
  category:sm_categories!category_id (
    id,
    name,
    slug,
    wp_id
  )
`

export const POST_SUMMARY_SELECT = `
  id,
  slug,
  title,
  excerpt,
  featured_image,
  published_at,
  views,
  author:sm_authors!author_id (
    id,
    display_name,
    avatar_url
  ),
  category:sm_categories!category_id (
    id,
    name,
    slug
  )
`

/**
 * Category ID mapping for Chicago teams
 * These should match your sm_categories table
 */
export const TEAM_CATEGORY_SLUGS = {
  bears: ['bears', 'chicago-bears'],
  cubs: ['cubs', 'chicago-cubs'],
  'white-sox': ['white-sox', 'whitesox', 'chicago-white-sox'],
  bulls: ['bulls', 'chicago-bulls'],
  blackhawks: ['blackhawks', 'chicago-blackhawks'],
} as const

/**
 * Get all valid team category slugs as a flat array
 */
export function getAllTeamCategorySlugs(): string[] {
  return Object.values(TEAM_CATEGORY_SLUGS).flat()
}
