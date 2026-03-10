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
    <div className="relative flex flex-col items-center justify-center h-screen w-full px-6">
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

      <div className="flex flex-col items-start w-full max-w-[480px]">
        {/* Scout head + Greeting side by side */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <span style={{ fontSize: 26, fontWeight: 500, color: 'var(--hp-foreground)', opacity: 0.7 }}>
            Hi {firstName || "there"},
          </span>
        </div>

        {/* Large headline - centered */}
        <h1
          className="text-left mb-10"
          style={{
            fontSize: 'clamp(32px, 4.5vw, 42px)',
            fontWeight: 700,
            color: 'var(--hp-foreground)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          What&apos;s up Chicago fans?
        </h1>

        {/* Search / Ask box - centered with red border and glow */}
        <form onSubmit={handleSubmit} className="w-full max-w-[480px] mx-auto mt-4">
          <div
            style={{
              boxShadow: "0 0 12px rgba(188, 0, 0, 0.25), 0 0 24px rgba(188, 0, 0, 0.12)",
              borderRadius: "0.5rem",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Scout Anything..."
              style={{
                width: '100%',
                height: 48,
                padding: '0 16px',
                borderRadius: '0.5rem',
                background: 'var(--hp-card)',
                border: '1px solid rgba(188, 0, 0, 0.5)',
                color: 'var(--hp-foreground)',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
        </form>
      </div>
    </div>
  )
}
