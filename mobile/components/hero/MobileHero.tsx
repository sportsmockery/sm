import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TrendingHero } from './TrendingHero'
import { StoryUniverseHero } from './StoryUniverseHero'
import { ScoutLiveHero } from './ScoutLiveHero'
import { GameDayHero } from './GameDayHero'
import { TeamPulseHero } from './TeamPulseHero'
import { DebateHero } from './DebateHero'
import { ScoutBriefingHero } from './ScoutBriefingHero'

// ─── Types ───────────────────────────────────────────────────────────────────

export type HeroMode =
  | 'trending'
  | 'story_universe'
  | 'scout_live'
  | 'game_day'
  | 'team_pulse'
  | 'debate'
  | 'scout_briefing'

export interface TrendingHeroData {
  mode: 'trending'
  imageUrl: string
  headline: string
  category: 'BREAKING' | 'RUMOR' | 'ANALYSIS'
  teamLogo?: string
  articleId: string
}

export interface StoryUniverseHeroData {
  mode: 'story_universe'
  mainStory: { imageUrl: string; headline: string; articleId: string }
  relatedStories: { headline: string; articleId: string }[]
}

export interface ScoutLiveHeroData {
  mode: 'scout_live'
  signals: { icon: string; text: string }[]
}

export interface GameDayHeroData {
  mode: 'game_day'
  homeTeam: { name: string; logo: string; score?: number }
  awayTeam: { name: string; logo: string; score?: number }
  isLive: boolean
  gameTime?: string
  storyline?: string
}

export interface TeamPulseHeroData {
  mode: 'team_pulse'
  teamName: string
  teamKey: string
  topics: string[]
}

export interface DebateHeroData {
  mode: 'debate'
  question: string
  sideA: { label: string; percentage: number }
  sideB: { label: string; percentage: number }
  participantCount: number
  debateId: string
}

export interface ScoutBriefingHeroData {
  mode: 'scout_briefing'
  quickActions?: string[]
}

export type HeroData =
  | TrendingHeroData
  | StoryUniverseHeroData
  | ScoutLiveHeroData
  | GameDayHeroData
  | TeamPulseHeroData
  | DebateHeroData
  | ScoutBriefingHeroData

interface MobileHeroProps {
  heroData: HeroData | null
}

// ─── Controller ──────────────────────────────────────────────────────────────

export function MobileHero({ heroData }: MobileHeroProps) {
  if (!heroData) {
    return <ScoutBriefingHero data={{ mode: 'scout_briefing' }} />
  }

  switch (heroData.mode) {
    case 'trending':
      return <TrendingHero data={heroData} />
    case 'story_universe':
      return <StoryUniverseHero data={heroData} />
    case 'scout_live':
      return <ScoutLiveHero data={heroData} />
    case 'game_day':
      return <GameDayHero data={heroData} />
    case 'team_pulse':
      return <TeamPulseHero data={heroData} />
    case 'debate':
      return <DebateHero data={heroData} />
    case 'scout_briefing':
      return <ScoutBriefingHero data={heroData} />
    default:
      return <ScoutBriefingHero data={{ mode: 'scout_briefing' }} />
  }
}
