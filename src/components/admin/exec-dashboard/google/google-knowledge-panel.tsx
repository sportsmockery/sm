'use client'

import React from 'react'
import type { GoogleTabPayload } from '@/lib/google/types'
import { SourceTypeBadge } from './google-overview-cards'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E' }

// Static catalog of rule families with the public guidance they're aligned to.
// This panel is the "what is this scoring you and why" surface; keep wording
// neutral and never claim to reproduce Google's algorithm.
const FAMILIES: Array<{
  family: string
  label: string
  weight: number
  sourceType: string
  guidance: string
  signals: string[]
}> = [
  { family: 'search_essentials', label: 'Search Essentials', weight: 25, sourceType: 'official-policy',
    guidance: 'Aligned to Google Search Essentials: descriptive titles/headings, alt text, descriptive link text, and crawlable internal links.',
    signals: ['Title length & descriptiveness', 'Meta description length', 'Image alt text coverage', 'Internal link presence'] },
  { family: 'google_news', label: 'Google News Readiness', weight: 20, sourceType: 'official-policy',
    guidance: 'Aligned to Google News transparency expectations: visible byline, dates, author/contact information, and NewsArticle schema.',
    signals: ['Real-name byline', 'Published & updated dates', 'Author transparency surface', 'NewsArticle JSON-LD'] },
  { family: 'trust_eeat', label: 'Trust / E-E-A-T', weight: 15, sourceType: 'internal-heuristic',
    guidance: 'Internal heuristic aligned to Google\'s helpful, reliable, people-first content guidance and E-E-A-T signals.',
    signals: ['Author bio length', 'Author tenure', 'First-hand reporting markers'] },
  { family: 'spam_policy', label: 'Spam Policy Safety', weight: 15, sourceType: 'official-policy',
    guidance: 'Aligned to Google Search spam policies: avoid thin content, keyword stuffing, and misleading headlines.',
    signals: ['Body word count', 'Keyword density', 'Misleading headline patterns'] },
  { family: 'technical_indexability', label: 'Technical Indexability', weight: 15, sourceType: 'official-policy',
    guidance: 'Aligned to Google Search Essentials technical requirements: indexable, canonicalized, descriptive URLs.',
    signals: ['Canonical URL', 'Robots meta', 'URL slug descriptiveness'] },
  { family: 'sportsmockery_opportunity', label: 'SportsMockery Opportunity', weight: 10, sourceType: 'sportsmockery-opportunity',
    guidance: 'Internal SM opportunity signal — does this article match SM\'s editorial strengths (Chicago entities, evergreen angles).',
    signals: ['Chicago team / entity reference', 'Evergreen angle (draft, cap, history, simulator)'] },
]

export function GoogleKnowledgePanel({ data }: { data: GoogleTabPayload }) {
  return (
    <div className="rounded-lg border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Knowledge Panel</h3>
        <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>ruleset {data.rulesetVersion}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
        {FAMILIES.map((f) => (
          <div key={f.family} className="rounded-lg border p-3" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-sm" style={{ color: 'var(--sm-text)' }}>{f.label}</h4>
              <SourceTypeBadge sourceType={f.sourceType} />
            </div>
            <p className="text-[11px] mt-1 tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>weight {f.weight} pts</p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--sm-text-muted)' }}>{f.guidance}</p>
            <ul className="mt-2 text-[12px] space-y-1" style={{ color: 'var(--sm-text)' }}>
              {f.signals.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full" style={{ background: C.cyan }} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <p className="text-[11px] italic" style={{ color: 'var(--sm-text-dim)' }}>
          This is an internal model aligned to Google\'s public guidance. It does not reproduce Google\'s ranking algorithm or guarantee SERP outcomes.
        </p>
      </div>
    </div>
  )
}
