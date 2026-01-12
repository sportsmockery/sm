'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartDataEntry } from '../DataEntryForm'

interface BarChartProps {
  data: ChartDataEntry[]
  colors: {
    primary: string
    secondary: string
    gradient: string[]
  }
  animate?: boolean
  width?: number
  height?: number
}

export default function BarChart({
  data,
  colors,
  animate = true,
  width = 400,
  height = 250,
}: BarChartProps) {
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
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([innerHeight, 0])

    // Create gradient
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.primary)

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.secondary)

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
      .attr('transform', 'rotate(-35)')
      .attr('text-anchor', 'end')

    g.selectAll('.domain').attr('stroke', '#374151')
    g.selectAll('.tick line').attr('stroke', '#374151')

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')

    // Bars
    const bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.label) || 0)
      .attr('width', xScale.bandwidth())
      .attr('fill', 'url(#bar-gradient)')
      .attr('rx', 4)
      .attr('ry', 4)

    if (animate) {
      bars
        .attr('y', innerHeight)
        .attr('height', 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 100)
        .ease(d3.easeElasticOut.amplitude(1).period(0.5))
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value))
    } else {
      bars
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value))
    }

    // Value labels
    const labels = g
      .selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#E5E7EB')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text((d) => d.value.toLocaleString())

    if (animate) {
      labels
        .attr('y', innerHeight)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 100 + 400)
        .attr('y', (d) => yScale(d.value) - 8)
        .attr('opacity', 1)
    } else {
      labels.attr('y', (d) => yScale(d.value) - 8)
    }

    // Hover effects
    bars
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.8)
          .attr('transform', `translate(0, -2)`)
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('transform', 'translate(0, 0)')
      })
  }, [data, colors, animate, width, height])

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
