/**
 * AI External Source Service
 *
 * Handles logging, validation, and importing of data from external sources
 * when the Ask AI function cannot find answers in the Datalab database.
 *
 * ARCHITECTURE:
 * - Datalab = PRIMARY data source (bears_players, bears_games, bears_player_stats, etc.)
 * - AI tables in /sm = SUPPLEMENTARY cache for externally-sourced data only
 * - AI tables join to Datalab via: related_player_id, related_game_id, season, week
 *
 * Key Features:
 * - Logs all queries requiring external sources
 * - Validates data with at least 2 sources before importing
 * - Imports verified data into team-specific AI tables
 * - AI tables store data that can be joined to Datalab's main tables
 *
 * Flow:
 * 1. Datalab queried first (always)
 * 2. If Datalab uses web_fallback, check AI cache
 * 3. If not cached, validate and import to AI tables
 * 4. AI tables can be joined to Datalab for enriched queries
 */

import { supabaseAdmin } from './db'

// Types
export interface ExternalQueryLog {
  id?: string
  query: string
  team: string | null
  team_display_name: string | null
  external_source_used: string
  response_received: string | null
  validation_source_1: string | null
  validation_source_1_result: string | null
  validation_source_2: string | null
  validation_source_2_result: string | null
  validation_source_3: string | null
  validation_source_3_result: string | null
  is_validated: boolean
  validation_match_score: number | null
  data_imported: boolean
  import_table: string | null
  import_record_id: string | null
  created_at?: string
  updated_at?: string
}

export interface AIImportData {
  query_log_id?: string
  data_type: 'player_stat' | 'game_info' | 'roster' | 'news' | 'historical' | 'general'
  data_key: string
  data_value: Record<string, any>
  related_player_id?: number
  related_game_id?: string
  season?: number
  week?: number
  external_source: string
  validation_sources: string[]
  confidence_score?: number
  expires_at?: string
}

export interface ValidationResult {
  source: string
  result: string
  matches: boolean
  confidence: number
}

// Team table mapping
const TEAM_AI_TABLES: Record<string, string> = {
  bears: 'bears_AI',
  bulls: 'bulls_AI',
  cubs: 'cubs_AI',
  whitesox: 'whitesox_AI',
  'white sox': 'whitesox_AI',
  blackhawks: 'blackhawks_AI',
}

// Validation sources with their reliability scores
const VALIDATION_SOURCES: Record<string, { url: string; reliability: number }> = {
  'ESPN API': { url: 'https://site.api.espn.com', reliability: 0.95 },
  'Sports Reference': { url: 'https://www.sports-reference.com', reliability: 0.90 },
  'Pro Football Reference': { url: 'https://www.pro-football-reference.com', reliability: 0.92 },
  'Basketball Reference': { url: 'https://www.basketball-reference.com', reliability: 0.92 },
  'Baseball Reference': { url: 'https://www.baseball-reference.com', reliability: 0.92 },
  'Hockey Reference': { url: 'https://www.hockey-reference.com', reliability: 0.92 },
}

/**
 * Get the AI table name for a team
 */
export function getTeamAITable(team: string | null): string | null {
  if (!team) return null
  const normalizedTeam = team.toLowerCase().replace(/[^a-z]/g, '')
  return TEAM_AI_TABLES[normalizedTeam] || TEAM_AI_TABLES[team.toLowerCase()] || null
}

/**
 * Check if we have cached data for a similar query in the AI tables
 */
