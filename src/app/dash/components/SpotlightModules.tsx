'use client'

import type { HomepageData } from '../types'
import { TeamLogo } from '../shared/TeamLogo'

interface SpotlightProps {
  spotlight: HomepageData['spotlight']
}

export function SpotlightModules({ spotlight }: SpotlightProps) {
  if (!spotlight.data_card && !spotlight.trending_take) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Data Card */}
      {spotlight.data_card && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#222222] aspect-[9/16] max-h-[400px]">
          <img
            src={spotlight.data_card.image_url}
            alt={spotlight.data_card.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase text-white/80 bg-white/20">
              {spotlight.data_card.card_type.replace('_', ' ')}
            </span>
            <p className="mt-2 text-sm font-medium text-white">{spotlight.data_card.chicago_take}</p>
          </div>
        </div>
      )}

      {/* Trending Take */}
      {spotlight.trending_take && (
        <div className="rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Trending</span>
              <span className="px-2 py-0.5 rounded-full text-[13px] capitalize" style={{ backgroundColor: '#BC000020', color: '#BC0000' }}>
                {spotlight.trending_take.emotion}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0B0F14] dark:text-[#FAFAFB] mb-2">{spotlight.trending_take.headline}</h3>
            <p className="text-sm text-gray-600 dark:text-[#888888]">{spotlight.trending_take.hook}</p>
          </div>
          <div className="mt-4">
            <a
              href={`/ask-ai?q=${encodeURIComponent(spotlight.trending_take.headline)}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: '#00D4FF' }}
            >
              Discuss with Scout
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
