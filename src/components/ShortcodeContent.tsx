'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { splitContentByShortcodes, ContentSegment } from '@/lib/shortcodes'
import PollEmbed from '@/components/polls/PollEmbed'

const ChartEmbed = dynamic(() => import('@/components/charts/ChartEmbed'), {
  ssr: false,
  loading: () => <div style={{ height: 300, background: 'var(--sm-surface)', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />,
})

interface ShortcodeContentProps {
  html: string
  className?: string
}

/**
 * Renders HTML content with embedded charts and polls
 * Parses shortcodes like [chart:123] and [poll:456] and replaces them with components
 */
export default function ShortcodeContent({ html, className = '' }: ShortcodeContentProps) {
  const segments = useMemo(() => splitContentByShortcodes(html), [html])

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'html':
            return (
              <div
                key={index}
                dangerouslySetInnerHTML={{ __html: segment.content }}
              />
            )
          case 'chart':
            return (
              <div key={index} className="my-8">
                <ChartEmbed id={segment.content} />
              </div>
            )
          case 'poll':
            return (
              <div key={index} className="my-8">
                <PollEmbed id={segment.content} />
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
