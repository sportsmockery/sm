'use client'

import { useState } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  parent_id?: number | null
}

interface CategorySelectorProps {
  categories: Category[]
  selectedId: number | null
  onSelect: (id: number | null) => void
}

export default function CategorySelector({ categories, selectedId, onSelect }: CategorySelectorProps) {
  const [showAddNew, setShowAddNew] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Build tree structure
  const buildCategoryTree = (cats: Category[], parentId: number | null = null): Category[] => {
    return cats
      .filter((cat) => (cat.parent_id || null) === parentId)
      .map((cat) => ({
        ...cat,
        children: buildCategoryTree(cats, cat.id),
      }))
  }

  const rootCategories = categories.filter((cat) => !cat.parent_id)
  const getCategoryChildren = (parentId: number) => categories.filter((cat) => cat.parent_id === parentId)

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }),
      })

      if (response.ok) {
        const newCategory = await response.json()
        onSelect(newCategory.id)
        setNewCategoryName('')
        setShowAddNew(false)
        // Trigger a refresh - in real implementation, would update categories list
      }
    } catch (error) {
      console.error('Failed to create category:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const renderCategoryOption = (category: Category, level: number = 0) => {
    const children = getCategoryChildren(category.id)
    return (
      <div key={category.id}>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <input
            type="radio"
            name="category"
            checked={selectedId === category.id}
            onChange={() => onSelect(category.id)}
            className="h-4 w-4 border-zinc-300 text-[#8B0000] focus:ring-[#8B0000] dark:border-zinc-600"
          />
          <span
            className="text-sm text-zinc-900 dark:text-white"
            style={{ paddingLeft: `${level * 16}px` }}
          >
            {level > 0 && <span className="mr-1 text-zinc-400">—</span>}
            {category.name}
          </span>
        </label>
        {children.map((child) => renderCategoryOption(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Category List */}
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {/* No category option */}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <input
            type="radio"
            name="category"
            checked={selectedId === null}
            onChange={() => onSelect(null)}
            className="h-4 w-4 border-zinc-300 text-[#8B0000] focus:ring-[#8B0000] dark:border-zinc-600"
          />
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Uncategorized</span>
        </label>

        {rootCategories.map((category) => renderCategoryOption(category))}
      </div>

      {/* Add New Category */}
      {showAddNew ? (
        <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCategory()
              if (e.key === 'Escape') setShowAddNew(false)
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateCategory}
              disabled={isCreating || !newCategoryName.trim()}
              className="flex-1 rounded-lg bg-[#8B0000] px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAddNew(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddNew(true)}
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Category
        </button>
      )}
    </div>
  )
}
