'use client'

/**
 * AI-Generated Highlights Component
 *
 * HOW USERS FIND AND USE THIS FEATURE:
 * ====================================
 * 1. Discovery: Users navigate to team pages (e.g., /chicago-bears)
 *    - This component appears in the right sidebar automatically
 *    - No search or user input needed - it's always visible on load
 *
 * 2. Automatic Generation:
 *    - On page load, AI (Claude) dynamically creates 3-5 highlights
 *    - Content includes: charts, stats data, memes, witty commentary
 *    - Data pulled from real-time sources (Supabase/ESPN API)
 *
 * 3. User Experience Flow:
 *    - Visit team page → highlights load instantly
 *    - Tap/click item → expands to full view
 *    - Refresh page → new highlights generate from latest data
 *    - Mobile: Stacked below main feed
 *    - Desktop: Sidebar card with red accent
 *
 * 4. Appeal to Chicago Fans:
 *    - "Your Daily Chicago Mockery Fix – AI Knows the Heartbreak!"
 *    - Geo-detection for local insights (e.g., Tinley Park Special)
 */

import { useState, useEffect, useRef } from 'react'
import { Montserrat } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

// Highlight types
type HighlightType = 'chart' | 'data' | 'meme' | 'commentary' | 'video_highlight'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
  }[]
  chartType: 'line' | 'bar'
}

interface VideoHighlightData {
  video_url: string
  overlay_text: string
  credit: string
  duration_seconds: number
}

interface Highlight {
  id: string
  type: HighlightType
  title: string
  content: string | ChartData | VideoHighlightData
  shareText?: string
  timestamp: string
}

interface AIHighlightsProps {
  teamSlug: string
  teamName: string
  className?: string
}

// Team-specific configuration
const TEAM_CONFIG: Record<string, {
  name: string
  primaryColor: string
  accentColor: string
  mockeryTagline: string
}> = {
  'chicago-bears': {
    name: 'Bears',
    primaryColor: '#0B162A',
    accentColor: '#C83803',
    mockeryTagline: 'Bears Heartbreak Update',
  },
  'chicago-bulls': {
    name: 'Bulls',
    primaryColor: '#CE1141',
    accentColor: '#000000',
    mockeryTagline: 'Bulls Rebuild Watch',
  },
  'chicago-blackhawks': {
    name: 'Blackhawks',
    primaryColor: '#CF0A2C',
    accentColor: '#000000',
    mockeryTagline: 'Hawks Hope Meter',
  },
  'chicago-cubs': {
    name: 'Cubs',
    primaryColor: '#0E3386',
    accentColor: '#CC3433',
    mockeryTagline: 'Cubs Curse Update',
  },
  'chicago-white-sox': {
    name: 'White Sox',
    primaryColor: '#27251F',
    accentColor: '#C4CED4',
    mockeryTagline: 'Sox Sadness Index',
  },
}

