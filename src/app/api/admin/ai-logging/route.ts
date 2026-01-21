import { NextRequest, NextResponse } from 'next/server'
import {
  getExternalQueryLogs,
  getTeamAIData,
  getAIQueryStats,
  updateQueryLog,
  importValidatedData,
  generateDataKey,
  validateWithMultipleSources,
} from '@/lib/ai-external-service'

/**
 * GET /api/admin/ai-logging
 * Fetch AI external query logs and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'logs'
    const team = searchParams.get('team') || undefined
    const isValidated = searchParams.get('validated')
    const dataImported = searchParams.get('imported')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (action) {
      case 'stats': {
        const stats = await getAIQueryStats()
        return NextResponse.json(stats)
      }

      case 'team-data': {
        if (!team) {
          return NextResponse.json({ error: 'Team parameter required' }, { status: 400 })
        }
        const dataType = searchParams.get('dataType') || undefined
        const data = await getTeamAIData(team, { dataType, limit })
        return NextResponse.json({ data })
      }

      case 'logs':
      default: {
        const { logs, total } = await getExternalQueryLogs({
          team,
          isValidated: isValidated ? isValidated === 'true' : undefined,
          dataImported: dataImported ? dataImported === 'true' : undefined,
          limit,
          offset,
        })
        return NextResponse.json({ logs, total, limit, offset })
      }
    }
  } catch (error) {
    console.error('AI Logging API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI logging data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/ai-logging
 * Perform actions on AI logs (validate, import, update)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, logId, team, data, dataType } = body

    switch (action) {
      case 'validate': {
        if (!data || !team) {
          return NextResponse.json(
            { error: 'Data and team are required for validation' },
            { status: 400 }
          )
        }

        const { isValid, validations, matchScore } = await validateWithMultipleSources(
          data,
          team,
          dataType || 'general'
        )

        // Update log if provided
        if (logId) {
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
        }

        return NextResponse.json({ isValid, validations, matchScore })
      }

      case 'import': {
        if (!team || !data || !body.query) {
          return NextResponse.json(
            { error: 'Team, data, and query are required for import' },
            { status: 400 }
          )
        }

        const result = await importValidatedData(
          team,
          {
            data_type: dataType || 'general',
            data_key: generateDataKey(body.query),
            data_value: data,
            external_source: body.externalSource || 'manual_import',
            validation_sources: body.validationSources || [],
            confidence_score: body.confidenceScore || 1.0,
            season: body.season,
            week: body.week,
            related_player_id: body.relatedPlayerId,
            related_game_id: body.relatedGameId,
          },
          logId
        )

        return NextResponse.json(result)
      }

      case 'update-log': {
        if (!logId) {
          return NextResponse.json({ error: 'Log ID required' }, { status: 400 })
        }

        const success = await updateQueryLog(logId, body.updates || {})
        return NextResponse.json({ success })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Logging API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI logging action' },
      { status: 500 }
    )
  }
}
