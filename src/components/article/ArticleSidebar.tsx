'use client'

import FeedTeamSidebar from '@/components/homepage/FeedTeamSidebar'

const CATEGORY_TO_TEAM: Record<string, string> = {
  'chicago-bears': 'bears',
  'chicago-bulls': 'bulls',
  'chicago-blackhawks': 'blackhawks',
  'chicago-cubs': 'cubs',
  'chicago-white-sox': 'whitesox',
}

interface ArticleSidebarProps {
  categoryName?: string
  categorySlug?: string
}

export default function ArticleSidebar({ categoryName, categorySlug }: ArticleSidebarProps) {
  const teamKey = categorySlug ? CATEGORY_TO_TEAM[categorySlug] : null

  return (
    <div className="flex flex-col gap-3">
      {/* Team Sidebar — season card, key players, trending */}
      {teamKey && <FeedTeamSidebar selectedTeam={teamKey} />}
    </div>
  )
}
