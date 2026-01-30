/**
 * GM Trade Simulator State Context
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type {
  PlayerData,
  OpponentTeam,
  DraftPick,
  GradeResult,
  ChicagoTeam,
  Sport,
  ValidationResult,
  UserPreferences,
  MLBProspect,
} from './gm-types'
import { CHICAGO_TEAM_SPORT } from './gm-types'

// Sheet types for the new Trade Hub UI
export type ActiveSheet = 'none' | 'roster' | 'opponent' | 'picks'

interface GMState {
  chicagoTeam: ChicagoTeam | null
  sport: Sport | null
  roster: PlayerData[]
  rosterLoading: boolean
  selectedPlayers: PlayerData[]
  opponent: OpponentTeam | null
  opponentRoster: PlayerData[]
  opponentRosterLoading: boolean
  selectedOpponentPlayers: PlayerData[]
  draftPicksSent: DraftPick[]
  draftPicksReceived: DraftPick[]
  grading: boolean
  gradeResult: GradeResult | null
  sessionId: string | null
  // MLB Prospects State
  prospects: MLBProspect[]
  prospectsLoading: boolean
  selectedProspects: MLBProspect[]
  opponentProspects: MLBProspect[]
  opponentProspectsLoading: boolean
  selectedOpponentProspects: MLBProspect[]
  // V2 State
  validation: ValidationResult | null
  validating: boolean
  preferences: UserPreferences | null
  // Trade Hub UI State
  activeSheet: ActiveSheet
  dockExpanded: boolean
}

type GMAction =
  | { type: 'SET_TEAM'; team: ChicagoTeam }
  | { type: 'SET_ROSTER'; players: PlayerData[] }
  | { type: 'SET_ROSTER_LOADING'; loading: boolean }
  | { type: 'TOGGLE_PLAYER'; player: PlayerData }
  | { type: 'SET_OPPONENT'; opponent: OpponentTeam }
  | { type: 'SET_OPPONENT_ROSTER'; players: PlayerData[] }
  | { type: 'SET_OPPONENT_ROSTER_LOADING'; loading: boolean }
  | { type: 'TOGGLE_OPPONENT_PLAYER'; player: PlayerData }
  | { type: 'ADD_DRAFT_PICK_SENT'; pick: DraftPick }
  | { type: 'REMOVE_DRAFT_PICK_SENT'; index: number }
  | { type: 'ADD_DRAFT_PICK_RECEIVED'; pick: DraftPick }
  | { type: 'REMOVE_DRAFT_PICK_RECEIVED'; index: number }
  | { type: 'SET_GRADING'; grading: boolean }
  | { type: 'SET_GRADE_RESULT'; result: GradeResult | null }
  | { type: 'CLEAR_GRADE' }
  | { type: 'SET_SESSION_ID'; id: string }
  | { type: 'RESET' }
  // MLB Prospects Actions
  | { type: 'SET_PROSPECTS'; prospects: MLBProspect[] }
  | { type: 'SET_PROSPECTS_LOADING'; loading: boolean }
  | { type: 'TOGGLE_PROSPECT'; prospect: MLBProspect }
  | { type: 'SET_OPPONENT_PROSPECTS'; prospects: MLBProspect[] }
  | { type: 'SET_OPPONENT_PROSPECTS_LOADING'; loading: boolean }
  | { type: 'TOGGLE_OPPONENT_PROSPECT'; prospect: MLBProspect }
  | { type: 'REMOVE_PROSPECT'; prospectId: string }
  | { type: 'REMOVE_OPPONENT_PROSPECT'; prospectId: string }
  // V2 Actions
  | { type: 'SET_VALIDATION'; validation: ValidationResult | null }
  | { type: 'SET_VALIDATING'; validating: boolean }
  | { type: 'SET_PREFERENCES'; preferences: UserPreferences | null }
  // Trade Hub UI Actions
  | { type: 'SET_ACTIVE_SHEET'; sheet: ActiveSheet }
  | { type: 'SET_DOCK_EXPANDED'; expanded: boolean }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'REMOVE_OPPONENT_PLAYER'; playerId: string }

const initialState: GMState = {
  chicagoTeam: null,
  sport: null,
  roster: [],
  rosterLoading: false,
  selectedPlayers: [],
  opponent: null,
  opponentRoster: [],
  opponentRosterLoading: false,
  selectedOpponentPlayers: [],
  draftPicksSent: [],
  draftPicksReceived: [],
  grading: false,
  gradeResult: null,
  sessionId: null,
  // MLB Prospects State
  prospects: [],
  prospectsLoading: false,
  selectedProspects: [],
  opponentProspects: [],
  opponentProspectsLoading: false,
  selectedOpponentProspects: [],
  // V2 State
  validation: null,
  validating: false,
  preferences: null,
  // Trade Hub UI State
  activeSheet: 'none',
  dockExpanded: false,
}

function gmReducer(state: GMState, action: GMAction): GMState {
  switch (action.type) {
    case 'SET_TEAM':
      return {
        ...initialState,
        chicagoTeam: action.team,
        sport: CHICAGO_TEAM_SPORT[action.team],
      }
    case 'SET_ROSTER':
      return { ...state, roster: action.players, rosterLoading: false }
    case 'SET_ROSTER_LOADING':
      return { ...state, rosterLoading: action.loading }
    case 'TOGGLE_PLAYER': {
      const exists = state.selectedPlayers.find(p => p.player_id === action.player.player_id)
      return {
        ...state,
        selectedPlayers: exists
          ? state.selectedPlayers.filter(p => p.player_id !== action.player.player_id)
          : [...state.selectedPlayers, action.player],
      }
    }
    case 'SET_OPPONENT':
      return {
        ...state,
        opponent: action.opponent,
        selectedOpponentPlayers: [],
        opponentRoster: [],
        opponentProspects: [],
        selectedOpponentProspects: [],
      }
    case 'SET_OPPONENT_ROSTER':
      return { ...state, opponentRoster: action.players, opponentRosterLoading: false }
    case 'SET_OPPONENT_ROSTER_LOADING':
      return { ...state, opponentRosterLoading: action.loading }
    case 'TOGGLE_OPPONENT_PLAYER': {
      const exists = state.selectedOpponentPlayers.find(p => p.player_id === action.player.player_id)
      return {
        ...state,
        selectedOpponentPlayers: exists
          ? state.selectedOpponentPlayers.filter(p => p.player_id !== action.player.player_id)
          : [...state.selectedOpponentPlayers, action.player],
      }
    }
    case 'ADD_DRAFT_PICK_SENT':
      return { ...state, draftPicksSent: [...state.draftPicksSent, action.pick] }
    case 'REMOVE_DRAFT_PICK_SENT':
      return { ...state, draftPicksSent: state.draftPicksSent.filter((_, i) => i !== action.index) }
    case 'ADD_DRAFT_PICK_RECEIVED':
      return { ...state, draftPicksReceived: [...state.draftPicksReceived, action.pick] }
    case 'REMOVE_DRAFT_PICK_RECEIVED':
      return { ...state, draftPicksReceived: state.draftPicksReceived.filter((_, i) => i !== action.index) }
    case 'SET_GRADING':
      return { ...state, grading: action.grading }
    case 'SET_GRADE_RESULT':
      return { ...state, gradeResult: action.result, grading: false }
    case 'CLEAR_GRADE':
      return { ...state, gradeResult: null, grading: false }
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.id }
    case 'RESET':
      return initialState
    // MLB Prospects Actions
    case 'SET_PROSPECTS':
      return { ...state, prospects: action.prospects, prospectsLoading: false }
    case 'SET_PROSPECTS_LOADING':
      return { ...state, prospectsLoading: action.loading }
    case 'TOGGLE_PROSPECT': {
      const prospectId = action.prospect.id || action.prospect.prospect_id || action.prospect.name
      const exists = state.selectedProspects.find(
        p => (p.id || p.prospect_id || p.name) === prospectId
      )
      return {
        ...state,
        selectedProspects: exists
          ? state.selectedProspects.filter(p => (p.id || p.prospect_id || p.name) !== prospectId)
          : [...state.selectedProspects, action.prospect],
      }
    }
    case 'SET_OPPONENT_PROSPECTS':
      return { ...state, opponentProspects: action.prospects, opponentProspectsLoading: false }
    case 'SET_OPPONENT_PROSPECTS_LOADING':
      return { ...state, opponentProspectsLoading: action.loading }
    case 'TOGGLE_OPPONENT_PROSPECT': {
      const prospectId = action.prospect.id || action.prospect.prospect_id || action.prospect.name
      const exists = state.selectedOpponentProspects.find(
        p => (p.id || p.prospect_id || p.name) === prospectId
      )
      return {
        ...state,
        selectedOpponentProspects: exists
          ? state.selectedOpponentProspects.filter(p => (p.id || p.prospect_id || p.name) !== prospectId)
          : [...state.selectedOpponentProspects, action.prospect],
      }
    }
    case 'REMOVE_PROSPECT':
      return {
        ...state,
        selectedProspects: state.selectedProspects.filter(
          p => (p.id || p.prospect_id || p.name) !== action.prospectId
        ),
      }
    case 'REMOVE_OPPONENT_PROSPECT':
      return {
        ...state,
        selectedOpponentProspects: state.selectedOpponentProspects.filter(
          p => (p.id || p.prospect_id || p.name) !== action.prospectId
        ),
      }
    // V2 Actions
    case 'SET_VALIDATION':
      return { ...state, validation: action.validation, validating: false }
    case 'SET_VALIDATING':
      return { ...state, validating: action.validating }
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.preferences }
    // Trade Hub UI Actions
    case 'SET_ACTIVE_SHEET':
      return { ...state, activeSheet: action.sheet }
    case 'SET_DOCK_EXPANDED':
      return { ...state, dockExpanded: action.expanded }
    case 'REMOVE_PLAYER':
      return {
        ...state,
        selectedPlayers: state.selectedPlayers.filter(p => p.player_id !== action.playerId),
      }
    case 'REMOVE_OPPONENT_PLAYER':
      return {
        ...state,
        selectedOpponentPlayers: state.selectedOpponentPlayers.filter(p => p.player_id !== action.playerId),
      }
    default:
      return state
  }
}

interface GMContextValue {
  state: GMState
  dispatch: React.Dispatch<GMAction>
}

const GMContext = createContext<GMContextValue | null>(null)

export function GMProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gmReducer, initialState)
  return <GMContext.Provider value={{ state, dispatch }}>{children}</GMContext.Provider>
}

export function useGM() {
  const ctx = useContext(GMContext)
  if (!ctx) throw new Error('useGM must be used within GMProvider')
  return ctx
}
