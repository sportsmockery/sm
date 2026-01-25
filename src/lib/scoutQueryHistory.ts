/**
 * Scout Query History
 *
 * Stores user queries for 30 days:
 * - Logged-in users: Supabase (scout_query_history table)
 * - Guests: localStorage
 *
 * Includes automatic cleanup for database entries older than 30 days.
 */

import { createBrowserClient } from '@supabase/ssr'

const STORAGE_KEY = 'scout_query_history'
const MAX_DAYS = 30
const MAX_LOCAL_QUERIES = 100 // Limit localStorage entries

export interface QueryHistoryEntry {
  id: string
  query: string
  response: string
  timestamp: string
  team?: string
  source?: string
}

// =============================================================================
// LOCAL STORAGE (Guest Users)
// =============================================================================

/**
 * Get query history from localStorage
 */
export function getLocalHistory(): QueryHistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const entries: QueryHistoryEntry[] = JSON.parse(stored)

    // Filter out entries older than 30 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_DAYS)

    return entries.filter(e => new Date(e.timestamp) > cutoff)
  } catch {
    return []
  }
}

/**
 * Save a query to localStorage
 */
export function saveToLocalHistory(entry: Omit<QueryHistoryEntry, 'id'>): void {
  if (typeof window === 'undefined') return

  try {
    const history = getLocalHistory()

    const newEntry: QueryHistoryEntry = {
      ...entry,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    // Add to beginning, limit total entries
    const updated = [newEntry, ...history].slice(0, MAX_LOCAL_QUERIES)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('[Scout History] Failed to save to localStorage:', e)
  }
}

/**
 * Clear localStorage history
 */
export function clearLocalHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// =============================================================================
// SUPABASE (Logged-in Users)
// =============================================================================

/**
 * Get Supabase client for query history (browser client with user session)
 */
function getSupabaseClient() {
  if (typeof window === 'undefined') return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  return createBrowserClient(url, key)
}

/**
 * Get query history from Supabase for a user
 */
export async function getSupabaseHistory(userId: string): Promise<QueryHistoryEntry[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_DAYS)

    const { data, error } = await supabase
      .from('scout_query_history')
      .select('id, query, response, created_at, team, source')
      .eq('user_id', userId)
      .gte('created_at', cutoff.toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('[Scout History] Supabase fetch error:', error)
      return []
    }

    return (data || []).map(row => ({
      id: row.id,
      query: row.query,
      response: row.response,
      timestamp: row.created_at,
      team: row.team,
      source: row.source,
    }))
  } catch (e) {
    console.error('[Scout History] Failed to fetch from Supabase:', e)
    return []
  }
}

/**
 * Save a query to Supabase
 */
export async function saveToSupabaseHistory(
  userId: string,
  entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>
): Promise<void> {
  const supabase = getSupabaseClient()
  if (!supabase) return

  try {
    const { error } = await supabase
      .from('scout_query_history')
      .insert({
        user_id: userId,
        query: entry.query,
        response: entry.response.substring(0, 5000), // Limit response size
        team: entry.team || null,
        source: entry.source || null,
      })

    if (error) {
      console.error('[Scout History] Supabase insert error:', error)
    }
  } catch (e) {
    console.error('[Scout History] Failed to save to Supabase:', e)
  }
}

/**
 * Delete a specific query from history
 */
export async function deleteFromSupabaseHistory(userId: string, queryId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('scout_query_history')
      .delete()
      .eq('id', queryId)
      .eq('user_id', userId)

    return !error
  } catch {
    return false
  }
}

/**
 * Clear all history for a user
 */
export async function clearSupabaseHistory(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('scout_query_history')
      .delete()
      .eq('user_id', userId)

    return !error
  } catch {
    return false
  }
}

// =============================================================================
// CLEANUP (Called by Cron)
// =============================================================================

/**
 * Delete queries older than 30 days from Supabase
 * Called by /api/cron/cleanup-scout-history
 */
export async function cleanupOldQueries(): Promise<{ deleted: number; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { deleted: 0, error: 'Supabase client not available' }
  }

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_DAYS)

    // Count before delete
    const { count: beforeCount } = await supabase
      .from('scout_query_history')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoff.toISOString())

    // Delete old entries
    const { error } = await supabase
      .from('scout_query_history')
      .delete()
      .lt('created_at', cutoff.toISOString())

    if (error) {
      return { deleted: 0, error: error.message }
    }

    return { deleted: beforeCount || 0 }
  } catch (e) {
    return { deleted: 0, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
