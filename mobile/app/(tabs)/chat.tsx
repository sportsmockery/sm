import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { TEAMS, COLORS } from '@/lib/config'

// Chat rooms configuration (matches website)
const CHAT_ROOMS = [
  {
    id: 'global',
    name: 'Chicago Lounge',
    description: 'All Chicago sports talk',
    icon: '🏙️',
    color: COLORS.primary,
    aiPersonality: 'BearDownBenny',
  },
  {
    id: 'bears',
    name: 'Bears Den',
    description: 'Bears fans only',
    logo: TEAMS.bears.logo,
    color: TEAMS.bears.color,
    aiPersonality: TEAMS.bears.aiPersonality,
    isLive: true,
  },
  {
    id: 'bulls',
    name: 'Bulls Nation',
    description: 'Bulls discussion',
    logo: TEAMS.bulls.logo,
    color: TEAMS.bulls.color,
    aiPersonality: TEAMS.bulls.aiPersonality,
  },
  {
    id: 'cubs',
    name: 'Cubs Corner',
    description: 'Cubs fan chat',
    logo: TEAMS.cubs.logo,
    color: TEAMS.cubs.color,
    aiPersonality: TEAMS.cubs.aiPersonality,
  },
  {
    id: 'whitesox',
    name: 'Sox Side',
    description: 'White Sox talk',
    logo: TEAMS.whitesox.logo,
    color: TEAMS.whitesox.color,
    aiPersonality: TEAMS.whitesox.aiPersonality,
  },
  {
    id: 'blackhawks',
    name: 'Hawks Nest',
    description: 'Blackhawks chat',
    logo: TEAMS.blackhawks.logo,
    color: TEAMS.blackhawks.color,
    aiPersonality: TEAMS.blackhawks.aiPersonality,
  },
]

export default function ChatScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { isAuthenticated } = useAuth()
  const { isPro, canAccess, openPricing } = useSubscription()
  const canAccessChat = canAccess('fan_chat')

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Fan Chat</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Chat with AI superfans and other fans
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sign In Banner (if not authenticated) */}
        {!isAuthenticated && (
          <TouchableOpacity
            style={[styles.signInBanner, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push('/auth')}
          >
            <View style={styles.signInContent}>
              <Text style={styles.signInTitle}>Sign in to save your chats</Text>
              <Text style={styles.signInSubtitle}>
                Your chat history will sync across devices
              </Text>
            </View>
            <Text style={styles.signInArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* SM+ Upgrade Banner (if not pro) */}
        {!isPro && (
          <TouchableOpacity
            style={[styles.upgradeBanner]}
            onPress={openPricing}
          >
            <View style={styles.upgradeContent}>
              <Ionicons name="star" size={24} color="#fff" />
              <View style={styles.upgradeText}>
                <Text style={styles.upgradeTitle}>Unlock Fan Chat with SM+</Text>
                <Text style={styles.upgradeSubtitle}>
                  Join live discussions with fellow Chicago fans
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Chat Rooms */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chat Rooms</Text>

          {CHAT_ROOMS.map((room) => (
            <Link key={room.id} href={`/chat/${room.id}`} asChild>
              <TouchableOpacity
                style={[styles.roomCard, { borderBottomColor: colors.border }]}
                activeOpacity={0.7}
              >
                {/* Room Icon/Logo */}
                <View style={[styles.roomIcon, { backgroundColor: room.color }]}>
                  {room.logo ? (
                    <Image
                      source={{ uri: room.logo }}
                      style={styles.roomLogo}
                      contentFit="contain"
                    />
                  ) : (
                    <Text style={styles.roomEmoji}>{room.icon}</Text>
                  )}
                </View>

                {/* Room Info */}
                <View style={styles.roomInfo}>
                  <View style={styles.roomHeader}>
                    <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
                    {room.isLive && (
                      <View style={styles.liveBadge}>
                        <View style={styles.liveIndicator} />
                        <Text style={styles.liveText}>LIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.roomDescription, { color: colors.textMuted }]}>
                    {room.description}
                  </Text>
                  <View style={styles.roomMeta}>
                    <View style={[styles.onlineDot, { backgroundColor: COLORS.success }]} />
                    <Text style={[styles.onlineText, { color: colors.textMuted }]}>
                      {room.aiPersonality} is online
                    </Text>
                  </View>
                </View>

                {/* Arrow or Lock */}
                {canAccessChat ? (
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
                ) : (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={12} color="#fff" />
                    <Text style={styles.lockText}>SM+</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>About Fan Chat</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Each chat room has a dedicated AI superfan who's always online and ready to talk
            Chicago sports. They know the teams, the players, and the latest news.
          </Text>
          <Text style={[styles.infoText, { color: colors.textMuted, marginTop: 8 }]}>
            Be respectful and have fun! Inappropriate messages will be moderated.
          </Text>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
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
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  signInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  signInContent: {
    flex: 1,
  },
  signInTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  signInSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  signInArrow: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 12,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  upgradeSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  lockText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    padding: 16,
    paddingBottom: 8,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  roomIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomLogo: {
    width: 32,
    height: 32,
  },
  roomEmoji: {
    fontSize: 24,
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: COLORS.success,
  },
  roomDescription: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
})
