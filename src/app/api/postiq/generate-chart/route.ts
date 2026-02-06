import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DATALAB_API = 'https://datalab.sportsmockery.com'

// Team color palettes
const TEAM_COLORS = {
  bears: { primary: '#0B162A', secondary: '#C83803' },
  bulls: { primary: '#CE1141', secondary: '#000000' },
  cubs: { primary: '#0E3386', secondary: '#CC3433' },
  whitesox: { primary: '#27251F', secondary: '#C4CED4' },
  blackhawks: { primary: '#CF0A2C', secondary: '#000000' },
} as const

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: {
    source?: string
    context?: string
  }
}

export interface ChartSuggestion {
  success: boolean
  shouldCreateChart: boolean
  chartType: 'bar' | 'line' | 'pie' | 'player-comparison' | 'team-stats'
  chartTitle: string
  data: ChartDataPoint[]
  paragraphIndex: number
  reasoning: string
  confidence?: number
  teamTheme?: string
  teamColors?: {
    primary: string
    secondary: string
  }
  axes?: {
    x: { label: string; type: string }
    y: { label: string; type: string; format: string }
  }
  extractedFrom?: string
}

export interface RejectionResponse {
  success: false
  shouldCreateChart: false
  confidence?: number
  reason: string
  suggestion: string
  potentialImprovements?: string[]
}

export interface PostIQAnalyzeResponse {
  charts: ChartSuggestion[]
  shouldCreateChart: boolean
  success: boolean
  pollSuggestion?: {
    question: string
    options: string[]
    confidence: number
  }
  config: {
    teamTheme?: string
  }
  // Rejection fields
  reason?: string
  suggestion?: string
  potentialImprovements?: string[]
  confidence?: number
}

/**
 * POST /api/postiq/generate-chart
 *
 * Dedicated route for PostIQ chart generation.
 * Forwards to DataLab's /api/postiq/analyze endpoint.
 *
 * Flow:
 * 1. Writer types article at test.sportsmockery.com
 * 2. Front-end debounces and sends to this route
 * 3. This route forwards to datalab.sportsmockery.com/api/postiq/analyze
 * 4. DataLab analyzes content and returns:
 *    - Success: charts array with team colors, axes, confidence
 *    - Rejection: reason, suggestion, potentialImprovements
 * 5. Front-end D3 components render animated charts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title, category, team = 'bears', timestamp } = body

    // Validate required fields
    if (!content || content.length < 100) {
      return NextResponse.json({
        success: false,
        shouldCreateChart: false,
        charts: [],
        reason: 'empty_content',
        suggestion: 'Write at least 100 characters before generating chart.',
        config: { teamTheme: team },
      })
    }

    // Get user session for logging/tracking
    let userId: string | undefined
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                try {
                  cookieStore.set(name, value, options)
                } catch {
                  // Ignore cookie errors in API routes
                }
              })
            },
          },
        }
      )
      const { data: { session } } = await supabase.auth.getSession()
      userId = session?.user?.id
    } catch {
      // Continue without user ID
    }

    // Forward to DataLab PostIQ /api/postiq/analyze
    const datalabResponse = await fetch(`${DATALAB_API}/api/postiq/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.POSTIQ_INTERNAL_KEY && {
          'X-PostIQ-Internal-Key': process.env.POSTIQ_INTERNAL_KEY,
          'Authorization': `Bearer ${process.env.POSTIQ_INTERNAL_KEY}`,
        }),
      },
      body: JSON.stringify({
        content,
        articleTitle: title,
        category,
        team,
        timestamp: timestamp || new Date().toISOString(),
        user_id: userId,
        action: 'generate_chart',
      }),
    })

    if (!datalabResponse.ok) {
      const errorText = await datalabResponse.text()
      console.error('[PostIQ Chart] DataLab error:', datalabResponse.status, errorText)
      return NextResponse.json({
        success: false,
        shouldCreateChart: false,
        charts: [],
        reason: 'api_error',
        suggestion: 'Chart analysis service temporarily unavailable. Please try again.',
        config: { teamTheme: team },
      })
    }

    const data = await datalabResponse.json()
    return NextResponse.json(normalizeResponse(data, team))

  } catch (error) {
    console.error('[PostIQ Chart] Error:', error)
    return NextResponse.json({
      success: false,
      shouldCreateChart: false,
      charts: [],
      reason: 'network_error',
      suggestion: 'Failed to analyze content for charts. Please check your connection.',
      config: { teamTheme: 'bears' },
    })
  }
}

/**
 * Normalize the DataLab response to ensure consistent format for frontend
 */
