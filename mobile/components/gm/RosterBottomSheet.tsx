/**
 * RosterBottomSheet - Reusable bottom sheet for roster browsing
 * Features: search, position filters, player selection, MLB prospects toggle
 */

import React, { memo, useCallback, useMemo, useState, forwardRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'

import { useTheme } from '@/hooks/useTheme'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS } from '@/lib/config'
import type { PlayerData, Sport, MLBProspect } from '@/lib/gm-types'

import PlayerCardCompact from './PlayerCardCompact'
import ProspectCard from './ProspectCard'

type ViewMode = 'roster' | 'prospects'

interface RosterBottomSheetProps {
  visible: boolean
  onClose: () => void
  team: { name: string; color: string; logo: string }
  players: PlayerData[]
  selectedPlayerIds: Set<string>
  onTogglePlayer: (player: PlayerData) => void
  loading: boolean
  sport: Sport
  title?: string
  showDraftPicksButton?: boolean
  onOpenDraftPicks?: () => void
  // MLB Prospects props
  prospects?: MLBProspect[]
  selectedProspectIds?: Set<string>
  onToggleProspect?: (prospect: MLBProspect) => void
  prospectsLoading?: boolean
  onLoadProspects?: () => void
}

const SNAP_POINTS = ['35%', '70%', '92%']

