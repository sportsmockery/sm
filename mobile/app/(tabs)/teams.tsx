import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import { useFeed } from '@/hooks/useFeed'
import { TEAMS, COLORS } from '@/lib/config'

export default function TeamsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { teamPreferences, onlySelectedTeams } = useFeed()

  const allTeams = Object.values(TEAMS)
  const teamList = onlySelectedTeams
    ? allTeams.filter(t => teamPreferences.includes(t.id))
    : allTeams

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chicago Teams</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          Follow your favorite teams
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mock Draft Banner */}
        <TouchableOpacity
          style={styles.draftBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/mock-draft')}
        >
          <View style={styles.draftBannerContent}>
            <View style={styles.draftBannerLeft}>
              <Text style={styles.draftBannerBadge}>NEW</Text>
              <Text style={styles.draftBannerTitle}>Mock Draft</Text>
              <Text style={styles.draftBannerDesc}>Draft prospects & get AI grades</Text>
            </View>
            <View style={styles.gmBannerArrow}>
              <Text style={styles.gmBannerArrowText}>{'>'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* GM Trade Simulator Banner */}
        <TouchableOpacity
          style={styles.gmBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/gm')}
        >
          <View style={styles.gmBannerContent}>
            <View style={styles.gmBannerLeft}>
              <Text style={styles.gmBannerBadge}>NEW</Text>
              <Text style={styles.gmBannerTitle}>GM Trade Simulator</Text>
              <Text style={styles.gmBannerDesc}>Build trades & get AI grades</Text>
            </View>
            <View style={styles.gmBannerArrow}>
              <Text style={styles.gmBannerArrowText}>{'>'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Team Cards */}
        {teamList.map((team) => (
          <Link key={team.id} href={`/team/${team.id}`} asChild>
            <TouchableOpacity
              style={[styles.teamCard, { backgroundColor: colors.surface }]}
              activeOpacity={0.9}
            >
              {/* Team Color Bar */}
              <View style={[styles.colorBar, { backgroundColor: team.color }]} />

              {/* Team Content */}
              <View style={styles.teamContent}>
                {/* Logo */}
                <View style={[styles.logoContainer, { backgroundColor: team.color }]}>
                  <Image
                    source={{ uri: team.logo }}
                    style={styles.teamLogo}
                    contentFit="contain"
                  />
                </View>

                {/* Info */}
                <View style={styles.teamInfo}>
                  <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                  <Text style={[styles.teamSport, { color: colors.textMuted }]}>
                    {team.sport.charAt(0).toUpperCase() + team.sport.slice(1)}
                  </Text>
                  <View style={styles.teamMeta}>
                    <View style={styles.chatPreview}>
                      <View style={[styles.onlineIndicator, { backgroundColor: COLORS.success }]} />
                      <Text style={[styles.chatText, { color: colors.textMuted }]}>
                        {team.aiPersonality} is online
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}

        {/* All Teams Feed Link */}
        <TouchableOpacity
          style={[styles.allTeamsCard, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/')}
        >
          <View style={[styles.allTeamsIcon, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.allTeamsIconText}>ALL</Text>
          </View>
          <View style={styles.allTeamsContent}>
            <Text style={[styles.allTeamsTitle, { color: colors.text }]}>All Chicago Sports</Text>
            <Text style={[styles.allTeamsSubtitle, { color: colors.textMuted }]}>
              View combined feed from all teams
            </Text>
          </View>
        </TouchableOpacity>

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
    padding: 16,
  },
  teamCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorBar: {
    height: 4,
    width: '100%',
  },
  teamContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogo: {
    width: 44,
    height: 44,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 16,
  },
  teamName: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 2,
  },
  teamSport: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chatText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  arrowContainer: {
    paddingLeft: 12,
  },
  allTeamsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  allTeamsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allTeamsIconText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  allTeamsContent: {
    marginLeft: 16,
  },
  allTeamsTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  allTeamsSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  gmBanner: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#bc0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  gmBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  gmBannerLeft: {
    flex: 1,
  },
  gmBannerBadge: {
    color: '#bc0000',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
    letterSpacing: 1,
  },
  gmBannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 2,
  },
  gmBannerDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  gmBannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  gmBannerArrowText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  draftBanner: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#1e40af',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  draftBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  draftBannerLeft: {
    flex: 1,
  },
  draftBannerBadge: {
    color: '#1e40af',
    backgroundColor: '#fbbf24',
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
    letterSpacing: 1,
  },
  draftBannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 2,
  },
  draftBannerDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  draftBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  draftBannerIconText: {
    fontSize: 24,
  },
})
