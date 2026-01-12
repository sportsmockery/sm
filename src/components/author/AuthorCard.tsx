import Image from 'next/image'
import Link from 'next/link'

interface AuthorCardProps {
  id: number
  name: string
  slug?: string
  avatar_url?: string
  bio?: string
  post_count: number
  className?: string
}

export default function AuthorCard({
  id,
  name,
  slug,
  avatar_url,
  bio,
  post_count,
  className = '',
}: AuthorCardProps) {
  const authorUrl = slug ? `/author/${slug}` : `/author/${id}`

  return (
    <Link
      href={authorUrl}
      className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#8B0000]/30 hover:shadow-lg hover:shadow-[#8B0000]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#FF6666]/30 dark:hover:shadow-[#FF6666]/10 ${className}`}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-[#FF6666]/5" />

      {/* Avatar */}
      <div className="relative mb-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-zinc-100 transition-all duration-300 group-hover:ring-[#8B0000]/20 dark:ring-zinc-800 dark:group-hover:ring-[#FF6666]/20">
          {avatar_url ? (
            <Image
              src={avatar_url}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B0000] to-[#a00000] text-3xl font-bold text-white dark:from-[#FF6666] dark:to-[#FF8888]">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* Online indicator */}
        <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-3 border-white bg-green-500 dark:border-zinc-900" />
      </div>

      {/* Name */}
      <h3 className="relative mb-1 font-heading text-lg font-bold text-zinc-900 transition-colors group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
        {name}
      </h3>

      {/* Post count */}
      <p className="relative mb-3 text-sm text-zinc-500 dark:text-zinc-400">
        {post_count} {post_count === 1 ? 'article' : 'articles'}
      </p>

      {/* Bio snippet */}
      {bio && (
        <p className="relative mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {bio}
        </p>
      )}

      {/* View profile button */}
      <span className="relative mt-auto inline-flex items-center gap-1 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-all duration-300 group-hover:bg-[#8B0000] group-hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-[#FF6666] dark:group-hover:text-white">
        View Profile
        <svg
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
          />
        </svg>
      </span>
    </Link>
  )
}
