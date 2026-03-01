'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { HubItem } from '@/types/hub'

interface Post {
  id: number | string
  title: string
  slug: string
  categorySlug?: string
  featuredImage?: string | null
  publishedAt: string
  author?: { displayName: string } | null
}

interface DraftTrackerTabsProps {
  hubItems: HubItem[]
  displayPosts: Post[]
}

const TABS = [
  { key: 'mock-draft', label: 'Mock Draft' },
  { key: 'prospects', label: 'Prospects' },
  { key: 'news', label: 'News' },
  { key: 'trade-value', label: 'Trade Value' },
] as const

type TabKey = (typeof TABS)[number]['key']

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DraftTrackerTabs({ hubItems, displayPosts }: DraftTrackerTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const paramTab = searchParams.get('tab') as TabKey | null
  const [activeTab, setActiveTab] = useState<TabKey>(
    paramTab && TABS.some(t => t.key === paramTab) ? paramTab : 'mock-draft'
  )

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      {/* Tab Bar */}
      <div className="draft-tab-group" style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`draft-tab${activeTab === tab.key ? ' active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mock Draft Tab */}
      {activeTab === 'mock-draft' && (
        <div
          className="glass-card glass-card-static"
          style={{
            marginBottom: '32px',
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(11,22,42,0.4), rgba(206,17,65,0.1))',
            borderColor: 'rgba(206,17,65,0.2)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2
                style={{
                  fontFamily: "Barlow, sans-serif",
                  color: 'var(--sm-text)',
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 6px 0',
                }}
              >
                Build Your Bulls Mock Draft
              </h2>
              <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: 0 }}>
                Use our interactive mock draft tool to build your ideal Bulls draft board.
              </p>
            </div>
            <Link
              href="/mock-draft"
              className="btn btn-md btn-primary"
              style={{
                textDecoration: 'none',
                borderRadius: 'var(--sm-radius-pill)',
                flexShrink: 0,
              }}
            >
              Launch Mock Draft
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ marginLeft: '6px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Prospects Tab */}
      {activeTab === 'prospects' && (
        <section style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: "Barlow, sans-serif",
              color: 'var(--sm-text)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              paddingBottom: '8px',
              borderBottom: '3px solid var(--sm-red)',
              margin: '0 0 20px 0',
            }}
          >
            2026 Draft Needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { position: 'PG', priority: 'High', note: 'Floor general' },
              { position: 'Wing', priority: 'High', note: '3&D presence' },
              { position: 'Center', priority: 'Medium', note: 'Rim protection' },
              { position: '3&D', priority: 'Medium', note: 'Spacing & defense' },
              { position: 'Combo Guard', priority: 'Medium', note: 'Scoring punch' },
              { position: 'Bench Scoring', priority: 'Low', note: 'Second unit spark' },
            ].map((need) => (
              <div
                key={need.position}
                className="glass-card glass-card-sm glass-card-static"
                style={{ padding: '14px 16px', textAlign: 'center' }}
              >
                <div
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--sm-text)',
                    marginBottom: '4px',
                  }}
                >
                  {need.position}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color:
                      need.priority === 'High'
                        ? 'var(--sm-red-light)'
                        : need.priority === 'Medium'
                          ? 'var(--sm-warning, #f59e0b)'
                          : 'var(--sm-text-dim)',
                    marginBottom: '2px',
                  }}
                >
                  {need.priority} Priority
                </div>
                <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>{need.note}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* News Tab */}
      {activeTab === 'news' && (
        <>
          {/* Hub Items */}
          {hubItems.length > 0 && (
            <section style={{ marginBottom: '28px' }}>
              <h2
                style={{
                  fontFamily: "Barlow, sans-serif",
                  color: 'var(--sm-text)',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  paddingBottom: '8px',
                  borderBottom: '3px solid var(--sm-red)',
                  marginBottom: '16px',
                  marginTop: 0,
                }}
              >
                Draft Intel
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {hubItems.map((item) => (
                  <div key={item.id} className="glass-card glass-card-sm" style={{ position: 'relative' }}>
                    {item.featured && (
                      <span style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '14px', color: '#f59e0b' }} title="Pinned">
                        &#9733;
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 500 }}>
                        {relativeTime(item.timestamp)}
                      </span>
                      {item.source_name && (
                        <>
                          <span style={{ fontSize: '10px', color: 'var(--sm-text-muted)' }}>&middot;</span>
                          {item.source_url ? (
                            <a href={item.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#bc0000', textDecoration: 'none', fontWeight: 500 }}>
                              {item.source_name}
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 500 }}>{item.source_name}</span>
                          )}
                        </>
                      )}
                    </div>
                    <h3 style={{ fontFamily: "Barlow, sans-serif", fontSize: '15px', fontWeight: 600, color: 'var(--sm-text)', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                      {item.headline}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', margin: '0 0 8px 0', lineHeight: 1.5 }}>{item.summary}</p>
                    <div style={{ borderTop: '1px solid var(--sm-border, rgba(255,255,255,0.08))', paddingTop: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#bc0000' }}>What it means</span>
                      <p style={{ fontSize: '13px', color: 'var(--sm-text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>{item.what_it_means}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Article List */}
          <section>
            <h2
              style={{
                fontFamily: "Barlow, sans-serif",
                color: 'var(--sm-text)',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                paddingBottom: '8px',
                borderBottom: '3px solid var(--sm-red)',
                margin: '0 0 20px 0',
              }}
            >
              Latest Draft News
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayPosts.map((post) => {
                const href = post.categorySlug ? `/${post.categorySlug}/${post.slug}` : `/chicago-bulls/${post.slug}`
                return (
                  <Link key={post.id} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                    <article className="glass-card glass-card-sm" style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
                      {post.featuredImage && (
                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--sm-radius-sm)', overflow: 'hidden' }}>
                          <Image src={post.featuredImage} alt="" fill style={{ objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "Barlow, sans-serif", color: 'var(--sm-text)', fontSize: '15px', fontWeight: 600, lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
                          <span>{post.author?.displayName || 'Staff'}</span>
                          <span>-</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </section>
        </>
      )}

      {/* Trade Value Tab */}
      {activeTab === 'trade-value' && (
        <div
          className="glass-card glass-card-static"
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <h2
            style={{
              fontFamily: "Barlow, sans-serif",
              color: 'var(--sm-text)',
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}
          >
            Trade Value Chart
          </h2>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: 0 }}>
            Coming soon — interactive draft pick trade value calculator.
          </p>
        </div>
      )}
    </>
  )
}
