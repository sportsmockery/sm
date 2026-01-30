import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import {
  MockDraft,
  Prospect,
  DraftGrade,
  DraftHistoryItem,
  TeamEligibility,
  ChicagoTeam,
  Sport,
} from './mock-draft-types'

// State
interface MockDraftState {
  // Team selection
  selectedTeam: ChicagoTeam | null
  eligibility: Record<string, TeamEligibility>
  eligibilityLoading: boolean

  // Active draft
  activeDraft: MockDraft | null
  prospects: Prospect[]
  prospectsLoading: boolean

  // Grading
  gradeResult: DraftGrade | null
  grading: boolean

  // History
  history: DraftHistoryItem[]
  historyLoading: boolean

  // UI state
  autoAdvancing: boolean
  submittingPick: boolean
  error: string | null
}

const initialState: MockDraftState = {
  selectedTeam: null,
  eligibility: {},
  eligibilityLoading: true,
  activeDraft: null,
  prospects: [],
  prospectsLoading: false,
  gradeResult: null,
  grading: false,
  history: [],
  historyLoading: false,
  autoAdvancing: false,
  submittingPick: false,
  error: null,
}

// Actions
type Action =
  | { type: 'SET_TEAM'; team: ChicagoTeam }
  | { type: 'SET_ELIGIBILITY'; eligibility: Record<string, TeamEligibility> }
  | { type: 'SET_ELIGIBILITY_LOADING'; loading: boolean }
  | { type: 'SET_ACTIVE_DRAFT'; draft: MockDraft | null }
  | { type: 'SET_PROSPECTS'; prospects: Prospect[] }
  | { type: 'SET_PROSPECTS_LOADING'; loading: boolean }
  | { type: 'SET_GRADE_RESULT'; grade: DraftGrade | null }
  | { type: 'SET_GRADING'; grading: boolean }
  | { type: 'SET_HISTORY'; history: DraftHistoryItem[] }
  | { type: 'SET_HISTORY_LOADING'; loading: boolean }
  | { type: 'SET_AUTO_ADVANCING'; advancing: boolean }
  | { type: 'SET_SUBMITTING_PICK'; submitting: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' }

// Reducer
function mockDraftReducer(state: MockDraftState, action: Action): MockDraftState {
  switch (action.type) {
    case 'SET_TEAM':
      return { ...state, selectedTeam: action.team, error: null }
    case 'SET_ELIGIBILITY':
      return { ...state, eligibility: action.eligibility }
    case 'SET_ELIGIBILITY_LOADING':
      return { ...state, eligibilityLoading: action.loading }
    case 'SET_ACTIVE_DRAFT':
      return { ...state, activeDraft: action.draft }
    case 'SET_PROSPECTS':
      return { ...state, prospects: action.prospects }
    case 'SET_PROSPECTS_LOADING':
      return { ...state, prospectsLoading: action.loading }
    case 'SET_GRADE_RESULT':
      return { ...state, gradeResult: action.grade }
    case 'SET_GRADING':
      return { ...state, grading: action.grading }
    case 'SET_HISTORY':
      return { ...state, history: action.history }
    case 'SET_HISTORY_LOADING':
      return { ...state, historyLoading: action.loading }
    case 'SET_AUTO_ADVANCING':
      return { ...state, autoAdvancing: action.advancing }
    case 'SET_SUBMITTING_PICK':
      return { ...state, submittingPick: action.submitting }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'RESET':
      return {
        ...initialState,
        eligibility: state.eligibility,
        eligibilityLoading: false,
        history: state.history,
      }
    default:
      return state
  }
}

// Context
interface MockDraftContextValue {
  state: MockDraftState
  dispatch: React.Dispatch<Action>
}

const MockDraftContext = createContext<MockDraftContextValue | null>(null)

// Provider
export function MockDraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mockDraftReducer, initialState)

  return (
    <MockDraftContext.Provider value={{ state, dispatch }}>
      {children}
    </MockDraftContext.Provider>
  )
}

// Hook
export function useMockDraft() {
  const context = useContext(MockDraftContext)
  if (!context) {
    throw new Error('useMockDraft must be used within MockDraftProvider')
  }
  return context
}

// Computed helpers
export function getCurrentPick(draft: MockDraft | null) {
  if (!draft) return null
  return draft.picks.find(p => p.is_current)
}

export function isUserPick(draft: MockDraft | null) {
  const currentPick = getCurrentPick(draft)
  return currentPick?.is_user_pick ?? false
}

export function getUserPicks(draft: MockDraft | null) {
  if (!draft) return []
  return draft.picks.filter(p => p.is_user_pick && p.selected_prospect)
}

export function getTeamColor(team: ChicagoTeam | null): string {
  if (!team) return '#bc0000'
  const colors: Record<ChicagoTeam, string> = {
    bears: '#0B162A',
    bulls: '#CE1141',
    blackhawks: '#CF0A2C',
    cubs: '#0E3386',
    whitesox: '#27251F',
  }
  return colors[team]
}
