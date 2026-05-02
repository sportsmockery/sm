/**
 * Supabase client for /mobile-next.
 *
 * Mirrors mobile/lib/supabase.ts but swaps the Expo SecureStore adapter for
 * a Capacitor secure-storage adapter.
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { SecureStorage } from './secure-storage';

const adapter = {
  getItem: (key: string) => SecureStorage.getItem(key),
  setItem: (key: string, value: string) => SecureStorage.setItem(key, value),
  removeItem: (key: string) => SecureStorage.removeItem(key),
};

// During the static-export build the env may not be available; fall back to
// a placeholder so createClient doesn't throw. The runtime in Capacitor uses
// the real values via NEXT_PUBLIC_SUPABASE_URL.
const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(url, key, {
  auth: {
    storage: adapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithOAuth(provider: 'apple' | 'google') {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'sportsmockery://auth/callback',
      skipBrowserRedirect: true,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session, error };
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
}

export type ChatMessagePayload = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  content_type: 'text' | 'gif';
  gif_url?: string;
  created_at: string;
  moderation_status: string;
};

export function subscribeToChatRoom(
  roomId: string,
  onMessage: (m: ChatMessagePayload) => void,
  onDelete?: (id: string) => void,
) {
  const channel = supabase
    .channel(`chat:${roomId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
      (p) => {
        if (p.new.moderation_status === 'approved') onMessage(p.new as ChatMessagePayload);
      },
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
      (p) => {
        if (p.new.is_deleted && onDelete) onDelete(p.new.id);
      },
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export interface UserPreferences {
  favorite_teams: string[];
  notification_settings: {
    breaking_news: boolean;
    team_news: boolean;
    game_alerts: boolean;
    chat_mentions: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { user } = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!data) {
    return {
      favorite_teams: ['bears'],
      notification_settings: {
        breaking_news: true,
        team_news: true,
        game_alerts: true,
        chat_mentions: true,
      },
      theme: 'system',
    };
  }
  return data as UserPreferences;
}

export async function updateUserPreferences(prefs: Partial<UserPreferences>) {
  const { user } = await getUser();
  if (!user) return { error: new Error('Not authenticated') };
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      ...prefs,
      updated_at: new Date().toISOString(),
    });
  return { error };
}
