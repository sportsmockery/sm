import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LOYALTY_KEY = 'sm_loyalty_data'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string | null
}

interface LoyaltyData {
  streak: number
  lastVisitDate: string | null
  totalVisits: number
  articlesRead: number
  pollsVoted: number
  tradesGraded: number
  scoutQueries: number
  badges: Badge[]
}

const DEFAULT_BADGES: Badge[] = [
  { id: 'first_take', name: 'First Take', description: 'Cast your first vote', icon: 'hand-left', earnedAt: null },
  { id: 'streak_3', name: 'Daily Streak 3', description: 'Visit 3 days in a row', icon: 'flame', earnedAt: null },
  { id: 'streak_7', name: 'Weekly Warrior', description: 'Visit 7 days in a row', icon: 'flame', earnedAt: null },
  { id: 'scout_explorer', name: 'Scout Explorer', description: 'Ask Scout 10 questions', icon: 'search', earnedAt: null },
  { id: 'war_room_gm', name: 'War Room GM', description: 'Complete a trade', icon: 'swap-horizontal', earnedAt: null },
  { id: 'all_chicago', name: 'All-Chicago Fan', description: 'Follow all 5 teams', icon: 'star', earnedAt: null },
  { id: 'news_junkie', name: 'News Junkie', description: 'Read 50 articles', icon: 'newspaper', earnedAt: null },
  { id: 'hot_take', name: 'Hot Take Artist', description: 'Get 50 reactions', icon: 'flame', earnedAt: null },
]

const DEFAULT_DATA: LoyaltyData = {
  streak: 0,
  lastVisitDate: null,
  totalVisits: 0,
  articlesRead: 0,
  pollsVoted: 0,
  tradesGraded: 0,
  scoutQueries: 0,
  badges: DEFAULT_BADGES,
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getMvpLevel(data: LoyaltyData): { level: string; progress: number; nextLevel: string } {
  const score = data.articlesRead * 2 + data.pollsVoted * 5 + data.tradesGraded * 10 + data.scoutQueries * 3 + data.streak * 2
  if (score >= 500) return { level: 'MVP', progress: 1, nextLevel: 'MVP' }
  if (score >= 200) return { level: 'All-Star', progress: (score - 200) / 300, nextLevel: 'MVP' }
  if (score >= 50) return { level: 'Starter', progress: (score - 50) / 150, nextLevel: 'All-Star' }
  return { level: 'Rookie', progress: score / 50, nextLevel: 'Starter' }
}

export function useLoyalty() {
  const [data, setData] = useState<LoyaltyData>(DEFAULT_DATA)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load on mount
  useEffect(() => {
    AsyncStorage.getItem(LOYALTY_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as LoyaltyData
          // Merge with default badges to pick up new badge definitions
          const mergedBadges = DEFAULT_BADGES.map((db) => {
            const existing = parsed.badges?.find((b) => b.id === db.id)
            return existing || db
          })
          setData({ ...DEFAULT_DATA, ...parsed, badges: mergedBadges })
        } catch {
          setData(DEFAULT_DATA)
        }
      }
      setIsLoaded(true)
    })
  }, [])

  // Track daily visit / streak
  useEffect(() => {
    if (!isLoaded) return
    const today = getToday()
    if (data.lastVisitDate === today) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const newStreak = data.lastVisitDate === yesterdayStr ? data.streak + 1 : 1
    const updated: LoyaltyData = {
      ...data,
      streak: newStreak,
      lastVisitDate: today,
      totalVisits: data.totalVisits + 1,
    }

    // Check streak badges
    if (newStreak >= 3) {
      const badge = updated.badges.find((b) => b.id === 'streak_3')
      if (badge && !badge.earnedAt) badge.earnedAt = new Date().toISOString()
    }
    if (newStreak >= 7) {
      const badge = updated.badges.find((b) => b.id === 'streak_7')
      if (badge && !badge.earnedAt) badge.earnedAt = new Date().toISOString()
    }

    save(updated)
  }, [isLoaded])

  const save = useCallback((updated: LoyaltyData) => {
    setData(updated)
    AsyncStorage.setItem(LOYALTY_KEY, JSON.stringify(updated))
  }, [])

  const trackArticleRead = useCallback(() => {
    const updated = { ...data, articlesRead: data.articlesRead + 1 }
    if (updated.articlesRead >= 50) {
      const badge = updated.badges.find((b) => b.id === 'news_junkie')
      if (badge && !badge.earnedAt) badge.earnedAt = new Date().toISOString()
    }
    save(updated)
  }, [data, save])

  const trackPollVote = useCallback(() => {
    const updated = { ...data, pollsVoted: data.pollsVoted + 1 }
    if (updated.pollsVoted >= 1) {
      const badge = updated.badges.find((b) => b.id === 'first_take')
      if (badge && !badge.earnedAt) badge.earnedAt = new Date().toISOString()
    }
    save(updated)
  }, [data, save])

  const trackTrade = useCallback(() => {
    const updated = { ...data, tradesGraded: data.tradesGraded + 1 }
    const badge = updated.badges.find((b) => b.id === 'war_room_gm')
    if (badge && !badge.earnedAt) badge.earnedAt = new Date().toISOString()
    save(updated)
  }, [data, save])

  const trackScoutQuery = useCallback(() => {
    const updated = { ...data, scoutQueries: data.scoutQueries + 1 }
    if (updated.scoutQueries >= 10) {
      const badge = updated.badges.find((b) => b.id === 'scout_explorer')
      if (badge && !badge.earnedAt) badge.earnedAt = new Date().toISOString()
    }
    save(updated)
  }, [data, save])

  const mvp = getMvpLevel(data)
  const earnedBadges = data.badges.filter((b) => b.earnedAt)

  return {
    ...data,
    mvpLevel: mvp.level,
    mvpProgress: mvp.progress,
    mvpNextLevel: mvp.nextLevel,
    earnedBadges,
    earnedCount: earnedBadges.length,
    totalBadges: data.badges.length,
    isLoaded,
    trackArticleRead,
    trackPollVote,
    trackTrade,
    trackScoutQuery,
  }
}
