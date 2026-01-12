'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartDataEntry } from '../DataEntryForm'

interface LineChartProps {
  data: ChartDataEntry[]
  colors: {
    primary: string
    secondary: string
    gradient: string[]
  }
  animate?: boolean
  width?: number
  height?: number
  showSecondLine?: boolean
}

export default function LineChart({
  data,
  colors,
  animate = true,
  width = 400,
  height = 250,
  showSecondLine = false,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.5)

    const allValues = data.flatMap((d) => [d.value, d.secondaryValue || 0])
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allValues) || 0])
      .nice()
      .range([innerHeight, 0])

    // Create gradient for area
    const areaGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.3)

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0)

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#374151')
      .attr('stroke-dasharray', '2,2')

    g.select('.grid .domain').remove()

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')

    g.selectAll('.domain').attr('stroke', '#374151')
    g.selectAll('.tick line').attr('stroke', '#374151')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')

    // Area generator
    const area = d3
      .area<ChartDataEntry>()
      .x((d) => xScale(d.label) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Line generator
    const line = d3
      .line<ChartDataEntry>()
      .x((d) => xScale(d.label) || 0)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX)

    // Draw area
    const areaPath = g
      .append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area)

    // Draw line
    const linePath = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line)

    // Animate line drawing
    if (animate) {
      const totalLength = linePath.node()?.getTotalLength() || 0
      linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)

      areaPath
        .attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1)
    }

    // Secondary line (for comparisons)
    if (showSecondLine && data.some((d) => d.secondaryValue !== undefined)) {
      const line2 = d3
        .line<ChartDataEntry>()
        .x((d) => xScale(d.label) || 0)
        .y((d) => yScale(d.secondaryValue || 0))
        .curve(d3.curveMonotoneX)

      const linePath2 = g
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.secondary)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-dasharray', '5,5')
        .attr('d', line2)

      if (animate) {
        const totalLength2 = linePath2.node()?.getTotalLength() || 0
        linePath2
          .attr('stroke-dasharray', `${totalLength2} ${totalLength2}`)
          .attr('stroke-dashoffset', totalLength2)
          .transition()
          .delay(500)
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)
          .on('end', function () {
            d3.select(this).attr('stroke-dasharray', '5,5')
          })
      }

      // Secondary dots
      g.selectAll('.dot-secondary')
        .data(data.filter((d) => d.secondaryValue !== undefined))
        .enter()
        .append('circle')
        .attr('class', 'dot-secondary')
        .attr('cx', (d) => xScale(d.label) || 0)
        .attr('cy', (d) => yScale(d.secondaryValue || 0))
        .attr('r', animate ? 0 : 5)
        .attr('fill', colors.secondary)
        .attr('stroke', '#18181B')
        .attr('stroke-width', 2)
        .transition()
        .delay((_, i) => (animate ? 500 + i * 100 : 0))
        .duration(animate ? 300 : 0)
        .attr('r', 5)
    }

    // Data points (dots)
    const dots = g
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.label) || 0)
      .attr('cy', (d) => yScale(d.value))
      .attr('fill', colors.primary)
      .attr('stroke', '#18181B')
      .attr('stroke-width', 2)

    if (animate) {
      dots
        .attr('r', 0)
        .transition()
        .delay((_, i) => i * 100)
        .duration(300)
        .attr('r', 5)
    } else {
      dots.attr('r', 5)
    }

    // Value labels on hover
    const tooltip = g
      .append('g')
      .attr('class', 'tooltip')
      .attr('opacity', 0)

    tooltip
      .append('rect')
      .attr('width', 60)
      .attr('height', 24)
      .attr('rx', 4)
      .attr('fill', '#27272A')

    tooltip
      .append('text')
      .attr('x', 30)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')

    dots
      .on('mouseenter', function (event, d) {
        const x = xScale(d.label) || 0
        const y = yScale(d.value)

        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)

        tooltip
          .attr('transform', `translate(${x - 30},${y - 35})`)
          .transition()
          .duration(150)
          .attr('opacity', 1)

        tooltip.select('text').text(d.value.toLocaleString())
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)

        tooltip
          .transition()
          .duration(150)
          .attr('opacity', 0)
      })
  }, [data, colors, animate, width, height, showSecondLine])

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