export const RosterBottomSheet = forwardRef<BottomSheet, RosterBottomSheetProps>(
  function RosterBottomSheet(
    {
      visible,
      onClose,
      team,
      players,
      selectedPlayerIds,
      onTogglePlayer,
      loading,
      sport,
      title,
      showDraftPicksButton = false,
      onOpenDraftPicks,
      // MLB Prospects
      prospects = [],
      selectedProspectIds = new Set(),
      onToggleProspect,
      prospectsLoading = false,
      onLoadProspects,
    },
    ref
  ) {
    const { colors, isDark } = useTheme()
    const [search, setSearch] = useState('')
    const [posFilter, setPosFilter] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('roster')

    const isMLB = sport === 'mlb'
    const showProspectsToggle = isMLB && onToggleProspect

    // Extract unique positions based on view mode
    const positions = useMemo(() => {
      if (viewMode === 'prospects') {
        const pos = new Set(prospects.map((p) => p.position))
        return Array.from(pos).sort()
      }
      const pos = new Set(players.map((p) => p.position))
      return Array.from(pos).sort()
    }, [players, prospects, viewMode])

    // Filter players/prospects
    const filteredPlayers = useMemo(() => {
      let list = players
      if (search) {
        const q = search.toLowerCase()
        list = list.filter((p) => p.full_name.toLowerCase().includes(q))
      }
      if (posFilter) {
        list = list.filter((p) => p.position === posFilter)
      }
      return list
    }, [players, search, posFilter])

    const filteredProspects = useMemo(() => {
      let list = prospects
      if (search) {
        const q = search.toLowerCase()
        list = list.filter((p) => p.name.toLowerCase().includes(q))
      }
      if (posFilter) {
        list = list.filter((p) => p.position === posFilter)
      }
      return list
    }, [prospects, search, posFilter])

    const handleTogglePlayer = useCallback(
      (player: PlayerData) => {
        onTogglePlayer(player)
        setSearch('') // Clear search after selecting a player
      },
      [onTogglePlayer]
    )

    const handleToggleProspect = useCallback(
      (prospect: MLBProspect) => {
        if (onToggleProspect) {
          onToggleProspect(prospect)
          setSearch('') // Clear search after selecting a prospect
        }
      },
      [onToggleProspect]
    )

    const handleViewModeChange = useCallback(
      (mode: ViewMode) => {
        triggerHaptic('selection')
        setViewMode(mode)
        setPosFilter(null)
        setSearch('')
        // Load prospects when switching to prospects view
        if (mode === 'prospects' && prospects.length === 0 && onLoadProspects) {
          onLoadProspects()
        }
      },
      [prospects.length, onLoadProspects]
    )

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    )

    const renderPlayer = useCallback(
      ({ item }: { item: PlayerData }) => (
        <PlayerCardCompact
          player={item}
          selected={selectedPlayerIds.has(item.player_id)}
          teamColor={team.color}
          onPress={() => handleTogglePlayer(item)}
        />
      ),
      [selectedPlayerIds, team.color, handleTogglePlayer]
    )

    const renderProspect = useCallback(
      ({ item }: { item: MLBProspect }) => {
        const prospectId = item.id || item.prospect_id || item.name
        return (
          <ProspectCard
            prospect={item}
            selected={selectedProspectIds.has(prospectId)}
            teamColor={team.color}
            onPress={() => handleToggleProspect(item)}
          />
        )
      },
      [selectedProspectIds, team.color, handleToggleProspect]
    )

    const keyExtractor = useCallback(
      (item: PlayerData, index: number) => `${item.player_id}-${index}`,
      []
    )

    const prospectKeyExtractor = useCallback(
      (item: MLBProspect, index: number) => `${item.id || item.prospect_id || item.name}-${index}`,
      []
    )

    if (!visible) return null

    const isLoading = viewMode === 'roster' ? loading : prospectsLoading
    const currentCount = viewMode === 'roster' ? players.length : prospects.length
    const currentSelectedCount = viewMode === 'roster' ? selectedPlayerIds.size : selectedProspectIds.size

    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.textMuted,
        }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={[styles.teamBadge, { backgroundColor: team.color }]}>
              <Image source={{ uri: team.logo }} style={styles.teamLogo} contentFit="contain" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {title || team.name}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {currentSelectedCount} selected · {currentCount} {viewMode === 'roster' ? 'players' : 'prospects'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Roster/Prospects Toggle (MLB only) */}
          {showProspectsToggle && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === 'roster' && styles.toggleBtnActive,
                  { backgroundColor: viewMode === 'roster' ? COLORS.primary : colors.background },
                ]}
                onPress={() => handleViewModeChange('roster')}
              >
                <Ionicons
                  name="people"
                  size={16}
                  color={viewMode === 'roster' ? '#fff' : colors.text}
                />
                <Text style={[
                  styles.toggleBtnText,
                  { color: viewMode === 'roster' ? '#fff' : colors.text },
                ]}>
                  Roster
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  viewMode === 'prospects' && styles.toggleBtnActive,
                  { backgroundColor: viewMode === 'prospects' ? '#22c55e' : colors.background },
                ]}
                onPress={() => handleViewModeChange('prospects')}
              >
                <Ionicons
                  name="star"
                  size={16}
                  color={viewMode === 'prospects' ? '#fff' : colors.text}
                />
                <Text style={[
                  styles.toggleBtnText,
                  { color: viewMode === 'prospects' ? '#fff' : colors.text },
                ]}>
                  Prospects
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={viewMode === 'roster' ? 'Search players...' : 'Search prospects...'}
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Position Filters */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={[null, ...positions]}
              keyExtractor={(item) => item || 'all'}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        posFilter === item ? COLORS.primary : colors.background,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic('selection')
                    setPosFilter(item)
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: posFilter === item ? '#fff' : colors.text },
                    ]}
                  >
                    {item || 'All'}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {showDraftPicksButton && (
              <TouchableOpacity
                style={[styles.draftPicksBtn, { borderColor: COLORS.primary }]}
                onPress={onOpenDraftPicks}
              >
                <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                <Text style={[styles.draftPicksBtnText, { color: COLORS.primary }]}>
                  Picks
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Loading {viewMode === 'roster' ? 'roster' : 'prospects'}...
              </Text>
            </View>
          ) : viewMode === 'roster' ? (
            <FlatList
              data={filteredPlayers}
              keyExtractor={keyExtractor}
              renderItem={renderPlayer}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No players found
                  </Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={filteredProspects}
              keyExtractor={prospectKeyExtractor}
              renderItem={renderProspect}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="star-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No prospects found
                  </Text>
                </View>
              }
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogo: {
    width: 28,
    height: 28,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  toggleBtnActive: {},
  toggleBtnText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterList: {
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  draftPicksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  draftPicksBtnText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
})

export default RosterBottomSheet
