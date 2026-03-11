"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SearchHeroProps {
  firstName?: string
}

export default function SearchHero({ firstName }: SearchHeroProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/ask-ai?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="relative flex flex-col justify-center h-screen w-full">
      {/* EDGE Logo - top left */}
      <div className="absolute top-6 left-8">
        <Image
          src="/edge_logo.png"
          alt="EDGE"
          width={140}
          height={40}
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Centered hero content */}
      <div className="mx-auto w-full max-w-[600px] flex flex-col items-center px-6 text-center">
        {/* Scout identity pill */}
        <div
          className="inline-flex items-center gap-3 rounded-full px-5 py-2 mb-5"
          style={{
            background: 'var(--hp-card)',
            border: '1px solid var(--hp-border, rgba(0,0,0,0.08))',
          }}
        >
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout"
            width={36}
            height={36}
            className="w-9 h-9 object-contain flex-shrink-0"
          />
          <span className="text-[15px] font-medium" style={{ color: 'var(--hp-foreground)', opacity: 0.7 }}>
            Hi {firstName || "there"}, welcome to SM✶EDGE
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(48px,5vw,72px)] font-bold leading-[1.1] tracking-tight mb-6"
          style={{ color: 'var(--hp-foreground)' }}
        >
          What can I help{"\u00A0"}you&nbsp;with?
        </h1>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="w-full max-w-[540px]">
          <div
            className="rounded-lg motion-telemetry"
            style={{
              boxShadow: "0 0 10px rgba(188, 0, 0, 0.2), 0 0 20px rgba(188, 0, 0, 0.08)",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Scout Anything..."
              className="w-full h-[50px] px-4 rounded-lg text-[14px] outline-none transition-colors"
              style={{
                background: 'var(--hp-card)',
                border: '1px solid rgba(188, 0, 0, 0.4)',
                color: 'var(--hp-foreground)',
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
