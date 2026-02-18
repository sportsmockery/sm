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

interface ChartAxes {
  x: { label: string; type: string }
  y: { label: string; type: string; format: string }
}

interface AnimatedBarChartProps {
  data: ChartDataPoint[]
  axes?: ChartAxes
  teamColors?: {
    primary: string
    secondary: string
  }
  team?: keyof typeof TEAM_COLORS
  animated?: boolean
  height?: number
}

export const AnimatedBarChart = memo(function AnimatedBarChart({
  data,
  axes,
  teamColors,
  team = 'bears',
  animated = true,
  height: propHeight,
}: AnimatedBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: propHeight || 400 })
  const isInitialized = useRef(false)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  // Get team colors - prefer explicit teamColors, fallback to team palette
  const colors = teamColors || TEAM_COLORS[team] || TEAM_COLORS.bears

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const height = propHeight || Math.max(300, Math.min(500, width * 0.5))
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

    // Create groups in proper order for z-index
    const g = svg.append('g').attr('class', 'chart-container')
    g.append('g').attr('class', 'grid-lines')
    g.append('g').attr('class', 'x-axis')
    g.append('g').attr('class', 'y-axis')
    g.append('g').attr('class', 'bars')
    g.append('g').attr('class', 'labels')
    g.append('text').attr('class', 'x-axis-label')
    g.append('text').attr('class', 'y-axis-label')

    isInitialized.current = true
  }, [])

  // Update chart when data or dimensions change
  useEffect(() => {
    if (!svgRef.current || !isInitialized.current || !data || data.length === 0) return

    const { width, height } = dimensions

    // Smart margin calculation based on label lengths
    const maxLabelLength = Math.max(...data.map(d => d.label.length))
    const needsRotation = maxLabelLength > 12 || data.length > 6

    const margin = {
      top: 40,
      right: 40,
      bottom: needsRotation ? 100 : 60,
      left: 70,
    }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    const g = svg.select('.chart-container')

    g.attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const maxValue = d3.max(data, (d) => d.value) || 0
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.15])
      .range([innerHeight, 0])
      .nice()

    // Grid lines
    const gridLines = g.select('.grid-lines')
    gridLines.selectAll('line').remove()

    yScale.ticks(5).forEach(tick => {
      gridLines.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(tick))
        .attr('y2', yScale(tick))
        .attr('stroke', 'var(--sm-border, #e0e0e0)')
        .attr('stroke-opacity', 0.3)
        .attr('stroke-dasharray', '3,3')
    })

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)
    const xAxisGroup = g.select('.x-axis') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    xAxisGroup.attr('transform', `translate(0,${innerHeight})`)

    xAxisGroup
      .transition()
      .duration(animated ? 500 : 0)
      .call(xAxis)

    // Smart label rotation
    xAxisGroup
      .selectAll('text')
      .attr('transform', needsRotation ? 'rotate(-45)' : 'rotate(0)')
      .style('text-anchor', needsRotation ? 'end' : 'middle')
      .attr('dx', needsRotation ? '-.8em' : '0')
      .attr('dy', needsRotation ? '.15em' : '.71em')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('fill', 'var(--sm-text, #222)')

    xAxisGroup.selectAll('line').style('stroke', 'var(--sm-border, #e0e0e0)')
    xAxisGroup.selectAll('path').style('stroke', 'var(--sm-border, #e0e0e0)')

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => d3.format('.0f')(d as number))

    const yAxisGroup = g.select('.y-axis') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    yAxisGroup
      .transition()
      .duration(animated ? 500 : 0)
      .call(yAxis)

    yAxisGroup.selectAll('text')
      .style('font-size', '12px')
      .style('fill', 'var(--sm-text-muted, #666)')

    yAxisGroup.selectAll('line').style('stroke', 'var(--sm-border, #e0e0e0)')
    yAxisGroup.selectAll('path').style('stroke', 'var(--sm-border, #e0e0e0)')

    // Axis labels
    g.select('.x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + (needsRotation ? 85 : 45))
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', 'var(--sm-text, #222)')
      .text(axes?.x?.label || '')

    g.select('.y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', 'var(--sm-text, #222)')
      .text(axes?.y?.label || '')

    // Color function - use data color, team colors, or alternate
    const getColor = (d: ChartDataPoint, i: number) => {
      if (d.color) return d.color
      return i % 2 === 0 ? colors.primary : colors.secondary
    }

    // Bars with enter/update/exit pattern
    const barsGroup = g.select('.bars')
    const bars = barsGroup.selectAll<SVGRectElement, ChartDataPoint>('.bar').data(data, (d) => d.label)

    // Enter
    const barsEnter = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.label)!)
      .attr('width', xScale.bandwidth())
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', getColor)
      .style('cursor', 'pointer')

    if (animated) {
      barsEnter
        .transition()
        .duration(800)
        .delay((_, i) => i * 100)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value))
    } else {
      barsEnter
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value))
    }

    // Update
    if (animated) {
      bars
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attr('x', (d) => xScale(d.label)!)
        .attr('width', xScale.bandwidth())
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value))
        .attr('fill', getColor)
    } else {
      bars
        .attr('x', (d) => xScale(d.label)!)
        .attr('width', xScale.bandwidth())
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value))
        .attr('fill', getColor)
    }

    // Exit
    if (animated) {
      bars.exit()
        .transition()
        .duration(400)
        .ease(d3.easeExpIn)
        .attr('y', innerHeight)
        .attr('height', 0)
        .style('opacity', 0)
        .remove()
    } else {
      bars.exit().remove()
    }

    // Hover effects
    barsGroup.selectAll('.bar')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('transform', 'translateY(-2px)')

        showTooltip(event, d as ChartDataPoint)
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('transform', 'translateY(0)')

        hideTooltip()
      })

    // Value labels on top of bars
    const labelsGroup = g.select('.labels')
    const valueLabels = labelsGroup.selectAll<SVGTextElement, ChartDataPoint>('.value-label').data(data, (d) => d.label)

    // Enter labels
    const labelsEnter = valueLabels.enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.label)! + xScale.bandwidth() / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '700')
      .style('fill', 'var(--sm-text, #222)')
      .style('opacity', 0)
      .text((d) => formatValue(d.value, axes?.y?.format))

    if (animated) {
      labelsEnter
        .transition()
        .duration(800)
        .delay((_, i) => i * 100 + 400)
        .attr('y', (d) => yScale(d.value) - 10)
        .style('opacity', 1)
    } else {
      labelsEnter
        .attr('y', (d) => yScale(d.value) - 10)
        .style('opacity', 1)
    }

    // Update labels
    if (animated) {
      valueLabels
        .transition()
        .duration(750)
        .attr('x', (d) => xScale(d.label)! + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.value) - 10)
        .text((d) => formatValue(d.value, axes?.y?.format))
    } else {
      valueLabels
        .attr('x', (d) => xScale(d.label)! + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.value) - 10)
        .text((d) => formatValue(d.value, axes?.y?.format))
    }

    // Exit labels
    if (animated) {
      valueLabels.exit()
        .transition()
        .duration(400)
        .style('opacity', 0)
        .remove()
    } else {
      valueLabels.exit().remove()
    }

  }, [data, dimensions, colors, animated, axes])

  const formatValue = (value: number, format?: string) => {
    if (format === 'decimal') return d3.format('.1f')(value)
    if (format === 'percent') return d3.format('.0%')(value / 100)
    return d3.format('.0f')(value)
  }

  const showTooltip = (event: MouseEvent, d: ChartDataPoint) => {
    // Remove any existing tooltip
    hideTooltip()

    const tooltip = document.createElement('div')
    tooltip.className = 'chart-tooltip'
    tooltip.style.cssText = `
      position: fixed;
      background: var(--sm-card, #fff);
      border: 1px solid var(--sm-border, #e0e0e0);
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

    const contextHtml = d.metadata?.context
      ? `<div style="color: var(--sm-text-muted, #666); font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--sm-border, #e0e0e0);">${d.metadata.context}</div>`
      : ''

    tooltip.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; color: var(--sm-text, #222);">${d.label}</div>
      <div style="color: var(--sm-text-dim, #666); font-size: 13px;">
        ${axes?.y?.label || 'Value'}: <strong style="color: var(--sm-text, #222);">${formatValue(d.value, axes?.y?.format)}</strong>
      </div>
      ${contextHtml}
    `

    document.body.appendChild(tooltip)
    tooltipRef.current = tooltip

    // Position tooltip
    const tooltipRect = tooltip.getBoundingClientRect()
    let left = event.clientX + 15
    let top = event.clientY - 10

    // Keep tooltip in viewport
    if (left + tooltipRect.width > window.innerWidth - 20) {
      left = event.clientX - tooltipRect.width - 15
    }
    if (top + tooltipRect.height > window.innerHeight - 20) {
      top = event.clientY - tooltipRect.height - 10
    }

    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`

    // Fade in
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

  // Cleanup tooltip on unmount
  useEffect(() => {
    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.remove()
      }
    }
  }, [])

  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 text-center" style={{ color: 'var(--sm-text-muted, #666)' }}>
        <div>
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">Insufficient data for chart</p>
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

export default AnimatedBarChart
