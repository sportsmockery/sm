'use client'

import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { ChartConfig } from './ChartBuilderModal'
import { teamColors } from './ChartColorPicker'

interface ChartPreviewProps {
  config: ChartConfig
}

function buildEChartsOptions(config: ChartConfig) {
  const { type, title, data, colors, size } = config

  const primaryColor =
    colors.scheme === 'team' && colors.team
      ? teamColors[colors.team]?.primary || '#bc0000'
      : colors.customColors?.[0] || '#bc0000'

  const secondaryColor =
    colors.scheme === 'team' && colors.team
      ? teamColors[colors.team]?.secondary || '#000000'
      : colors.customColors?.[1] || '#666666'

  const baseOptions: Record<string, unknown> = {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: type === 'pie' ? 'item' : 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: primaryColor,
      textStyle: { color: '#fff' },
    },
    title: title ? { text: title, textStyle: { color: '#fff', fontSize: 14 }, left: 'center', top: 0 } : undefined,
  }

  const labels = data.map((d) => d.label)
  const values = data.map((d) => d.value)
  const secondaryValues = data.map((d) => d.secondaryValue ?? 0)

  switch (type) {
    case 'bar':
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: '#9CA3AF', rotate: labels.some((l) => l.length > 10) ? 30 : 0 },
          axisLine: { lineStyle: { color: '#374151' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#9CA3AF' },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        series: [
          {
            type: 'bar',
            data: values,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: primaryColor },
                  { offset: 1, color: secondaryColor },
                ],
              },
              borderRadius: [4, 4, 0, 0],
            },
            label: { show: true, position: 'top', color: '#E5E7EB', fontSize: 11 },
            animationDelay: (idx: number) => idx * 100,
          },
        ],
      }

    case 'line':
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: '#9CA3AF' },
          axisLine: { lineStyle: { color: '#374151' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#9CA3AF' },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        series: [
          {
            type: 'line',
            data: values,
            smooth: true,
            lineStyle: { color: primaryColor, width: 3 },
            itemStyle: { color: primaryColor },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: primaryColor + '66' },
                  { offset: 1, color: primaryColor + '00' },
                ],
              },
            },
            symbol: 'circle',
            symbolSize: 8,
          },
          ...(data.some((d) => d.secondaryValue !== undefined)
            ? [
                {
                  type: 'line',
                  data: secondaryValues,
                  smooth: true,
                  lineStyle: { color: secondaryColor, width: 2, type: 'dashed' as const },
                  itemStyle: { color: secondaryColor },
                  symbol: 'circle',
                  symbolSize: 6,
                },
              ]
            : []),
        ],
      }

    case 'pie':
      return {
        ...baseOptions,
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            data: data.map((d, i) => ({
              value: d.value,
              name: d.label,
              itemStyle: {
                color: i === 0 ? primaryColor : i === 1 ? secondaryColor : `hsl(${(i * 60) % 360}, 60%, 50%)`,
              },
            })),
            label: {
              color: '#E5E7EB',
              formatter: '{b}: {d}%',
            },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
              scale: true,
              scaleSize: 5,
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
          },
        ],
      }

    case 'radar':
      return {
        ...baseOptions,
        radar: {
          indicator: data.map((d) => ({
            name: d.label,
            max: Math.max(...values, ...secondaryValues) * 1.2 || 100,
          })),
          axisName: { color: '#E5E7EB', fontSize: 11 },
          splitLine: { lineStyle: { color: '#374151' } },
          splitArea: { areaStyle: { color: ['transparent'] } },
          axisLine: { lineStyle: { color: '#374151' } },
        },
        series: [
          {
            type: 'radar',
            data: [
              {
                value: values,
                name: 'Value',
                lineStyle: { color: primaryColor, width: 2 },
                itemStyle: { color: primaryColor },
                areaStyle: { color: primaryColor + '33' },
              },
              ...(data.some((d) => d.secondaryValue !== undefined)
                ? [
                    {
                      value: secondaryValues,
                      name: 'Comparison',
                      lineStyle: { color: secondaryColor, width: 2, type: 'dashed' },
                      itemStyle: { color: secondaryColor },
                      areaStyle: { color: secondaryColor + '22' },
                    },
                  ]
                : []),
            ],
            symbol: 'circle',
            symbolSize: 8,
          },
        ],
      }

    case 'scatter':
      return {
        ...baseOptions,
        xAxis: {
          type: 'value',
          axisLabel: { color: '#9CA3AF' },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#9CA3AF' },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        series: [
          {
            type: 'scatter',
            data: data.map((d) => [d.value, d.secondaryValue ?? d.value]),
            symbolSize: 14,
            itemStyle: { color: primaryColor },
            emphasis: { scale: 1.5 },
          },
        ],
      }

    case 'heatmap':
      return {
        ...baseOptions,
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: '#9CA3AF' },
        },
        yAxis: {
          type: 'category',
          data: ['Value'],
          axisLabel: { color: '#9CA3AF' },
        },
        visualMap: {
          min: Math.min(...values),
          max: Math.max(...values),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          inRange: { color: [secondaryColor, primaryColor] },
          textStyle: { color: '#9CA3AF' },
        },
        series: [
          {
            type: 'heatmap',
            data: data.map((d, i) => [i, 0, d.value]),
            label: { show: true, color: '#fff' },
          },
        ],
      }

    // Legacy types mapped to ECharts equivalents
    case 'player-comparison':
      return {
        ...baseOptions,
        yAxis: {
          type: 'category',
          data: labels,
          axisLabel: { color: '#9CA3AF' },
          axisLine: { lineStyle: { color: '#374151' } },
        },
        xAxis: {
          type: 'value',
          axisLabel: { color: '#9CA3AF' },
          splitLine: { lineStyle: { color: '#374151', type: 'dashed' } },
        },
        legend: {
          data: ['Player 1', 'Player 2'],
          textStyle: { color: '#ccc' },
          top: 0,
        },
        series: [
          {
            name: 'Player 1',
            type: 'bar',
            data: values,
            itemStyle: { color: primaryColor, borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', color: '#E5E7EB', fontSize: 10 },
          },
          {
            name: 'Player 2',
            type: 'bar',
            data: secondaryValues,
            itemStyle: { color: secondaryColor, borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', color: '#E5E7EB', fontSize: 10 },
          },
        ],
      }

    case 'team-stats':
      return buildEChartsOptions({ ...config, type: 'radar' })

    default:
      return baseOptions
  }
}

