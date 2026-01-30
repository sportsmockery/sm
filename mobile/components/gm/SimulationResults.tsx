/**
 * SimulationResults - Display full season simulation results with tabs
 */

import React, { memo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import type { SeasonSimulationResult } from '@/lib/gm-types'

interface SimulationResultsProps {
  result: SeasonSimulationResult
  tradeCount: number
  teamName: string
  teamColor: string
  onSimulateAgain: () => void
  onClose: () => void
}

type TabType = 'overview' | 'standings' | 'playoffs' | 'summary'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

function SimulationResultsComponent({
  result,
  tradeCount,
  teamName,
  teamColor,
  onSimulateAgain,
  onClose,
}: SimulationResultsProps) {
  const { colors, isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const winImprovement = result.modified.wins - result.baseline.wins
  const isImproved = winImprovement > 0

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'stats-chart' },
    { key: 'standings', label: 'Standings', icon: 'list' },
    { key: 'playoffs', label: 'Playoffs', icon: 'trophy' },
    { key: 'summary', label: 'Summary', icon: 'document-text' },
  ]

  const renderOverview = () => (
    <>
      {/* GM Score */}
      <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>GM Score</Text>
        <Text style={[styles.scoreValue, { color: teamColor }]}>{result.gmScore}</Text>
        <Text style={[styles.scoreSubtext, { color: colors.textMuted }]}>
          Based on {tradeCount} trade{tradeCount > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Record Comparison */}
      <View style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Record Projection</Text>

        <View style={styles.recordRow}>
          <View style={styles.recordItem}>
            <Text style={[styles.recordLabel, { color: colors.textMuted }]}>Before Trades</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>
              {result.baseline.wins}-{result.baseline.losses}
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />

          <View style={styles.recordItem}>
            <Text style={[styles.recordLabel, { color: colors.textMuted }]}>After Trades</Text>
            <Text style={[styles.recordValue, { color: isImproved ? '#22c55e' : '#ef4444' }]}>
              {result.modified.wins}-{result.modified.losses}
            </Text>
          </View>
        </View>

        {winImprovement !== 0 && (
          <View style={[styles.improvementBadge, { backgroundColor: isImproved ? '#22c55e20' : '#ef444420' }]}>
            <Ionicons
              name={isImproved ? 'trending-up' : 'trending-down'}
              size={16}
              color={isImproved ? '#22c55e' : '#ef4444'}
            />
            <Text style={[styles.improvementText, { color: isImproved ? '#22c55e' : '#ef4444' }]}>
              {isImproved ? '+' : ''}{winImprovement} wins
            </Text>
          </View>
        )}
      </View>

      {/* Playoffs Status */}
      <View style={[styles.playoffCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.playoffRow}>
          <Text style={[styles.playoffLabel, { color: colors.textMuted }]}>Playoff Status</Text>
          <View style={[
            styles.playoffBadge,
            { backgroundColor: result.modified.madePlayoffs ? '#22c55e20' : '#ef444420' }
          ]}>
            <Ionicons
              name={result.modified.madePlayoffs ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={result.modified.madePlayoffs ? '#22c55e' : '#ef4444'}
            />
            <Text style={[
              styles.playoffText,
              { color: result.modified.madePlayoffs ? '#22c55e' : '#ef4444' }
            ]}>
              {result.modified.madePlayoffs ? 'Made Playoffs' : 'Missed Playoffs'}
            </Text>
          </View>
        </View>

        {result.modified.playoffSeed && (
          <Text style={[styles.seedText, { color: colors.text }]}>
            #{result.modified.playoffSeed} Seed
          </Text>
        )}
      </View>

      {/* Championship */}
      {result.championship && (
        <View style={[styles.championCard, { backgroundColor: colors.surface, borderColor: teamColor }]}>
          <View style={styles.championHeader}>
            <Text style={{ fontSize: 32 }}>🏆</Text>
            <Text style={[styles.championTitle, { color: colors.text }]}>
              {result.championship.userTeamWon ? 'CHAMPIONS!' : 'Championship'}
            </Text>
          </View>
          <View style={styles.championTeams}>
            <View style={styles.championTeam}>
              <Image
                source={{ uri: result.championship.winner.logoUrl }}
                style={styles.championLogo}
                contentFit="contain"
              />
              <Text style={[styles.championTeamName, { color: colors.text }]} numberOfLines={1}>
                {result.championship.winner.teamName}
              </Text>
              <Text style={[styles.championLabel, { color: '#22c55e' }]}>WINNER</Text>
            </View>
            <Text style={[styles.seriesScore, { color: colors.textMuted }]}>
              {result.championship.seriesScore}
            </Text>
            <View style={styles.championTeam}>
              <Image
                source={{ uri: result.championship.runnerUp.logoUrl }}
                style={styles.championLogo}
                contentFit="contain"
              />
              <Text style={[styles.championTeamName, { color: colors.text }]} numberOfLines={1}>
                {result.championship.runnerUp.teamName}
              </Text>
              <Text style={[styles.championLabel, { color: colors.textMuted }]}>Runner-up</Text>
            </View>
          </View>
        </View>
      )}

      {/* Score Breakdown */}
      {result.scoreBreakdown && (
        <View style={[styles.breakdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Score Breakdown</Text>

          {[
            { label: 'Trade Quality', value: result.scoreBreakdown.tradeQualityScore },
            { label: 'Win Improvement', value: result.scoreBreakdown.winImprovementScore },
            { label: 'Playoff Bonus', value: result.scoreBreakdown.playoffBonusScore },
            { label: 'Championship Bonus', value: result.scoreBreakdown.championshipBonus || 0 },
          ].filter(item => item.value !== 0).map((item, idx) => (
            <View key={idx} style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>{item.label}</Text>
              <Text style={[styles.breakdownValue, { color: item.value > 0 ? '#22c55e' : item.value < 0 ? '#ef4444' : colors.text }]}>
                {item.value > 0 ? '+' : ''}{item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  )

  const renderStandings = () => {
    if (!result.standings) {
      return (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Standings data not available</Text>
        </View>
      )
    }

    const renderConference = (teams: typeof result.standings.conference1, name: string) => (
      <View style={[styles.conferenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.conferenceName, { color: colors.text }]}>{name}</Text>
        {teams.map((team, idx) => (
          <View
            key={team.teamKey}
            style={[
              styles.standingRow,
              team.isUserTeam && { backgroundColor: `${teamColor}15` },
              idx < teams.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.standingRank, { color: colors.textMuted }]}>{idx + 1}</Text>
            <Image source={{ uri: team.logoUrl }} style={styles.standingLogo} contentFit="contain" />
            <View style={styles.standingInfo}>
              <Text style={[styles.standingName, { color: team.isUserTeam ? teamColor : colors.text }]} numberOfLines={1}>
                {team.abbreviation}
                {team.isUserTeam && ' ★'}
              </Text>
            </View>
            <Text style={[styles.standingRecord, { color: colors.text }]}>
              {team.wins}-{team.losses}{team.otLosses ? `-${team.otLosses}` : ''}
            </Text>
            {team.playoffSeed && (
              <View style={[styles.seedBadge, { backgroundColor: '#22c55e20' }]}>
                <Text style={{ color: '#22c55e', fontSize: 10, fontFamily: 'Montserrat-Bold' }}>
                  #{team.playoffSeed}
                </Text>
              </View>
            )}
            {team.tradeImpact && team.tradeImpact !== 0 && (
              <Text style={[styles.tradeImpact, { color: team.tradeImpact > 0 ? '#22c55e' : '#ef4444' }]}>
                {team.tradeImpact > 0 ? '+' : ''}{team.tradeImpact}
              </Text>
            )}
          </View>
        ))}
      </View>
    )

    return (
      <>
        {renderConference(result.standings.conference1, result.standings.conference1Name)}
        {renderConference(result.standings.conference2, result.standings.conference2Name)}
      </>
    )
  }

  const renderPlayoffs = () => {
    if (!result.playoffs?.bracket || result.playoffs.bracket.length === 0) {
      return (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Playoff bracket not available</Text>
        </View>
      )
    }

    // Group matchups by round
    const rounds = result.playoffs.bracket.reduce((acc, matchup) => {
      if (!acc[matchup.round]) acc[matchup.round] = []
      acc[matchup.round].push(matchup)
      return acc
    }, {} as Record<number, typeof result.playoffs.bracket>)

    return (
      <>
        {/* User Team Status */}
        {result.playoffs.userTeamResult && (
          <View style={[styles.userResultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Team's Playoff Run</Text>
            {result.playoffs.userTeamResult.wonChampionship ? (
              <View style={styles.championBanner}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
                <Text style={[styles.championBannerText, { color: '#22c55e' }]}>CHAMPIONS!</Text>
              </View>
            ) : result.playoffs.userTeamResult.madePlayoffs ? (
              <View>
                <Text style={[styles.userResultText, { color: colors.textMuted }]}>
                  Eliminated in {result.playoffs.userTeamResult.eliminatedRound === 1 ? 'First Round' :
                    result.playoffs.userTeamResult.eliminatedRound === 2 ? 'Second Round' :
                    result.playoffs.userTeamResult.eliminatedRound === 3 ? 'Conference Finals' : 'Finals'}
                </Text>
                {result.playoffs.userTeamResult.eliminatedBy && (
                  <Text style={[styles.userResultSubtext, { color: colors.textMuted }]}>
                    Lost to {result.playoffs.userTeamResult.eliminatedBy}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[styles.userResultText, { color: '#ef4444' }]}>Missed Playoffs</Text>
            )}
          </View>
        )}

        {/* Bracket by Round */}
        {Object.entries(rounds).map(([round, matchups]) => (
          <View key={round} style={[styles.roundCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.roundTitle, { color: colors.text }]}>
              {matchups[0]?.roundName || `Round ${round}`}
            </Text>
            {matchups.map((matchup, idx) => (
              <View
                key={idx}
                style={[
                  styles.matchupRow,
                  matchup.userTeamInvolved && { backgroundColor: `${teamColor}10` },
                  idx < matchups.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.matchupTeam}>
                  <Image source={{ uri: matchup.homeTeam.logoUrl }} style={styles.matchupLogo} contentFit="contain" />
                  <Text style={[
                    styles.matchupName,
                    { color: matchup.winner === 'home' ? colors.text : colors.textMuted },
                    matchup.winner === 'home' && { fontFamily: 'Montserrat-Bold' },
                  ]} numberOfLines={1}>
                    ({matchup.homeTeam.seed}) {matchup.homeTeam.abbreviation}
                  </Text>
                </View>
                <View style={styles.matchupScore}>
                  <Text style={[styles.seriesWins, { color: colors.text }]}>
                    {matchup.seriesWins[0]} - {matchup.seriesWins[1]}
                  </Text>
                </View>
                <View style={[styles.matchupTeam, { alignItems: 'flex-end' }]}>
                  <Image source={{ uri: matchup.awayTeam.logoUrl }} style={styles.matchupLogo} contentFit="contain" />
                  <Text style={[
                    styles.matchupName,
                    { color: matchup.winner === 'away' ? colors.text : colors.textMuted },
                    matchup.winner === 'away' && { fontFamily: 'Montserrat-Bold' },
                  ]} numberOfLines={1}>
                    ({matchup.awayTeam.seed}) {matchup.awayTeam.abbreviation}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </>
    )
  }

  const renderSummary = () => {
    if (!result.seasonSummary) {
      return (
        <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Season summary not available</Text>
        </View>
      )
    }

    return (
      <>
        {/* Headline */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryHeadline, { color: colors.text }]}>
            {result.seasonSummary.headline}
          </Text>
          <Text style={[styles.summaryNarrative, { color: colors.textMuted }]}>
            {result.seasonSummary.narrative}
          </Text>
        </View>

        {/* Trade Impact */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: teamColor }]}>
          <Text style={[styles.sectionTitle, { color: teamColor }]}>Trade Impact</Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {result.seasonSummary.tradeImpactSummary}
          </Text>
        </View>

        {/* Key Moments */}
        {result.seasonSummary.keyMoments && result.seasonSummary.keyMoments.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Moments</Text>
            {result.seasonSummary.keyMoments.map((moment, idx) => (
              <View key={idx} style={styles.momentRow}>
                <View style={[styles.momentDot, { backgroundColor: teamColor }]} />
                <Text style={[styles.momentText, { color: colors.textMuted }]}>{moment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Affected Teams */}
        {result.seasonSummary.affectedTeams && result.seasonSummary.affectedTeams.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Teams Affected</Text>
            {result.seasonSummary.affectedTeams.map((team, idx) => (
              <View key={idx} style={styles.affectedRow}>
                <Text style={[styles.affectedTeam, { color: colors.text }]}>{team.teamName}</Text>
                <Text style={[styles.affectedImpact, { color: colors.textMuted }]}>{team.impact}</Text>
              </View>
            ))}
          </View>
        )}
      </>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 24 }}>🏆</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Season Simulation</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: teamColor + '20', borderColor: teamColor },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? teamColor : colors.textMuted}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? teamColor : colors.textMuted },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'standings' && renderStandings()}
        {activeTab === 'playoffs' && renderPlayoffs()}
        {activeTab === 'summary' && renderSummary()}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: teamColor }]}
            onPress={onSimulateAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Simulate Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnSecondary, { borderColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnSecondaryText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginLeft: 10,
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontFamily: 'Montserrat-Bold',
  },
  scoreSubtext: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 8,
  },
  recordCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordItem: {
    alignItems: 'center',
    flex: 1,
  },
  recordLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  improvementText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  playoffCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  playoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playoffLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  playoffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  playoffText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  seedText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginTop: 8,
    textAlign: 'center',
  },
  championCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  championHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  championTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  championTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  championTeam: {
    alignItems: 'center',
    flex: 1,
  },
  championLogo: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  championTeamName: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  championLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    marginTop: 4,
  },
  seriesScore: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  breakdownValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  conferenceCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  conferenceName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    padding: 12,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  standingRank: {
    width: 20,
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  standingLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  standingInfo: {
    flex: 1,
  },
  standingName: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  standingRecord: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    marginRight: 8,
  },
  seedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  tradeImpact: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  userResultCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  championBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  championBannerText: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  userResultText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  userResultSubtext: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
  },
  roundCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  roundTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    padding: 12,
  },
  matchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  matchupTeam: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchupLogo: {
    width: 24,
    height: 24,
  },
  matchupName: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
  matchupScore: {
    paddingHorizontal: 12,
  },
  seriesWins: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryHeadline: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  summaryNarrative: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
  },
  momentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  momentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  momentText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  affectedRow: {
    marginBottom: 12,
  },
  affectedTeam: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 2,
  },
  affectedImpact: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  actionBtnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
})

export const SimulationResults = memo(SimulationResultsComponent)
export default SimulationResults
