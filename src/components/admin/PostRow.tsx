'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface PostRowProps {
  post: {
    id: number
    title: string
    slug: string
    status: string
    published_at: string | null
    created_at: string
    views: number
    category?: {
      name: string
      slug: string
    }
    author?: {
      name: string
    }
  }
  isSelected: boolean
  onSelect: (id: number) => void
  onDelete: (id: number) => void
}

export default function PostRow({ post, isSelected, onSelect, onDelete }: PostRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Published
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Draft
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400">
            {status}
          </span>
        )
    }
  }

  const displayDate = post.published_at || post.created_at

  return (
    <tr className="border-b border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      {/* Checkbox */}
      <td className="w-12 px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(post.id)}
          className="h-4 w-4 rounded border-zinc-300 text-[#8B0000] focus:ring-[#8B0000] dark:border-zinc-600"
        />
      </td>

      {/* Title */}
      <td className="px-4 py-4">
        <div>
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="font-medium text-zinc-900 hover:text-[#8B0000] dark:text-white dark:hover:text-[#FF6666]"
          >
            {post.title}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>/{post.slug}</span>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-4">
        {post.category ? (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {post.category.name}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </td>

      {/* Author */}
      <td className="hidden px-4 py-4 lg:table-cell">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {post.author?.name || 'Unknown'}
        </span>
      </td>

      {/* Date */}
      <td className="hidden px-4 py-4 md:table-cell">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-4">{getStatusBadge(post.status)}</td>

      {/* Views */}
      <td className="hidden px-4 py-4 text-right lg:table-cell">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {post.views.toLocaleString()}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
              />
            </svg>
          </Link>
          <Link
            href={`/${post.category?.slug || 'posts'}/${post.slug}`}
            target="_blank"
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="View"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}