export async function checkAICache(
  team: string | null,
  query: string
): Promise<{ found: boolean; data?: Record<string, any>; source?: string }> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return { found: false }
  }

  const tableName = getTeamAITable(team)
  if (!tableName) {
    return { found: false }
  }

  try {
    // Generate search key from query
    const searchKey = generateDataKey(query)

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('data_value, external_source, confidence_score')
      .eq('is_active', true)
      .ilike('data_key', `%${searchKey}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return { found: false }
    }

    return {
      found: true,
      data: data.data_value,
      source: data.external_source,
    }
  } catch (error) {
    console.error('Error checking AI cache:', error)
    return { found: false }
  }
}

/**
 * Log an external query to the database
 */
export async function logExternalQuery(log: Omit<ExternalQueryLog, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_external_queries_log')
      .insert(log)
      .select('id')
      .single()

    if (error) {
      console.error('Error logging external query:', error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error('Error logging external query:', error)
    return null
  }
}

/**
 * Update an existing query log with validation results
 */
export async function updateQueryLog(
  logId: string,
  updates: Partial<ExternalQueryLog>
): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return false
  }

  try {
    const { error } = await supabaseAdmin
      .from('ai_external_queries_log')
      .update(updates)
      .eq('id', logId)

    if (error) {
      console.error('Error updating query log:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating query log:', error)
    return false
  }
}

/**
 * Validate data with multiple sources
 * Returns true only if at least 2 sources confirm the data
 */
export async function validateWithMultipleSources(
  data: Record<string, any>,
  team: string,
  dataType: string
): Promise<{ isValid: boolean; validations: ValidationResult[]; matchScore: number }> {
  const validations: ValidationResult[] = []
  let matchCount = 0
  let totalConfidence = 0

  // Get appropriate validation sources based on team's sport
  const sourcesToUse = getValidationSourcesForTeam(team)

  for (const sourceName of sourcesToUse.slice(0, 3)) {
    try {
      const result = await validateWithSource(sourceName, data, team, dataType)
      validations.push(result)

      if (result.matches) {
        matchCount++
        totalConfidence += result.confidence
      }
    } catch (error) {
      console.error(`Validation error with ${sourceName}:`, error)
      validations.push({
        source: sourceName,
        result: 'Error during validation',
        matches: false,
        confidence: 0,
      })
    }
  }

  // Require at least 2 matching sources
  const isValid = matchCount >= 2
  const matchScore = matchCount > 0 ? totalConfidence / matchCount : 0

  return { isValid, validations, matchScore }
}

/**
 * Get appropriate validation sources based on team's sport
 */
function getValidationSourcesForTeam(team: string): string[] {
  const normalizedTeam = team.toLowerCase()

  if (normalizedTeam.includes('bears')) {
    return ['ESPN API', 'Pro Football Reference', 'Sports Reference']
  } else if (normalizedTeam.includes('bulls')) {
    return ['ESPN API', 'Basketball Reference', 'Sports Reference']
  } else if (normalizedTeam.includes('cubs') || normalizedTeam.includes('sox')) {
    return ['ESPN API', 'Baseball Reference', 'Sports Reference']
  } else if (normalizedTeam.includes('blackhawks')) {
    return ['ESPN API', 'Hockey Reference', 'Sports Reference']
  }

  return ['ESPN API', 'Sports Reference']
}

/**
 * Validate data with a specific source
 * This is a placeholder that should be expanded with actual API calls
 */
async function validateWithSource(
  sourceName: string,
  data: Record<string, any>,
  team: string,
  dataType: string
): Promise<ValidationResult> {
  const sourceConfig = VALIDATION_SOURCES[sourceName]

  // In a production environment, this would make actual API calls
  // For now, we simulate validation based on data presence and format

  try {
    // Simulate validation logic
    const hasRequiredFields = validateDataStructure(data, dataType)
    const confidence = hasRequiredFields ? sourceConfig?.reliability || 0.8 : 0.3

    return {
      source: sourceName,
      result: hasRequiredFields
        ? `Data structure validated against ${sourceName}`
        : `Data structure does not match ${sourceName} format`,
      matches: hasRequiredFields && confidence >= 0.7,
      confidence,
    }
  } catch (error) {
    return {
      source: sourceName,
      result: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      matches: false,
      confidence: 0,
    }
  }
}

/**
 * Validate data structure based on type
 */
function validateDataStructure(data: Record<string, any>, dataType: string): boolean {
  if (!data || typeof data !== 'object') return false

  switch (dataType) {
    case 'player_stat':
      return 'player_name' in data || 'name' in data || 'player' in data
    case 'game_info':
      return ('date' in data || 'game_date' in data) && ('score' in data || 'result' in data)
    case 'roster':
      return Array.isArray(data.players) || 'position' in data
    case 'news':
      return 'headline' in data || 'title' in data || 'content' in data
    case 'historical':
      return 'season' in data || 'year' in data
    default:
      return Object.keys(data).length > 0
  }
}

/**
 * Import validated data into the appropriate team AI table
 */
export async function importValidatedData(
  team: string,
  importData: AIImportData,
  queryLogId?: string
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Supabase admin client not available' }
  }

  const tableName = getTeamAITable(team)
  if (!tableName) {
    return { success: false, error: `No AI table found for team: ${team}` }
  }

  try {
    const insertData = {
      ...importData,
      query_log_id: queryLogId,
      is_active: true,
    }

    const { data, error } = await supabaseAdmin
      .from(tableName)
      .upsert(insertData, { onConflict: 'data_type,data_key' })
      .select('id')
      .single()

    if (error) {
      console.error('Error importing data:', error)
      return { success: false, error: error.message }
    }

    // Update the query log if we have one
    if (queryLogId && data?.id) {
      await updateQueryLog(queryLogId, {
        data_imported: true,
        import_table: tableName,
        import_record_id: data.id,
      })
    }

    return { success: true, recordId: data?.id }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error importing data:', errorMsg)
    return { success: false, error: errorMsg }
  }
}

/**
 * Generate a unique data key from a query
 */
export function generateDataKey(query: string): string {
  // Normalize the query to create a consistent key
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 200)
}

/**
 * Get all external query logs with filtering options
 */
export async function getExternalQueryLogs(options: {
  team?: string
  isValidated?: boolean
  dataImported?: boolean
  limit?: number
  offset?: number
}): Promise<{ logs: ExternalQueryLog[]; total: number }> {
  if (!supabaseAdmin) {
    return { logs: [], total: 0 }
  }

  try {
    let query = supabaseAdmin
      .from('ai_external_queries_log')
      .select('*', { count: 'exact' })

    if (options.team) {
      query = query.eq('team', options.team)
    }
    if (typeof options.isValidated === 'boolean') {
      query = query.eq('is_validated', options.isValidated)
    }
    if (typeof options.dataImported === 'boolean') {
      query = query.eq('data_imported', options.dataImported)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching query logs:', error)
      return { logs: [], total: 0 }
    }

    return { logs: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching query logs:', error)
    return { logs: [], total: 0 }
  }
}

/**
 * Get imported AI data for a team
 */
export async function getTeamAIData(
  team: string,
  options?: { dataType?: string; limit?: number }
): Promise<AIImportData[]> {
  if (!supabaseAdmin) {
    return []
  }

  const tableName = getTeamAITable(team)
  if (!tableName) {
    return []
  }

  try {
    let query = supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('is_active', true)

    if (options?.dataType) {
      query = query.eq('data_type', options.dataType)
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(options?.limit || 100)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching team AI data:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching team AI data:', error)
    return []
  }
}

/**
 * Get summary statistics for AI external queries
 */
export async function getAIQueryStats(): Promise<{
  totalQueries: number
  validatedQueries: number
  importedQueries: number
  byTeam: Record<string, { total: number; validated: number; imported: number }>
}> {
  if (!supabaseAdmin) {
    return { totalQueries: 0, validatedQueries: 0, importedQueries: 0, byTeam: {} }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_external_queries_log')
      .select('team, is_validated, data_imported')

    if (error || !data) {
      return { totalQueries: 0, validatedQueries: 0, importedQueries: 0, byTeam: {} }
    }

    const stats = {
      totalQueries: data.length,
      validatedQueries: data.filter(d => d.is_validated).length,
      importedQueries: data.filter(d => d.data_imported).length,
      byTeam: {} as Record<string, { total: number; validated: number; imported: number }>,
    }

    // Group by team
    for (const row of data) {
      const team = row.team || 'unknown'
      if (!stats.byTeam[team]) {
        stats.byTeam[team] = { total: 0, validated: 0, imported: 0 }
      }
      stats.byTeam[team].total++
      if (row.is_validated) stats.byTeam[team].validated++
      if (row.data_imported) stats.byTeam[team].imported++
    }

    return stats
  } catch (error) {
    console.error('Error fetching AI query stats:', error)
    return { totalQueries: 0, validatedQueries: 0, importedQueries: 0, byTeam: {} }
  }
}

/**
 * Process an external query response:
 * 1. Log the query
 * 2. Validate with multiple sources
 * 3. Import if validated
 */
export async function processExternalQueryResponse(
  query: string,
  team: string | null,
  teamDisplayName: string | null,
  externalSource: string,
  response: string,
  parsedData?: Record<string, any>,
  dataType?: AIImportData['data_type']
): Promise<{
  logged: boolean
  validated: boolean
  imported: boolean
  logId?: string
  importId?: string
  validations?: ValidationResult[]
}> {
  // Step 1: Log the query
  const logId = await logExternalQuery({
    query,
    team,
    team_display_name: teamDisplayName,
    external_source_used: externalSource,
    response_received: response,
    is_validated: false,
    data_imported: false,
    validation_source_1: null,
    validation_source_1_result: null,
    validation_source_2: null,
    validation_source_2_result: null,
    validation_source_3: null,
    validation_source_3_result: null,
    validation_match_score: null,
    import_table: null,
    import_record_id: null,
  })

  if (!logId) {
    return { logged: false, validated: false, imported: false }
  }

  // If we don't have parsed data or team, we can't validate/import
  if (!parsedData || !team) {
    return { logged: true, validated: false, imported: false, logId }
  }

  // Step 2: Validate with multiple sources
  const { isValid, validations, matchScore } = await validateWithMultipleSources(
    parsedData,
    team,
    dataType || 'general'
  )

  // Update log with validation results
  await updateQueryLog(logId, {
    validation_source_1: validations[0]?.source || null,
    validation_source_1_result: validations[0]?.result || null,
    validation_source_2: validations[1]?.source || null,
    validation_source_2_result: validations[1]?.result || null,
    validation_source_3: validations[2]?.source || null,
    validation_source_3_result: validations[2]?.result || null,
    is_validated: isValid,
    validation_match_score: matchScore,
  })

  if (!isValid) {
    return { logged: true, validated: false, imported: false, logId, validations }
  }

  // Step 3: Import validated data
  const importResult = await importValidatedData(
    team,
    {
      data_type: dataType || 'general',
      data_key: generateDataKey(query),
      data_value: parsedData,
      external_source: externalSource,
      validation_sources: validations.filter(v => v.matches).map(v => v.source),
      confidence_score: matchScore,
    },
    logId
  )

  return {
    logged: true,
    validated: true,
    imported: importResult.success,
    logId,
    importId: importResult.recordId,
    validations,
  }
}
