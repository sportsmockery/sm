'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { AssetRow } from './AssetRow'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, TradeFlow } from '@/types/gm'
import type { PlayerData } from './PlayerCard'

interface TeamInfo {
  key: string
  name: string
  logo: string | null
  color: string
}

interface ThreeTeamTradeBoardProps {
  team1: TeamInfo  // Chicago team
  team2: TeamInfo  // Opponent 1
  team3: TeamInfo  // Opponent 2
  flows: TradeFlow[]
  onRemoveFromFlow: (fromTeam: string, toTeam: string, type: 'player' | 'pick', id: string | number) => void
  canGrade: boolean
  grading: boolean
  onGrade: () => void
  validation?: ValidationState
  gradeResult?: any
  mobile?: boolean
}

export function ThreeTeamTradeBoard({
  team1, team2, team3,
  flows,
  onRemoveFromFlow,
  canGrade, grading, onGrade,
  validation,
  gradeResult,
  mobile = false,
}: ThreeTeamTradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const flowBg = isDark ? '#1f2937' : '#ffffff'

  const teams = [team1, team2, team3]

  // Get flow between two teams
  function getFlow(from: string, to: string): TradeFlow | undefined {
    return flows.find(f => f.from === from && f.to === to)
  }

  // Count assets in a flow
  function countFlowAssets(flow: TradeFlow | undefined): number {
    if (!flow) return 0
    return (flow.players?.length || 0) + (flow.picks?.length || 0)
  }

  // Get what a team is receiving (from all sources)
  function getReceiving(teamKey: string): { from: TeamInfo; flow: TradeFlow }[] {
    return teams
      .filter(t => t.key !== teamKey)
      .map(from => ({ from, flow: getFlow(from.key, teamKey) }))
      .filter(({ flow }) => flow && countFlowAssets(flow) > 0) as { from: TeamInfo; flow: TradeFlow }[]
  }

  // Get what a team is sending (to all destinations)
  function getSending(teamKey: string): { to: TeamInfo; flow: TradeFlow }[] {
    return teams
      .filter(t => t.key !== teamKey)
      .map(to => ({ to, flow: getFlow(teamKey, to.key) }))
      .filter(({ flow }) => flow && countFlowAssets(flow) > 0) as { to: TeamInfo; flow: TradeFlow }[]
  }

  // Render a team card
  function renderTeamCard(team: TeamInfo) {
    const receiving = getReceiving(team.key)
    const sending = getSending(team.key)
    const totalReceiving = receiving.reduce((sum, { flow }) => sum + countFlowAssets(flow), 0)
    const totalSending = sending.reduce((sum, { flow }) => sum + countFlowAssets(flow), 0)

    return (
      <div
        key={team.key}
        style={{
          flex: 1,
          minWidth: mobile ? 'auto' : 0,
          backgroundColor: panelBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}
      >
        {/* Team header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          backgroundColor: `${team.color}15`,
          borderBottom: `2px solid ${team.color}`,
        }}>
          {team.logo && (
            <img
              src={team.logo}
              alt={team.name}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: team.color }}>
              {team.name}
            </div>
            <div style={{ fontSize: 11, color: subText }}>
              Sends {totalSending} · Gets {totalReceiving}
            </div>
          </div>
        </div>

        {/* Sending section */}
        <div style={{ padding: 12, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            SENDS OUT
          </div>

          {sending.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sending.map(({ to, flow }) => (
                <div key={to.key} style={{
                  backgroundColor: flowBg,
                  borderRadius: 8,
                  padding: 10,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Destination badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 10,
                    color: subText,
                  }}>
                    <span>To</span>
                    {to.logo && (
                      <img src={to.logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600, color: to.color }}>{to.name}</span>
                  </div>

                  {/* Assets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <AnimatePresence>
                      {flow.players?.map((p: any) => (
                        <AssetRow
                          key={p.player_id}
                          type="PLAYER"
                          player={p}
                          teamColor={team.color}
                          onRemove={gradeResult ? undefined : () => onRemoveFromFlow(team.key, to.key, 'player', p.player_id)}
                          compact
                        />
                      ))}
                      {flow.picks?.map((pk: DraftPick, i: number) => (
                        <AssetRow
                          key={`pk-${i}`}
                          type="DRAFT_PICK"
                          pick={pk}
                          teamColor={team.color}
                          onRemove={gradeResult ? undefined : () => onRemoveFromFlow(team.key, to.key, 'pick', i)}
                          compact
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 11,
              color: isDark ? '#4b5563' : '#9ca3af',
            }}>
              Not sending any assets
            </div>
          )}
        </div>

        {/* Receiving section */}
        <div style={{ padding: 12 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#22c55e',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            RECEIVES
          </div>

          {receiving.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {receiving.map(({ from, flow }) => (
                <div key={from.key} style={{
                  backgroundColor: flowBg,
                  borderRadius: 8,
                  padding: 10,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Source badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 10,
                    color: subText,
                  }}>
                    <span>From</span>
                    {from.logo && (
                      <img src={from.logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600, color: from.color }}>{from.name}</span>
                  </div>

                  {/* Assets (read-only, removal handled from sender) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {flow.players?.map((p: any) => (
                      <div
                        key={p.player_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          borderLeft: `3px solid ${from.color}`,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>{p.full_name}</span>
                        <span style={{ fontSize: 10, color: subText }}>{p.position}</span>
                      </div>
                    ))}
                    {flow.picks?.map((pk: DraftPick, i: number) => (
                      <div
                        key={`rpk-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          borderLeft: '3px solid #8b5cf6',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
                          {pk.year} Round {pk.round}
                        </span>
                        {pk.condition && (
                          <span style={{ fontSize: 10, color: subText }}>{pk.condition}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 11,
              color: isDark ? '#4b5563' : '#9ca3af',
            }}>
              Not receiving any assets
            </div>
          )}
        </div>
      </div>
    )
  }

  // Total assets in trade
  const totalAssets = flows.reduce((sum, f) => sum + countFlowAssets(f), 0)
  const activeFlows = flows.filter(f => countFlowAssets(f) > 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 3-Team Trade Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: '#bc000010',
        borderRadius: 10,
        border: '1px solid #bc000030',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#bc0000',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          3-Team Trade
        </span>
        <span style={{ color: subText, fontSize: 12 }}>
          {totalAssets} assets · {activeFlows} active flows
        </span>
      </div>

      {/* Team Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {renderTeamCard(team1)}
        {renderTeamCard(team2)}
        {renderTeamCard(team3)}
      </div>

      {/* Flow Diagram (visual summary) */}
      {!mobile && activeFlows > 0 && (
        <div style={{
          backgroundColor: panelBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          padding: 16,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: subText,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 12,
          }}>
            Trade Summary
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {flows.filter(f => countFlowAssets(f) > 0).map((flow, idx) => {
              const from = teams.find(t => t.key === flow.from)
              const to = teams.find(t => t.key === flow.to)
              if (!from || !to) return null

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    backgroundColor: flowBg,
                    borderRadius: 20,
                    border: `1px solid ${borderColor}`,
                    fontSize: 11,
                  }}
                >
                  {from.logo && (
                    <img src={from.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )}
                  <span style={{ fontWeight: 600, color: from.color }}>{from.name.split(' ').pop()}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {to.logo && (
                    <img src={to.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )}
                  <span style={{ fontWeight: 600, color: to.color }}>{to.name.split(' ').pop()}</span>
                  <span style={{
                    backgroundColor: '#bc000020',
                    color: '#bc0000',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                  }}>
                    {countFlowAssets(flow)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Validation */}
      {validation && validation.status !== 'idle' && (
        <ValidationIndicator validation={validation} />
      )}

      {/* Grade button */}
      {!gradeResult && (() => {
        const isBlocked = validation?.status === 'invalid'
        const canClick = canGrade && !grading && !isBlocked
        return (
          <motion.button
            whileHover={canClick ? { scale: 1.02 } : {}}
            whileTap={canClick ? { scale: 0.98 } : {}}
            onClick={onGrade}
            disabled={!canClick}
            style={{
              width: '100%',
              padding: '14px 32px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: canClick ? '#bc0000' : (isDark ? '#374151' : '#d1d5db'),
              color: canClick ? '#fff' : subText,
              fontWeight: 800,
              fontSize: 16,
              cursor: canClick ? 'pointer' : 'not-allowed',
              letterSpacing: '0.5px',
            }}
          >
            {grading ? 'ANALYZING 3-TEAM TRADE...' : isBlocked ? 'FIX ISSUES TO GRADE' : 'GRADE 3-TEAM TRADE'}
          </motion.button>
        )
      })()}

      {/* Empty state */}
      {totalAssets === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: subText,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Build Your 3-Team Trade</div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            Click on players from any team's roster to add them to the trade.
            <br />
            A modal will ask which team should receive each player.
          </div>
        </div>
      )}
    </div>
  )
}
