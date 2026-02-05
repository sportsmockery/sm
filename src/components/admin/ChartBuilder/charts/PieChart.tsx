'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { ChartDataEntry } from '../DataEntryForm'

interface PieChartProps {
  data: ChartDataEntry[]
  colors: {
    primary: string
    secondary: string
    gradient: string[]
  }
  animate?: boolean
  width?: number
  height?: number
  donut?: boolean
}

export default function PieChart({
  data,
  colors,
  animate = true,
  width = 300,
  height = 340,
  donut = true,
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Reserve space for legend at bottom
    const legendSpace = 50
    const chartHeight = height - legendSpace
    const radius = Math.min(width, chartHeight) / 2 - 10
    const innerRadius = donut ? radius * 0.6 : 0

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${chartHeight / 2})`)

    // Color scale
    const total = d3.sum(data, (d) => d.value)
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0, data.length - 1])
      .range([colors.primary, colors.secondary])

    // Pie generator
    const pie = d3
      .pie<ChartDataEntry>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.02)

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<ChartDataEntry>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)

    // Arc for labels
    const labelArc = d3
      .arc<d3.PieArcDatum<ChartDataEntry>>()
      .innerRadius(radius * 0.75)
      .outerRadius(radius * 0.75)

    // Create pie slices
    const slices = g
      .selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice')

    // Draw arcs
    const paths = slices
      .append('path')
      .attr('fill', (_, i) => colorScale(i))
      .attr('stroke', '#18181B')
      .attr('stroke-width', 2)

    if (animate) {
      paths
        .transition()
        .duration(1000)
        .attrTween('d', function (d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
          return function (t) {
            return arc(interpolate(t)) || ''
          }
        })
    } else {
      paths.attr('d', arc)
    }

    // Percentage labels
    const percentLabels = slices
      .append('text')
      .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .text((d) => {
        const percent = ((d.data.value / total) * 100).toFixed(0)
        return `${percent}%`
      })

    if (animate) {
      percentLabels
        .attr('opacity', 0)
        .transition()
        .delay(800)
        .duration(300)
        .attr('opacity', 1)
    }

    // Center text for donut
    if (donut) {
      const centerGroup = g.append('g').attr('class', 'center-text')

      centerGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.2em')
        .attr('fill', '#E5E7EB')
        .attr('font-size', '24px')
        .attr('font-weight', '700')
        .text(total.toLocaleString())

      centerGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('fill', '#9CA3AF')
        .attr('font-size', '11px')
        .text('TOTAL')

      if (animate) {
        centerGroup
          .attr('opacity', 0)
          .transition()
          .delay(500)
          .duration(500)
          .attr('opacity', 1)
      }
    }

    // Hover effects
    paths
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', () => {
            const [x, y] = arc.centroid(d)
            const midAngle = Math.atan2(y, x)
            return `translate(${Math.cos(midAngle) * 10},${Math.sin(midAngle) * 10})`
          })
          .attr('opacity', 0.9)
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)')
          .attr('opacity', 1)
      })

    // Legend - positioned below chart in horizontal layout
    const legendHeight = 40
    const legendY = height - legendHeight + 10
    const itemWidth = Math.floor(width / Math.min(data.length, 4))

    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(10, ${legendY})`)

    const legendItems = legend
      .selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (_, i) => {
        const row = Math.floor(i / 4)
        const col = i % 4
        return `translate(${col * itemWidth}, ${row * 18})`
      })

    legendItems
      .append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('rx', 2)
      .attr('fill', (_, i) => colorScale(i))

    legendItems
      .append('text')
      .attr('x', 14)
      .attr('y', 9)
      .attr('fill', '#9CA3AF')
      .attr('font-size', '10px')
      .text((d) => d.label.length > 12 ? d.label.slice(0, 12) + '...' : d.label)

    if (animate) {
      legend
        .attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(300)
        .attr('opacity', 1)
    }
  }, [data, colors, animate, width, height, donut])

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
