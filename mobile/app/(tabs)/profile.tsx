import { useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useFeed } from '@/hooks/useFeed'
import { TEAMS, COLORS, TeamId } from '@/lib/config'

export default function ProfileScreen() {
  const router = useRouter()
  const { colors, mode, setMode, isDark } = useTheme()
  const { user, isAuthenticated, signOut, isAdmin, isEditor } = useAuth()
  const { teamPreferences, updateTeamPreferences } = useFeed()

  const toggleTeam = useCallback((teamId: string) => {
    const isSelected = teamPreferences.includes(teamId)
    if (isSelected) {
      // Remove team from preferences
      const newPrefs = teamPreferences.filter(t => t !== teamId)
      updateTeamPreferences(newPrefs)
    } else {
      // Add team to preferences
      updateTeamPreferences([...teamPreferences, teamId])
    }
  }, [teamPreferences, updateTeamPreferences])

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        {isAuthenticated && user ? (
          <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.userAvatar, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.userAvatarText}>
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.signInCard, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push('/auth')}
          >
            <Ionicons name="person-circle-outline" size={48} color="#fff" />
            <View style={styles.signInContent}>
              <Text style={styles.signInTitle}>Sign In</Text>
              <Text style={styles.signInSubtitle}>
                Save your preferences and sync across devices
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}

        {/* Favorite Teams */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Favorite Teams</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Select teams to customize your feed
          </Text>

          <View style={styles.teamsGrid}>
            {Object.values(TEAMS).map((team) => {
              const isSelected = teamPreferences.includes(team.id)
              return (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.teamChip,
                    {
                      backgroundColor: isSelected ? `${team.color}15` : colors.background,
                      borderColor: isSelected ? team.color : colors.border,
                    },
                  ]}
                  onPress={() => toggleTeam(team.id)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: team.logo }} style={styles.teamChipLogo} contentFit="contain" />
                  <Text style={[styles.teamChipName, { color: colors.text }]}>{team.shortName}</Text>
                  <View
                    style={[
                      styles.teamCheckbox,
                      {
                        borderColor: isSelected ? team.color : colors.border,
                        backgroundColor: isSelected ? team.color : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

          {/* Dark Mode */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <View style={styles.settingControl}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  mode === 'light' && styles.themeButtonActive,
                  { borderColor: colors.border },
                ]}
                onPress={() => setMode('light')}
              >
                <Text style={[styles.themeButtonText, { color: mode === 'light' ? COLORS.primary : colors.textMuted }]}>
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  mode === 'dark' && styles.themeButtonActive,
                  { borderColor: colors.border },
                ]}
                onPress={() => setMode('dark')}
              >
                <Text style={[styles.themeButtonText, { color: mode === 'dark' ? COLORS.primary : colors.textMuted }]}>
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  mode === 'system' && styles.themeButtonActive,
                  { borderColor: colors.border },
                ]}
                onPress={() => setMode('system')}
              >
                <Text style={[styles.themeButtonText, { color: mode === 'system' ? COLORS.primary : colors.textMuted }]}>
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={() => {/* Navigate to notification settings */}}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Offline Reading */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="download-outline" size={22} color={colors.text} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Offline Reading</Text>
                <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                  Cache articles for offline access
                </Text>
              </View>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: `${COLORS.primary}80` }}
              thumbColor={COLORS.primary}
            />
          </View>
        </View>

        {/* About */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text-outline" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-outline" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="information-circle-outline" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
            </View>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>1.0.0</Text>
          </View>
        </View>

        {/* Admin/Editor Section - temporarily show for all authenticated users for testing */}
        {isAuthenticated && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin Tools</Text>

            <TouchableOpacity
              style={[styles.settingRow, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/notifications' as any)}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
                  <Text style={[styles.settingDesc, { color: colors.textMuted }]}>
                    Send notifications to app users
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out */}
        {isAuthenticated && (
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.surface }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            <Text style={[styles.signOutText, { color: COLORS.error }]}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  signInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  signInContent: {
    flex: 1,
    marginLeft: 12,
  },
  signInTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  signInSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 16,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  teamChipLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  teamChipName: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    marginRight: 8,
  },
  teamCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}20`,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
  },
  settingDesc: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  settingControl: {
    flexDirection: 'row',
    gap: 4,
  },
  themeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeButtonActive: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  themeButtonText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
})
