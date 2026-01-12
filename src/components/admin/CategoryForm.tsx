'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
}

interface CategoryFormProps {
  initialData?: Partial<Category>
  categories: Category[]
  onSave: (data: Partial<Category>) => Promise<void>
  saving: boolean
}

export default function CategoryForm({
  initialData,
  categories,
  onSave,
  saving
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [parentId, setParentId] = useState(initialData?.parent_id || '')
  const [autoSlug, setAutoSlug] = useState(!initialData?.slug)

  useEffect(() => {
    if (autoSlug && name) {
      const newSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setSlug(newSlug)
    }
  }, [name, autoSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      name,
      slug,
      description,
      parent_id: parentId || undefined
    })
  }

  // Filter out current category and its descendants from parent options
  const availableParents = initialData?.id
    ? categories.filter(c => c.id !== initialData.id)
    : categories

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder="Category name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Slug <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setAutoSlug(false)
            }}
            required
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="category-slug"
          />
          <button
            type="button"
            onClick={() => setAutoSlug(true)}
            className="px-3 py-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Auto
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          URL: /category/{slug || 'slug'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Optional description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Parent Category
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">None (top-level)</option>
          {availableParents.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name || !slug}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : initialData?.id ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}
