'use client'

import { useEffect, useState, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { motion, useInView } from 'framer-motion'

interface ChartEmbedProps {
  id?: string
  config?: Record<string, unknown>
  className?: string
}

export default function ChartEmbed({ id, config: propConfig, className = '' }: ChartEmbedProps) {
  const [options, setOptions] = useState<Record<string, unknown> | null>(propConfig || null)
  const [title, setTitle] = useState<string>('')
  const [loading, setLoading] = useState(!propConfig && !!id)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (id && !propConfig) {
      let cancelled = false
      setLoading(true)
      fetch(`/api/charts/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Chart not found')
          return res.json()
        })
        .then((data) => {
          if (!cancelled) {
            setOptions(data.options)
            setTitle(data.title || '')
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
      return () => { cancelled = true }
    }
  }, [id, propConfig])

  if (loading) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error || !options) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm">{error || 'Chart not available'}</p>
        </div>
      </div>
    )
  }

  const seo = (options as Record<string, unknown>).seo as Record<string, unknown> | undefined
  const seoSchema = seo?.schema ? JSON.stringify(seo.schema) : null

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}

      <div className="h-80">
        <ReactECharts
          option={{
            ...options,
            backgroundColor: 'transparent',
          }}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'svg' }}
          notMerge
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Data visualized by Sports Mockery
        </span>
        {seo?.alt ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {String(seo.alt)}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-purple-500">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Interactive Chart
        </span>
      </div>

      {seoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSchema }}
        />
      )}
    </motion.figure>
  )
}
