/**
 * DraftPicksSheet - Quick draft pick management
 * Split view for sending and receiving picks with button-based selectors
 */

import React, { memo, useCallback, useState, forwardRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'

import { useTheme } from '@/hooks/useTheme'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS } from '@/lib/config'
import type { DraftPick, Sport } from '@/lib/gm-types'

interface DraftPicksSheetProps {
  visible: boolean
  onClose: () => void
  sport: Sport
  picksSent: DraftPick[]
  picksReceived: DraftPick[]
  onAddPickSent: (pick: DraftPick) => void
  onRemovePickSent: (index: number) => void
  onAddPickReceived: (pick: DraftPick) => void
  onRemovePickReceived: (index: number) => void
}

const SNAP_POINTS = ['55%', '85%']

// Year options (current year to 5 years out)
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i)

// Rounds by sport
const ROUNDS_BY_SPORT: Record<Sport, number[]> = {
  nfl: [1, 2, 3, 4, 5, 6, 7],
  nba: [1, 2],
  nhl: [1, 2, 3, 4, 5, 6, 7],
  mlb: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
}

type PickSide = 'sent' | 'received'

export const DraftPicksSheet = forwardRef<BottomSheet, DraftPicksSheetProps>(
  function DraftPicksSheet(
    {
      visible,
      onClose,
      sport,
      picksSent,
      picksReceived,
      onAddPickSent,
      onRemovePickSent,
      onAddPickReceived,
      onRemovePickReceived,
    },
    ref
  ) {
    const { colors, isDark } = useTheme()
    const [activeSide, setActiveSide] = useState<PickSide>('sent')
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [selectedRound, setSelectedRound] = useState(1)
    const [condition, setCondition] = useState('')

    const rounds = ROUNDS_BY_SPORT[sport] || ROUNDS_BY_SPORT.nfl

    const handleAddPick = useCallback(() => {
      triggerHaptic('success')
      const pick: DraftPick = {
        year: selectedYear,
        round: selectedRound,
        condition: condition.trim() || undefined,
      }
      if (activeSide === 'sent') {
        onAddPickSent(pick)
      } else {
        onAddPickReceived(pick)
      }
      // Reset condition after adding
      setCondition('')
    }, [activeSide, selectedYear, selectedRound, condition, onAddPickSent, onAddPickReceived])

    const handleRemovePick = useCallback(
      (index: number) => {
        triggerHaptic('impact_light')
        if (activeSide === 'sent') {
          onRemovePickSent(index)
        } else {
          onRemovePickReceived(index)
        }
      },
      [activeSide, onRemovePickSent, onRemovePickReceived]
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

    const currentPicks = activeSide === 'sent' ? picksSent : picksReceived

    if (!visible) return null

    return (
      <BottomSheet
        ref={ref}
        index={0}
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
            <Ionicons name="document-text" size={24} color={COLORS.primary} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Draft Picks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeSide === 'sent' && { backgroundColor: COLORS.primary },
              ]}
              onPress={() => setActiveSide('sent')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeSide === 'sent' ? '#fff' : colors.textMuted },
                ]}
              >
                Sending ({picksSent.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeSide === 'received' && { backgroundColor: COLORS.primary },
              ]}
              onPress={() => setActiveSide('received')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeSide === 'received' ? '#fff' : colors.textMuted },
                ]}
              >
                Receiving ({picksReceived.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pick Builder */}
          <View style={[styles.pickBuilder, { backgroundColor: colors.background }]}>
            <Text style={[styles.builderLabel, { color: colors.textMuted }]}>Add a pick</Text>

            {/* Year Selector */}
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>Year</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {YEARS.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.selectorChip,
                      { backgroundColor: colors.surface },
                      selectedYear === year && { backgroundColor: COLORS.primary },
                    ]}
                    onPress={() => {
                      triggerHaptic('selection')
                      setSelectedYear(year)
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorChipText,
                        { color: selectedYear === year ? '#fff' : colors.text },
                      ]}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Round Selector */}
            <View style={styles.selectorContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>Round</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {rounds.map((round) => (
                  <TouchableOpacity
                    key={round}
                    style={[
                      styles.selectorChip,
                      { backgroundColor: colors.surface },
                      selectedRound === round && { backgroundColor: COLORS.primary },
                    ]}
                    onPress={() => {
                      triggerHaptic('selection')
                      setSelectedRound(round)
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorChipText,
                        { color: selectedRound === round ? '#fff' : colors.text },
                      ]}
                    >
                      R{round}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Condition Input */}
            <View style={styles.conditionContainer}>
              <Text style={[styles.selectorLabel, { color: colors.textMuted }]}>
                Condition (optional)
              </Text>
              <TextInput
                style={[
                  styles.conditionInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                placeholder="e.g., Top 10 protected"
                placeholderTextColor={colors.textMuted}
                value={condition}
                onChangeText={setCondition}
              />
            </View>

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddPick}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Pick</Text>
            </TouchableOpacity>
          </View>

          {/* Current Picks List */}
          <View style={styles.picksListContainer}>
            <Text style={[styles.picksListTitle, { color: colors.textMuted }]}>
              {activeSide === 'sent' ? 'Picks you are sending' : 'Picks you will receive'}
            </Text>
            <ScrollView style={styles.picksList} showsVerticalScrollIndicator={false}>
              {currentPicks.length === 0 ? (
                <View style={styles.emptyPicks}>
                  <Ionicons name="document-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No picks added yet
                  </Text>
                </View>
              ) : (
                currentPicks.map((pick, idx) => (
                  <View
                    key={`pick-${idx}-${pick.year}-${pick.round}`}
                    style={[styles.pickItem, { backgroundColor: colors.surface }]}
                  >
                    <View style={[styles.pickBadge, { backgroundColor: COLORS.primary }]}>
                      <Text style={styles.pickBadgeText}>R{pick.round}</Text>
                    </View>
                    <View style={styles.pickInfo}>
                      <Text style={[styles.pickYear, { color: colors.text }]}>
                        {pick.year} Round {pick.round}
                      </Text>
                      {pick.condition && (
                        <Text style={[styles.pickCondition, { color: colors.textMuted }]}>
                          {pick.condition}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemovePick(idx)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
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
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  pickBuilder: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  builderLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  selectorContainer: {
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 6,
  },
  selectorRow: {
    gap: 8,
  },
  selectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectorChipText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  conditionContainer: {
    marginTop: 4,
  },
  conditionInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  picksListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  picksListTitle: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  picksList: {
    flex: 1,
  },
  emptyPicks: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  pickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
  },
  pickBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  pickInfo: {
    flex: 1,
  },
  pickYear: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  pickCondition: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
})

export default DraftPicksSheet
