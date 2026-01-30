import { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { gmApi } from '@/lib/gm-api'
import type { Trade } from '@/lib/gm-types'

function getGradeColor(grade: number) {
  if (grade >= 85) return '#22c55e'
  if (grade >= 70) return '#f59e0b'
  if (grade >= 50) return '#f97316'
  return '#ef4444'
}

export default function GMHistoryScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await gmApi.getTrades()
        setTrades(res.trades)
      } catch (err) {
        console.error('Failed to load trades:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExportAll = async () => {
    if (trades.length === 0) {
      Alert.alert('No Trades', 'You have no trades to export.')
      return
    }
    setExporting(true)
    try {
      const result = await gmApi.exportTrade({ format: 'json', all: true })
      if (result.data) {
        await Share.share({
          message: JSON.stringify(result.data, null, 2),
          title: 'Trade History Export',
        })
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Failed to export trades')
    } finally {
      setExporting(false)
    }
  }

  const renderTrade = ({ item }: { item: Trade }) => {
    const gradeColor = getGradeColor(item.grade)
    return (
      <View style={[styles.tradeCard, { backgroundColor: colors.surface }]}>
        <View style={styles.tradeHeader}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{item.grade}</Text>
          </View>
          <View style={styles.tradeInfo}>
            <Text style={[styles.tradeTeams, { color: colors.text }]}>
              {item.chicago_team.charAt(0).toUpperCase() + item.chicago_team.slice(1)} ↔ {item.trade_partner}
            </Text>
            <Text style={[styles.tradeDate, { color: colors.textMuted }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusPill, {
            backgroundColor: item.status === 'accepted' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          }]}>
            <Text style={{
              color: item.status === 'accepted' ? '#22c55e' : '#ef4444',
              fontSize: 11, fontFamily: 'Montserrat-Bold',
            }}>
              {item.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
            </Text>
          </View>
        </View>
        {item.trade_summary && (
          <Text style={[styles.tradeSummary, { color: colors.textMuted }]} numberOfLines={2}>
            {item.trade_summary}
          </Text>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trade History</Text>
        <View style={{ flex: 1 }} />
        {trades.length > 0 && (
          <TouchableOpacity onPress={handleExportAll} disabled={exporting} style={styles.exportBtn}>
            {exporting ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="download-outline" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(item) => item.id}
          renderItem={renderTrade}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="swap-horizontal-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No trades yet</Text>
              <TouchableOpacity onPress={() => router.replace('/gm')}>
                <Text style={[styles.linkText, { color: COLORS.primary }]}>Make your first trade</Text>
              </TouchableOpacity>
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
  exportBtn: { padding: 4 },
  listContent: { padding: 16 },
  tradeCard: {
    borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  tradeHeader: { flexDirection: 'row', alignItems: 'center' },
  gradeBadge: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  gradeText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' },
  tradeInfo: { flex: 1, marginLeft: 12 },
  tradeTeams: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  tradeDate: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tradeSummary: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, fontFamily: 'Montserrat-Medium', marginTop: 12 },
  linkText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', marginTop: 8 },
})
