'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  currentCategory?: string
}

export default function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`/admin/posts?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-[var(--text-muted)]">Category:</label>
      <select
        value={currentCategory || 'all'}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
      >
        <option value="all">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
    </div>
  )
}
