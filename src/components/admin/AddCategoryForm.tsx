'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddCategoryForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || `Failed (${res.status})`)
        return
      }
      setName('')
      setSlug('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  const suggestSlug = () => {
    if (!name) return
    setSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name && !slug && suggestSlug()}
          placeholder="e.g. Chicago Bears"
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. chicago-bears"
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#BC0000] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Adding…' : 'Add category'}
      </button>
    </form>
  )
}