export default function AIHighlights({ teamSlug, teamName, className = '' }: AIHighlightsProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [localInsight, setLocalInsight] = useState<string | null>(null)

  const teamConfig = TEAM_CONFIG[teamSlug] || TEAM_CONFIG['chicago-bears']

  // Fetch AI-generated highlights on mount
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/generate-highlights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamSlug }),
        })

        if (!res.ok) throw new Error('Failed to generate highlights')

        const data = await res.json()
        setHighlights(data.highlights || [])
      } catch (err) {
        console.error('AI Highlights error:', err)
        setError('Unable to load AI highlights')
        // Use fallback mock data
        setHighlights(getMockHighlights(teamSlug, teamConfig))
      } finally {
        setLoading(false)
      }
    }

    fetchHighlights()
  }, [teamSlug, teamConfig])

  // Geo-detection for local insights (Tinley Park, etc.)
  useEffect(() => {
    if ('geolocation' in navigator) {
      // In production, use actual geo-detection
      // For now, simulate with a random local insight
      const localInsights = [
        'Tinley Park Special: Local Bears bar reactions included!',
        'South Side Update: Sox fans unite in sorrow',
        'Wrigleyville Watch: Cubs faithful remain hopeful',
      ]
      setLocalInsight(localInsights[Math.floor(Math.random() * localInsights.length)])
    }
  }, [])

  const handleShare = (highlight: Highlight) => {
    const text = highlight.shareText || `${highlight.title} - ${teamConfig.mockeryTagline}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&via=sportsmockery`
    window.open(url, '_blank', 'width=550,height=420')
  }

  if (loading) {
    return (
      <div className={`bg-[var(--sm-card)] border border-[var(--sm-border)] rounded-lg overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-red-600 bg-gradient-to-r from-red-600 to-red-700">
          <h3 className={`text-white text-lg ${montserrat.className}`}>
            AI-Generated Mockery Highlights
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--sm-surface)] rounded w-3/4 mb-2" />
              <div className="h-20 bg-[var(--sm-surface)] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && highlights.length === 0) {
    return (
      <div className={`bg-[var(--sm-card)] border border-[var(--sm-border)] rounded-lg overflow-hidden ${className}`}>
        <div className="px-4 py-3 border-b border-red-600">
          <h3 className={`text-[var(--sm-text)] text-lg ${montserrat.className}`}>
            AI Highlights
          </h3>
        </div>
        <div className="p-4 text-center text-zinc-500">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <section
      className={`bg-[var(--sm-card)] border border-[var(--sm-border)] rounded-lg overflow-hidden ${className}`}
      aria-labelledby="ai-highlights-title"
    >
      {/* Header with red accent */}
      <header className="px-4 py-3 border-b border-red-600 bg-gradient-to-r from-red-600 to-red-700">
        <h3
          id="ai-highlights-title"
          className={`text-white text-lg flex items-center gap-2 ${montserrat.className}`}
        >
          <span className="text-xl">🤖</span>
          AI-Generated Mockery Highlights
        </h3>
        <p className="text-red-100 text-xs mt-1">
          Your Daily Chicago Mockery Fix – AI Knows the Heartbreak!
        </p>
      </header>

      {/* Local insight banner */}
      {localInsight && (
        <div className="px-4 py-2 bg-[var(--sm-surface)] border-b border-[var(--sm-border)]">
          <p className="text-xs text-[var(--sm-text-muted)] flex items-center gap-1">
            <span>📍</span>
            {localInsight}
          </p>
        </div>
      )}

      {/* Highlights list */}
      <div className="divide-y divide-[var(--sm-border)]">
        <AnimatePresence>
          {highlights.map((highlight, index) => (
            <HighlightItem
              key={highlight.id}
              highlight={highlight}
              index={index}
              isExpanded={expandedId === highlight.id}
              onToggle={() => setExpandedId(expandedId === highlight.id ? null : highlight.id)}
              onShare={() => handleShare(highlight)}
              teamConfig={teamConfig}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 bg-[var(--sm-surface)] border-t border-[var(--sm-border)]">
        <p className="text-xs text-zinc-500 text-center">
          Generated by AI • Updates every hour • {teamConfig.mockeryTagline}
        </p>
        <p className="text-[10px] text-zinc-400 text-center mt-1">
          Video clips used under fair use for transformative commentary.
          All footage from official league channels. © respective owners.
        </p>
      </footer>
    </section>
  )
}

// Individual highlight item
function HighlightItem({
  highlight,
  index,
  isExpanded,
  onToggle,
  onShare,
  teamConfig,
}: {
  highlight: Highlight
  index: number
  isExpanded: boolean
  onToggle: () => void
  onShare: () => void
  teamConfig: typeof TEAM_CONFIG[string]
}) {
  const getTypeIcon = (type: HighlightType): string => {
    switch (type) {
      case 'chart': return '📊'
      case 'data': return '📈'
      case 'meme': return '😂'
      case 'commentary': return '💬'
      case 'video_highlight': return '🎬'
      default: return '📌'
    }
  }

  const getTypeLabel = (type: HighlightType): string => {
    switch (type) {
      case 'chart': return 'Chart'
      case 'data': return 'Stats'
      case 'meme': return 'Meme'
      case 'commentary': return 'Take'
      case 'video_highlight': return 'Clip'
      default: return 'Highlight'
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      {/* Clickable header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600"
        aria-expanded={isExpanded}
      >
        {/* Type icon */}
        <span className="text-lg flex-shrink-0">{getTypeIcon(highlight.type)}</span>

        {/* Content preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
              style={{ backgroundColor: teamConfig.primaryColor, color: 'white' }}
            >
              {getTypeLabel(highlight.type)}
            </span>
            <time className="text-[10px] text-zinc-500">
              {formatTime(highlight.timestamp)}
            </time>
          </div>
          <h4 className={`text-sm font-medium text-[var(--sm-text)] line-clamp-2 ${montserrat.className}`}>
            {highlight.title}
          </h4>
        </div>

        {/* Expand indicator */}
        <svg
          className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <HighlightContent highlight={highlight} teamConfig={teamConfig} />

              {/* Share button */}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onShare()
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share to X
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

// Render highlight content based on type
function HighlightContent({
  highlight,
  teamConfig,
}: {
  highlight: Highlight
  teamConfig: typeof TEAM_CONFIG[string]
}) {
  switch (highlight.type) {
    case 'chart':
      return <ChartHighlight data={highlight.content as ChartData} teamConfig={teamConfig} />
    case 'data':
      return <DataHighlight content={highlight.content as string} />
    case 'meme':
      return <MemeHighlight content={highlight.content as string} title={highlight.title} />
    case 'commentary':
      return <CommentaryHighlight content={highlight.content as string} />
    case 'video_highlight':
      return <VideoHighlight data={highlight.content as VideoHighlightData} title={highlight.title} />
    default:
      return <p className="text-[var(--sm-text-muted)]">{String(highlight.content)}</p>
  }
}

// Chart highlight with Chart.js
function ChartHighlight({
  data,
  teamConfig,
}: {
  data: ChartData
  teamConfig: typeof TEAM_CONFIG[string]
}) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 10 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.1)' },
      },
      x: {
        grid: { display: false },
      },
    },
  }

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      borderColor: ds.borderColor || teamConfig.primaryColor,
      backgroundColor: ds.backgroundColor || `${teamConfig.primaryColor}40`,
    })),
  }

  return (
    <div className="h-48 bg-[var(--sm-surface)] rounded-lg p-2">
      {data.chartType === 'bar' ? (
        <Bar data={chartData} options={chartOptions} />
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  )
}

// Data/stats highlight
function DataHighlight({ content }: { content: string }) {
  return (
    <div className="bg-[var(--sm-surface)] rounded-lg p-4">
      <p className={`text-2xl font-bold text-[var(--sm-text)] ${montserrat.className}`}>
        {content}
      </p>
    </div>
  )
}

// Meme highlight (placeholder)
function MemeHighlight({ content, title }: { content: string; title: string }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4 text-center">
      {/* Placeholder for AI-generated meme image */}
      <div className="aspect-square max-w-[200px] mx-auto bg-zinc-700 rounded-lg flex items-center justify-center mb-3">
        <div className="text-center text-zinc-400">
          <span className="text-4xl">😂</span>
          <p className="text-xs mt-2">AI Meme</p>
        </div>
      </div>
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-zinc-400 text-xs mt-1">{content}</p>
    </div>
  )
}

// Commentary highlight
function CommentaryHighlight({ content }: { content: string }) {
  return (
    <blockquote className="border-l-4 border-red-600 pl-4 py-2 bg-[var(--sm-surface)] rounded-r-lg">
      <p className="italic font-serif" style={{ color: 'var(--sm-text-muted)' }}>
        "{content}"
      </p>
      <footer className="text-xs text-zinc-500 mt-2">— AI Mockery Bot</footer>
    </blockquote>
  )
}

// Video highlight with safe YouTube embed
function VideoHighlight({ data, title }: { data: VideoHighlightData; title: string }) {
  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const videoId = getYouTubeId(data.video_url)

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden">
      {/* Video embed container */}
      <div className="relative aspect-video">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <p className="text-zinc-400 text-sm">Video unavailable</p>
          </div>
        )}

        {/* Mockery overlay text */}
        {data.overlay_text && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none">
            <p className={`text-white text-sm font-bold drop-shadow-lg ${montserrat.className}`}>
              {data.overlay_text}
            </p>
          </div>
        )}
      </div>

      {/* Credit and duration */}
      <div className="px-3 py-2 flex items-center justify-between text-xs">
        <span className="text-zinc-500">
          {data.credit}
        </span>
        {data.duration_seconds && (
          <span className="text-zinc-600">
            {data.duration_seconds}s clip
          </span>
        )}
      </div>

      {/* Fair use disclaimer */}
      <div className="px-3 pb-2">
        <p className="text-[10px] text-zinc-600 leading-tight">
          Fair Use: Short clip for transformative commentary. Full video on official channel.
        </p>
      </div>
    </div>
  )
}

// Helper functions
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// Mock data fallback
function getMockHighlights(teamSlug: string, teamConfig: typeof TEAM_CONFIG[string]): Highlight[] {
  const now = new Date().toISOString()

  return [
    {
      id: '1',
      type: 'chart',
      title: `${teamConfig.name} Win Probability Trend`,
      content: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [{
          label: 'Win %',
          data: [65, 58, 45, 52, 48],
          fill: true,
        }],
        chartType: 'line',
      } as ChartData,
      shareText: `${teamConfig.name} win probability trending... check it out!`,
      timestamp: now,
    },
    {
      id: '2',
      type: 'data',
      title: 'Key Stat Alert',
      content: `${teamConfig.name} Win Probability: 48%`,
      shareText: `${teamConfig.name} at 48% win probability. The AI has spoken!`,
      timestamp: now,
    },
    {
      id: '3',
      type: 'meme',
      title: `${teamConfig.name} Flop Meme`,
      content: `When the ${teamConfig.name} look promising in Q1 but collapse by Q4...`,
      shareText: `This ${teamConfig.name} meme hits different 😂`,
      timestamp: now,
    },
    {
      id: '4',
      type: 'commentary',
      title: teamConfig.mockeryTagline,
      content: `Another day, another ${teamConfig.name} fan asking "why do we do this to ourselves?" The AI empathizes, truly.`,
      shareText: `${teamConfig.mockeryTagline}: Still alive! @sportsmockery`,
      timestamp: now,
    },
  ]
}
