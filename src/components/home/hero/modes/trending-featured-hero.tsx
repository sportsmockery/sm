"use client"

import Image from "next/image"
import { HeroShell, HeroCta } from "../hero-shell"
import type { FeaturedStory } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Trending Article Featured Hero                                     */
/*  Full-width featured-image takeover. Highest-priority hero mode.    */
/* ------------------------------------------------------------------ */

interface TrendingFeaturedHeroProps {
  story: FeaturedStory
  logo?: ReactNode
}

export function TrendingFeaturedHero({ story, logo }: TrendingFeaturedHeroProps) {
  return (
    <HeroShell
      logo={logo}
      ariaLabel={`Featured: ${story.title}`}
      background={
        <>
          {/* Full-bleed background image */}
          <div className="absolute inset-0">
            <Image
              src={story.imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Dark overlay for readability */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(11,15,20,0.88) 0%, rgba(11,15,20,0.72) 50%, rgba(11,15,20,0.45) 100%)",
              }}
            />
            {/* Bottom fade to blend into feed */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32"
              style={{
                background: "linear-gradient(to top, var(--hp-background), transparent)",
              }}
            />
          </div>
        </>
      }
    >
      <div className="mx-auto flex max-w-2xl flex-col items-start text-left md:items-start md:max-w-3xl">
        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(188, 0, 0, 0.15)",
              color: "#FAFAFB",
              border: "1px solid rgba(188, 0, 0, 0.3)",
            }}
          >
            <span
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#BC0000" }}
            />
            Trending Now
          </span>

          {story.team && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "rgba(250, 250, 251, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {story.team}
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="font-bold tracking-tight"
          style={{
            color: "#FAFAFB",
            fontSize: "clamp(32px, 4.5vw, 56px)",
            lineHeight: 1.1,
          }}
        >
          {story.title}
        </h1>

        {/* Dek */}
        {story.dek && (
          <p
            className="mt-4 max-w-xl text-base sm:text-lg"
            style={{ color: "rgba(250, 250, 251, 0.75)", lineHeight: 1.5 }}
          >
            {story.dek}
          </p>
        )}

        {/* Meta row */}
        {story.publishedLabel && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm" style={{ color: "rgba(250, 250, 251, 0.5)" }}>
              {story.publishedLabel}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8">
          <HeroCta href={story.href}>Read Now</HeroCta>
        </div>
      </div>
    </HeroShell>
  )
}
