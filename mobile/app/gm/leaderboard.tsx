import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { gmApi } from '@/lib/gm-api'
import type { LeaderboardEntry } from '@/lib/gm-types'

export default function GMLeaderboardScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await gmApi.getLeaderboard()
        setEntries(res.leaderboard)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getMedalColor = (index: number) => {
    if (index === 0) return '#FFD700'
    if (index === 1) return '#C0C0C0'
    if (index === 2) return '#CD7F32'
    return null
  }

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const medal = getMedalColor(index)
    return (
      <View style={[styles.entryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.rankCol}>
          {medal ? (
            <View style={[styles.medalBadge, { backgroundColor: medal }]}>
              <Text style={styles.medalText}>{index + 1}</Text>
            </View>
          ) : (
            <Text style={[styles.rankText, { color: colors.textMuted }]}>{index + 1}</Text>
          )}
        </View>
        <View style={styles.entryInfo}>
          <Text style={[styles.entryName, { color: colors.text }]} numberOfLines={1}>
            {item.user_email.split('@')[0]}
          </Text>
          <Text style={[styles.entryStats, { color: colors.textMuted }]}>
            {item.trades_count} trades · Avg {Math.round(item.avg_grade)}
          </Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={[styles.scoreText, { color: COLORS.primary }]}>{item.total_score}</Text>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>pts</Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Ionicons name="trophy" size={22} color="#FFD700" style={{ marginRight: 8 }} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboard</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.user_id}
          renderItem={renderEntry}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No entries yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
  listContent: { padding: 16 },
  entryCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  rankCol: { width: 36, alignItems: 'center' },
  medalBadge: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  medalText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Bold' },
  rankText: { fontSize: 16, fontFamily: 'Montserrat-Bold' },
  entryInfo: { flex: 1, marginLeft: 12 },
  entryName: { fontSize: 15, fontFamily: 'Montserrat-SemiBold' },
  entryStats: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  scoreCol: { alignItems: 'flex-end' },
  scoreText: { fontSize: 20, fontFamily: 'Montserrat-Bold' },
  scoreLabel: { fontSize: 11, fontFamily: 'Montserrat-Regular' },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontFamily: 'Montserrat-Medium', marginTop: 12 },
})
