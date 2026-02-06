'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ChartBuilderModal, ChartConfig, AISuggestion, ChartType } from '@/components/admin/ChartBuilder'
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart'
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart'
import { AnimatedPieChart } from '@/components/charts/AnimatedPieChart'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: {
    source?: string
    context?: string
  }
}

interface ChartSuggestion {
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

interface RejectionResponse {
  success: false
  confidence?: number
  reason: 'no_numeric_data' | 'insufficient_data' | 'unclear_context' | 'low_confidence' | 'network_error' | 'empty_content'
  suggestion: string
  potentialImprovements?: string[]
}

interface PostIQAnalyzeResponse {
  charts: ChartSuggestion[]
  shouldCreateChart: boolean
  pollSuggestion?: {
    question: string
    options: string[]
    confidence: number
  }
  config: {
    teamTheme?: string
  }
}

type ChartAnalysis = ChartSuggestion | RejectionResponse

interface PostIQChartGeneratorProps {
  content: string
  title: string
  category?: string
  team?: string
  debounceMs?: number
  minContentLength?: number
  onAnalysisComplete?: (analysis: ChartAnalysis | null) => void
  onChartInsert?: (chartId: string, shortcode: string, updatedContent: string) => void
  showIndicator?: boolean
  indicatorPosition?: 'bottom-right' | 'bottom-center' | 'top-right'
}

// Minimum confidence threshold for displaying charts
const CONFIDENCE_THRESHOLD = 0.7

export default function PostIQChartGenerator({
  content,
  title,
  category,
  team = 'bears',
  debounceMs = 1500,
  minContentLength = 200,
  onAnalysisComplete,
  onChartInsert,
  showIndicator = true,
  indicatorPosition = 'bottom-right',
}: PostIQChartGeneratorProps) {
  const [analysis, setAnalysis] = useState<ChartSuggestion | null>(null)
  const [rejection, setRejection] = useState<RejectionResponse | null>(null)
  const [allCharts, setAllCharts] = useState<ChartSuggestion[]>([])
  const [selectedChartIndex, setSelectedChartIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showRejectionDetails, setShowRejectionDetails] = useState(false)
  const [teamTheme, setTeamTheme] = useState<string>(team)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastContentRef = useRef<string>('')
  const lastAnalysisRef = useRef<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounced content analysis
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const contentHash = content.slice(0, 500) + content.length
    if (contentHash === lastContentRef.current) {
      return
    }
    lastContentRef.current = contentHash

    // Clear state if content is too short
    if (content.length < minContentLength) {
      setAnalysis(null)
      setRejection({
        success: false,
        reason: 'empty_content',
        suggestion: `Write at least ${minContentLength} characters before generating chart.`,
      })
      return
    }

    debounceRef.current = setTimeout(async () => {
      const analysisKey = `${title}:${content.slice(0, 1000)}`
      if (analysisKey === lastAnalysisRef.current) {
        return
      }

      setIsAnalyzing(true)
      setRejection(null)

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch('/api/postiq/generate-chart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            title,
            category,
            team,
            timestamp: new Date().toISOString(),
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        lastAnalysisRef.current = analysisKey

        // Handle rejection response
        if (data.success === false || !data.shouldCreateChart) {
          setAnalysis(null)
          setAllCharts([])
          setRejection({
            success: false,
            confidence: data.confidence,
            reason: data.reason || 'no_numeric_data',
            suggestion: data.suggestion || 'No chartable data found in article.',
            potentialImprovements: data.potentialImprovements,
          })
          onAnalysisComplete?.(null)
          return
        }

        // Store team theme from config
        if (data.config?.teamTheme) {
          setTeamTheme(data.config.teamTheme)
        }

        // Store all charts for selection
        if (data.charts && data.charts.length > 0) {
          setAllCharts(data.charts)
          setSelectedChartIndex(0)
        }

        // Use first chart from the charts array
        const firstChart = data.charts?.[0]

        // Apply confidence threshold
        const confidence = firstChart?.confidence ?? data.confidence ?? 0
        if (confidence < CONFIDENCE_THRESHOLD) {
          setAnalysis(null)
          setRejection({
            success: false,
            confidence,
            reason: 'low_confidence',
            suggestion: `PostIQ confidence (${Math.round(confidence * 100)}%) is below threshold. Add more specific statistics to improve.`,
            potentialImprovements: [
              'Add specific numeric values (yards, points, percentages)',
              'Include comparative data (vs. last season, vs. league average)',
              'Provide context for the statistics'
            ],
          })
          onAnalysisComplete?.(null)
          return
        }

        if (firstChart && firstChart.data?.length >= 2) {
          const chartWithTheme = {
            ...firstChart,
            success: true as const,
            teamTheme: firstChart.teamTheme || data.config?.teamTheme || team,
          }
          setAnalysis(chartWithTheme)
          setRejection(null)
          onAnalysisComplete?.(chartWithTheme)
        } else {
          setAnalysis(null)
          setRejection({
            success: false,
            reason: 'insufficient_data',
            suggestion: 'Chart requires at least 2 data points. Add more statistics to article.',
          })
          onAnalysisComplete?.(null)
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return // Request was cancelled, ignore
        }
        console.error('[PostIQ Chart] Analysis error:', error)
        setAnalysis(null)
        setRejection({
          success: false,
          reason: 'network_error',
          suggestion: 'Unable to generate chart. Please check your connection and try again.',
        })
      } finally {
        setIsAnalyzing(false)
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [content, title, category, team, debounceMs, minContentLength, onAnalysisComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Handle chart insertion
  const handleChartInsert = useCallback(async (config: ChartConfig) => {
    try {
      const chartResponse = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          title: config.title,
          size: config.size,
          colors: config.colors,
          data: config.data,
          dataSource: config.dataSource,
          dataLabQuery: config.dataLabQuery,
        }),
      })

      if (!chartResponse.ok) {
        throw new Error('Failed to create chart')
      }

      const chartData = await chartResponse.json()
      const shortcode = `[chart:${chartData.id}]`

      const paragraphIndex = analysis?.paragraphIndex || 1
      const updatedContent = insertShortcodeAfterParagraph(content, shortcode, paragraphIndex)

      onChartInsert?.(chartData.id, shortcode, updatedContent)
      setShowModal(false)
      setAnalysis(null)
      setAllCharts([])
    } catch (error) {
      console.error('[PostIQ Chart] Insert error:', error)
      alert('Failed to create chart. Please try again.')
    }
  }, [content, analysis, onChartInsert])

  const insertShortcodeAfterParagraph = (html: string, shortcode: string, paragraphIndex: number): string => {
    const closingTagRegex = /<\/p>/gi
    let match
    let count = 0
    let insertPosition = -1

    while ((match = closingTagRegex.exec(html)) !== null) {
      count++
      if (count === paragraphIndex) {
        insertPosition = match.index + match[0].length
        break
      }
    }

    if (insertPosition > 0) {
      const chartBlock = `\n<div class="chart-embed my-6">${shortcode}</div>\n`
      return html.slice(0, insertPosition) + chartBlock + html.slice(insertPosition)
    }

    return html + `\n<div class="chart-embed my-6">${shortcode}</div>`
  }

  const getAISuggestion = (): AISuggestion | null => {
    if (!analysis) return null
    return {
      reasoning: analysis.reasoning,
      chartTitle: analysis.chartTitle,
      chartType: analysis.chartType as ChartType,
      data: analysis.data,
      paragraphIndex: analysis.paragraphIndex,
    }
  }

  const getInitialConfig = (): Partial<ChartConfig> | undefined => {
    if (!analysis) return undefined
    const chartTeam = (analysis.teamTheme || teamTheme || team) as 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'
    return {
      type: analysis.chartType as ChartConfig['type'],
      title: analysis.chartTitle,
      size: 'medium',
      colors: { scheme: 'team', team: chartTeam },
      data: analysis.data,
      dataSource: 'manual',
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
  }

  const handleDismiss = () => {
    setAnalysis(null)
    setRejection(null)
    setAllCharts([])
    setShowPreview(false)
  }

  return (
    <>
      {/* Success Indicator - Chart data detected */}
      {showIndicator && analysis && !showModal && (
        <div className={`fixed ${positionClasses[indicatorPosition]} z-40 animate-in slide-in-from-bottom-4 duration-300`}>
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 pl-4 pr-2 py-2 shadow-lg shadow-purple-500/25">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-white">
                {allCharts.length > 1 ? `${allCharts.length} charts detected` : 'Chart data detected'}
              </span>
              {analysis.confidence && (
                <span className="text-xs text-white/70">
                  {Math.round(analysis.confidence * 100)}%
                </span>
              )}
            </div>

            {/* Chart selector for multiple charts */}
            {allCharts.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const newIndex = (selectedChartIndex - 1 + allCharts.length) % allCharts.length
                    setSelectedChartIndex(newIndex)
                    setAnalysis(allCharts[newIndex])
                  }}
                  className="rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-white/70">{selectedChartIndex + 1}/{allCharts.length}</span>
                <button
                  onClick={() => {
                    const newIndex = (selectedChartIndex + 1) % allCharts.length
                    setSelectedChartIndex(newIndex)
                    setAnalysis(allCharts[newIndex])
                  }}
                  className="rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Preview chart"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
            >
              Add Chart
            </button>

            <button
              onClick={handleDismiss}
              className="rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Live Chart Preview */}
          {showPreview && analysis && (
            <div className="absolute bottom-full mb-2 right-0 w-96 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{analysis.chartTitle}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {analysis.chartType} chart • {analysis.data.length} data points
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                    Ready
                  </span>
                </div>
              </div>
              <div className="p-4">
                {analysis.chartType === 'line' ? (
                  <AnimatedLineChart
                    data={analysis.data}
                    axes={analysis.axes}
                    teamColors={analysis.teamColors}
                    team={(analysis.teamTheme || team) as 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'}
                    animated={true}
                    height={200}
                  />
                ) : analysis.chartType === 'pie' ? (
                  <AnimatedPieChart
                    data={analysis.data}
                    teamColors={analysis.teamColors}
                    team={(analysis.teamTheme || team) as 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'}
                    animated={true}
                    height={200}
                    showLabels={true}
                    showLegend={false}
                  />
                ) : (
                  <AnimatedBarChart
                    data={analysis.data}
                    axes={analysis.axes}
                    teamColors={analysis.teamColors}
                    team={(analysis.teamTheme || team) as 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'}
                    animated={true}
                    height={200}
                  />
                )}
              </div>
              {analysis.extractedFrom && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                  <p className="text-xs text-gray-500 dark:text-zinc-500">
                    Extracted from: "{analysis.extractedFrom}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rejection/Warning Indicator */}
      {showIndicator && rejection && !isAnalyzing && !analysis && (
        <div className={`fixed ${positionClasses[indicatorPosition]} z-40 animate-in slide-in-from-bottom-4 duration-300`}>
          <div className="flex flex-col rounded-xl bg-amber-500/10 dark:bg-amber-900/20 border border-amber-400/30 shadow-lg overflow-hidden max-w-sm">
            <div className="flex items-start gap-3 px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                  {rejection.confidence !== undefined
                    ? `Low Confidence (${Math.round(rejection.confidence * 100)}%)`
                    : 'Cannot Generate Chart'}
                </p>
                <p className="text-sm text-amber-600/80 dark:text-amber-300/80 mt-0.5">{rejection.suggestion}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="rounded-full p-1 text-amber-500/70 hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {rejection.potentialImprovements && rejection.potentialImprovements.length > 0 && (
              <>
                <button
                  onClick={() => setShowRejectionDetails(!showRejectionDetails)}
                  className="flex items-center justify-between px-4 py-2 bg-amber-500/5 hover:bg-amber-500/10 transition-colors border-t border-amber-400/20"
                >
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    How to improve
                  </span>
                  <svg className={`h-4 w-4 text-amber-500 transition-transform ${showRejectionDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showRejectionDetails && (
                  <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-400/20">
                    <ul className="space-y-1.5">
                      {rejection.potentialImprovements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-amber-600/80 dark:text-amber-300/70">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Analyzing Indicator */}
      {isAnalyzing && showIndicator && (
        <div className={`fixed ${positionClasses[indicatorPosition]} z-40`}>
          <div className="flex items-center gap-3 rounded-full bg-gray-800/90 dark:bg-zinc-800/90 backdrop-blur-sm px-4 py-2.5 shadow-lg">
            <div className="h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-300 dark:text-zinc-400">PostIQ analyzing content...</span>
          </div>
        </div>
      )}

      {/* Chart Builder Modal */}
      <ChartBuilderModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onInsert={handleChartInsert}
        initialConfig={getInitialConfig()}
        aiSuggestion={getAISuggestion()}
        isLoading={false}
        team={team}
      />
    </>
  )
}

export type { ChartAnalysis, PostIQChartGeneratorProps, ChartSuggestion, RejectionResponse }
