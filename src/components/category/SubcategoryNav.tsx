'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SubcategoryNavProps {
  categorySlug: string
  className?: string
}

type SubcategoryTab = 'all' | 'news' | 'rumors' | 'analysis' | 'opinion'

const subcategories: { value: SubcategoryTab; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📰' },
  { value: 'news', label: 'News', icon: '🔔' },
  { value: 'rumors', label: 'Rumors', icon: '👀' },
  { value: 'analysis', label: 'Analysis', icon: '📊' },
  { value: 'opinion', label: 'Opinion', icon: '💭' },
]

export default function SubcategoryNav({
  categorySlug,
  className = '',
}: SubcategoryNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<SubcategoryTab>(
    (searchParams.get('type') as SubcategoryTab) || 'all'
  )

  const handleTabChange = (tab: SubcategoryTab) => {
    setActiveTab(tab)

    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'all') {
      params.delete('type')
    } else {
      params.set('type', tab)
    }
    params.delete('page') // Reset to page 1 when changing tabs

    const queryString = params.toString()
    router.push(`/${categorySlug}${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <nav className={`overflow-x-auto ${className}`}>
      <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {subcategories.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-white text-[#8B0000] shadow-sm dark:bg-zinc-700 dark:text-[#FF6666]'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
