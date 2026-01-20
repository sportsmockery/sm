'use client'

import { usePathname } from 'next/navigation'
import TeamStickyBar from './TeamStickyBar'

type TeamKey = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

// Define which URL patterns belong to which team
const TEAM_ROUTES: { pattern: RegExp; teamKey: TeamKey }[] = [
  // Bears pages
  { pattern: /^\/chicago-bears(\/.*)?$/, teamKey: 'bears' },
  { pattern: /^\/bears(\/.*)?$/, teamKey: 'bears' },
  // Bulls pages
  { pattern: /^\/chicago-bulls(\/.*)?$/, teamKey: 'bulls' },
  { pattern: /^\/bulls(\/.*)?$/, teamKey: 'bulls' },
  // Cubs pages
  { pattern: /^\/chicago-cubs(\/.*)?$/, teamKey: 'cubs' },
  { pattern: /^\/cubs(\/.*)?$/, teamKey: 'cubs' },
  // White Sox pages
  { pattern: /^\/chicago-white-sox(\/.*)?$/, teamKey: 'whitesox' },
  { pattern: /^\/white-sox(\/.*)?$/, teamKey: 'whitesox' },
  // Blackhawks pages
  { pattern: /^\/chicago-blackhawks(\/.*)?$/, teamKey: 'blackhawks' },
  { pattern: /^\/blackhawks(\/.*)?$/, teamKey: 'blackhawks' },
]

// Pages where we don't want to show any team bar
const EXCLUDED_ROUTES = [
  /^\/$/,                    // Homepage
  /^\/fan-chat(\/.*)?$/,     // Fan chat
  /^\/ask-ai(\/.*)?$/,       // Ask AI
  /^\/login(\/.*)?$/,        // Login
  /^\/register(\/.*)?$/,     // Register
  /^\/search(\/.*)?$/,       // Search
  /^\/about(\/.*)?$/,        // About
  /^\/contact(\/.*)?$/,      // Contact
  /^\/privacy(\/.*)?$/,      // Privacy
  /^\/terms(\/.*)?$/,        // Terms
]

interface TeamStickyBarRouterProps {
  className?: string
}

export default function TeamStickyBarRouter({ className }: TeamStickyBarRouterProps) {
  const pathname = usePathname()

  if (!pathname) return null

  // Check if we're on an excluded route
  for (const pattern of EXCLUDED_ROUTES) {
    if (pattern.test(pathname)) {
      return null
    }
  }

  // Detect which team page we're on
  let detectedTeam: TeamKey | null = null

  for (const { pattern, teamKey } of TEAM_ROUTES) {
    if (pattern.test(pathname)) {
      detectedTeam = teamKey
      break
    }
  }

  // If we found a team from the URL, show that team's bar
  if (detectedTeam) {
    return <TeamStickyBar teamKey={detectedTeam} className={className} />
  }

  // For article pages (e.g., /chicago-bears/article-slug), detect team from category
  // The pathname structure is typically /category-slug/article-slug
  const pathParts = pathname.split('/').filter(Boolean)

  if (pathParts.length >= 1) {
    const categorySlug = pathParts[0].toLowerCase()

    // Map category slugs to teams
    if (categorySlug.includes('bear')) {
      return <TeamStickyBar teamKey="bears" className={className} isArticlePage={pathParts.length >= 2} />
    }
    if (categorySlug.includes('bull')) {
      return <TeamStickyBar teamKey="bulls" className={className} isArticlePage={pathParts.length >= 2} />
    }
    if (categorySlug.includes('cub')) {
      return <TeamStickyBar teamKey="cubs" className={className} isArticlePage={pathParts.length >= 2} />
    }
    if (categorySlug.includes('white') || categorySlug.includes('sox')) {
      return <TeamStickyBar teamKey="whitesox" className={className} isArticlePage={pathParts.length >= 2} />
    }
    if (categorySlug.includes('hawk') || categorySlug.includes('blackhawk')) {
      return <TeamStickyBar teamKey="blackhawks" className={className} isArticlePage={pathParts.length >= 2} />
    }
  }

  // No team detected - don't show any bar
  return null
}
