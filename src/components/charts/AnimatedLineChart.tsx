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

interface AnimatedLineChartProps {
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

export const AnimatedLineChart = memo(function AnimatedLineChart({
  data,
  axes,
  teamColors,
  team = 'bears',
  animated = true,
  height: propHeight,
}: AnimatedLineChartProps) {
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
    g.append('path').attr('class', 'line-path')
    g.append('path').attr('class', 'area-path')
    g.append('g').attr('class', 'dots')
    g.append('text').attr('class', 'x-axis-label')
    g.append('text').attr('class', 'y-axis-label')

    isInitialized.current = true
  }, [])

  // Update chart when data or dimensions change
  useEffect(() => {
    if (!svgRef.current || !isInitialized.current || !data || data.length === 0) return

    const { width, height } = dimensions

    const margin = {
      top: 40,
      right: 40,
      bottom: 60,
      left: 70,
    }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const svg = d3.select(svgRef.current)
    const g = svg.select('.chart-container')

    g.attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.5)

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

    // Line generator
    const line = d3
      .line<ChartDataPoint>()
      .x((d) => xScale(d.label)!)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Area generator
    const area = d3
      .area<ChartDataPoint>()
      .x((d) => xScale(d.label)!)
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0)
    const xAxisGroup = g.select('.x-axis') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    xAxisGroup.attr('transform', `translate(0,${innerHeight})`)

    xAxisGroup
      .transition()
      .duration(animated ? 500 : 0)
      .call(xAxis)

    xAxisGroup
      .selectAll('text')
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
      .attr('y', innerHeight + 45)
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

    // Gradient ID for area fill
    const gradientId = `area-gradient-${team}`

    // Area path (gradient fill under line)
    const areaPath = g.select('.area-path')

    if (animated) {
      areaPath
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('opacity', 0)
        .attr('d', area)
        .transition()
        .duration(1000)
        .delay(300)
        .attr('opacity', 0.3)
    } else {
      areaPath
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('opacity', 0.3)
        .attr('d', area)
    }

    // Add gradient definition
    const defs = svg.select('defs').empty()
      ? svg.append('defs')
      : svg.select('defs')

    defs.select(`#${gradientId}`).remove()
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.4)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0)

    // Line path
    const linePath = g.select('.line-path')

    if (animated) {
      const totalLength = linePath.node()
        ? (linePath.node() as SVGPathElement).getTotalLength?.() || 1000
        : 1000

      linePath
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', line)
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0)
    } else {
      linePath
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.primary)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('d', line)
    }

    // Dots
    const dotsGroup = g.select('.dots')
    const dots = dotsGroup.selectAll<SVGCircleElement, ChartDataPoint>('.dot').data(data, (d) => d.label)

    // Enter dots
    const dotsEnter = dots.enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.label)!)
      .attr('cy', innerHeight)
      .attr('r', 0)
      .attr('fill', colors.primary)
      .attr('stroke', 'var(--sm-card, #fff)')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    if (animated) {
      dotsEnter
        .transition()
        .duration(600)
        .delay((_, i) => 800 + i * 80)
        .ease(d3.easeBackOut.overshoot(1.5))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 6)
    } else {
      dotsEnter
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 6)
    }

    // Update dots
    if (animated) {
      dots
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attr('cx', (d) => xScale(d.label)!)
        .attr('cy', (d) => yScale(d.value))
    } else {
      dots
        .attr('cx', (d) => xScale(d.label)!)
        .attr('cy', (d) => yScale(d.value))
    }

    // Exit dots
    if (animated) {
      dots.exit()
        .transition()
        .duration(400)
        .attr('r', 0)
        .remove()
    } else {
      dots.exit().remove()
    }

    // Hover effects
    dotsGroup.selectAll('.dot')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 9)
          .attr('fill', colors.secondary)

        showTooltip(event, d as ChartDataPoint)
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', colors.primary)

        hideTooltip()
      })

  }, [data, dimensions, colors, animated, axes, team])

  const formatValue = (value: number, format?: string) => {
    if (format === 'decimal') return d3.format('.1f')(value)
    if (format === 'percent') return d3.format('.0%')(value / 100)
    return d3.format('.0f')(value)
  }

  const showTooltip = (event: MouseEvent, d: ChartDataPoint) => {
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
      <div className="flex items-center justify-center h-64 text-center" style={{ color: 'var(--sm-text-muted, #666)' }}>
        <div>
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-sm">Insufficient data for line chart</p>
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

export default AnimatedLineChart
