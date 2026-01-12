'use client'

import Link from 'next/link'
import { useState } from 'react'
import DeleteConfirmModal from './DeleteConfirmModal'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  post_count?: number
  parent_id?: string
}

interface CategoriesTableProps {
  categories: Category[]
  onDelete: (id: string) => Promise<void>
}

export default function CategoriesTable({ categories, onDelete }: CategoriesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categoryToDelete = categories.find(c => c.id === deleteId)

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await onDelete(deleteId)
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setDeleting(false)
    }
  }

  // Build hierarchy
  const getChildren = (parentId?: string) => {
    return categories.filter(c => c.parent_id === parentId)
  }

  const renderRow = (category: Category, level = 0): React.ReactNode => {
    const children = getChildren(category.id)
    const indent = level * 24

    return (
      <>
        <tr key={category.id} className="hover:bg-gray-700/50 transition-colors">
          <td className="px-6 py-4">
            <div className="flex items-center" style={{ paddingLeft: indent }}>
              {level > 0 && (
                <span className="text-gray-600 mr-2">└</span>
              )}
              <Link
                href={`/admin/categories/${category.id}`}
                className="text-white hover:text-blue-400 font-medium"
              >
                {category.name}
              </Link>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className="text-gray-400 text-sm font-mono">{category.slug}</span>
          </td>
          <td className="px-6 py-4">
            <span className="text-gray-300">{category.post_count || 0}</span>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/categories/${category.id}`}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                onClick={() => setDeleteId(category.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        {children.map(child => renderRow(child, level + 1))}
      </>
    )
  }

  const rootCategories = getChildren(undefined)

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rootCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No categories found
                </td>
              </tr>
            ) : (
              rootCategories.map(category => renderRow(category))
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        title="Delete Category"
        itemName={categoryToDelete?.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </>
  )
}
