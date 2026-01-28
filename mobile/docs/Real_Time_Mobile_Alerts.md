# Real-Time Mobile Alerts System
## Implementation Instructions for Claude AI Assistant

---

# CRITICAL CONTEXT FOR CLAUDE

You are implementing a real-time sports alert system for Sports Mockery, a Chicago sports media app. This document provides complete instructions for building a zero-subscription notification system that rivals The Score.

**Before implementing ANY code, you MUST:**
1. Check if the functionality already exists in the codebase
2. Ask clarifying questions if file structures differ from expected
3. Never overwrite existing working code without explicit confirmation
4. Test each component individually before integration

---

# PROJECT STRUCTURE

```
/mobile                          ← React Native / Next.js mobile app root
├── /app                         ← App routes and pages
│   ├── /profile                 ← User profile pages (UPDATE notification prefs here)
│   └── ...
├── /components                  ← Reusable UI components
├── /lib                         ← Utility functions and API clients
├── /services                    ← Backend service integrations
│   └── onesignal.ts            ← OneSignal integration (MAY ALREADY EXIST)
├── /hooks                       ← Custom React hooks
├── /types                       ← TypeScript type definitions
└── /docs                        ← Documentation (THIS FILE LOCATION)
```

---

# PHASE 1: PRE-IMPLEMENTATION CHECKS

## Step 1.1: Verify Existing OneSignal Integration

**Claude, before writing any OneSignal code, run these checks:**

```bash
# Check if OneSignal is already installed
grep -r "onesignal" /mobile/package.json
grep -r "OneSignal" /mobile --include="*.ts" --include="*.tsx" --include="*.js"

# Check for existing notification services
ls -la /mobile/services/
cat /mobile/services/onesignal.ts 2>/dev/null || echo "File does not exist"
cat /mobile/services/notifications.ts 2>/dev/null || echo "File does not exist"
cat /mobile/services/push.ts 2>/dev/null || echo "File does not exist"
```

**If OneSignal integration exists:**
- Review the existing implementation
- Identify what notification types are already supported
- Determine if user preferences are already stored
- Ask the user: "I found existing OneSignal integration at [path]. Should I extend it or replace it?"

**If OneSignal integration does NOT exist:**
- Proceed with fresh implementation
- Install required packages: `npm install onesignal-expo-plugin` or `react-native-onesignal`

## Step 1.2: Verify Existing User Preferences

**Claude, check for existing notification preference systems:**

```bash
# Check for existing preference storage
grep -r "notificationPreferences" /mobile --include="*.ts" --include="*.tsx"
grep -r "alertSettings" /mobile --include="*.ts" --include="*.tsx"
grep -r "pushSettings" /mobile --include="*.ts" --include="*.tsx"

# Check profile page structure
ls -la /mobile/app/profile/
cat /mobile/app/profile/settings.tsx 2>/dev/null || echo "File does not exist"
cat /mobile/app/profile/notifications.tsx 2>/dev/null || echo "File does not exist"
```

## Step 1.3: Verify Existing Data Fetching

**Claude, check for existing sports data fetching:**

```bash
# Check for existing ESPN/sports API integrations
grep -r "espn" /mobile --include="*.ts" --include="*.tsx" -i
grep -r "scoreboard" /mobile --include="*.ts" --include="*.tsx"
grep -r "sports" /mobile/services/ --include="*.ts"
grep -r "rss" /mobile --include="*.ts" --include="*.tsx" -i
```

---

# PHASE 2: DATABASE SCHEMA FOR USER PREFERENCES

## Step 2.1: Create/Update Supabase Tables

**Claude, create this table if it doesn't exist. Check first:**

```sql
-- First, check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'user_notification_preferences'
);
```

**If table does NOT exist, create it:**

```sql
-- /mobile/supabase/migrations/YYYYMMDD_notification_preferences.sql

CREATE TABLE user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ═══════════════════════════════════════════════════════════════
  -- GLOBAL SETTINGS
  -- ═══════════════════════════════════════════════════════════════
  notifications_enabled BOOLEAN DEFAULT true,

  -- Frequency mode: 'all' | 'important' | 'minimal' | 'off'
  -- 'all' = Every score change, every news item
  -- 'important' = Touchdowns, game endings, breaking news only
  -- 'minimal' = Game start/end, major breaking news only
  -- 'off' = No push notifications (still visible in-app)
  frequency_mode VARCHAR(20) DEFAULT 'important',

  -- Quiet hours (no notifications during these times)
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',

  -- ═══════════════════════════════════════════════════════════════
  -- TEAM-SPECIFIC SETTINGS (which teams to follow)
  -- ═══════════════════════════════════════════════════════════════
  -- If true, ONLY send alerts for favorited teams
  -- If false, send alerts for ALL Chicago teams
  only_favorite_teams BOOLEAN DEFAULT true,

  -- Favorited teams (array of team IDs)
  -- Options: 'bears', 'bulls', 'cubs', 'whitesox', 'blackhawks', 'fire', 'sky'
  favorite_teams TEXT[] DEFAULT ARRAY['bears', 'bulls', 'cubs'],

  -- ═══════════════════════════════════════════════════════════════
  -- PLAYER TRACKING (optional)
  -- ═══════════════════════════════════════════════════════════════
  tracked_players TEXT[] DEFAULT ARRAY[]::TEXT[],  -- e.g., ['caleb-williams', 'cody-bellinger']
  player_alerts_enabled BOOLEAN DEFAULT false,

  -- ═══════════════════════════════════════════════════════════════
  -- EVENT TYPE SETTINGS (what types of alerts to receive)
  -- ═══════════════════════════════════════════════════════════════

  -- GAME ALERTS
  alert_game_start BOOLEAN DEFAULT true,          -- "Bears vs Packers starting now"
  alert_game_end BOOLEAN DEFAULT true,            -- "FINAL: Bears 24, Packers 17"
  alert_score_change BOOLEAN DEFAULT true,        -- "Bears TD! Now leading 14-7"
  alert_close_game BOOLEAN DEFAULT true,          -- "4th Quarter, Bears down by 3"
  alert_overtime BOOLEAN DEFAULT true,            -- "OVERTIME! Bears vs Packers heading to OT"

  -- NEWS ALERTS
  alert_injuries BOOLEAN DEFAULT true,            -- "Caleb Williams questionable (ankle)"
  alert_trades BOOLEAN DEFAULT true,              -- "Bears acquire OT from Dolphins"
  alert_roster_moves BOOLEAN DEFAULT true,        -- "Bears sign FA WR"
  alert_breaking_news BOOLEAN DEFAULT true,       -- Major team news

  -- SPECIAL ALERTS
  alert_playoffs BOOLEAN DEFAULT true,            -- Playoff-specific updates
  alert_draft BOOLEAN DEFAULT false,              -- Draft picks and trades
  alert_preseason BOOLEAN DEFAULT false,          -- Preseason game alerts (default OFF)

  -- ═══════════════════════════════════════════════════════════════
  -- ADVANCED SETTINGS
  -- ═══════════════════════════════════════════════════════════════

  -- Maximum alerts per game (prevents spam during high-scoring games)
  max_alerts_per_game INTEGER DEFAULT 8,

  -- Minimum seconds between alerts (prevents rapid-fire)
  min_alert_gap_seconds INTEGER DEFAULT 60,

  -- Batch similar alerts (combine multiple scores into one alert)
  batch_alerts BOOLEAN DEFAULT true,

  -- Delay alerts for spoiler protection (if user is recording game)
  spoiler_delay_seconds INTEGER DEFAULT 0,  -- 0 = no delay, 300 = 5 min delay

  -- Sound/vibration settings
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,

  UNIQUE(user_id)
);

-- Create index for fast lookups
CREATE INDEX idx_notification_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_notification_prefs_teams ON user_notification_preferences USING GIN(favorite_teams);

-- Row-level security
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

# PHASE 3: NOTIFICATION PREFERENCE UI

## Step 3.1: Create Notification Settings Page

**Claude, create this file at `/mobile/app/profile/notifications.tsx`:**

**FIRST, check if it exists:**
```bash
cat /mobile/app/profile/notifications.tsx 2>/dev/null && echo "FILE EXISTS - DO NOT OVERWRITE"
```

**If it does NOT exist, create:**

```tsx
// /mobile/app/profile/notifications.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { Slider } from '@/components/ui/Slider';
import { TimePicker } from '@/components/ui/TimePicker';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationPreferences {
  notifications_enabled: boolean;
  frequency_mode: 'all' | 'important' | 'minimal' | 'off';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  only_favorite_teams: boolean;
  favorite_teams: string[];
  tracked_players: string[];
  player_alerts_enabled: boolean;
  alert_game_start: boolean;
  alert_game_end: boolean;
  alert_score_change: boolean;
  alert_close_game: boolean;
  alert_overtime: boolean;
  alert_injuries: boolean;
  alert_trades: boolean;
  alert_roster_moves: boolean;
  alert_breaking_news: boolean;
  alert_playoffs: boolean;
  alert_draft: boolean;
  alert_preseason: boolean;
  max_alerts_per_game: number;
  min_alert_gap_seconds: number;
  batch_alerts: boolean;
  spoiler_delay_seconds: number;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notifications_enabled: true,
  frequency_mode: 'important',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  only_favorite_teams: true,
  favorite_teams: ['bears', 'bulls', 'cubs'],
  tracked_players: [],
  player_alerts_enabled: false,
  alert_game_start: true,
  alert_game_end: true,
  alert_score_change: true,
  alert_close_game: true,
  alert_overtime: true,
  alert_injuries: true,
  alert_trades: true,
  alert_roster_moves: true,
  alert_breaking_news: true,
  alert_playoffs: true,
  alert_draft: false,
  alert_preseason: false,
  max_alerts_per_game: 8,
  min_alert_gap_seconds: 60,
  batch_alerts: true,
  spoiler_delay_seconds: 0,
  sound_enabled: true,
  vibration_enabled: true,
};

