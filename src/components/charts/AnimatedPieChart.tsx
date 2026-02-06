'use client'

import { useEffect, useRef, useState, memo } from 'react'
import * as d3 from 'd3'

// Team color palettes
const TEAM_COLORS = {
  bears: { primary: '#0B162A', secondary: '#C83803', accent: '#FFFFFF' },
  bulls: { primary: '#CE1141', secondary: '#000000', accent: '#FFFFFF' },
  cubs: { primary: '#0E3386', secondary: '#CC3433', accent: '#FFFFFF' },
  whitesox: { primary: '#27251F', secondary: '#C4CED4', accent: '#FFFFFF' },
  blackhawks: { primary: '#CF0A2C', secondary: '#000000', accent: '#FFD100' },
} as const

interface ChartDataPoint {
  label: string
  value: number
  color?: string
  metadata?: {
    source?: string
    context?: string
  }
}

interface AnimatedPieChartProps {
  data: ChartDataPoint[]
  teamColors?: {
    primary: string
    secondary: string
  }
  team?: keyof typeof TEAM_COLORS
  animated?: boolean
  height?: number
  showLabels?: boolean
  showLegend?: boolean
}

export const AnimatedPieChart = memo(function AnimatedPieChart({
  data,
  teamColors,
  team = 'bears',
  animated = true,
  height: propHeight,
  showLabels = true,
  showLegend = true,
}: AnimatedPieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: propHeight || 400 })
  const isInitialized = useRef(false)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  // Get team colors - prefer explicit teamColors, fallback to team palette
  const colors = teamColors || TEAM_COLORS[team] || TEAM_COLORS.bears

  // Generate color scale from team colors
  const colorScale = (index: number) => {
    const palette = [
      colors.primary,
      colors.secondary,
      d3.color(colors.primary)?.brighter(0.5)?.formatHex() || '#444',
      d3.color(colors.secondary)?.brighter(0.5)?.formatHex() || '#888',
      d3.color(colors.primary)?.darker(0.3)?.formatHex() || '#222',
      d3.color(colors.secondary)?.darker(0.3)?.formatHex() || '#666',
    ]
    return palette[index % palette.length]
  }

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const height = propHeight || Math.max(300, Math.min(500, width * 0.6))
        setDimensions({ width, height })
      }
    }

    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [propHeight])

  // Initialize SVG structure once
  useEffect(() => {
    if (!svgRef.current || isInitialized.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('class', 'chart-container')
    g.append('g').attr('class', 'slices')
    g.append('g').attr('class', 'labels')
    g.append('g').attr('class', 'legend')

    isInitialized.current = true
  }, [])

  // Update chart when data or dimensions change
  useEffect(() => {
    if (!svgRef.current || !isInitialized.current || !data || data.length === 0) return

    const { width, height } = dimensions
    const legendWidth = showLegend ? 160 : 0
    const chartWidth = width - legendWidth
    const radius = Math.min(chartWidth, height) / 2 - 40
    const innerRadius = radius * 0.4 // Donut hole

    const svg = d3.select(svgRef.current)
    const g = svg.select('.chart-container')

    g.attr('transform', `translate(${chartWidth / 2},${height / 2})`)

    // Pie generator
    const pie = d3
      .pie<ChartDataPoint>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.02)

    // Arc generators
    const arc = d3
      .arc<d3.PieArcDatum<ChartDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)

    const hoverArc = d3
      .arc<d3.PieArcDatum<ChartDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10)
      .cornerRadius(4)

    const labelArc = d3
      .arc<d3.PieArcDatum<ChartDataPoint>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7)

    // Get pie data
    const pieData = pie(data)

    // Slices
    const slicesGroup = g.select('.slices')
    const slices = slicesGroup.selectAll<SVGPathElement, d3.PieArcDatum<ChartDataPoint>>('.slice')
      .data(pieData, (d) => d.data.label)

    // Enter slices
    const slicesEnter = slices.enter()
      .append('path')
      .attr('class', 'slice')
      .attr('fill', (_, i) => colorScale(i))
      .attr('stroke', 'var(--bg-card, #fff)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    if (animated) {
      slicesEnter
        .each(function(d) {
          // Store initial angles for animation
          (this as SVGPathElement & { _current: d3.PieArcDatum<ChartDataPoint> })._current = {
            ...d,
            startAngle: 0,
            endAngle: 0,
          }
        })
        .transition()
        .duration(1000)
        .delay((_, i) => i * 100)
        .ease(d3.easeCubicOut)
        .attrTween('d', function(d) {
          const element = this as SVGPathElement & { _current: d3.PieArcDatum<ChartDataPoint> }
          const interpolate = d3.interpolate(element._current, d)
          element._current = d
          return (t) => arc(interpolate(t)) || ''
        })
    } else {
      slicesEnter.attr('d', arc)
    }

    // Update slices
    if (animated) {
      slices
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attrTween('d', function(d) {
          const element = this as SVGPathElement & { _current: d3.PieArcDatum<ChartDataPoint> }
          const interpolate = d3.interpolate(element._current || d, d)
          element._current = d
          return (t) => arc(interpolate(t)) || ''
        })
        .attr('fill', (_, i) => colorScale(i))
    } else {
      slices.attr('d', arc).attr('fill', (_, i) => colorScale(i))
    }

    // Exit slices
    if (animated) {
      slices.exit()
        .transition()
        .duration(400)
        .attrTween('d', function(d) {
          const element = this as SVGPathElement & { _current: d3.PieArcDatum<ChartDataPoint> }
          const pieData = d as d3.PieArcDatum<ChartDataPoint>
          const endState: d3.PieArcDatum<ChartDataPoint> = {
            data: pieData.data,
            value: pieData.value,
            index: pieData.index,
            startAngle: pieData.endAngle,
            endAngle: pieData.endAngle,
            padAngle: pieData.padAngle,
          }
          const interpolate = d3.interpolate(element._current, endState)
          return (t) => arc(interpolate(t)) || ''
        })
        .remove()
    } else {
      slices.exit().remove()
    }

    // Hover effects
    slicesGroup.selectAll('.slice')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc(d as d3.PieArcDatum<ChartDataPoint>))
          .attr('opacity', 0.85)

        showTooltip(event, d as d3.PieArcDatum<ChartDataPoint>)
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc(d as d3.PieArcDatum<ChartDataPoint>))
          .attr('opacity', 1)

        hideTooltip()
      })

    // Labels inside slices (only for larger segments)
    if (showLabels) {
      const labelsGroup = g.select('.labels')
      const total = d3.sum(data, d => d.value)

      const labelData = pieData.filter(d => d.data.value / total > 0.05) // Only show labels for >5% segments

      const labels = labelsGroup.selectAll<SVGTextElement, d3.PieArcDatum<ChartDataPoint>>('.slice-label')
        .data(labelData, (d) => d.data.label)

      // Enter labels
      const labelsEnter = labels.enter()
        .append('text')
        .attr('class', 'slice-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .style('font-size', '13px')
        .style('font-weight', '600')
        .style('fill', '#fff')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .text(d => `${Math.round(d.data.value / total * 100)}%`)

      if (animated) {
        labelsEnter
          .transition()
          .duration(600)
          .delay(800)
          .style('opacity', 1)
          .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      } else {
        labelsEnter
          .style('opacity', 1)
          .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      }

      // Update labels
      if (animated) {
        labels
          .transition()
          .duration(750)
          .attr('transform', d => `translate(${labelArc.centroid(d)})`)
          .text(d => `${Math.round(d.data.value / total * 100)}%`)
      } else {
        labels
          .attr('transform', d => `translate(${labelArc.centroid(d)})`)
          .text(d => `${Math.round(d.data.value / total * 100)}%`)
      }

      // Exit labels
      labels.exit()
        .transition()
        .duration(400)
        .style('opacity', 0)
        .remove()
    }

    // Legend
    if (showLegend) {
      const legendGroup = svg.select('.legend')
      legendGroup.attr('transform', `translate(${chartWidth + 20}, ${height / 2 - (data.length * 25) / 2})`)

      const legendItems = legendGroup.selectAll<SVGGElement, ChartDataPoint>('.legend-item')
        .data(data, (d) => d.label)

      // Enter legend items
      const legendEnter = legendItems.enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (_, i) => `translate(0, ${i * 28})`)
        .style('opacity', 0)

      legendEnter.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', (_, i) => colorScale(i))

      legendEnter.append('text')
        .attr('x', 24)
        .attr('y', 12)
        .style('font-size', '13px')
        .style('fill', 'var(--text-primary, #222)')
        .text(d => d.label.length > 15 ? d.label.slice(0, 15) + '...' : d.label)

      if (animated) {
        legendEnter
          .transition()
          .duration(500)
          .delay((_, i) => 800 + i * 50)
          .style('opacity', 1)
      } else {
        legendEnter.style('opacity', 1)
      }

      // Update legend
      legendItems
        .attr('transform', (_, i) => `translate(0, ${i * 28})`)
        .select('rect')
        .attr('fill', (_, i) => colorScale(i))

      legendItems
        .select('text')
        .text(d => d.label.length > 15 ? d.label.slice(0, 15) + '...' : d.label)

      // Exit legend
      legendItems.exit()
        .transition()
        .duration(400)
        .style('opacity', 0)
        .remove()
    }

    // Center total label
    const total = d3.sum(data, d => d.value)

    // Remove existing center labels and recreate
    g.selectAll('.center-label, .center-sub-label').remove()

    g.append('text')
      .attr('class', 'center-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .style('font-size', '24px')
      .style('font-weight', '700')
      .style('fill', 'var(--text-primary, #222)')
      .text(d3.format(',')(Math.round(total)))

    g.append('text')
      .attr('class', 'center-sub-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .style('font-size', '13px')
      .style('fill', 'var(--text-muted, #666)')
      .text('Total')

  }, [data, dimensions, colors, animated, showLabels, showLegend])

  const showTooltip = (event: MouseEvent, d: d3.PieArcDatum<ChartDataPoint>) => {
    hideTooltip()

    const total = d3.sum(data, d => d.value)
    const percentage = ((d.data.value / total) * 100).toFixed(1)

    const tooltip = document.createElement('div')
    tooltip.className = 'chart-tooltip'
    tooltip.style.cssText = `
      position: fixed;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-default, #e0e0e0);
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      pointer-events: none;
      z-index: 10000;
      font-size: 14px;
      min-width: 150px;
      opacity: 0;
      transition: opacity 0.2s ease;
    `

    const contextHtml = d.data.metadata?.context
      ? `<div style="color: var(--text-muted, #666); font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-default, #e0e0e0);">${d.data.metadata.context}</div>`
      : ''

    tooltip.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--text-primary, #222);">${d.data.label}</div>
      <div style="color: var(--text-secondary, #666); font-size: 13px;">
        Value: <strong style="color: var(--text-primary, #222);">${d3.format(',')(d.data.value)}</strong>
      </div>
      <div style="color: var(--text-secondary, #666); font-size: 13px;">
        Share: <strong style="color: var(--text-primary, #222);">${percentage}%</strong>
      </div>
      ${contextHtml}
    `

    document.body.appendChild(tooltip)
    tooltipRef.current = tooltip

    const tooltipRect = tooltip.getBoundingClientRect()
    let left = event.clientX + 15
    let top = event.clientY - 10

    if (left + tooltipRect.width > window.innerWidth - 20) {
      left = event.clientX - tooltipRect.width - 15
    }
    if (top + tooltipRect.height > window.innerHeight - 20) {
      top = event.clientY - tooltipRect.height - 10
    }

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`

    requestAnimationFrame(() => {
      tooltip.style.opacity = '1'
    })
  }

  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0'
      setTimeout(() => {
        tooltipRef.current?.remove()
        tooltipRef.current = null
      }, 200)
    }
  }

  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove()
      }
    }
  }, [])

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-center" style={{ color: 'var(--text-muted, #666)' }}>
        <div>
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <p className="text-sm">Insufficient data for pie chart</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ fontFamily: 'inherit', maxWidth: '100%', display: 'block' }}
      />
    </div>
  )
})

export default AnimatedPieChart
