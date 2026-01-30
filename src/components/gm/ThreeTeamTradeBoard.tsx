'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { AssetRow } from './AssetRow'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, MLBProspect } from '@/types/gm'
import type { PlayerData } from './PlayerCard'

interface TeamTradeAssets {
  players: PlayerData[]
  prospects: MLBProspect[]
  draftPicks: DraftPick[]
}

interface TeamInfo {
  name: string
  abbreviation?: string
  logo: string | null
  color: string
}

interface ThreeTeamTradeBoardProps {
  team1: TeamInfo  // Chicago team
  team2: TeamInfo  // Opponent 1
  team3: TeamInfo  // Opponent 2

  // Assets each team sends out
  team1Sends: TeamTradeAssets
  team2Sends: TeamTradeAssets
  team3Sends: TeamTradeAssets

  // Which team receives assets from which team
  // team1ReceivesFrom: { fromTeam2: TeamTradeAssets, fromTeam3: TeamTradeAssets }
  // Simplified: we track what each team sends, and the UI shows receive = sum of what others send to them
  team1ReceivesFromTeam2: TeamTradeAssets
  team1ReceivesFromTeam3: TeamTradeAssets
  team2ReceivesFromTeam1: TeamTradeAssets
  team2ReceivesFromTeam3: TeamTradeAssets
  team3ReceivesFromTeam1: TeamTradeAssets
  team3ReceivesFromTeam2: TeamTradeAssets

  // Remove handlers
  onRemoveTeam1Player: (playerId: string) => void
  onRemoveTeam1Pick: (index: number) => void
  onRemoveTeam1Prospect: (prospectId: string) => void
  onRemoveTeam2Player: (playerId: string) => void
  onRemoveTeam2Pick: (index: number) => void
  onRemoveTeam2Prospect: (prospectId: string) => void
  onRemoveTeam3Player: (playerId: string) => void
  onRemoveTeam3Pick: (index: number) => void
  onRemoveTeam3Prospect: (prospectId: string) => void

  canGrade: boolean
  grading: boolean
  onGrade: () => void
  validation?: ValidationState
  currentStep?: number
  mobile?: boolean
}

