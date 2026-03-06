'use client'

import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'

type ChartEmbedMode = 'dark' | 'light'

interface ChartEmbedProps {
  id: string
  mode: ChartEmbedMode
  className?: string
}

interface ChartApiResponse {
  id: string
  options: any
  created_at?: string
  updated_at?: string
}

export default function ChartEmbed({ id, mode, className = '' }: ChartEmbedProps) {
  const [chart, setChart] = useState<ChartApiResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchChart() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/charts/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Chart not found')
          }
          throw new Error('Failed to load chart')
        }

        const data: ChartApiResponse = await res.json()
        if (!cancelled) {
          setChart(data)
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load chart')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchChart()

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className={`my-8 ${className}`}>
        <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="h-5 w-40 mb-3 bg-zinc-800 rounded" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    )
  }

  if (error || !chart || !chart.options) {
    return (
      <div className={`my-8 ${className}`}>
        <div className="rounded-xl border border-red-500/40 bg-red-950/60 px-4 py-3 text-sm text-red-200">
          {error || 'Chart could not be loaded.'}
        </div>
      </div>
    )
  }

  const baseOptions = chart.options || {}
  const seo = baseOptions.seo || {}

  const themeOptions = {
    ...baseOptions,
    backgroundColor: mode === 'dark' ? '#000000' : '#ffffff',
  }

  const seoSchema = seo.schema ? JSON.stringify(seo.schema) : null

  return (
    <figure className={`my-8 ${className}`}>
      <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black">
        <ReactECharts
          option={themeOptions}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge
        />
      </div>

      {seo.alt && (
        <figcaption className="mt-2 text-sm text-zinc-400 text-center">
          {seo.alt}
        </figcaption>
      )}

      {seoSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: seoSchema }}
        />
      )}
    </figure>
  )
}