const CHICAGO_TEAMS = [
  { id: 'bears', name: 'Chicago Bears', sport: 'NFL', emoji: '🏈' },
  { id: 'bulls', name: 'Chicago Bulls', sport: 'NBA', emoji: '🏀' },
  { id: 'cubs', name: 'Chicago Cubs', sport: 'MLB', emoji: '⚾' },
  { id: 'whitesox', name: 'Chicago White Sox', sport: 'MLB', emoji: '⚾' },
  { id: 'blackhawks', name: 'Chicago Blackhawks', sport: 'NHL', emoji: '🏒' },
  { id: 'fire', name: 'Chicago Fire', sport: 'MLS', emoji: '⚽' },
  { id: 'sky', name: 'Chicago Sky', sport: 'WNBA', emoji: '🏀' },
];

const FREQUENCY_MODES = [
  { 
    value: 'all', 
    label: 'All Updates', 
    description: 'Every score change, every news item',
    alertsPerGame: '15-20'
  },
  { 
    value: 'important', 
    label: 'Important Only', 
    description: 'Touchdowns, game endings, breaking news',
    alertsPerGame: '5-8'
  },
  { 
    value: 'minimal', 
    label: 'Minimal', 
    description: 'Game start/end, major news only',
    alertsPerGame: '2-4'
  },
  { 
    value: 'off', 
    label: 'Off', 
    description: 'No push notifications',
    alertsPerGame: '0'
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function NotificationSettingsPage() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD USER PREFERENCES
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading preferences:', error);
          return;
        }

        if (data) {
          setPreferences(data as NotificationPreferences);
        } else {
          // Create default preferences for new user
          const { error: insertError } = await supabase
            .from('user_notification_preferences')
            .insert({ user_id: user.id, ...DEFAULT_PREFERENCES });

          if (insertError) {
            console.error('Error creating preferences:', insertError);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user?.id]);

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE PREFERENCES
  // ─────────────────────────────────────────────────────────────────────────
  async function savePreferences() {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setHasChanges(false);
      Alert.alert('Saved', 'Your notification preferences have been updated.');

      // Sync with OneSignal tags
      await syncOneSignalTags(preferences);

    } catch (err) {
      console.error('Error saving preferences:', err);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYNC WITH ONESIGNAL
  // ─────────────────────────────────────────────────────────────────────────
  async function syncOneSignalTags(prefs: NotificationPreferences) {
    // Import OneSignal
    const OneSignal = require('react-native-onesignal').default;

    // Set tags for segmentation
    await OneSignal.User.addTags({
      // Global settings
      notifications_enabled: prefs.notifications_enabled.toString(),
      frequency_mode: prefs.frequency_mode,

      // Team preferences (for targeted pushes)
      follows_bears: prefs.favorite_teams.includes('bears').toString(),
      follows_bulls: prefs.favorite_teams.includes('bulls').toString(),
      follows_cubs: prefs.favorite_teams.includes('cubs').toString(),
      follows_whitesox: prefs.favorite_teams.includes('whitesox').toString(),
      follows_blackhawks: prefs.favorite_teams.includes('blackhawks').toString(),
      follows_fire: prefs.favorite_teams.includes('fire').toString(),
      follows_sky: prefs.favorite_teams.includes('sky').toString(),

      // Alert type preferences
      alert_scores: prefs.alert_score_change.toString(),
      alert_injuries: prefs.alert_injuries.toString(),
      alert_trades: prefs.alert_trades.toString(),
      alert_breaking: prefs.alert_breaking_news.toString(),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PREFERENCE HELPER
  // ─────────────────────────────────────────────────────────────────────────
  function updatePreference<K extends keyof NotificationPreferences>(
    key: K, 
    value: NotificationPreferences[K]
  ) {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  function toggleTeam(teamId: string) {
    const newTeams = preferences.favorite_teams.includes(teamId)
      ? preferences.favorite_teams.filter(t => t !== teamId)
      : [...preferences.favorite_teams, teamId];
    updatePreference('favorite_teams', newTeams);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return <View className="flex-1 items-center justify-center"><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MASTER TOGGLE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <View className="bg-gray-800 rounded-xl p-4 mb-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-bold">Push Notifications</Text>
            <Text className="text-gray-400 text-sm">
              {preferences.notifications_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <Switch
            value={preferences.notifications_enabled}
            onValueChange={(v) => updatePreference('notifications_enabled', v)}
            trackColor={{ false: '#374151', true: '#10B981' }}
          />
        </View>
      </View>

      {preferences.notifications_enabled && (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FREQUENCY MODE */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Alert Frequency</Text>
            {FREQUENCY_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                onPress={() => updatePreference('frequency_mode', mode.value as any)}
                className={`p-4 rounded-lg mb-2 ${
                  preferences.frequency_mode === mode.value 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white font-semibold">{mode.label}</Text>
                    <Text className="text-gray-300 text-sm">{mode.description}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs">~{mode.alertsPerGame}/game</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FAVORITE TEAMS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-2">My Teams</Text>
            <Text className="text-gray-400 text-sm mb-4">
              Select which teams you want alerts for
            </Text>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-300">Only alert for selected teams</Text>
              <Switch
                value={preferences.only_favorite_teams}
                onValueChange={(v) => updatePreference('only_favorite_teams', v)}
                trackColor={{ false: '#374151', true: '#10B981' }}
              />
            </View>

            {CHICAGO_TEAMS.map((team) => (
              <TouchableOpacity
                key={team.id}
                onPress={() => toggleTeam(team.id)}
                className={`flex-row items-center p-3 rounded-lg mb-2 ${
                  preferences.favorite_teams.includes(team.id)
                    ? 'bg-blue-600'
                    : 'bg-gray-700'
                }`}
              >
                <Text className="text-2xl mr-3">{team.emoji}</Text>
                <View className="flex-1">
                  <Text className="text-white font-semibold">{team.name}</Text>
                  <Text className="text-gray-300 text-xs">{team.sport}</Text>
                </View>
                {preferences.favorite_teams.includes(team.id) && (
                  <Text className="text-white">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ALERT TYPES */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Game Alerts</Text>

            <ToggleRow
              label="Game Starting"
              description="When your team's game begins"
              value={preferences.alert_game_start}
              onToggle={(v) => updatePreference('alert_game_start', v)}
            />
            <ToggleRow
              label="Final Scores"
              description="When games end"
              value={preferences.alert_game_end}
              onToggle={(v) => updatePreference('alert_game_end', v)}
            />
            <ToggleRow
              label="Score Changes"
              description="Touchdowns, goals, runs scored"
              value={preferences.alert_score_change}
              onToggle={(v) => updatePreference('alert_score_change', v)}
            />
            <ToggleRow
              label="Close Games"
              description="When games are tight in final minutes"
              value={preferences.alert_close_game}
              onToggle={(v) => updatePreference('alert_close_game', v)}
            />
            <ToggleRow
              label="Overtime"
              description="When games go to OT"
              value={preferences.alert_overtime}
              onToggle={(v) => updatePreference('alert_overtime', v)}
            />
          </View>

          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">News Alerts</Text>

            <ToggleRow
              label="Injuries"
              description="Player injury updates"
              value={preferences.alert_injuries}
              onToggle={(v) => updatePreference('alert_injuries', v)}
            />
            <ToggleRow
              label="Trades & Signings"
              description="Player acquisitions and trades"
              value={preferences.alert_trades}
              onToggle={(v) => updatePreference('alert_trades', v)}
            />
            <ToggleRow
              label="Roster Moves"
              description="Callups, releases, assignments"
              value={preferences.alert_roster_moves}
              onToggle={(v) => updatePreference('alert_roster_moves', v)}
            />
            <ToggleRow
              label="Breaking News"
              description="Major team announcements"
              value={preferences.alert_breaking_news}
              onToggle={(v) => updatePreference('alert_breaking_news', v)}
            />
          </View>

          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Special Events</Text>

            <ToggleRow
              label="Playoff Updates"
              description="Enhanced coverage during playoffs"
              value={preferences.alert_playoffs}
              onToggle={(v) => updatePreference('alert_playoffs', v)}
            />
            <ToggleRow
              label="Draft Alerts"
              description="Draft picks and trades"
              value={preferences.alert_draft}
              onToggle={(v) => updatePreference('alert_draft', v)}
            />
            <ToggleRow
              label="Preseason Games"
              description="Exhibition game updates"
              value={preferences.alert_preseason}
              onToggle={(v) => updatePreference('alert_preseason', v)}
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ANTI-SPAM SETTINGS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Anti-Spam Settings</Text>

            <View className="mb-4">
              <Text className="text-gray-300 mb-2">
                Max alerts per game: {preferences.max_alerts_per_game}
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={preferences.max_alerts_per_game}
                onValueChange={(v) => updatePreference('max_alerts_per_game', v)}
              />
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs">1 (minimal)</Text>
                <Text className="text-gray-500 text-xs">20 (everything)</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-300 mb-2">
                Minimum gap between alerts: {preferences.min_alert_gap_seconds} seconds
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={300}
                step={30}
                value={preferences.min_alert_gap_seconds}
                onValueChange={(v) => updatePreference('min_alert_gap_seconds', v)}
              />
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs">0 (instant)</Text>
                <Text className="text-gray-500 text-xs">5 min</Text>
              </View>
            </View>

            <ToggleRow
              label="Batch Similar Alerts"
              description="Combine rapid scores into one notification"
              value={preferences.batch_alerts}
              onToggle={(v) => updatePreference('batch_alerts', v)}
            />
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* QUIET HOURS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Quiet Hours</Text>

            <ToggleRow
              label="Enable Quiet Hours"
              description="No notifications during set times"
              value={preferences.quiet_hours_enabled}
              onToggle={(v) => updatePreference('quiet_hours_enabled', v)}
            />

            {preferences.quiet_hours_enabled && (
              <View className="mt-4">
                <View className="flex-row justify-between mb-4">
                  <View>
                    <Text className="text-gray-300">Start</Text>
                    <TimePicker
                      value={preferences.quiet_hours_start}
                      onChange={(v) => updatePreference('quiet_hours_start', v)}
                    />
                  </View>
                  <View>
                    <Text className="text-gray-300">End</Text>
                    <TimePicker
                      value={preferences.quiet_hours_end}
                      onChange={(v) => updatePreference('quiet_hours_end', v)}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SPOILER PROTECTION */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Spoiler Protection</Text>
            <Text className="text-gray-400 text-sm mb-4">
              Delay alerts if you're recording a game
            </Text>

            <View className="mb-4">
              <Text className="text-gray-300 mb-2">
                Delay: {preferences.spoiler_delay_seconds === 0 
                  ? 'Off' 
                  : `${preferences.spoiler_delay_seconds / 60} minutes`}
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={1800}
                step={300}
                value={preferences.spoiler_delay_seconds}
                onValueChange={(v) => updatePreference('spoiler_delay_seconds', v)}
              />
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-xs">Off</Text>
                <Text className="text-gray-500 text-xs">30 min</Text>
              </View>
            </View>
          </View>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SOUND & VIBRATION */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-white text-lg font-bold mb-4">Sound & Vibration</Text>

            <ToggleRow
              label="Sound"
              description="Play sound for notifications"
              value={preferences.sound_enabled}
              onToggle={(v) => updatePreference('sound_enabled', v)}
            />
            <ToggleRow
              label="Vibration"
              description="Vibrate for notifications"
              value={preferences.vibration_enabled}
              onToggle={(v) => updatePreference('vibration_enabled', v)}
            />
          </View>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SAVE BUTTON */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {hasChanges && (
        <TouchableOpacity
          onPress={savePreferences}
          disabled={saving}
          className={`p-4 rounded-xl mb-8 ${saving ? 'bg-gray-600' : 'bg-blue-600'}`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {saving ? 'Saving...' : 'Save Preferences'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Spacer for bottom */}
      <View className="h-20" />
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function ToggleRow({ 
  label, 
  description, 
  value, 
  onToggle 
}: { 
  label: string; 
  description: string; 
  value: boolean; 
  onToggle: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-700">
      <View className="flex-1 mr-4">
        <Text className="text-white font-medium">{label}</Text>
        <Text className="text-gray-400 text-xs">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#374151', true: '#10B981' }}
      />
    </View>
  );
}
```

---

# PHASE 4: BACKEND ALERT ENGINE

## Step 4.1: Create Alert Discovery Service

**Claude, create this file at `/mobile/services/alert-engine.ts`:**

```typescript
// /mobile/services/alert-engine.ts

import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface GameState {
  gameId: string;
  sport: 'nfl' | 'nba' | 'mlb' | 'nhl' | 'mls' | 'wnba';
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: number;
  clock: string;
  status: 'pre' | 'in' | 'post';
  isChicagoTeam: boolean;
  chicagoTeamId: string | null;
  lastUpdated: Date;
}

interface AlertEvent {
  type: 'SCORE_CHANGE' | 'GAME_START' | 'GAME_END' | 'INJURY' | 'TRADE' | 
        'CLOSE_GAME' | 'OVERTIME' | 'BREAKING_NEWS' | 'ROSTER_MOVE';
  gameId?: string;
  sport?: string;
  team: string;
  title: string;
  body: string;
  data: Record<string, any>;
  priority: 'high' | 'normal' | 'low';
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// ESPN FREE API ENDPOINTS (NO SUBSCRIPTION REQUIRED)
// ═══════════════════════════════════════════════════════════════════════════

const ESPN_ENDPOINTS = {
  nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  mls: 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
  wnba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard',
};

const CHICAGO_TEAM_IDS = {
  nfl: { abbreviation: 'CHI', name: 'Bears', id: 'bears' },
  nba: { abbreviation: 'CHI', name: 'Bulls', id: 'bulls' },
  mlb_cubs: { abbreviation: 'CHC', name: 'Cubs', id: 'cubs' },
  mlb_sox: { abbreviation: 'CWS', name: 'White Sox', id: 'whitesox' },
  nhl: { abbreviation: 'CHI', name: 'Blackhawks', id: 'blackhawks' },
  mls: { abbreviation: 'CHI', name: 'Fire', id: 'fire' },
  wnba: { abbreviation: 'CHI', name: 'Sky', id: 'sky' },
};

// ═══════════════════════════════════════════════════════════════════════════
// RSS FEED ENDPOINTS (FREE)
// ═══════════════════════════════════════════════════════════════════════════

const RSS_FEEDS = {
  // ESPN RSS
  espn_nfl: 'https://www.espn.com/espn/rss/nfl/news',
  espn_nba: 'https://www.espn.com/espn/rss/nba/news',
  espn_mlb: 'https://www.espn.com/espn/rss/mlb/news',
  espn_nhl: 'https://www.espn.com/espn/rss/nhl/news',

  // CBS Sports RSS
  cbs_nfl: 'https://www.cbssports.com/rss/headlines/nfl/',
  cbs_nba: 'https://www.cbssports.com/rss/headlines/nba/',
  cbs_mlb: 'https://www.cbssports.com/rss/headlines/mlb/',
  cbs_nhl: 'https://www.cbssports.com/rss/headlines/nhl/',

  // Team-specific
  bears: 'https://www.chicagobears.com/news/rss',
  cubs: 'https://www.mlb.com/cubs/feeds/news/rss.xml',
  whitesox: 'https://www.mlb.com/whitesox/feeds/news/rss.xml',
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

const gameStates: Map<string, GameState> = new Map();
const processedRSSItems: Set<string> = new Set();
const alertsSentPerGame: Map<string, number> = new Map();
const lastAlertTime: Map<string, Date> = new Map();

// ═══════════════════════════════════════════════════════════════════════════
// MAIN POLLING FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main function to discover new alerts
 * Call this every 30 seconds during game times, every 5 minutes otherwise
 */
export async function discoverAlerts(): Promise<AlertEvent[]> {
  const alerts: AlertEvent[] = [];

  try {
    // 1. Fetch scores from ESPN (FREE API)
    const scoreAlerts = await checkScoreUpdates();
    alerts.push(...scoreAlerts);

    // 2. Fetch news from RSS feeds (FREE)
    const newsAlerts = await checkNewsUpdates();
    alerts.push(...newsAlerts);

    // 3. Log for debugging
    console.log(`[AlertEngine] Discovered ${alerts.length} potential alerts`);

  } catch (error) {
    console.error('[AlertEngine] Error discovering alerts:', error);
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCORE CHECKING (ESPN FREE API)
// ═══════════════════════════════════════════════════════════════════════════

async function checkScoreUpdates(): Promise<AlertEvent[]> {
  const alerts: AlertEvent[] = [];

  for (const [sport, url] of Object.entries(ESPN_ENDPOINTS)) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`[ESPN] Failed to fetch ${sport}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      for (const event of data.events || []) {
        const gameAlert = processGameEvent(event, sport);
        if (gameAlert) {
          alerts.push(gameAlert);
        }
      }

    } catch (error) {
      console.error(`[ESPN] Error fetching ${sport}:`, error);
    }
  }

  return alerts;
}

function processGameEvent(event: any, sport: string): AlertEvent | null {
  const competition = event.competitions?.[0];
  if (!competition) return null;

  const competitors = competition.competitors || [];
  const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
  const awayTeam = competitors.find((c: any) => c.homeAway === 'away');

  if (!homeTeam || !awayTeam) return null;

  // Check if Chicago team is playing
  const chicagoTeam = findChicagoTeam(homeTeam, awayTeam, sport);
  if (!chicagoTeam) return null;  // Skip non-Chicago games

  const gameKey = `${sport}-${event.id}`;
  const previousState = gameStates.get(gameKey);

  const currentState: GameState = {
    gameId: event.id,
    sport: sport as any,
    homeTeam: homeTeam.team.displayName,
    awayTeam: awayTeam.team.displayName,
    homeScore: parseInt(homeTeam.score) || 0,
    awayScore: parseInt(awayTeam.score) || 0,
    period: competition.status?.period || 0,
    clock: competition.status?.displayClock || '',
    status: competition.status?.type?.state || 'pre',
    isChicagoTeam: true,
    chicagoTeamId: chicagoTeam.id,
    lastUpdated: new Date(),
  };

  // Store new state
  gameStates.set(gameKey, currentState);

  // First time seeing this game - check for game start
  if (!previousState) {
    if (currentState.status === 'in') {
      return createGameStartAlert(currentState);
    }
    return null;
  }

  // Check for state changes
  return detectStateChange(previousState, currentState, gameKey);
}

function findChicagoTeam(homeTeam: any, awayTeam: any, sport: string) {
  const chicagoAbbreviations = ['CHI', 'CHC', 'CWS'];

  if (chicagoAbbreviations.includes(homeTeam.team.abbreviation)) {
    return CHICAGO_TEAM_IDS[sport as keyof typeof CHICAGO_TEAM_IDS] || 
           (sport === 'mlb' && homeTeam.team.abbreviation === 'CHC' ? CHICAGO_TEAM_IDS.mlb_cubs :
            sport === 'mlb' && homeTeam.team.abbreviation === 'CWS' ? CHICAGO_TEAM_IDS.mlb_sox : null);
  }

  if (chicagoAbbreviations.includes(awayTeam.team.abbreviation)) {
    return CHICAGO_TEAM_IDS[sport as keyof typeof CHICAGO_TEAM_IDS] ||
           (sport === 'mlb' && awayTeam.team.abbreviation === 'CHC' ? CHICAGO_TEAM_IDS.mlb_cubs :
            sport === 'mlb' && awayTeam.team.abbreviation === 'CWS' ? CHICAGO_TEAM_IDS.mlb_sox : null);
  }

  return null;
}

function detectStateChange(prev: GameState, curr: GameState, gameKey: string): AlertEvent | null {
  // Game ended
  if (prev.status !== 'post' && curr.status === 'post') {
    return createGameEndAlert(curr);
  }

  // Game started
  if (prev.status === 'pre' && curr.status === 'in') {
    return createGameStartAlert(curr);
  }

  // Score changed
  if (prev.homeScore !== curr.homeScore || prev.awayScore !== curr.awayScore) {
    return createScoreChangeAlert(prev, curr, gameKey);
  }

  // Close game detection (final period, within 1 score)
  if (isCloseGame(curr) && !isCloseGame(prev)) {
    return createCloseGameAlert(curr);
  }

  // Overtime
  if (curr.period > getRegulationPeriods(curr.sport) && prev.period <= getRegulationPeriods(curr.sport)) {
    return createOvertimeAlert(curr);
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CREATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function createScoreChangeAlert(prev: GameState, curr: GameState, gameKey: string): AlertEvent {
  const pointsScored = (curr.homeScore + curr.awayScore) - (prev.homeScore + prev.awayScore);
  const scoringTeam = curr.homeScore > prev.homeScore ? curr.homeTeam : curr.awayTeam;
  const isChicagoScored = scoringTeam.includes('Bears') || scoringTeam.includes('Bulls') ||
                         scoringTeam.includes('Cubs') || scoringTeam.includes('Sox') ||
                         scoringTeam.includes('Blackhawks') || scoringTeam.includes('Fire') ||
                         scoringTeam.includes('Sky');

  const emoji = getScoreEmoji(curr.sport, pointsScored);

  return {
    type: 'SCORE_CHANGE',
    gameId: curr.gameId,
    sport: curr.sport,
    team: curr.chicagoTeamId || scoringTeam.toLowerCase(),
    title: `${emoji} ${scoringTeam} ${getScoreVerb(curr.sport, pointsScored)}!`,
    body: `${curr.awayTeam} ${curr.awayScore}, ${curr.homeTeam} ${curr.homeScore} • ${formatGameClock(curr)}`,
    data: {
      gameId: curr.gameId,
      homeTeam: curr.homeTeam,
      awayTeam: curr.awayTeam,
      homeScore: curr.homeScore,
      awayScore: curr.awayScore,
      scoringTeam,
      pointsScored,
      isChicagoScored,
    },
    priority: isChicagoScored ? 'high' : 'normal',
    timestamp: new Date(),
  };
}

function createGameStartAlert(game: GameState): AlertEvent {
  return {
    type: 'GAME_START',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: `🏟️ ${game.awayTeam} vs ${game.homeTeam}`,
    body: `Game starting now!`,
    data: { gameId: game.gameId, homeTeam: game.homeTeam, awayTeam: game.awayTeam },
    priority: 'normal',
    timestamp: new Date(),
  };
}

function createGameEndAlert(game: GameState): AlertEvent {
  const chicagoWon = didChicagoWin(game);
  const emoji = chicagoWon ? '🎉' : '📊';

  return {
    type: 'GAME_END',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: `${emoji} FINAL: ${game.awayTeam} ${game.awayScore}, ${game.homeTeam} ${game.homeScore}`,
    body: chicagoWon ? 'Victory!' : 'Game over.',
    data: { 
      gameId: game.gameId, 
      homeTeam: game.homeTeam, 
      awayTeam: game.awayTeam,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      chicagoWon,
    },
    priority: 'high',
    timestamp: new Date(),
  };
}

function createCloseGameAlert(game: GameState): AlertEvent {
  return {
    type: 'CLOSE_GAME',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: `⚡ Close game alert!`,
    body: `${game.awayTeam} ${game.awayScore}, ${game.homeTeam} ${game.homeScore} • ${formatGameClock(game)}`,
    data: { gameId: game.gameId },
    priority: 'high',
    timestamp: new Date(),
  };
}

function createOvertimeAlert(game: GameState): AlertEvent {
  return {
    type: 'OVERTIME',
    gameId: game.gameId,
    sport: game.sport,
    team: game.chicagoTeamId || '',
    title: `🔥 OVERTIME!`,
    body: `${game.awayTeam} vs ${game.homeTeam} heading to OT!`,
    data: { gameId: game.gameId },
    priority: 'high',
    timestamp: new Date(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RSS NEWS CHECKING
// ═══════════════════════════════════════════════════════════════════════════

async function checkNewsUpdates(): Promise<AlertEvent[]> {
  const alerts: AlertEvent[] = [];

  // Use a simple RSS parser or fetch as XML
  for (const [source, url] of Object.entries(RSS_FEEDS)) {
    try {
      const response = await fetch(url);
      const text = await response.text();

      // Simple XML parsing (in production, use a proper RSS parser)
      const items = parseRSSItems(text);

      for (const item of items) {
        // Skip if already processed
        if (processedRSSItems.has(item.link)) continue;
        processedRSSItems.add(item.link);

        // Check if Chicago-relevant
        if (!isChicagoRelevant(item.title + ' ' + item.description)) continue;

        // Check if breaking news
        const newsAlert = classifyNewsItem(item, source);
        if (newsAlert) {
          alerts.push(newsAlert);
        }
      }

    } catch (error) {
      console.error(`[RSS] Error fetching ${source}:`, error);
    }
  }

  return alerts;
}

function parseRSSItems(xml: string): Array<{title: string; link: string; description: string; pubDate: string}> {
  // Simple regex parsing (use proper XML parser in production)
  const items: Array<{title: string; link: string; description: string; pubDate: string}> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                  itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
    const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                        itemXml.match(/<description>(.*?)<\/description>/)?.[1] || '';
    const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';

    items.push({ title, link, description, pubDate });
  }

  return items.slice(0, 10);  // Only check latest 10 items
}

function isChicagoRelevant(text: string): boolean {
  const chicagoKeywords = [
    'bears', 'chicago bears', 'bulls', 'chicago bulls',
    'cubs', 'chicago cubs', 'white sox', 'whitesox', 'blackhawks',
    'chicago blackhawks', 'fire', 'chicago fire', 'sky', 'chicago sky',
    'soldier field', 'wrigley', 'united center', 'guaranteed rate'
  ];

  const lowerText = text.toLowerCase();
  return chicagoKeywords.some(keyword => lowerText.includes(keyword));
}

function classifyNewsItem(item: {title: string; description: string; link: string}, source: string): AlertEvent | null {
  const text = (item.title + ' ' + item.description).toLowerCase();

  // Injury detection
  if (text.includes('injury') || text.includes('injured') || text.includes('questionable') ||
      text.includes('doubtful') || text.includes('out for') || text.includes('surgery')) {
    return {
      type: 'INJURY',
      team: detectTeamFromText(text),
      title: '🏥 Injury Update',
      body: item.title.slice(0, 100),
      data: { link: item.link, source },
      priority: 'high',
      timestamp: new Date(),
    };
  }

  // Trade/signing detection
  if (text.includes('trade') || text.includes('sign') || text.includes('acquire') ||
      text.includes('deal') || text.includes('contract')) {
    return {
      type: 'TRADE',
      team: detectTeamFromText(text),
      title: '📝 Transaction Alert',
      body: item.title.slice(0, 100),
      data: { link: item.link, source },
      priority: 'high',
      timestamp: new Date(),
    };
  }

  // Breaking news detection
  if (text.includes('breaking') || text.includes('just in') || text.includes('report:')) {
    return {
      type: 'BREAKING_NEWS',
      team: detectTeamFromText(text),
      title: '🚨 Breaking News',
      body: item.title.slice(0, 100),
      data: { link: item.link, source },
      priority: 'high',
      timestamp: new Date(),
    };
  }

  return null;  // Not alert-worthy
}

function detectTeamFromText(text: string): string {
  if (text.includes('bears')) return 'bears';
  if (text.includes('bulls')) return 'bulls';
  if (text.includes('cubs')) return 'cubs';
  if (text.includes('white sox') || text.includes('whitesox')) return 'whitesox';
  if (text.includes('blackhawks')) return 'blackhawks';
  if (text.includes('fire')) return 'fire';
  if (text.includes('sky')) return 'sky';
  return 'chicago';
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getScoreEmoji(sport: string, points: number): string {
  if (sport === 'nfl') return points >= 6 ? '🏈' : '🦶';
  if (sport === 'nba') return points >= 3 ? '🏀' : '🎯';
  if (sport === 'mlb') return '⚾';
  if (sport === 'nhl') return '🏒';
  if (sport === 'mls') return '⚽';
  if (sport === 'wnba') return '🏀';
  return '📢';
}

function getScoreVerb(sport: string, points: number): string {
  if (sport === 'nfl') {
    if (points >= 6) return 'TOUCHDOWN';
    if (points === 3) return 'FIELD GOAL';
    if (points === 2) return 'SAFETY';
    return 'scores';
  }
  if (sport === 'nhl' || sport === 'mls') return 'GOAL';
  if (sport === 'mlb') return 'scores';
  return 'scores';
}

function formatGameClock(game: GameState): string {
  const periodNames: Record<string, string[]> = {
    nfl: ['1st', '2nd', '3rd', '4th', 'OT'],
    nba: ['1st', '2nd', '3rd', '4th', 'OT'],
    nhl: ['1st', '2nd', '3rd', 'OT'],
    mlb: ['Top', 'Bot'],  // Handled differently
    mls: ['1st Half', '2nd Half', 'ET'],
    wnba: ['1st', '2nd', '3rd', '4th', 'OT'],
  };

  if (game.sport === 'mlb') {
    return `${game.period % 2 === 1 ? 'Top' : 'Bot'} ${Math.ceil(game.period / 2)}`;
  }

  const periods = periodNames[game.sport] || ['Q1', 'Q2', 'Q3', 'Q4'];
  const periodName = periods[game.period - 1] || `P${game.period}`;
  return `${periodName} ${game.clock}`;
}

function isCloseGame(game: GameState): boolean {
  const finalPeriod = getRegulationPeriods(game.sport);
  const scoreDiff = Math.abs(game.homeScore - game.awayScore);

  // Must be in final period or later
  if (game.period < finalPeriod) return false;

  // Sport-specific close game thresholds
  if (game.sport === 'nfl') return scoreDiff <= 8;  // One score
  if (game.sport === 'nba' || game.sport === 'wnba') return scoreDiff <= 10;
  if (game.sport === 'nhl') return scoreDiff <= 1;
  if (game.sport === 'mlb') return scoreDiff <= 2;
  if (game.sport === 'mls') return scoreDiff <= 1;

  return scoreDiff <= 5;
}

function getRegulationPeriods(sport: string): number {
  if (sport === 'nfl') return 4;
  if (sport === 'nba' || sport === 'wnba') return 4;
  if (sport === 'nhl') return 3;
  if (sport === 'mlb') return 9;
  if (sport === 'mls') return 2;
  return 4;
}

function didChicagoWin(game: GameState): boolean {
  const isHome = game.chicagoTeamId && 
    (game.homeTeam.toLowerCase().includes(game.chicagoTeamId) ||
     game.homeTeam.toLowerCase().includes('chicago'));

  if (isHome) {
    return game.homeScore > game.awayScore;
  } else {
    return game.awayScore > game.homeScore;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  GameState,
  AlertEvent,
  ESPN_ENDPOINTS,
  RSS_FEEDS,
  CHICAGO_TEAM_IDS,
};
```

---

# PHASE 5: ONESIGNAL NOTIFICATION SENDER

## Step 5.1: Create OneSignal Service

**Claude, create this file at `/mobile/services/onesignal-alerts.ts`:**

```typescript
// /mobile/services/onesignal-alerts.ts

import { AlertEvent } from './alert-engine';

// ═══════════════════════════════════════════════════════════════════════════
// ONESIGNAL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!;

// ═══════════════════════════════════════════════════════════════════════════
// SEND NOTIFICATION VIA ONESIGNAL REST API
// ═══════════════════════════════════════════════════════════════════════════

export async function sendPushNotification(alert: AlertEvent): Promise<boolean> {
  try {
    // Build segment filters based on alert type and team
    const filters = buildFilters(alert);

    const payload = {
      app_id: ONESIGNAL_APP_ID,

      // Target users based on their preferences
      filters,

      // Notification content
      headings: { en: alert.title },
      contents: { en: alert.body },

      // Data payload for deep linking
      data: {
        type: alert.type,
        team: alert.team,
        gameId: alert.gameId,
        ...alert.data,
      },

      // iOS specific
      ios_sound: 'default',
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,

      // Android specific
      android_channel_id: getAndroidChannel(alert.type),
      android_accent_color: 'FF0000',  // Chicago red

      // Priority
      priority: alert.priority === 'high' ? 10 : 5,

      // TTL (time to live) - alerts expire after 1 hour
      ttl: 3600,
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('[OneSignal] Error sending notification:', result.errors);
      return false;
    }

    console.log(`[OneSignal] Sent notification to ${result.recipients} users`);
    return true;

  } catch (error) {
    console.error('[OneSignal] Failed to send notification:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BUILD ONESIGNAL FILTERS
// ═══════════════════════════════════════════════════════════════════════════

function buildFilters(alert: AlertEvent): any[] {
  const filters: any[] = [];

  // 1. User must have notifications enabled
  filters.push({ field: 'tag', key: 'notifications_enabled', value: 'true' });

  // 2. User must follow this team (if team-specific alert)
  if (alert.team && alert.team !== 'chicago') {
    filters.push({ operator: 'AND' });
    filters.push({ field: 'tag', key: `follows_${alert.team}`, value: 'true' });
  }

  // 3. User must have this alert type enabled
  const alertTypeTag = getAlertTypeTag(alert.type);
  if (alertTypeTag) {
    filters.push({ operator: 'AND' });
    filters.push({ field: 'tag', key: alertTypeTag, value: 'true' });
  }

  // 4. Frequency mode check (handled by additional filtering in the engine)
  // Users with 'minimal' mode should only get GAME_END and BREAKING_NEWS
  // Users with 'important' mode get scores, endings, injuries, trades
  // Users with 'all' mode get everything

  return filters;
}

function getAlertTypeTag(type: AlertEvent['type']): string | null {
  switch (type) {
    case 'SCORE_CHANGE':
      return 'alert_scores';
    case 'INJURY':
      return 'alert_injuries';
    case 'TRADE':
    case 'ROSTER_MOVE':
      return 'alert_trades';
    case 'BREAKING_NEWS':
      return 'alert_breaking';
    case 'GAME_START':
    case 'GAME_END':
    case 'CLOSE_GAME':
    case 'OVERTIME':
      return 'alert_scores';  // Game alerts fall under scores
    default:
      return null;
  }
}

function getAndroidChannel(type: AlertEvent['type']): string {
  // Create different notification channels for different alert types
  // This allows users to customize notifications at the OS level too
  switch (type) {
    case 'SCORE_CHANGE':
    case 'GAME_START':
    case 'GAME_END':
    case 'CLOSE_GAME':
    case 'OVERTIME':
      return 'game_alerts';
    case 'INJURY':
    case 'TRADE':
    case 'ROSTER_MOVE':
    case 'BREAKING_NEWS':
      return 'news_alerts';
    default:
      return 'general';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH NOTIFICATION SENDER
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBatchNotifications(alerts: AlertEvent[]): Promise<void> {
  // Group alerts by team to avoid sending multiple alerts for same game
  const alertsByTeam = new Map<string, AlertEvent[]>();

  for (const alert of alerts) {
    const key = `${alert.team}-${alert.gameId || 'news'}`;
    if (!alertsByTeam.has(key)) {
      alertsByTeam.set(key, []);
    }
    alertsByTeam.get(key)!.push(alert);
  }

  // Send one notification per team/game (batched)
  for (const [key, teamAlerts] of alertsByTeam) {
    if (teamAlerts.length === 1) {
      await sendPushNotification(teamAlerts[0]);
    } else {
      // Combine multiple alerts into one
      const combined = combineAlerts(teamAlerts);
      await sendPushNotification(combined);
    }

    // Small delay between sends to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function combineAlerts(alerts: AlertEvent[]): AlertEvent {
  // Take the highest priority alert as base
  const sorted = alerts.sort((a, b) => {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const base = sorted[0];

  // Modify body to indicate multiple events
  if (alerts.length > 1) {
    base.body = `${base.body} (+${alerts.length - 1} more updates)`;
  }

  return base;
}
```

---

# PHASE 6: MAIN ORCHESTRATOR (CRON JOB)

## Step 6.1: Create Main Alert Loop

**Claude, create this file at `/mobile/services/alert-orchestrator.ts`:**

```typescript
// /mobile/services/alert-orchestrator.ts

import { discoverAlerts, AlertEvent } from './alert-engine';
import { sendBatchNotifications } from './onesignal-alerts';
import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Polling intervals
  GAME_TIME_INTERVAL_MS: 30000,      // 30 seconds during games
  OFF_HOURS_INTERVAL_MS: 300000,     // 5 minutes when no games

  // Anti-spam limits
  MAX_ALERTS_PER_GAME: 15,
  MAX_ALERTS_PER_HOUR: 10,
  MIN_ALERT_GAP_MS: 60000,           // 1 minute minimum between alerts

  // Game time detection (CST)
  GAME_HOURS: {
    weekday: { start: 18, end: 23 },  // 6pm - 11pm
    weekend: { start: 11, end: 23 },  // 11am - 11pm
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

const alertsSentThisHour: Map<string, number> = new Map();
const lastAlertTime: Map<string, Date> = new Map();
let isRunning = false;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Call this function to start the alert discovery loop
 * Can be triggered by:
 * 1. Vercel Cron Job (recommended)
 * 2. setInterval on always-on server
 * 3. Edge function with scheduler
 */
export async function runAlertCycle(): Promise<{
  discovered: number;
  sent: number;
  filtered: number;
}> {
  if (isRunning) {
    console.log('[Orchestrator] Already running, skipping cycle');
    return { discovered: 0, sent: 0, filtered: 0 };
  }

  isRunning = true;
  const startTime = Date.now();

  try {
    console.log('[Orchestrator] Starting alert discovery cycle...');

    // 1. Discover potential alerts from ESPN + RSS
    const alerts = await discoverAlerts();
    console.log(`[Orchestrator] Discovered ${alerts.length} potential alerts`);

    // 2. Filter alerts based on anti-spam rules
    const filteredAlerts = filterAlerts(alerts);
    console.log(`[Orchestrator] After filtering: ${filteredAlerts.length} alerts to send`);

    // 3. Send notifications via OneSignal
    if (filteredAlerts.length > 0) {
      await sendBatchNotifications(filteredAlerts);

      // Record sent alerts for rate limiting
      for (const alert of filteredAlerts) {
        recordAlertSent(alert);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Orchestrator] Cycle complete in ${duration}ms`);

    return {
      discovered: alerts.length,
      sent: filteredAlerts.length,
      filtered: alerts.length - filteredAlerts.length,
    };

  } catch (error) {
    console.error('[Orchestrator] Error in alert cycle:', error);
    return { discovered: 0, sent: 0, filtered: 0 };
  } finally {
    isRunning = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-SPAM FILTERING
// ═══════════════════════════════════════════════════════════════════════════

function filterAlerts(alerts: AlertEvent[]): AlertEvent[] {
  return alerts.filter(alert => {
    const key = `${alert.team}-${alert.gameId || 'news'}`;

    // Check per-game limit
    const gameAlertCount = alertsSentThisHour.get(key) || 0;
    if (gameAlertCount >= CONFIG.MAX_ALERTS_PER_GAME) {
      console.log(`[Filter] Blocked: ${key} exceeded game limit (${gameAlertCount})`);
      return false;
    }

    // Check minimum gap
    const lastTime = lastAlertTime.get(key);
    if (lastTime && Date.now() - lastTime.getTime() < CONFIG.MIN_ALERT_GAP_MS) {
      console.log(`[Filter] Blocked: ${key} too soon after last alert`);
      return false;
    }

    // Check hourly limit
    const totalThisHour = Array.from(alertsSentThisHour.values())
      .reduce((sum, count) => sum + count, 0);
    if (totalThisHour >= CONFIG.MAX_ALERTS_PER_HOUR) {
      console.log(`[Filter] Blocked: hourly limit exceeded (${totalThisHour})`);
      return false;
    }

    return true;
  });
}

function recordAlertSent(alert: AlertEvent): void {
  const key = `${alert.team}-${alert.gameId || 'news'}`;

  // Increment count
  const current = alertsSentThisHour.get(key) || 0;
  alertsSentThisHour.set(key, current + 1);

  // Record time
  lastAlertTime.set(key, new Date());
}

// Reset hourly counters
setInterval(() => {
  alertsSentThisHour.clear();
  console.log('[Orchestrator] Reset hourly alert counters');
}, 3600000);

// ═══════════════════════════════════════════════════════════════════════════
// POLLING INTERVAL HELPER
// ═══════════════════════════════════════════════════════════════════════════

export function getCurrentPollingInterval(): number {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();  // 0 = Sunday

  const isWeekend = day === 0 || day === 6;
  const gameHours = isWeekend ? CONFIG.GAME_HOURS.weekend : CONFIG.GAME_HOURS.weekday;

  const isGameTime = hour >= gameHours.start && hour <= gameHours.end;

  return isGameTime ? CONFIG.GAME_TIME_INTERVAL_MS : CONFIG.OFF_HOURS_INTERVAL_MS;
}

// ═══════════════════════════════════════════════════════════════════════════
// VERCEL CRON ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

// If using Vercel, create this API route at /api/cron/alerts
// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/alerts",
//     "schedule": "* * * * *"  // Every minute
//   }]
// }

export async function handleCronRequest(request: Request): Promise<Response> {
  // Verify cron secret (prevent unauthorized triggers)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await runAlertCycle();

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

# PHASE 7: VERCEL CRON CONFIGURATION

## Step 7.1: Create Cron API Route

**Claude, create this file at `/mobile/app/api/cron/alerts/route.ts`:**

```typescript
// /mobile/app/api/cron/alerts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { runAlertCycle } from '@/services/alert-orchestrator';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify this is from Vercel Cron
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runAlertCycle();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## Step 7.2: Update vercel.json

**Claude, add this to `/mobile/vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/alerts",
      "schedule": "* * * * *"
    }
  ]
}
```

---

# NOTIFICATION TYPES SUMMARY

## What Gets Sent and When

| Alert Type | Trigger | Example Title | Example Body | Frequency Mode |
|------------|---------|---------------|--------------|----------------|
| GAME_START | Game begins | 🏟️ Bears vs Packers | Game starting now! | all, important, minimal |
| SCORE_CHANGE | Score updates | 🏈 Bears TOUCHDOWN! | Bears 14, Packers 7 • 2nd 3:45 | all, important |
| GAME_END | Game ends | 🎉 FINAL: Bears 24, Packers 17 | Victory! | all, important, minimal |
| CLOSE_GAME | Tight game | ⚡ Close game alert! | Bears 17, Packers 14 • 4th 2:00 | all, important |
| OVERTIME | OT starts | 🔥 OVERTIME! | Bears vs Packers heading to OT! | all, important |
| INJURY | Player hurt | 🏥 Injury Update | Caleb Williams questionable (ankle) | all, important |
| TRADE | Transaction | 📝 Transaction Alert | Bears acquire OT from Dolphins | all, important |
| BREAKING_NEWS | Major news | 🚨 Breaking News | [headline] | all, important, minimal |

---

# POLLING SCHEDULE

| Time Period | Interval | Why |
|-------------|----------|-----|
| Weekday 6pm-11pm CST | 30 seconds | Prime game time |
| Weekend 11am-11pm CST | 30 seconds | Weekend games |
| All other times | 5 minutes | Save resources |

---

# IMPLEMENTATION CHECKLIST FOR CLAUDE

## Before Starting
- [ ] Run all pre-implementation checks (Phase 1)
- [ ] Confirm existing code patterns with user
- [ ] Identify what already exists vs. needs creation

## Database
- [ ] Create `user_notification_preferences` table
- [ ] Add RLS policies
- [ ] Create indexes

## Frontend
- [ ] Create `/app/profile/notifications.tsx`
- [ ] Add ToggleRow component
- [ ] Add Slider component (or use existing)
- [ ] Add TimePicker component (or use existing)

## Backend Services
- [ ] Create `/services/alert-engine.ts`
- [ ] Create `/services/onesignal-alerts.ts`
- [ ] Create `/services/alert-orchestrator.ts`

## API Routes
- [ ] Create `/api/cron/alerts/route.ts`
- [ ] Update `vercel.json` with cron config

## Environment Variables
- [ ] Ensure `ONESIGNAL_APP_ID` is set
- [ ] Ensure `ONESIGNAL_REST_API_KEY` is set
- [ ] Add `CRON_SECRET` for cron authentication

## Testing
- [ ] Test ESPN API endpoints manually
- [ ] Test RSS feed parsing
- [ ] Test OneSignal notification sending
- [ ] Test user preference saving/loading
- [ ] Test frequency capping logic

---

# FINAL NOTES FOR CLAUDE

1. **Always check before creating** - Files may already exist
2. **Use existing patterns** - Match the codebase's style
3. **Ask if uncertain** - Don't guess on file locations
4. **Test incrementally** - Verify each component works before moving on
5. **Document changes** - Update any relevant docs or comments

This system is designed to be:
- **Zero subscription cost** (ESPN API is free)
- **Highly configurable** (users control everything)
- **Anti-spam by design** (multiple safeguards)
- **Chicago-focused** (optimized for 7 teams)
- **Scalable** (works on Vercel free tier)

Build it right, test it thoroughly, and Sports Mockery will have the best notification system in Chicago sports media.
