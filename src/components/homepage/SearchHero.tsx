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
          {/* Scout icon + Greeting */}
          <div className="flex items-end gap-3 mb-4">
            <Image
              src="/downloads/scout-v2.png"
              alt="Scout"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
            <span style={{ fontSize: 22, fontWeight: 500, color: 'var(--hp-foreground)', opacity: 0.65, paddingBottom: 4 }}>
              Hi {firstName || "there"},
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-left mb-10"
            style={{
              fontSize: 'clamp(30px, 4vw, 40px)',
              fontWeight: 700,
              color: 'var(--hp-foreground)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            What&apos;s up Chicago fans?
          </h1>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="w-full max-w-[540px]">
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
    </div>
  )
}