function normalizeResponse(
  data: Record<string, unknown>,
  fallbackTeam: string = 'bears'
): PostIQAnalyzeResponse {
  // If DataLab returned a rejection
  if (data.success === false) {
    return {
      success: false,
      shouldCreateChart: false,
      charts: [],
      reason: String(data.reason || 'no_numeric_data'),
      suggestion: String(data.suggestion || 'No chartable data found in article.'),
      potentialImprovements: Array.isArray(data.potentialImprovements)
        ? data.potentialImprovements.map(String)
        : undefined,
      confidence: typeof data.confidence === 'number' ? data.confidence : undefined,
      config: {
        teamTheme: fallbackTeam,
      },
    }
  }

  // Handle charts array from DataLab
  const charts = Array.isArray(data.charts)
    ? data.charts.map((chart: Record<string, unknown>) => normalizeChart(chart, fallbackTeam))
    : []

  // If DataLab returned a single chart object instead of array
  if (!Array.isArray(data.charts) && data.chartType) {
    charts.push(normalizeChart(data, fallbackTeam))
  }

  // Extract config
  const config = (data.config as Record<string, unknown>) || {}
  const teamTheme = String(config.teamTheme || fallbackTeam)

  // Validate we have enough data
  const hasValidCharts = charts.length > 0 && charts.some(c => c.data.length >= 2)

  if (!hasValidCharts) {
    return {
      success: false,
      shouldCreateChart: false,
      charts: [],
      reason: 'insufficient_data',
      suggestion: 'Chart requires at least 2 data points. Add more statistics to article.',
      potentialImprovements: [
        'Add specific numeric values (yards, points, percentages)',
        'Include comparative data (vs. last season, vs. league average)',
        'Provide context for the statistics'
      ],
      config: { teamTheme },
    }
  }

  // Extract poll suggestion if present
  const pollSuggestion = data.pollSuggestion as PostIQAnalyzeResponse['pollSuggestion']

  return {
    success: true,
    charts,
    shouldCreateChart: true,
    pollSuggestion,
    config: {
      teamTheme,
    },
  }
}

/**
 * Normalize a single chart object with team colors
 */
function normalizeChart(chartData: Record<string, unknown>, team: string): ChartSuggestion {
  const teamColors = TEAM_COLORS[team as keyof typeof TEAM_COLORS] || TEAM_COLORS.bears

  // Parse data array and apply team colors if not specified
  const rawData = Array.isArray(chartData.data) ? chartData.data : []
  const data: ChartDataPoint[] = rawData.map((d: Record<string, unknown>, index: number) => ({
    label: String(d.label || ''),
    value: Number(d.value) || 0,
    color: d.color ? String(d.color) : (index % 2 === 0 ? teamColors.primary : teamColors.secondary),
    metadata: d.metadata as ChartDataPoint['metadata'],
  }))

  // Parse axes if provided
  const axes = chartData.axes as ChartSuggestion['axes']

  const hasValidData = data.length >= 2 && data.every(d => d.label && typeof d.value === 'number')

  return {
    success: hasValidData,
    shouldCreateChart: hasValidData,
    chartType: (chartData.chartType as ChartSuggestion['chartType']) || 'bar',
    chartTitle: String(chartData.chartTitle || chartData.title || ''),
    data,
    paragraphIndex: Number(chartData.paragraphIndex) || 1,
    reasoning: String(chartData.reasoning || ''),
    confidence: typeof chartData.confidence === 'number' ? chartData.confidence : undefined,
    teamTheme: team,
    teamColors,
    axes,
    extractedFrom: chartData.extractedFrom ? String(chartData.extractedFrom) : undefined,
  }
}
