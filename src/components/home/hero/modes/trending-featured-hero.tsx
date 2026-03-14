"use client"

import Image from "next/image"
import { HeroShell, HeroCta } from "../hero-shell"
import type { FeaturedStory } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Trending Article Featured Hero                                     */
/*  Full-width featured-image takeover. Highest-priority hero mode.    */
/*                                                                     */
/*  Uses the article's featured image as the hero background with a    */
/*  dark overlay for readability. Content sits left-of-center.         */
/* ------------------------------------------------------------------ */

interface TrendingFeaturedHeroProps {
  story: FeaturedStory
  logo?: ReactNode
}

export function TrendingFeaturedHero({ story, logo }: TrendingFeaturedHeroProps) {
  return (
    <HeroShell
      logo={logo}
      height="cinematic"
      forceLight
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
            {/* Dark overlay — stronger left for text readability */}
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
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start text-left lg:max-w-4xl">
        {/* Eyebrow row */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(188, 0, 0, 0.15)",
              color: "#FAFAFB",
              border: "1px solid rgba(188, 0, 0, 0.3)",
            }}
          >
            <span
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full animate-pulse"
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
            fontSize: "clamp(28px, 4.5vw, 56px)",
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

        {/* Meta row — publishedLabel + optional view count */}
        {(story.publishedLabel || story.views > 0) && (
          <div className="mt-4 flex items-center gap-3">
            {story.publishedLabel && (
              <span className="text-sm" style={{ color: "rgba(250, 250, 251, 0.5)" }}>
                {story.publishedLabel}
              </span>
            )}
            {story.views > 0 && (
              <>
                {story.publishedLabel && (
                  <span style={{ color: "rgba(250, 250, 251, 0.25)" }}>·</span>
                )}
                <span className="text-sm" style={{ color: "rgba(250, 250, 251, 0.5)" }}>
                  {formatViews(story.views)} views
                </span>
              </>
            )}
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

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return String(views)
}
