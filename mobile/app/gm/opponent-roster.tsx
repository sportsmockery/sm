import { useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import type { PlayerData } from '@/lib/gm-types'

export default function GMOpponentRosterScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { state, dispatch } = useGM()
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState<string | null>(null)

  const positions = useMemo(() => {
    const pos = new Set(state.opponentRoster.map(p => p.position))
    return Array.from(pos).sort()
  }, [state.opponentRoster])

  const filtered = useMemo(() => {
    let list = state.opponentRoster
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.full_name.toLowerCase().includes(q))
    }
    if (posFilter) list = list.filter(p => p.position === posFilter)
    return list
  }, [state.opponentRoster, search, posFilter])

  const isSelected = (p: PlayerData) =>
    state.selectedOpponentPlayers.some(s => s.player_id === p.player_id)

  const renderPlayer = ({ item }: { item: PlayerData }) => {
    const selected = isSelected(item)
    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          { backgroundColor: colors.surface },
          selected && { borderColor: COLORS.primary, borderWidth: 2 },
        ]}
        activeOpacity={0.8}
        onPress={() => dispatch({ type: 'TOGGLE_OPPONENT_PLAYER', player: item })}
      >
        <View style={styles.playerRow}>
          {item.headshot_url ? (
            <Image source={{ uri: item.headshot_url }} style={styles.headshot} contentFit="cover" />
          ) : (
            <View style={[styles.headshot, styles.headshotPlaceholder, { backgroundColor: state.opponent?.primary_color || '#ccc' }]}>
              <Text style={styles.headshotInitial}>{item.full_name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: colors.text }]}>{item.full_name}</Text>
            <Text style={[styles.playerMeta, { color: colors.textMuted }]}>
              {item.position} {item.jersey_number ? `#${item.jersey_number}` : ''}
              {item.age ? ` · ${item.age}y` : ''}
            </Text>
            {item.stat_line ? (
              <Text style={[styles.statLine, { color: colors.textMuted }]} numberOfLines={1}>
                {item.stat_line}
              </Text>
            ) : null}
          </View>
          {selected && (
            <View style={[styles.checkBadge, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          )}
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
              <Text style={styles.stepBadgeText}>4</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Players to Receive</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {state.opponent?.team_name || ''} · {state.selectedOpponentPlayers.length} selected
          </Text>
        </View>
      </View>

      {/* Search + Filter */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search players..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FlatList
          horizontal
          data={[null, ...positions]}
          keyExtractor={(item) => item || 'all'}
          showsHorizontalScrollIndicator={false}
          style={styles.posFilter}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.posChip,
                { backgroundColor: posFilter === item ? COLORS.primary : colors.background },
              ]}
              onPress={() => setPosFilter(item)}
            >
              <Text style={[styles.posChipText, { color: posFilter === item ? '#fff' : colors.text }]}>
                {item || 'All'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => `${item.player_id}-${index}`}
        renderItem={renderPlayer}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No players found</Text>
        }
      />

      {state.selectedOpponentPlayers.length > 0 && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push('/gm/draft-picks')}
          >
            <Text style={styles.continueBtnText}>
              Continue with {state.selectedOpponentPlayers.length} player{state.selectedOpponentPlayers.length !== 1 ? 's' : ''}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
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
  filterBar: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, fontFamily: 'Montserrat-Regular' },
  posFilter: { marginTop: 8 },
  posChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  posChipText: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
  listContent: { padding: 16 },
  playerCard: {
    borderRadius: 12, marginBottom: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  headshot: { width: 48, height: 48, borderRadius: 24 },
  headshotPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  headshotInitial: { color: '#fff', fontSize: 18, fontFamily: 'Montserrat-Bold' },
  playerInfo: { flex: 1, marginLeft: 12 },
  playerName: { fontSize: 15, fontFamily: 'Montserrat-SemiBold' },
  playerMeta: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  statLine: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  checkBadge: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14, fontFamily: 'Montserrat-Regular' },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  continueBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' },
})
