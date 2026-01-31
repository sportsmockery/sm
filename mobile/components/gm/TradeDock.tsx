/**
 * TradeDock - Persistent floating element at the bottom showing trade state
 * Core innovation: Always visible, tap to open sheets, swipe to expand
 */

import React, { memo, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  ScrollView,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/useTheme'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS, TEAMS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import type { PlayerData, DraftPick, OpponentTeam, ChicagoTeam, Sport } from '@/lib/gm-types'

import TradeAssetPill from './TradeAssetPill'
import MLBFinancialsPanel from './MLBFinancialsPanel'
import ValidationBadge, { ValidationStatus } from './ValidationBadge'

// Dock heights
const DOCK_COLLAPSED = 90
const DOCK_EXPANDED = 320

interface TradeDockProps {
  chicagoTeam: ChicagoTeam | null
  opponent: OpponentTeam | null
  sport: Sport | null
  sentAssets: { players: PlayerData[]; picks: DraftPick[] }
  receivedAssets: { players: PlayerData[]; picks: DraftPick[] }
  expanded: boolean
  onExpandToggle: () => void
  onTapChicagoSide: () => void
  onTapOpponentSide: () => void
  onGrade: () => void
  onRemovePlayer: (playerId: string) => void
  onRemoveOpponentPlayer: (playerId: string) => void
  onRemoveDraftPickSent: (index: number) => void
  onRemoveDraftPickReceived: (index: number) => void
  canGrade: boolean
  isGrading: boolean
  // MLB salary retention & cash considerations
  salaryRetentions?: Record<string, number>
  onSalaryRetentionChange?: (playerId: string, pct: number) => void
  cashSent?: number
  cashReceived?: number
  onCashSentChange?: (amount: number) => void
  onCashReceivedChange?: (amount: number) => void
}

function TradeDockComponent({
  chicagoTeam,
  opponent,
  sport,
  sentAssets,
  receivedAssets,
  expanded,
  onExpandToggle,
  onTapChicagoSide,
  onTapOpponentSide,
  onGrade,
  onRemovePlayer,
  onRemoveOpponentPlayer,
  onRemoveDraftPickSent,
  onRemoveDraftPickReceived,
  canGrade,
  isGrading,
  salaryRetentions,
  onSalaryRetentionChange,
  cashSent,
  cashReceived,
  onCashSentChange,
  onCashReceivedChange,
}: TradeDockProps) {
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  const teamConfig = chicagoTeam ? TEAMS[chicagoTeam] : null
  const sentCount = sentAssets.players.length + sentAssets.picks.length
  const receivedCount = receivedAssets.players.length + receivedAssets.picks.length

  // Animation values
  const height = useSharedValue(DOCK_COLLAPSED)
  const dragStart = useSharedValue(0)

  useEffect(() => {
    height.value = withSpring(expanded ? DOCK_EXPANDED : DOCK_COLLAPSED, {
      damping: 20,
      stiffness: 200,
    })
  }, [expanded, height])

  // Determine validation status
  const getValidationStatus = (): ValidationStatus => {
    if (isGrading) return 'grading'
    if (sentCount === 0 && receivedCount === 0) return 'empty'
    if (!opponent || receivedCount === 0) return 'incomplete'
    if (canGrade) return 'valid'
    return 'warning'
  }

  // Swipe gesture for expand/collapse
  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragStart.value = height.value
    })
    .onUpdate((event) => {
      const newHeight = dragStart.value - event.translationY
      height.value = Math.max(DOCK_COLLAPSED, Math.min(DOCK_EXPANDED, newHeight))
    })
    .onEnd((event) => {
      const shouldExpand = event.velocityY < -500 || height.value > (DOCK_COLLAPSED + DOCK_EXPANDED) / 2
      if (shouldExpand !== expanded) {
        runOnJS(onExpandToggle)()
      }
      height.value = withSpring(shouldExpand ? DOCK_EXPANDED : DOCK_COLLAPSED)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value + insets.bottom,
  }))

  const handleChicagoTap = useCallback(() => {
    triggerHaptic('selection')
    onTapChicagoSide()
  }, [onTapChicagoSide])

  const handleOpponentTap = useCallback(() => {
    triggerHaptic('selection')
    onTapOpponentSide()
  }, [onTapOpponentSide])

  const handleGradeTap = useCallback(() => {
    if (canGrade && !isGrading) {
      triggerHaptic('impact_medium')
      onGrade()
    }
  }, [canGrade, isGrading, onGrade])

  const contentOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      height.value,
      [DOCK_COLLAPSED, DOCK_COLLAPSED + 60, DOCK_EXPANDED],
      [0, 0, 1],
      Extrapolation.CLAMP
    ),
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.dock,
          {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
          },
          animatedStyle,
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Compact View - Always visible */}
        <View style={styles.compactRow}>
          {/* Chicago Side */}
          <TouchableOpacity
            style={[styles.teamSide, { borderColor: teamConfig?.color || colors.border }]}
            onPress={handleChicagoTap}
            activeOpacity={0.7}
          >
            {teamConfig ? (
              <>
                <View style={[styles.teamLogo, { backgroundColor: teamConfig.color }]}>
                  <Image
                    source={{ uri: teamConfig.logo }}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.teamInfo}>
                  <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                    {teamConfig.shortName}
                  </Text>
                  <Text style={[styles.assetCount, { color: colors.textMuted }]}>
                    {sentCount === 0 ? 'Tap to add' : `${sentCount} asset${sentCount !== 1 ? 's' : ''}`}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyTeam}>
                <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Select team</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Trade Arrow */}
          <View style={styles.arrowContainer}>
            <Ionicons name="swap-horizontal" size={24} color={COLORS.primary} />
          </View>

          {/* Opponent Side */}
          <TouchableOpacity
            style={[
              styles.teamSide,
              { borderColor: opponent?.primary_color || colors.border },
            ]}
            onPress={handleOpponentTap}
            activeOpacity={0.7}
          >
            {opponent ? (
              <>
                <View style={[styles.teamLogo, { backgroundColor: opponent.primary_color }]}>
                  <Image
                    source={{ uri: opponent.logo_url }}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.teamInfo}>
                  <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                    {opponent.abbreviation}
                  </Text>
                  <Text style={[styles.assetCount, { color: colors.textMuted }]}>
                    {receivedCount === 0 ? 'Tap to add' : `${receivedCount} asset${receivedCount !== 1 ? 's' : ''}`}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyTeam}>
                <Ionicons name="add-circle-outline" size={24} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Select opponent</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Validation + Grade Button */}
        <View style={styles.actionRow}>
          <ValidationBadge status={getValidationStatus()} />
          <TouchableOpacity
            style={[
              styles.gradeButton,
              !canGrade && styles.gradeButtonDisabled,
              isGrading && styles.gradeButtonLoading,
            ]}
            onPress={handleGradeTap}
            disabled={!canGrade || isGrading}
            activeOpacity={0.8}
          >
            {isGrading ? (
              <Ionicons name="sync" size={18} color="#fff" />
            ) : (
              <>
                <Ionicons name="flash" size={16} color="#fff" />
                <Text style={styles.gradeButtonText}>GRADE TRADE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Expanded Content */}
        <Animated.View style={[styles.expandedContent, contentOpacity]}>
          <View style={styles.assetColumns}>
            {/* Sent Assets */}
            <View style={styles.assetColumn}>
              <Text style={[styles.columnTitle, { color: colors.textMuted }]}>Sending</Text>
              <ScrollView
                style={styles.assetScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.assetScrollContent}
              >
                {sentAssets.players.map((player, idx) => (
                  <TradeAssetPill
                    key={`sent-player-${player.player_id}`}
                    type="player"
                    player={player}
                    teamColor={teamConfig?.color || '#666'}
                    onRemove={() => onRemovePlayer(player.player_id)}
                  />
                ))}
                {sentAssets.picks.map((pick, idx) => (
                  <TradeAssetPill
                    key={`sent-pick-${idx}`}
                    type="pick"
                    pick={pick}
                    teamColor={teamConfig?.color || '#666'}
                    onRemove={() => onRemoveDraftPickSent(idx)}
                  />
                ))}
                {sentCount === 0 && (
                  <Text style={[styles.emptyAssets, { color: colors.textMuted }]}>
                    No assets selected
                  </Text>
                )}
              </ScrollView>
            </View>

            {/* Separator */}
            <View style={[styles.columnSeparator, { backgroundColor: colors.border }]} />

            {/* Received Assets */}
            <View style={styles.assetColumn}>
              <Text style={[styles.columnTitle, { color: colors.textMuted }]}>Receiving</Text>
              <ScrollView
                style={styles.assetScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.assetScrollContent}
              >
                {receivedAssets.players.map((player, idx) => (
                  <TradeAssetPill
                    key={`recv-player-${player.player_id}`}
                    type="player"
                    player={player}
                    teamColor={opponent?.primary_color || '#666'}
                    onRemove={() => onRemoveOpponentPlayer(player.player_id)}
                  />
                ))}
                {receivedAssets.picks.map((pick, idx) => (
                  <TradeAssetPill
                    key={`recv-pick-${idx}`}
                    type="pick"
                    pick={pick}
                    teamColor={opponent?.primary_color || '#666'}
                    onRemove={() => onRemoveDraftPickReceived(idx)}
                  />
                ))}
                {receivedCount === 0 && (
                  <Text style={[styles.emptyAssets, { color: colors.textMuted }]}>
                    No assets selected
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>

          {/* MLB Salary Retention & Cash Considerations */}
          {sport === 'mlb' && (
            <MLBFinancialsPanel
              receivedPlayers={receivedAssets.players}
              salaryRetentions={salaryRetentions || {}}
              onSalaryRetentionChange={onSalaryRetentionChange}
              cashSent={cashSent || 0}
              cashReceived={cashReceived || 0}
              onCashSentChange={onCashSentChange}
              onCashReceivedChange={onCashReceivedChange}
            />
          )}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  teamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    padding: 10,
    minHeight: 52,
  },
  teamLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 8,
  },
  teamName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  assetCount: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
  },
  emptyTeam: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  arrowContainer: {
    width: 32,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  gradeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  gradeButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  gradeButtonLoading: {
    backgroundColor: COLORS.primary,
    opacity: 0.8,
  },
  gradeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  expandedContent: {
    flex: 1,
    paddingTop: 12,
  },
  assetColumns: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  assetColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  assetScroll: {
    flex: 1,
  },
  assetScrollContent: {
    paddingBottom: 12,
  },
  columnSeparator: {
    width: 1,
    marginHorizontal: 10,
  },
  emptyAssets: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    paddingVertical: 20,
  },
})

export const TradeDock = memo(TradeDockComponent)
export default TradeDock
