import Link from 'next/link'

interface Tag {
  id: string
  name: string
  slug: string
}

interface ArticleTagsProps {
  tags: Tag[]
}

export default function ArticleTags({ tags }: ArticleTagsProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tags:</span>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tag/${tag.slug}`}
          className="inline-flex items-center rounded-full bg-gradient-to-r from-[#8B0000]/10 to-[#FF0000]/10 px-3 py-1 text-xs font-semibold text-[#8B0000] transition-all hover:from-[#8B0000]/20 hover:to-[#FF0000]/20 dark:from-[#8B0000]/20 dark:to-[#FF0000]/20 dark:text-[#FF6666]"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  )
}
