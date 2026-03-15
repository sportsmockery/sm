'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string }

type Props = {
  category: { id: string; name: string; postCount: number }
  otherCategories: Category[]
}

export default function CategoryDeleteButton({ category, otherCategories }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reassignToId, setReassignToId] = useState<string>(otherCategories[0]?.id ?? '')
  const [confirmDeletePosts, setConfirmDeletePosts] = useState(false)

  const hasPosts = category.postCount > 0

  const handleDelete = async (body?: { reassignToCategoryId?: string; deletePosts?: boolean }) => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || `Failed (${res.status})`)
        return
      }
      setOpen(false)
      setConfirmDeletePosts(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTrashClick = () => {
    setError(null)
    setReassignToId(otherCategories[0]?.id ?? '')
    setConfirmDeletePosts(false)
    if (!hasPosts) {
      if (window.confirm(`Delete category "${category.name}"?`)) {
        handleDelete()
      }
      return
    }
    setOpen(true)
  }

  const handleModalReassign = () => {
    if (!reassignToId) {
      setError('Select a category to move posts to.')
      return
    }
    handleDelete({ reassignToCategoryId: reassignToId })
  }

  const handleModalDeletePosts = () => {
    if (!confirmDeletePosts) {
      setError('Check the box to confirm you want to permanently delete all posts.')
      return
    }
    handleDelete({ deletePosts: true })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTrashClick}
        disabled={loading}
        className="rounded-lg p-2 text-[var(--text-muted)] transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(188,0,0,0.1)'; e.currentTarget.style.color = '#BC0000'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        title="Delete category"
        aria-label="Delete category"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>

      {open && hasPosts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
          onClick={() => { setOpen(false); setError(null); setConfirmDeletePosts(false); }}
        >
          <div
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-category-title" className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Delete &quot;{category.name}&quot;?
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              This category has <strong>{category.postCount}</strong> post{category.postCount !== 1 ? 's' : ''}. Choose what to do with them:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
                  Move posts to another category, then delete
                </label>
                <div className="flex gap-2">
                  <select
                    value={reassignToId}
                    onChange={(e) => setReassignToId(e.target.value)}
                    className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-default)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  >
                    {otherCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleModalReassign}
                    disabled={loading || !reassignToId}
                    className="rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#00D4FF', color: '#0B0F14' }}
                  >
                    Move & delete
                  </button>
                </div>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmDeletePosts}
                    onChange={(e) => setConfirmDeletePosts(e.target.checked)}
                    className="rounded border-[var(--border-default)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    Permanently delete all {category.postCount} post{category.postCount !== 1 ? 's' : ''} and this category
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleModalDeletePosts}
                  disabled={loading || !confirmDeletePosts}
                  className="mt-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#BC0000', color: '#FAFAFB' }}
                >
                  Delete posts & category
                </button>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(null); setConfirmDeletePosts(false); }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
