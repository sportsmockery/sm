import { ChartConfig } from '@/components/admin/ChartBuilder/ChartBuilderModal'
import { ChartDataEntry } from '@/components/admin/ChartBuilder/DataEntryForm'

/**
 * Chart utility functions for SportsMockery
 */

// Chart shortcode pattern: [chart:123] or [chart id="123"]
const CHART_SHORTCODE_REGEX = /\[chart(?:\s+id=)?[:\s]?"?(\d+)"?\]/g

/**
 * Extract chart IDs from post content
 */
export function extractChartIds(content: string): string[] {
  const matches = content.matchAll(CHART_SHORTCODE_REGEX)
  return Array.from(matches, (m) => m[1])
}

/**
 * Check if content contains charts
 */
export function hasCharts(content: string): boolean {
  return CHART_SHORTCODE_REGEX.test(content)
}

/**
 * Generate chart shortcode
 */
export function generateChartShortcode(chartId: string | number): string {
  return `[chart:${chartId}]`
}

/**
 * Replace chart shortcodes with placeholders for rendering
 */
export function replaceChartShortcodes(
  content: string,
  replacer: (chartId: string) => string
): string {
  return content.replace(CHART_SHORTCODE_REGEX, (_, chartId) => replacer(chartId))
}

/**
 * Format number with appropriate suffix (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toLocaleString()
}

/**
 * Calculate percentage for pie charts
 */
export function calculatePercentages(data: ChartDataEntry[]): (ChartDataEntry & { percentage: number })[] {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  return data.map((d) => ({
    ...d,
    percentage: total > 0 ? (d.value / total) * 100 : 0,
  }))
}

/**
 * Generate color palette based on team colors
 */
export function generateColorPalette(
  primaryColor: string,
  secondaryColor: string,
  count: number
): string[] {
  if (count <= 2) return [primaryColor, secondaryColor]

  const colors: string[] = []
  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1)
    colors.push(interpolateColor(primaryColor, secondaryColor, ratio))
  }
  return colors
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex1 = color1.replace('#', '')
  const hex2 = color2.replace('#', '')

  const r1 = parseInt(hex1.substring(0, 2), 16)
  const g1 = parseInt(hex1.substring(2, 4), 16)
  const b1 = parseInt(hex1.substring(4, 6), 16)

  const r2 = parseInt(hex2.substring(0, 2), 16)
  const g2 = parseInt(hex2.substring(2, 4), 16)
  const b2 = parseInt(hex2.substring(4, 6), 16)

  const r = Math.round(r1 + (r2 - r1) * ratio)
  const g = Math.round(g1 + (g2 - g1) * ratio)
  const b = Math.round(b1 + (b2 - b1) * ratio)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Validate chart data
 */
export function validateChartData(data: ChartDataEntry[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data || data.length < 2) {
    errors.push('Chart must have at least 2 data points')
  }

  const hasEmptyLabels = data.some((d) => !d.label?.trim())
  if (hasEmptyLabels) {
    errors.push('All data points must have labels')
  }

  const hasInvalidValues = data.some((d) => typeof d.value !== 'number' || isNaN(d.value))
  if (hasInvalidValues) {
    errors.push('All values must be valid numbers')
  }

  const labels = data.map((d) => d.label?.toLowerCase().trim())
  const hasDuplicates = labels.length !== new Set(labels).size
  if (hasDuplicates) {
    errors.push('Labels must be unique')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate chart config
 */
export function validateChartConfig(config: Partial<ChartConfig>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!config.title?.trim()) {
    errors.push('Chart title is required')
  }

  if (!config.type) {
    errors.push('Chart type is required')
  }

  if (config.data) {
    const dataValidation = validateChartData(config.data)
    errors.push(...dataValidation.errors)
  } else {
    errors.push('Chart data is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Convert CSV string to chart data
 */
export function parseCSV(csvString: string): ChartDataEntry[] {
  const lines = csvString.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const labelIndex = headers.findIndex((h) => h === 'label' || h === 'name' || h === 'category')
  const valueIndex = headers.findIndex((h) => h === 'value' || h === 'amount' || h === 'count')

  if (labelIndex === -1 || valueIndex === -1) {
    // Try to use first two columns
    return lines.slice(1).map((line) => {
      const [label, value] = line.split(',').map((v) => v.trim())
      return {
        label,
        value: parseFloat(value) || 0,
      }
    })
  }

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    return {
      label: values[labelIndex],
      value: parseFloat(values[valueIndex]) || 0,
    }
  })
}

/**
 * Convert chart data to CSV string
 */
export function dataToCSV(data: ChartDataEntry[]): string {
  const headers = ['label', 'value']
  if (data.some((d) => d.secondaryValue !== undefined)) {
    headers.push('secondaryValue')
  }

  const rows = data.map((d) => {
    const row = [d.label, d.value.toString()]
    if (d.secondaryValue !== undefined) {
      row.push(d.secondaryValue.toString())
    }
    return row.join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

/**
 * Calculate statistics for chart data
 */
export function calculateStats(data: ChartDataEntry[]): {
  min: number
  max: number
  avg: number
  sum: number
  count: number
} {
  const values = data.map((d) => d.value)
  const sum = values.reduce((a, b) => a + b, 0)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: sum / values.length,
    sum,
    count: values.length,
  }
}

/**
 * Sort chart data
 */
export function sortChartData(
  data: ChartDataEntry[],
  by: 'label' | 'value' = 'value',
  order: 'asc' | 'desc' = 'desc'
): ChartDataEntry[] {
  return [...data].sort((a, b) => {
    const aVal = by === 'label' ? a.label : a.value
    const bVal = by === 'label' ? b.label : b.value

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return order === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })
}

/**
 * Get recommended chart type based on data
 */
export function recommendChartType(data: ChartDataEntry[]): string {
  if (data.length <= 5) return 'pie'
  if (data.some((d) => d.secondaryValue !== undefined)) return 'player-comparison'

  // Check if labels look like time series
  const timePatterns = [/week/i, /month/i, /q[1-4]/i, /day/i, /^20\d{2}$/]
  const isTimeSeries = data.every((d) =>
    timePatterns.some((p) => p.test(d.label))
  )

  return isTimeSeries ? 'line' : 'bar'
}