export function ThreeTeamTradeBoard({
  team1, team2, team3,
  team1Sends, team2Sends, team3Sends,
  team1ReceivesFromTeam2, team1ReceivesFromTeam3,
  team2ReceivesFromTeam1, team2ReceivesFromTeam3,
  team3ReceivesFromTeam1, team3ReceivesFromTeam2,
  onRemoveTeam1Player, onRemoveTeam1Pick, onRemoveTeam1Prospect,
  onRemoveTeam2Player, onRemoveTeam2Pick, onRemoveTeam2Prospect,
  onRemoveTeam3Player, onRemoveTeam3Pick, onRemoveTeam3Prospect,
  canGrade, grading, onGrade,
  validation,
  currentStep = 1,
  mobile = false,
}: ThreeTeamTradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const steps = ['Select assets', 'Review', 'Validate', 'Grade']

  // Helper to count total assets for a team
  const countAssets = (assets: TeamTradeAssets) =>
    assets.players.length + assets.prospects.length + assets.draftPicks.length

  // Render a team panel
  const renderTeamPanel = (
    team: TeamInfo,
    sends: TeamTradeAssets,
    receivesFrom1: TeamTradeAssets,
    receivesFrom2: TeamTradeAssets,
    team1Name: string,
    team2Name: string,
    onRemovePlayer: (id: string) => void,
    onRemovePick: (index: number) => void,
    onRemoveProspect: (id: string) => void,
    position: 'left' | 'center' | 'right'
  ) => {
    const borderRadius = mobile
      ? position === 'left' ? '12px 12px 0 0' : position === 'right' ? '0 0 12px 12px' : '0'
      : position === 'left' ? '12px 0 0 12px' : position === 'right' ? '0 12px 12px 0' : '0'

    return (
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius,
        backgroundColor: panelBg,
        border: `1px solid ${borderColor}`,
        borderLeft: position !== 'left' && !mobile ? 'none' : `1px solid ${borderColor}`,
        borderTop: position !== 'left' && mobile ? 'none' : `1px solid ${borderColor}`,
        overflow: 'hidden',
      }}>
        {/* Team header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: `${team.color}10`,
        }}>
          {team.logo && (
            <img src={team.logo} alt={team.name} style={{ width: 24, height: 24, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <span style={{ fontWeight: 700, fontSize: 13, color: team.color }}>
            {team.abbreviation || team.name}
          </span>
        </div>

        {/* Sends section */}
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginBottom: 6, textTransform: 'uppercase' }}>
            Sends
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 40 }}>
            <AnimatePresence>
              {sends.players.map(p => (
                <AssetRow
                  key={p.player_id}
                  type="PLAYER"
                  player={p}
                  teamColor={team.color}
                  onRemove={() => onRemovePlayer(p.player_id)}
                  compact
                />
              ))}
              {sends.prospects.map(p => (
                <AssetRow
                  key={p.prospect_id}
                  type="PROSPECT"
                  prospect={p}
                  teamColor={team.color}
                  onRemove={() => onRemoveProspect(p.prospect_id)}
                  compact
                />
              ))}
              {sends.draftPicks.map((pk, i) => (
                <AssetRow
                  key={`pk-${i}`}
                  type="DRAFT_PICK"
                  pick={pk}
                  teamColor={team.color}
                  onRemove={() => onRemovePick(i)}
                  compact
                />
              ))}
            </AnimatePresence>
            {countAssets(sends) === 0 && (
              <div style={{ fontSize: 11, color: subText, textAlign: 'center', padding: 8 }}>
                No assets selected
              </div>
            )}
          </div>
        </div>

        {/* Receives section */}
        <div style={{ padding: '10px 12px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginBottom: 6, textTransform: 'uppercase' }}>
            Receives
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 40 }}>
            {/* From team 1 */}
            {countAssets(receivesFrom1) > 0 && (
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: subText, marginBottom: 2 }}>From {team1Name}:</div>
                {receivesFrom1.players.map(p => (
                  <AssetRow key={p.player_id} type="PLAYER" player={p} teamColor={team.color} compact showOnly />
                ))}
                {receivesFrom1.prospects.map(p => (
                  <AssetRow key={p.prospect_id} type="PROSPECT" prospect={p} teamColor={team.color} compact showOnly />
                ))}
                {receivesFrom1.draftPicks.map((pk, i) => (
                  <AssetRow key={`pk1-${i}`} type="DRAFT_PICK" pick={pk} teamColor={team.color} compact showOnly />
                ))}
              </div>
            )}
            {/* From team 2 */}
            {countAssets(receivesFrom2) > 0 && (
              <div>
                <div style={{ fontSize: 10, color: subText, marginBottom: 2 }}>From {team2Name}:</div>
                {receivesFrom2.players.map(p => (
                  <AssetRow key={p.player_id} type="PLAYER" player={p} teamColor={team.color} compact showOnly />
                ))}
                {receivesFrom2.prospects.map(p => (
                  <AssetRow key={p.prospect_id} type="PROSPECT" prospect={p} teamColor={team.color} compact showOnly />
                ))}
                {receivesFrom2.draftPicks.map((pk, i) => (
                  <AssetRow key={`pk2-${i}`} type="DRAFT_PICK" pick={pk} teamColor={team.color} compact showOnly />
                ))}
              </div>
            )}
            {countAssets(receivesFrom1) === 0 && countAssets(receivesFrom2) === 0 && (
              <div style={{ fontSize: 11, color: subText, textAlign: 'center', padding: 8 }}>
                No assets incoming
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Step indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        paddingBottom: 12, borderBottom: `1px solid ${borderColor}`,
      }}>
        {steps.map((step, i) => {
          const stepNum = i + 1
          const isComplete = currentStep > stepNum
          const isActive = currentStep === stepNum
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 16,
                backgroundColor: isActive ? '#bc000015' : 'transparent',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  backgroundColor: isComplete ? '#22c55e' : isActive ? '#bc0000' : (isDark ? '#374151' : '#e5e7eb'),
                  color: isComplete || isActive ? '#fff' : subText,
                }}>
                  {isComplete ? '✓' : stepNum}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#bc0000' : subText,
                  display: mobile ? 'none' : 'inline',
                }}>
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: mobile ? 6 : 16, height: 2,
                  backgroundColor: isComplete ? '#22c55e' : (isDark ? '#374151' : '#e5e7eb'),
                  marginLeft: 2, marginRight: 2,
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* 3-team mode badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 12,
          backgroundColor: '#bc000020',
          color: '#bc0000',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          3-Team Trade
        </span>
      </div>

      {/* Three team panels */}
      <div style={{
        display: 'flex',
        flexDirection: mobile ? 'column' : 'row',
        gap: 0,
      }}>
        {renderTeamPanel(
          team1, team1Sends,
          team1ReceivesFromTeam2, team1ReceivesFromTeam3,
          team2.name, team3.name,
          onRemoveTeam1Player, onRemoveTeam1Pick, onRemoveTeam1Prospect,
          'left'
        )}
        {renderTeamPanel(
          team2, team2Sends,
          team2ReceivesFromTeam1, team2ReceivesFromTeam3,
          team1.name, team3.name,
          onRemoveTeam2Player, onRemoveTeam2Pick, onRemoveTeam2Prospect,
          'center'
        )}
        {renderTeamPanel(
          team3, team3Sends,
          team3ReceivesFromTeam1, team3ReceivesFromTeam2,
          team1.name, team2.name,
          onRemoveTeam3Player, onRemoveTeam3Pick, onRemoveTeam3Prospect,
          'right'
        )}
      </div>

      {/* Validation indicator */}
      {validation && validation.status !== 'idle' && (
        <ValidationIndicator validation={validation} />
      )}

      {/* Grade button */}
      {(() => {
        const isBlocked = validation?.status === 'invalid'
        const canClick = canGrade && !grading && !isBlocked
        return (
          <motion.button
            whileHover={canClick ? { scale: 1.02 } : {}}
            whileTap={canClick ? { scale: 0.98 } : {}}
            animate={canClick ? { scale: [1, 1.03, 1] } : {}}
            transition={canClick ? { repeat: Infinity, duration: 2 } : {}}
            onClick={onGrade}
            disabled={!canClick}
            style={{
              width: '100%',
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: canClick ? '#bc0000' : (isDark ? '#374151' : '#d1d5db'),
              color: canClick ? '#fff' : subText,
              fontWeight: 800,
              fontSize: '16px',
              cursor: canClick ? 'pointer' : 'not-allowed',
              letterSpacing: '0.5px',
            }}
          >
            {grading ? 'ANALYZING 3-TEAM TRADE...' : isBlocked ? 'FIX ISSUES TO GRADE' : 'GRADE 3-TEAM TRADE'}
          </motion.button>
        )
      })()}
    </div>
  )
}
