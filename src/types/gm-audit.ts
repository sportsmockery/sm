export interface AuditResult {
  audit_id: string
  audit_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  audit_score: number
  confidence: number

  validation_summary: {
    fields_validated: number
    fields_confirmed: number
    fields_conflicting: number
    fields_unverified: number
  }

  discrepancies: Discrepancy[]

  methodology_review?: {
    score: number
    position_values_correct: boolean
    age_curves_applied: boolean
    cap_calculation_accurate: boolean
    team_context_considered: boolean
    historical_precedent_valid: boolean
    issues: string[]
  }

  grade_justification?: {
    score: number
    grade_matches_reasoning: boolean
    breakdown_consistent: boolean
    no_contradictions: boolean
    realism_considered: boolean
    issues: string[]
  }

  overall_assessment: string

  recommendations: {
    for_user: string[]
    for_gm_model?: string[]
    for_supabase?: string[]
  }

  sources_consulted?: Array<{
    source: string
    url?: string
    data_retrieved: string
  }>

  response_time_ms?: number
  gm_grade?: number
  trade_summary?: string
  cached?: boolean
}

export interface Discrepancy {
  field: string
  gm_value: string | number
  actual_value: string | number
  sources_checked: string[]
  severity: 'minor' | 'moderate' | 'major'
  impact?: string
}