export default function ChartPreview({ config }: ChartPreviewProps) {
  const { data, size } = config

  const sizeClasses: Record<string, string> = {
    small: 'max-w-xs',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'w-full',
  }

  const heightMap: Record<string, string> = {
    small: '200px',
    medium: '300px',
    large: '380px',
    full: '450px',
  }

  const hasValidData = data.length >= 2 && data.some((d) => d.label && d.value)

  const echartsOptions = useMemo(() => {
    if (!hasValidData) return null
    return buildEChartsOptions(config)
  }, [config, hasValidData])

  if (!hasValidData) {
    return (
      <div className={`${sizeClasses[size]} mx-auto`}>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-12 h-12 text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-zinc-500">Enter data to see preview</p>
            <p className="text-xs text-zinc-600 mt-1">Add at least 2 data points with labels</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto`}>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl">
        <ReactECharts
          option={echartsOptions}
          style={{ height: heightMap[size] || '300px', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge
        />
        <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>Source: SportsMockery Data Lab</span>
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  config.colors.scheme === 'team' && config.colors.team
                    ? teamColors[config.colors.team]?.primary
                    : config.colors.customColors?.[0] || '#bc0000',
              }}
            />
            {config.colors.scheme === 'team' && config.colors.team
              ? teamColors[config.colors.team]?.name || 'Team'
              : 'Custom'}
          </span>
        </div>
      </div>
    </div>
  )
}

export { buildEChartsOptions }
