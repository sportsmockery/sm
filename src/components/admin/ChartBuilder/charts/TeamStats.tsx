'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartDataEntry } from '../DataEntryForm'

interface TeamStatsProps {
  data: ChartDataEntry[]
  colors: {
    primary: string
    secondary: string
    gradient: string[]
  }
  animate?: boolean
  width?: number
  height?: number
  showLeagueAvg?: boolean
  teamName?: string
}

export default function TeamStats({
  data,
  colors,
  animate = true,
  width = 400,
  height = 300,
  showLeagueAvg = true,
  teamName = 'Team',
}: TeamStatsProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 30, right: 30, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Calculate center point
    const centerX = innerWidth / 2
    const centerY = innerHeight / 2
    const radius = Math.min(centerX, centerY) - 20

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left + centerX},${margin.top + centerY})`)

    // Create gradient
    const gradient = svg
      .append('defs')
      .append('radialGradient')
      .attr('id', 'radar-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '50%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.3)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.1)

    // Scales
    const angleSlice = (Math.PI * 2) / data.length
    const maxValue = d3.max(data, (d) => Math.max(d.value, d.secondaryValue || 0)) || 100
    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius])

    // Draw circular grid
    const levels = 5
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i

      g.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#374151')
        .attr('stroke-dasharray', '2,2')

      // Level labels
      g.append('text')
        .attr('x', 4)
        .attr('y', -levelRadius)
        .attr('fill', '#6B7280')
        .attr('font-size', '9px')
        .text(Math.round((maxValue / levels) * i))
    }

    // Draw axis lines
    data.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const lineData = [
        [0, 0],
        [radius * Math.cos(angle), radius * Math.sin(angle)],
      ]

      g.append('line')
        .attr('x1', lineData[0][0])
        .attr('y1', lineData[0][1])
        .attr('x2', lineData[1][0])
        .attr('y2', lineData[1][1])
        .attr('stroke', '#374151')
        .attr('stroke-width', 1)
    })

    // Function to generate radar path
    const radarLine = d3
      .lineRadial<ChartDataEntry>()
      .radius((d) => rScale(d.value))
      .angle((_, i) => i * angleSlice)
      .curve(d3.curveLinearClosed)

    // Draw league average if enabled (using secondaryValue)
    if (showLeagueAvg && data.some((d) => d.secondaryValue !== undefined)) {
      const avgLine = d3
        .lineRadial<ChartDataEntry>()
        .radius((d) => rScale(d.secondaryValue || 0))
        .angle((_, i) => i * angleSlice)
        .curve(d3.curveLinearClosed)

      const avgPath = g
        .append('path')
        .datum(data)
        .attr('fill', colors.secondary)
        .attr('fill-opacity', 0.1)
        .attr('stroke', colors.secondary)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', avgLine)

      if (animate) {
        const totalLength = avgPath.node()?.getTotalLength() || 0
        avgPath
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .attr('fill-opacity', 0)
          .transition()
          .duration(1000)
          .attr('stroke-dashoffset', 0)
          .transition()
          .duration(500)
          .attr('fill-opacity', 0.1)
          .attr('stroke-dasharray', '5,5')
      }
    }

    // Draw team stats area
    const teamArea = g
      .append('path')
      .datum(data)
      .attr('fill', 'url(#radar-gradient)')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)

    if (animate) {
      // Start from center and expand
      const startLine = d3
        .lineRadial<ChartDataEntry>()
        .radius(0)
        .angle((_, i) => i * angleSlice)
        .curve(d3.curveLinearClosed)

      teamArea
        .attr('d', startLine)
        .transition()
        .duration(1000)
        .ease(d3.easeElasticOut.amplitude(1).period(0.5))
        .attr('d', radarLine)
    } else {
      teamArea.attr('d', radarLine)
    }

    // Draw data points
    const points = g
      .selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('fill', colors.primary)
      .attr('stroke', '#18181B')
      .attr('stroke-width', 2)

    if (animate) {
      points
        .attr('r', 0)
        .transition()
        .delay((_, i) => 800 + i * 100)
        .duration(300)
        .attr('r', 5)
    } else {
      points.attr('r', 5)
    }

    // Axis labels
    const labels = g
      .selectAll('.axis-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'axis-label')
      .attr('x', (_, i) => (radius + 20) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr('y', (_, i) => (radius + 20) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr('text-anchor', (_, i) => {
        const angle = angleSlice * i
        if (angle < Math.PI / 4 || angle > (7 * Math.PI) / 4) return 'middle'
        if (angle < (3 * Math.PI) / 4) return 'start'
        if (angle < (5 * Math.PI) / 4) return 'middle'
        return 'end'
      })
      .attr('dominant-baseline', (_, i) => {
        const angle = angleSlice * i
        if (angle < Math.PI / 2 || angle > (3 * Math.PI) / 2) return 'auto'
        return 'hanging'
      })
      .attr('fill', '#E5E7EB')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text((d) => d.label)

    if (animate) {
      labels
        .attr('opacity', 0)
        .transition()
        .delay((_, i) => 1000 + i * 50)
        .duration(300)
        .attr('opacity', 1)
    }

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 120}, 10)`)

    legend
      .append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('fill', colors.primary)

    legend
      .append('text')
      .attr('x', 18)
      .attr('y', 10)
      .attr('fill', '#E5E7EB')
      .attr('font-size', '11px')
      .text(teamName)

    if (showLeagueAvg) {
      legend
        .append('line')
        .attr('x1', 0)
        .attr('y1', 26)
        .attr('x2', 12)
        .attr('y2', 26)
        .attr('stroke', colors.secondary)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3')

      legend
        .append('text')
        .attr('x', 18)
        .attr('y', 30)
        .attr('fill', '#9CA3AF')
        .attr('font-size', '11px')
        .text('League Avg')
    }

    // Hover effects
    points
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)

        // Show tooltip
        const tooltip = g
          .append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(0, 0)`)

        tooltip
          .append('rect')
          .attr('x', -30)
          .attr('y', -35)
          .attr('width', 60)
          .attr('height', 24)
          .attr('rx', 4)
          .attr('fill', '#27272A')

        tooltip
          .append('text')
          .attr('y', -19)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(d.value.toLocaleString())
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)

        g.select('.tooltip').remove()
      })
  }, [data, colors, animate, width, height, showLeagueAvg, teamName])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-auto"
      style={{ maxWidth: width }}
    />
  )
}
