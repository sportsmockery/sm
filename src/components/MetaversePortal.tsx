'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function MetaversePortal() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href="/metaverse"
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Floating orbs */}
      <div
        className={`absolute -left-10 top-1/2 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl transition-transform duration-700 ${
          isHovered ? 'translate-x-8 scale-125' : ''
        }`}
      />
      <div
        className={`absolute -right-10 top-1/4 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl transition-transform duration-500 ${
          isHovered ? '-translate-x-8 scale-125' : ''
        }`}
      />

      {/* Content */}
      <div className="relative p-6 sm:p-8">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-400">Coming Soon</span>
        </div>

        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25 transition-transform duration-300 group-hover:scale-110">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-black text-white sm:text-2xl">
          Virtual Stadium Tour
        </h3>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-purple-200/80">
          Step into the metaverse and experience Chicago&apos;s legendary stadiums like never before.
          Walk the tunnels, explore the locker rooms, and feel the energy of game day.
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-semibold text-white transition-colors group-hover:text-purple-300">
          <span>Explore the Metaverse</span>
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>

        {/* VR headset decorative element */}
        <div className="absolute bottom-4 right-4 opacity-20 transition-opacity group-hover:opacity-40">
          <svg className="h-24 w-24 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.5 6h-17A2.5 2.5 0 001 8.5v7A2.5 2.5 0 003.5 18h17a2.5 2.5 0 002.5-2.5v-7A2.5 2.5 0 0020.5 6zM12 15a3 3 0 110-6 3 3 0 010 6zm-6 0a3 3 0 110-6 3 3 0 010 6zm12 0a3 3 0 110-6 3 3 0 010 6z" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
