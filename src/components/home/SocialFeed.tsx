'use client'

import { useState } from 'react'
import GlassCard from '@/components/ui/GlassCard'

interface SocialPost {
  id: string
  platform: 'twitter' | 'instagram' | 'facebook'
  author: string
  handle: string
  avatar?: string
  content: string
  timestamp: string
  likes: number
  comments: number
  shares?: number
}

const samplePosts: SocialPost[] = [
  {
    id: '1',
    platform: 'twitter',
    author: 'SportsMockery',
    handle: '@SportsMockery',
    content: 'Breaking: Bears QB just threw the most beautiful pass we\'ve seen all season. Too bad it was to the other team. 🐻💀 #DaBears',
    timestamp: '2h ago',
    likes: 2345,
    comments: 187,
    shares: 412,
  },
  {
    id: '2',
    platform: 'twitter',
    author: 'SportsMockery',
    handle: '@SportsMockery',
    content: 'Bulls looking spicy tonight! LaVine dropping buckets like it\'s nothing. 🔥🏀 #BullsNation',
    timestamp: '4h ago',
    likes: 1823,
    comments: 94,
    shares: 256,
  },
  {
    id: '3',
    platform: 'instagram',
    author: 'SportsMockery',
    handle: '@sportsmockery',
    content: 'The energy at Wrigley last night was ELECTRIC ⚡️ Cubs fans showing up and showing out! #GoCubsGo',
    timestamp: '6h ago',
    likes: 4521,
    comments: 312,
  },
  {
    id: '4',
    platform: 'twitter',
    author: 'SportsMockery',
    handle: '@SportsMockery',
    content: 'Blackhawks rookie making defenders look silly out there. Future star alert! 🏒 #Blackhawks',
    timestamp: '8h ago',
    likes: 1456,
    comments: 78,
    shares: 189,
  },
]

const PlatformIcon = ({ platform }: { platform: SocialPost['platform'] }) => {
  if (platform === 'twitter') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }
  if (platform === 'instagram') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

interface SocialFeedProps {
  posts?: SocialPost[]
  className?: string
}

export default function SocialFeed({ posts = samplePosts, className = '' }: SocialFeedProps) {
  const [filter, setFilter] = useState<'all' | 'twitter' | 'instagram' | 'facebook'>('all')

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.platform === filter)

  return (
    <section className={className}>
      <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
            <svg
              className="h-5 w-5"
              style={{ color: '#8B0000' }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            Social Feed
          </h3>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(['all', 'twitter', 'instagram'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  filter === tab
                    ? 'bg-[#8B0000] text-white'
                    : ''
                }`}
                style={filter !== tab ? { color: 'var(--sm-text-muted)' } : undefined}
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <GlassCard key={post.id} className="p-4">
              {/* Post header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8B0000] to-red-600 text-white">
                    <span className="text-xs font-bold">SM</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
                      {post.author}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                      {post.handle}
                    </p>
                  </div>
                </div>
                <div style={post.platform === 'twitter' ? { color: 'var(--sm-text)' } : undefined} className={`${
                  post.platform === 'twitter' ? '' :
                  post.platform === 'instagram' ? 'text-pink-500' : 'text-blue-600'
                }`}>
                  <PlatformIcon platform={post.platform} />
                </div>
              </div>

              {/* Post content */}
              <p className="mb-3 text-sm" style={{ color: 'var(--sm-text)' }}>
                {post.content}
              </p>

              {/* Post meta */}
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                    {post.comments}
                  </span>
                  {post.shares && (
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                      {post.shares}
                    </span>
                  )}
                </div>
                <span>{post.timestamp}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* View more link */}
        <a
          href="https://twitter.com/SportsMockery"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors"
          style={{ border: '1px solid var(--sm-border)', color: 'var(--sm-text-muted)' }}
        >
          Follow Us
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </section>
  )
}
