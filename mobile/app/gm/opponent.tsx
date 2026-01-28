import { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import { gmApi } from '@/lib/gm-api'
import type { OpponentTeam } from '@/lib/gm-types'

export default function GMOpponentScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { state, dispatch } = useGM()
  const [teams, setTeams] = useState<OpponentTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [loadingRoster, setLoadingRoster] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const sport = state.sport || undefined
        // Exclude the selected Chicago team from opponent list
        const res = await gmApi.getTeams(sport, undefined, state.chicagoTeam || undefined)
        setTeams(res.teams)
      } catch (err) {
        console.error('Failed to load teams:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [state.sport, state.chicagoTeam])

  const filtered = useMemo(() => {
    if (!search) return teams
    const q = search.toLowerCase()
    return teams.filter(
      t => t.team_name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q)
    )
  }, [teams, search])

  const handleSelectOpponent = async (team: OpponentTeam) => {
    dispatch({ type: 'SET_OPPONENT', opponent: team })
    setLoadingRoster(true)
    try {
      const res = await gmApi.getRoster(team.team_key, team.sport)
      dispatch({ type: 'SET_OPPONENT_ROSTER', players: res.players })
      router.push('/gm/opponent-roster')
    } catch (err) {
      console.error('Failed to load opponent roster:', err)
    } finally {
      setLoadingRoster(false)
    }
  }

  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set())

  const renderTeam = ({ item }: { item: OpponentTeam }) => {
    const logoFailed = failedLogos.has(item.team_key)
    const showFallback = !item.logo_url || logoFailed

    return (
      <TouchableOpacity
        style={[styles.teamCard, { backgroundColor: colors.surface }]}
        activeOpacity={0.85}
        onPress={() => handleSelectOpponent(item)}
        disabled={loadingRoster}
      >
        <View style={styles.teamRow}>
          {showFallback ? (
            <View style={[styles.teamLogo, { backgroundColor: item.primary_color || '#666', borderRadius: 22, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#fff', fontFamily: 'Montserrat-Bold', fontSize: 14 }}>
                {item.abbreviation}
              </Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.logo_url }}
              style={styles.teamLogo}
              contentFit="contain"
              onError={() => setFailedLogos(prev => new Set(prev).add(item.team_key))}
            />
          )}
          <View style={styles.teamInfo}>
            <Text style={[styles.teamName, { color: colors.text }]}>{item.team_name}</Text>
            <Text style={[styles.teamMeta, { color: colors.textMuted }]}>
              {item.conference} · {item.division}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Choose Trade Partner</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {state.sport?.toUpperCase()} teams
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search teams..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {(loading || loadingRoster) ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            {loadingRoster ? 'Loading roster...' : 'Loading teams...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.team_key}
          renderItem={renderTeam}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No teams found</Text>
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
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerCenter: { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  stepBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat-Bold' },
  headerTitle: { fontSize: 17, fontFamily: 'Montserrat-Bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2, marginLeft: 32 },
  searchBar: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, fontFamily: 'Montserrat-Regular' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'Montserrat-Medium' },
  listContent: { padding: 16 },
  teamCard: {
    borderRadius: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  teamRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  teamLogo: { width: 44, height: 44 },
  teamInfo: { flex: 1, marginLeft: 12 },
  teamName: { fontSize: 15, fontFamily: 'Montserrat-SemiBold' },
  teamMeta: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14, fontFamily: 'Montserrat-Regular' },
})
