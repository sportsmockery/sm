'use client'

import { trackPulseEvent } from '@/app/dash3/lib/pulseAnalytics'

interface FeedPulseTagProps {
  team?: string
}

export function FeedPulseTag({ team }: FeedPulseTagProps) {
  return (
    <a
      href="/dash3"
      onClick={(e) => {
        e.stopPropagation()
        trackPulseEvent('feed_tag_tap', { team })
      }}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide active:scale-[0.95] transition-transform"
      style={{ backgroundColor: '#00D4FF15', color: '#00D4FF' }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
      Pulse
    </a>
  )
}
