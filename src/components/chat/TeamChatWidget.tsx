'use client'

import { ChatProvider } from '@/contexts/ChatContext'
import FloatingChatButton from './FloatingChatButton'
import TeamChatPanel from './TeamChatPanel'

interface TeamChatWidgetProps {
  categorySlug: string
  categoryName?: string
  articleId?: string
}

// Map category slugs to team slugs
function getTeamSlug(categorySlug: string): string {
  const slug = categorySlug.toLowerCase()

  if (slug.includes('bears') || slug === 'nfl') return 'bears'
  if (slug.includes('cubs')) return 'cubs'
  if (slug.includes('white-sox') || slug.includes('whitesox') || slug.includes('sox')) return 'white-sox'
  if (slug.includes('bulls') || slug === 'nba') return 'bulls'
  if (slug.includes('blackhawks') || slug.includes('hawks') || slug === 'nhl') return 'blackhawks'
  if (slug.includes('fire') || slug === 'mls') return 'fire'
  if (slug.includes('sky') || slug === 'wnba') return 'sky'

  // Default to Bears for general Chicago sports
  return 'bears'
}

function getTeamName(teamSlug: string): string {
  const names: Record<string, string> = {
    bears: 'Bears',
    cubs: 'Cubs',
    'white-sox': 'White Sox',
    bulls: 'Bulls',
    blackhawks: 'Blackhawks',
    fire: 'Fire',
    sky: 'Sky',
  }
  return names[teamSlug] || 'Bears'
}

export default function TeamChatWidget({ categorySlug }: TeamChatWidgetProps) {
  const teamSlug = getTeamSlug(categorySlug)
  const teamName = getTeamName(teamSlug)

  return (
    <ChatProvider teamSlug={teamSlug}>
      <FloatingChatButton teamSlug={teamSlug} teamName={teamName} />
      <TeamChatPanel teamSlug={teamSlug} teamName={teamName} />
    </ChatProvider>
  )
}
