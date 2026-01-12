'use client'

interface PublishPanelProps {
  status: string
  publishDate: string | null
  visibility: string
  onStatusChange: (status: string) => void
  onPublishDateChange: (date: string | null) => void
  onVisibilityChange: (visibility: string) => void
  onPublish: () => void
  onSaveDraft: () => void
  isLoading?: boolean
  isNew?: boolean
}

export default function PublishPanel({
  status,
  publishDate,
  visibility,
  onStatusChange,
  onPublishDateChange,
  onVisibilityChange,
  onPublish,
  onSaveDraft,
  isLoading = false,
  isNew = true,
}: PublishPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <span className="font-medium text-zinc-900 dark:text-white">Publish</span>
      </div>
      <div className="space-y-4 p-4">
        {/* Status */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>

        {/* Visibility */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="password">Password Protected</option>
          </select>
        </div>

        {/* Publish Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Publish Date
          </label>
          <input
            type="datetime-local"
            value={publishDate || ''}
            onChange={(e) => onPublishDateChange(e.target.value || null)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-zinc-500">Leave empty to publish immediately</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onSaveDraft}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            {isLoading ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={onPublish}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-medium text-white hover:bg-[#a00000] disabled:opacity-50"
          >
            {isLoading ? 'Publishing...' : isNew ? 'Publish' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}
