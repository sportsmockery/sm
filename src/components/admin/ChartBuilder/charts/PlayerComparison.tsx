'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartDataEntry } from '../DataEntryForm'

interface PlayerComparisonProps {
  data: ChartDataEntry[]
  colors: {
    primary: string
    secondary: string
    gradient: string[]
  }
  animate?: boolean
  width?: number
  height?: number
  player1Name?: string
  player2Name?: string
}

export default function PlayerComparison({
  data,
  colors,
  animate = true,
  width = 400,
  height = 300,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
}: PlayerComparisonProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 40, right: 30, bottom: 40, left: 100 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    const barHeight = Math.min(25, innerHeight / data.length / 2 - 5)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Find max value for scale
    const maxValue = d3.max(data, (d) => Math.max(d.value, d.secondaryValue || 0)) || 0

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([0, innerWidth])

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerHeight])
      .padding(0.3)

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 10)`)

    // Player 1 legend
    legend
      .append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', colors.primary)

    legend
      .append('text')
      .attr('x', 22)
      .attr('y', 12)
      .attr('fill', '#E5E7EB')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(player1Name)

    // Player 2 legend
    legend
      .append('rect')
      .attr('x', 120)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 3)
      .attr('fill', colors.secondary)

    legend
      .append('text')
      .attr('x', 142)
      .attr('y', 12)
      .attr('fill', '#E5E7EB')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text(player2Name)

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(innerHeight)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#374151')
      .attr('stroke-dasharray', '2,2')

    g.select('.grid .domain').remove()

    // Stat labels (Y axis)
    g.append('g')
      .selectAll('.stat-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'stat-label')
      .attr('x', -10)
      .attr('y', (d) => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', '11px')
      .text((d) => d.label)

    // Player 1 bars
    const bars1 = g
      .selectAll('.bar-player1')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-player1')
      .attr('x', 0)
      .attr('y', (d) => (yScale(d.label) || 0))
      .attr('height', barHeight)
      .attr('fill', colors.primary)
      .attr('rx', 3)

    // Player 2 bars
    const bars2 = g
      .selectAll('.bar-player2')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-player2')
      .attr('x', 0)
      .attr('y', (d) => (yScale(d.label) || 0) + barHeight + 3)
      .attr('height', barHeight)
      .attr('fill', colors.secondary)
      .attr('rx', 3)

    if (animate) {
      bars1
        .attr('width', 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 100)
        .ease(d3.easeElasticOut.amplitude(1).period(0.6))
        .attr('width', (d) => xScale(d.value))

      bars2
        .attr('width', 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 100 + 200)
        .ease(d3.easeElasticOut.amplitude(1).period(0.6))
        .attr('width', (d) => xScale(d.secondaryValue || 0))
    } else {
      bars1.attr('width', (d) => xScale(d.value))
      bars2.attr('width', (d) => xScale(d.secondaryValue || 0))
    }

    // Value labels for Player 1
    const labels1 = g
      .selectAll('.value-label-1')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label-1')
      .attr('y', (d) => (yScale(d.label) || 0) + barHeight / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d) => d.value.toLocaleString())

    // Value labels for Player 2
    const labels2 = g
      .selectAll('.value-label-2')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label-2')
      .attr('y', (d) => (yScale(d.label) || 0) + barHeight + 3 + barHeight / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d) => (d.secondaryValue || 0).toLocaleString())

    if (animate) {
      labels1
        .attr('x', 5)
        .attr('opacity', 0)
        .transition()
        .delay((_, i) => i * 100 + 600)
        .duration(300)
        .attr('x', (d) => Math.max(xScale(d.value) + 5, 5))
        .attr('opacity', 1)

      labels2
        .attr('x', 5)
        .attr('opacity', 0)
        .transition()
        .delay((_, i) => i * 100 + 800)
        .duration(300)
        .attr('x', (d) => Math.max(xScale(d.secondaryValue || 0) + 5, 5))
        .attr('opacity', 1)
    } else {
      labels1.attr('x', (d) => Math.max(xScale(d.value) + 5, 5))
      labels2.attr('x', (d) => Math.max(xScale(d.secondaryValue || 0) + 5, 5))
    }

    // Winner indicator (who has higher value)
    data.forEach((d, i) => {
      const winner = d.value > (d.secondaryValue || 0) ? 1 : d.value < (d.secondaryValue || 0) ? 2 : 0
      if (winner !== 0) {
        const indicator = g
          .append('text')
          .attr('x', innerWidth + 10)
          .attr('y', (yScale(d.label) || 0) + yScale.bandwidth() / 2)
          .attr('dominant-baseline', 'middle')
          .attr('fill', winner === 1 ? colors.primary : colors.secondary)
          .attr('font-size', '14px')
          .text('★')

        if (animate) {
          indicator
            .attr('opacity', 0)
            .transition()
            .delay(i * 100 + 1000)
            .duration(300)
            .attr('opacity', 1)
        }
      }
    })

    // Hover effects
    bars1
      .on('mouseenter', function () {
        d3.select(this).transition().duration(150).attr('opacity', 0.8)
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(150).attr('opacity', 1)
      })

    bars2
      .on('mouseenter', function () {
        d3.select(this).transition().duration(150).attr('opacity', 0.8)
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(150).attr('opacity', 1)
      })
  }, [data, colors, animate, width, height, player1Name, player2Name])

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
