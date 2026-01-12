import { format, isAfter, parseISO } from 'date-fns'

interface UpdatedDateProps {
  publishedAt: string
  updatedAt?: string | null
  className?: string
}

export default function UpdatedDate({
  publishedAt,
  updatedAt,
  className = '',
}: UpdatedDateProps) {
  // Only show if updated date exists and is after published date
  if (!updatedAt) return null

  const publishedDate = parseISO(publishedAt)
  const updatedDate = parseISO(updatedAt)

  // Check if update is at least 1 hour after publish
  const oneHourInMs = 60 * 60 * 1000
  const timeDiff = updatedDate.getTime() - publishedDate.getTime()

  if (timeDiff < oneHourInMs) return null

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 ${className}`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
      <span className="font-medium">Updated:</span>
      <time dateTime={updatedAt}>{format(updatedDate, 'MMM d, yyyy')}</time>
    </div>
  )
}
