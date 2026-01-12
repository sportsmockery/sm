'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface NFTItem {
  id: string
  name: string
  image: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  price?: string
  team: string
}

interface NFTShowcaseProps {
  items?: NFTItem[]
  title?: string
}

const defaultItems: NFTItem[] = [
  {
    id: '1',
    name: 'Bears Victory #1985',
    image: '/images/nft/bears-victory.jpg',
    rarity: 'legendary',
    price: '2.5 ETH',
    team: 'Bears',
  },
  {
    id: '2',
    name: 'Bulls Dynasty Era',
    image: '/images/nft/bulls-dynasty.jpg',
    rarity: 'epic',
    price: '1.2 ETH',
    team: 'Bulls',
  },
  {
    id: '3',
    name: 'Cubs 2016 Moment',
    image: '/images/nft/cubs-2016.jpg',
    rarity: 'legendary',
    price: '3.0 ETH',
    team: 'Cubs',
  },
  {
    id: '4',
    name: 'Sox Classic Play',
    image: '/images/nft/sox-classic.jpg',
    rarity: 'rare',
    price: '0.8 ETH',
    team: 'White Sox',
  },
]

const rarityStyles = {
  common: {
    border: 'border-zinc-500',
    badge: 'bg-zinc-500/20 text-zinc-400',
    glow: 'shadow-zinc-500/20',
  },
  rare: {
    border: 'border-blue-500',
    badge: 'bg-blue-500/20 text-blue-400',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    border: 'border-purple-500',
    badge: 'bg-purple-500/20 text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    border: 'border-amber-500',
    badge: 'bg-amber-500/20 text-amber-400',
    glow: 'shadow-amber-500/30',
  },
}

export default function NFTShowcase({
  items = defaultItems,
  title = 'Digital Collectibles',
}: NFTShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-pink-950/20 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-zinc-500">NFT Collection</p>
          </div>
        </div>

        <Link
          href="/collectibles"
          className="text-xs font-semibold text-pink-400 transition-colors hover:text-pink-300"
        >
          View All
        </Link>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const styles = rarityStyles[item.rarity]
          const isHovered = hoveredId === item.id

          return (
            <Link
              key={item.id}
              href={`/collectibles/${item.id}`}
              className={`group relative overflow-hidden rounded-xl border-2 ${styles.border} bg-zinc-800/50 transition-all duration-300 hover:scale-[1.02] ${isHovered ? `shadow-xl ${styles.glow}` : ''}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image placeholder */}
              <div className="relative aspect-square overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800">
                  {/* Placeholder pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%)] bg-[size:8px_8px]" />

                  {/* NFT icon placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                </div>

                {/* Rarity badge */}
                <div className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                  {item.rarity}
                </div>

                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-black/50 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="flex h-full items-center justify-center">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      View Details
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {item.team}
                </p>
                <h4 className="mb-1 truncate text-sm font-bold text-white">{item.name}</h4>
                {item.price && (
                  <p className="text-xs font-semibold text-pink-400">{item.price}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Coming Soon Banner */}
      <div className="mt-4 rounded-lg bg-pink-500/10 p-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
          </span>
          <p className="text-xs font-medium text-pink-300">
            NFT Marketplace Coming Soon
          </p>
        </div>
      </div>
    </div>
  )
}
