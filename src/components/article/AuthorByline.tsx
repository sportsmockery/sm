import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface Author {
  id: string
  name: string
  avatarUrl?: string
}

interface AuthorBylineProps {
  author: Author
  date?: string
  additionalAuthors?: number
  size?: 'sm' | 'md' | 'lg'
  showAvatar?: boolean
  className?: string
}

const sizeClasses = {
  sm: {
    avatar: 'h-6 w-6',
    text: 'text-xs',
    gap: 'gap-2',
  },
  md: {
    avatar: 'h-8 w-8',
    text: 'text-sm',
    gap: 'gap-3',
  },
  lg: {
    avatar: 'h-10 w-10',
    text: 'text-base',
    gap: 'gap-3',
  },
}

export default function AuthorByline({
  author,
  date,
  additionalAuthors,
  size = 'sm',
  showAvatar = true,
  className = '',
}: AuthorBylineProps) {
  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center ${sizes.gap} ${className}`}>
      {/* Avatar */}
      {showAvatar && (
        <Link
          href={`/author/${author.id}`}
          className={`relative shrink-0 overflow-hidden rounded-full ${sizes.avatar}`}
        >
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B0000] to-[#FF0000] text-xs font-bold text-white">
              {author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      )}

      {/* Name and date */}
      <div className={sizes.text}>
        <Link
          href={`/author/${author.id}`}
          className="font-medium text-zinc-900 transition-colors hover:text-[#8B0000] dark:text-white dark:hover:text-[#FF6666]"
        >
          {author.name}
        </Link>

        {additionalAuthors && additionalAuthors > 0 && (
          <span className="text-zinc-500 dark:text-zinc-500">
            {' '}and {additionalAuthors} other{additionalAuthors > 1 ? 's' : ''}
          </span>
        )}

        {date && (
          <>
            <span className="mx-1.5 text-zinc-400 dark:text-zinc-600">•</span>
            <time
              dateTime={date}
              className="text-zinc-500 dark:text-zinc-500"
            >
              {format(new Date(date), 'MMM d, yyyy')}
            </time>
          </>
        )}
      </div>
    </div>
  )
}
