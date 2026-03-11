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

      {/* Content aligned to middle feed column on desktop, centered on mobile */}
      <div className="mx-auto flex w-full max-w-[1300px] px-6 md:px-0">
        {/* Spacer matching left sidebar width */}
        <div className="hidden md:block md:w-[350px] md:flex-shrink-0" />

        {/* Hero content aligned to feed column */}
        <div className="w-full max-w-[600px] flex flex-col items-start px-4">
          {/* Scout icon + Greeting row */}
          <div className="flex items-center gap-4 mb-4">
            <Image
              src="/downloads/scout-v2.png"
              alt="Scout"
              width={80}
              height={80}
              className="w-[80px] h-[80px] object-contain flex-shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[23px] font-medium leading-tight" style={{ color: 'var(--hp-foreground)', opacity: 0.7 }}>
                Hi {firstName || "there"},
              </span>
              <span className="text-[17px] font-normal leading-snug mt-[3px]" style={{ color: 'var(--hp-foreground)', opacity: 0.6 }}>
                Welcome to SM✶EDGE, our new AI-powered platform.
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="text-[clamp(48px,5vw,72px)] font-bold leading-[1.15] tracking-tight mb-[25px] whitespace-nowrap"
            style={{ color: 'var(--hp-foreground)' }}
          >
            What can I help you with?
          </h1>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="mt-4 md:mt-6 w-full max-w-[540px]">
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
    </div>
  )
}
