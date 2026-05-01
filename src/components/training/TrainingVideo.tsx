'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

export function TrainingVideo({
  title,
  videoSrc,
  poster,
  duration,
  fallbackText = 'Video coming soon',
}: {
  title: string
  videoSrc: string
  poster?: string
  duration: string
  fallbackText?: string
}) {
  const [errored, setErrored] = useState(false)
  const [posterErrored, setPosterErrored] = useState(false)

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
      <div className="relative aspect-video bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
        {!errored ? (
          <video
            className="h-full w-full object-cover"
            controls
            poster={posterErrored ? undefined : poster}
            preload="metadata"
            onError={() => setErrored(true)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <BrandedPlaceholder
            title={title}
            duration={duration}
            posterAttempt={posterErrored ? undefined : poster}
            onPosterError={() => setPosterErrored(true)}
            fallbackText={fallbackText}
          />
        )}

        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          EDGE Training
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div className="rounded-xl bg-black/40 px-3 py-2 backdrop-blur">
            <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
            <p className="text-xs text-zinc-300 sm:text-sm">{duration}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandedPlaceholder({
  title,
  duration,
  posterAttempt,
  onPosterError,
  fallbackText,
}: {
  title: string
  duration: string
  posterAttempt?: string
  onPosterError: () => void
  fallbackText: string
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {posterAttempt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterAttempt}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          onError={onPosterError}
        />
      ) : null}

      <ChicagoStarMotif />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10">
          <Play className="h-7 w-7 text-cyan-300" fill="currentColor" />
        </div>
        <p className="text-sm text-zinc-300">{fallbackText}</p>
        <p className="text-xs text-zinc-500">
          {title} · {duration}
        </p>
      </div>
    </div>
  )
}

function ChicagoStarMotif() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className="absolute inset-0 m-auto h-2/3 w-auto opacity-10"
    >
      <defs>
        <linearGradient id="edge-star" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bc0000" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <polygon
        fill="url(#edge-star)"
        points="100,10 117,68 178,68 128,104 147,164 100,128 53,164 72,104 22,68 83,68"
      />
    </svg>
  )
}
