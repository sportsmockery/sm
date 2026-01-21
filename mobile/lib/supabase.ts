/**
 * Supabase Client for Mobile App
 *
 * Used for:
 * - Authentication (same accounts as website)
 * - Real-time Fan Chat subscriptions
 * - User preferences sync
 */

import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config'

// Custom storage adapter using Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch {
      // SecureStore has a 2048 byte limit, fall back to nothing for large values
      console.warn('Failed to store in SecureStore:', key)
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {
      // Ignore errors
    }
  },
}

// Create Supabase client with secure storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ============================================
// AUTH HELPERS
// ============================================

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'sportsmockery://auth/callback',
      skipBrowserRedirect: true,
    },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data?.session, error }
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data?.user, error }
}

// ============================================
// REAL-TIME CHAT SUBSCRIPTIONS
// ============================================

export type ChatMessagePayload = {
  id: string
  room_id: string
  user_id: string
  content: string
  content_type: 'text' | 'gif'
  gif_url?: string
  created_at: string
  moderation_status: string
}

/**
 * Subscribe to real-time chat messages for a room
 */
export function subscribeToChatRoom(
  roomId: string,
  onMessage: (message: ChatMessagePayload) => void,
  onDelete?: (messageId: string) => void
) {
  const channel = supabase
    .channel(`chat:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.new.moderation_status === 'approved') {
          onMessage(payload.new as ChatMessagePayload)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        // Handle message deletion (soft delete)
        if (payload.new.is_deleted && onDelete) {
          onDelete(payload.new.id)
        }
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to typing indicators
 */
export function subscribeToTyping(
  roomId: string,
  onTyping: (userId: string, isTyping: boolean) => void
) {
  const channel = supabase.channel(`typing:${roomId}`)

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      // Handle presence state updates
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      newPresences.forEach((presence: any) => {
        if (presence.isTyping) {
          onTyping(presence.userId, true)
        }
      })
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      leftPresences.forEach((presence: any) => {
        onTyping(presence.userId, false)
      })
    })
    .subscribe()

  // Return functions to update typing status and unsubscribe
  return {
    setTyping: async (userId: string, isTyping: boolean) => {
      await channel.track({ userId, isTyping })
    },
    unsubscribe: () => {
      supabase.removeChannel(channel)
    },
  }
}

// ============================================
// USER PREFERENCES
// ============================================

export interface UserPreferences {
  favorite_teams: string[]
  notification_settings: {
    breaking_news: boolean
    team_news: boolean
    game_alerts: boolean
    chat_mentions: boolean
  }
  theme: 'light' | 'dark' | 'system'
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { user } = await getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    // Return defaults
    return {
      favorite_teams: ['bears'],
      notification_settings: {
        breaking_news: true,
        team_news: true,
        game_alerts: true,
        chat_mentions: true,
      },
      theme: 'system',
    }
  }

  return data as UserPreferences
}

export async function updateUserPreferences(
  preferences: Partial<UserPreferences>
): Promise<{ error: Error | null }> {
  const { user } = await getUser()
  if (!user) return { error: new Error('Not authenticated') }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
      updated_at: new Date().toISOString(),
    })

  return { error }
}
