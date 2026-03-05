import { NextResponse } from 'next/server'
import type { EChartsOption } from 'echarts'

interface TemplateOption {
  id: string
  name: string
  options: EChartsOption
}

export async function GET() {
  // For now we return a small, curated set of built-in templates.
  // These can be moved to Supabase-backed storage later if needed.
  const templates: TemplateOption[] = [
    {
      id: 'bears-weekly-points',
      name: 'Bears Weekly Points (Bar)',
      options: {
        title: { text: 'Bears Weekly Points' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'bar',
            data: [21, 17, 31, 24],
            itemStyle: { color: '#bc0000' },
          },
        ],
      },
    },
    {
      id: 'bulls-scoring-trend',
      name: 'Bulls Scoring Trend (Line)',
      options: {
        title: { text: 'Bulls Last 5 Games Points' },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['G1', 'G2', 'G3', 'G4', 'G5'],
        },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'line',
            data: [108, 115, 99, 122, 110],
            smooth: true,
            itemStyle: { color: '#3b82f6' },
          },
        ],
      },
    },
    {
      id: 'win-loss-share',
      name: 'Season Record (Pie)',
      options: {
        title: { text: 'Season Record' },
        tooltip: { trigger: 'item' },
        series: [
          {
            name: 'Record',
            type: 'pie',
            radius: '60%',
            data: [
              { value: 11, name: 'Wins' },
              { value: 6, name: 'Losses' },
            ],
            itemStyle: {
              color: '#22c55e',
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      },
    },
  ]

  return NextResponse.json(templates)
}

