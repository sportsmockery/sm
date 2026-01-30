/**
 * OpponentSelectorSheet - Combined opponent team selection and roster
 * Features: Two tabs for "Select Team" and "Their Roster"
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
  useWindowDimensions,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'

import { useTheme } from '@/hooks/useTheme'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS } from '@/lib/config'
import type { PlayerData, OpponentTeam, Sport } from '@/lib/gm-types'

import PlayerCardCompact from './PlayerCardCompact'

interface OpponentSelectorSheetProps {
  visible: boolean
  onClose: () => void
  sport: Sport
  teams: OpponentTeam[]
  teamsLoading: boolean
  selectedOpponent: OpponentTeam | null
  onSelectOpponent: (team: OpponentTeam) => void
  opponentRoster: PlayerData[]
  rosterLoading: boolean
  selectedPlayerIds: Set<string>
  onTogglePlayer: (player: PlayerData) => void
  showDraftPicksButton?: boolean
  onOpenDraftPicks?: () => void
}

type TabType = 'teams' | 'roster'

const SNAP_POINTS = ['35%', '70%', '92%']

// Group teams by division
function groupByDivision(teams: OpponentTeam[]): Map<string, OpponentTeam[]> {
  const groups = new Map<string, OpponentTeam[]>()
  teams.forEach((team) => {
    const key = `${team.conference} - ${team.division}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(team)
  })
  return groups
}

export const OpponentSelectorSheet = forwardRef<BottomSheet, OpponentSelectorSheetProps>(
  function OpponentSelectorSheet(
    {
      visible,
      onClose,
      sport,
      teams,
      teamsLoading,
      selectedOpponent,
      onSelectOpponent,
      opponentRoster,
      rosterLoading,
      selectedPlayerIds,
      onTogglePlayer,
      showDraftPicksButton = false,
      onOpenDraftPicks,
    },
    ref
  ) {
    const { colors, isDark } = useTheme()
    const { width } = useWindowDimensions()
    const [activeTab, setActiveTab] = useState<TabType>('teams')
    const [teamSearch, setTeamSearch] = useState('')
    const [playerSearch, setPlayerSearch] = useState('')
    const [posFilter, setPosFilter] = useState<string | null>(null)

    // Filter teams
    const filteredTeams = useMemo(() => {
      if (!teamSearch) return teams
      const q = teamSearch.toLowerCase()
      return teams.filter(
        (t) =>
          t.team_name.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.abbreviation.toLowerCase().includes(q)
      )
    }, [teams, teamSearch])

    // Group filtered teams
    const groupedTeams = useMemo(() => groupByDivision(filteredTeams), [filteredTeams])

    // Extract unique positions for roster
    const positions = useMemo(() => {
      const pos = new Set(opponentRoster.map((p) => p.position))
      return Array.from(pos).sort()
    }, [opponentRoster])

    // Filter roster players
    const filteredPlayers = useMemo(() => {
      let list = opponentRoster
      if (playerSearch) {
        const q = playerSearch.toLowerCase()
        list = list.filter((p) => p.full_name.toLowerCase().includes(q))
      }
      if (posFilter) {
        list = list.filter((p) => p.position === posFilter)
      }
      return list
    }, [opponentRoster, playerSearch, posFilter])

    const handleSelectTeam = useCallback(
      (team: OpponentTeam) => {
        triggerHaptic('selection')
        onSelectOpponent(team)
        // Auto-switch to roster tab after team selection
        setActiveTab('roster')
      },
      [onSelectOpponent]
    )

    const handleTogglePlayer = useCallback(
      (player: PlayerData) => {
        onTogglePlayer(player)
      },
      [onTogglePlayer]
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

    const renderTeam = useCallback(
      ({ item }: { item: OpponentTeam }) => (
        <TouchableOpacity
          style={[
            styles.teamCard,
            { backgroundColor: colors.surface },
            selectedOpponent?.team_key === item.team_key && {
              borderColor: item.primary_color,
              borderWidth: 2,
            },
          ]}
          onPress={() => handleSelectTeam(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.teamLogo, { backgroundColor: item.primary_color }]}>
            <Image
              source={{ uri: item.logo_url }}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
          </View>
          <View style={styles.teamCardInfo}>
            <Text style={[styles.teamCardName, { color: colors.text }]} numberOfLines={1}>
              {item.team_name}
            </Text>
            <Text style={[styles.teamCardCity, { color: colors.textMuted }]}>
              {item.city}
            </Text>
          </View>
          {selectedOpponent?.team_key === item.team_key && (
            <Ionicons name="checkmark-circle" size={20} color={item.primary_color} />
          )}
        </TouchableOpacity>
      ),
      [colors, selectedOpponent, handleSelectTeam]
    )

    const renderPlayer = useCallback(
      ({ item }: { item: PlayerData }) => (
        <PlayerCardCompact
          player={item}
          selected={selectedPlayerIds.has(item.player_id)}
          teamColor={selectedOpponent?.primary_color || '#666'}
          onPress={() => handleTogglePlayer(item)}
        />
      ),
      [selectedPlayerIds, selectedOpponent, handleTogglePlayer]
    )

    // Flatten grouped teams for FlatList
    const flatTeamsList = useMemo(() => {
      const result: Array<{ type: 'header'; title: string } | { type: 'team'; team: OpponentTeam }> = []
      groupedTeams.forEach((teamList, division) => {
        result.push({ type: 'header', title: division })
        teamList.forEach((team) => result.push({ type: 'team', team }))
      })
      return result
    }, [groupedTeams])

    if (!visible) return null

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
          {/* Header with Tabs */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'teams' && styles.tabActive,
                activeTab === 'teams' && { borderBottomColor: COLORS.primary },
              ]}
              onPress={() => setActiveTab('teams')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'teams' ? COLORS.primary : colors.textMuted },
                ]}
              >
                Select Team
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'roster' && styles.tabActive,
                activeTab === 'roster' && { borderBottomColor: COLORS.primary },
              ]}
              onPress={() => setActiveTab('roster')}
              disabled={!selectedOpponent}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'roster'
                      ? COLORS.primary
                      : selectedOpponent
                      ? colors.textMuted
                      : colors.border,
                  },
                ]}
              >
                Their Roster
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <>
              {/* Search */}
              <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
                  <Ionicons name="search" size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search teams..."
                    placeholderTextColor={colors.textMuted}
                    value={teamSearch}
                    onChangeText={setTeamSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {teamSearch ? (
                    <TouchableOpacity onPress={() => setTeamSearch('')}>
                      <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Team List */}
              {teamsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <FlatList
                  data={flatTeamsList}
                  keyExtractor={(item, idx) =>
                    item.type === 'header' ? `header-${idx}` : item.team.team_key
                  }
                  renderItem={({ item }) => {
                    if (item.type === 'header') {
                      return (
                        <Text style={[styles.divisionHeader, { color: colors.textMuted }]}>
                          {item.title}
                        </Text>
                      )
                    }
                    return renderTeam({ item: item.team })
                  }}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}

          {/* Roster Tab */}
          {activeTab === 'roster' && (
            <>
              {selectedOpponent && (
                <View style={styles.selectedTeamBanner}>
                  <View
                    style={[styles.bannerLogo, { backgroundColor: selectedOpponent.primary_color }]}
                  >
                    <Image
                      source={{ uri: selectedOpponent.logo_url }}
                      style={{ width: 20, height: 20 }}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={[styles.bannerText, { color: colors.text }]}>
                    {selectedOpponent.team_name}
                  </Text>
                  <Text style={[styles.bannerCount, { color: colors.textMuted }]}>
                    {selectedPlayerIds.size} selected
                  </Text>
                </View>
              )}

              {/* Search */}
              <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.background }]}>
                  <Ionicons name="search" size={16} color={colors.textMuted} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search players..."
                    placeholderTextColor={colors.textMuted}
                    value={playerSearch}
                    onChangeText={setPlayerSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
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
                    <Text style={[styles.draftPicksBtnText, { color: COLORS.primary }]}>Picks</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Roster List */}
              {rosterLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredPlayers}
                  keyExtractor={(item, idx) => `${item.player_id}-${idx}`}
                  renderItem={renderPlayer}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      {!selectedOpponent ? (
                        <>
                          <Ionicons name="people-outline" size={40} color={colors.textMuted} />
                          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            Select a team first
                          </Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            No players found
                          </Text>
                        </>
                      )}
                    </View>
                  }
                />
              )}
            </>
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
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  closeBtn: {
    padding: 4,
  },
  selectedTeamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  bannerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  bannerCount: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
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
  divisionHeader: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamCardName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  teamCardCity: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default OpponentSelectorSheet
