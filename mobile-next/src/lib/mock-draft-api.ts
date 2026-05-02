/**
 * Mock Draft API Client
 */

import { API_BASE_URL } from './config'
import {
  MockDraft,
  Prospect,
  DraftGrade,
  DraftHistoryItem,
  TeamEligibility,
  ChicagoTeam,
  Sport,
} from './mock-draft-types'

class AuthRequiredError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthRequiredError'
  }
}

async function mockDraftFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    throw new AuthRequiredError()
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`)
  }

  return data
}

export const mockDraftApi = {
  // Get team eligibility status
  async getEligibility(token?: string | null): Promise<{ teams: TeamEligibility[] }> {
    return mockDraftFetch('/api/gm/draft/eligibility', {}, token)
  },

  // Start a new draft
  async startDraft(
    chicagoTeam: ChicagoTeam,
    token?: string | null
  ): Promise<{ draft: MockDraft }> {
    return mockDraftFetch(
      '/api/gm/draft/start',
      {
        method: 'POST',
        body: JSON.stringify({ chicago_team: chicagoTeam }),
      },
      token
    )
  },

  // Get prospects for a sport/year
  async getProspects(
    sport: Sport,
    year?: number,
    token?: string | null
  ): Promise<{ prospects: Prospect[] }> {
    const params = new URLSearchParams({ sport })
    if (year) params.set('year', year.toString())
    return mockDraftFetch(`/api/gm/draft/prospects?${params}`, {}, token)
  },

  // Submit a pick
  async submitPick(
    mockId: string,
    prospectId: string,
    pickNumber: number,
    token?: string | null
  ): Promise<{ draft: MockDraft }> {
    return mockDraftFetch(
      '/api/gm/draft/pick',
      {
        method: 'POST',
        body: JSON.stringify({
          mock_id: mockId,
          prospect_id: prospectId,
          pick_number: pickNumber,
        }),
      },
      token
    )
  },

  // Auto-advance to next user pick
  async autoAdvance(
    mockId: string,
    token?: string | null
  ): Promise<{ draft: MockDraft; picksAdvanced: number }> {
    return mockDraftFetch(
      '/api/gm/draft/auto',
      {
        method: 'POST',
        body: JSON.stringify({ mock_id: mockId }),
      },
      token
    )
  },

  // Grade the draft
  async gradeDraft(
    mockId: string,
    token?: string | null
  ): Promise<{ grade: DraftGrade }> {
    return mockDraftFetch(
      '/api/gm/draft/grade',
      {
        method: 'POST',
        body: JSON.stringify({ mock_id: mockId }),
      },
      token
    )
  },

  // Get draft history
  async getHistory(token?: string | null): Promise<{ drafts: DraftHistoryItem[] }> {
    return mockDraftFetch('/api/gm/draft/history', {}, token)
  },
}

export { AuthRequiredError }
