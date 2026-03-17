"use client"

import Image from "next/image"
import { HeroShell, HeroCta } from "../hero-shell"
import type { StoryUniverseContext } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Story Universe Hero                                                */
/*                                                                     */
/*  Cinematic hero showcasing an editor-curated story cluster.         */
/*  Main story fills the left with background image; two related       */
/*  stories sit in a stacked sidebar on the right.                     */
/* ------------------------------------------------------------------ */

interface StoryUniverseHeroProps {
  context: StoryUniverseContext
  logo?: ReactNode
}

export function StoryUniverseHero({ context, logo }: StoryUniverseHeroProps) {
  const { mainStory, relatedStories } = context

  return (
    <HeroShell
      logo={logo}
      height="cinematic"
      forceLight
      ariaLabel={`Story Universe: ${mainStory.title}`}
      background={
        <>
          <div className="absolute inset-0">
            <Image
              src={mainStory.imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Dark overlay — strong left for text, lighter right for cards */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(11,15,20,0.92) 0%, rgba(11,15,20,0.78) 45%, rgba(11,15,20,0.6) 100%)",
              }}
            />
            {/* Bottom fade */}
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        {/* Left — Main Story */}
        <div className="flex-1 min-w-0">
          {/* Eyebrow */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(188, 0, 0, 0.15)",
                color: "#FAFAFB",
                border: "1px solid rgba(188, 0, 0, 0.3)",
              }}
            >
              Story Universe
            </span>

            {mainStory.team && (
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  color: "rgba(250, 250, 251, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {mainStory.team}
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="font-bold uppercase tracking-tight"
            style={{
              color: "#FAFAFB",
              fontSize: "clamp(28px, 4.5vw, 52px)",
              lineHeight: 1.1,
            }}
          >
            {mainStory.title}
          </h1>

          {/* Dek */}
          {mainStory.dek && (
            <p
              className="mt-4 max-w-xl text-base sm:text-lg"
              style={{ color: "rgba(250, 250, 251, 0.75)", lineHeight: 1.5 }}
            >
              {mainStory.dek}
            </p>
          )}

          {/* CTA */}
          <div className="mt-8">
            <HeroCta href={mainStory.href}>Read Main Story</HeroCta>
          </div>
        </div>

        {/* Right — Related Stories sidebar */}
        <div className="flex w-full flex-col gap-4 lg:w-[340px] lg:flex-shrink-0">
          {relatedStories.map((story, idx) => (
            <a
              key={story.id}
              href={story.href}
              className="group block rounded-2xl p-4 transition-all duration-200"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
              }}
            >
              {story.label && (
                <span
                  className="mb-2 inline-block text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: idx === 0 ? "#00D4FF" : "#D6B05E" }}
                >
                  {story.label}
                </span>
              )}
              <h3
                className="font-medium leading-snug"
                style={{
                  color: "#FAFAFB",
                  fontSize: "15px",
                }}
              >
                {story.title}
              </h3>
              {story.dek && (
                <p
                  className="mt-1.5 line-clamp-2 text-sm"
                  style={{ color: "rgba(250, 250, 251, 0.6)" }}
                >
                  {story.dek}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </HeroShell>
  )
}
