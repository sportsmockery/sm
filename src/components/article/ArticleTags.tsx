import Link from 'next/link'

interface ArticleTagsProps {
  tags: string[]
  className?: string
}

export default function ArticleTags({ tags, className = '' }: ArticleTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        Tags:
      </span>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/search?tag=${encodeURIComponent(tag)}`}
          className="inline-flex items-center rounded-full border border-[#8B0000]/30 px-3 py-1 text-sm font-medium text-[#8B0000] transition-all hover:border-[#8B0000] hover:bg-[#8B0000] hover:text-white dark:border-[#FF6666]/30 dark:text-[#FF6666] dark:hover:border-[#FF6666] dark:hover:bg-[#FF6666] dark:hover:text-white"
        >
          <svg
            className="mr-1.5 h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6h.008v.008H6V6z"
            />
          </svg>
          {tag}
        </Link>
      ))}
    </div>
  )
}
