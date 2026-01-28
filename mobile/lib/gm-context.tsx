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
} from './gm-types'
import { CHICAGO_TEAM_SPORT } from './gm-types'

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
  | { type: 'SET_SESSION_ID'; id: string }
  | { type: 'RESET' }

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
      return { ...state, opponent: action.opponent, selectedOpponentPlayers: [], opponentRoster: [] }
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
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.id }
    case 'RESET':
      return initialState
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
