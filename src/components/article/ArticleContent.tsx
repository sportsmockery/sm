interface ArticleContentProps {
  content: string
  className?: string
}

export default function ArticleContent({
  content,
  className = '',
}: ArticleContentProps) {
  return (
    <div
      className={`prose prose-lg max-w-none
        /* Base typography */
        prose-p:text-lg prose-p:leading-[1.8] prose-p:mb-6 prose-p:text-zinc-700

        /* Headings */
        prose-headings:font-heading prose-headings:font-bold prose-headings:text-zinc-900
        prose-h2:text-[28px] prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-[22px] prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
        prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2

        /* Links */
        prose-a:text-[#8B0000] prose-a:no-underline prose-a:font-medium
        hover:prose-a:underline

        /* Blockquotes */
        prose-blockquote:border-l-4 prose-blockquote:border-[#8B0000]
        prose-blockquote:bg-zinc-100 prose-blockquote:py-4 prose-blockquote:px-6
        prose-blockquote:rounded-r-lg prose-blockquote:not-italic
        prose-blockquote:text-zinc-600 prose-blockquote:font-medium

        /* Lists */
        prose-ul:my-6 prose-ul:pl-6
        prose-ol:my-6 prose-ol:pl-6
        prose-li:my-2 prose-li:text-zinc-700
        prose-ul:marker:text-[#8B0000]
        prose-ol:marker:text-[#8B0000] prose-ol:marker:font-bold

        /* Images */
        prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full
        prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-zinc-500 prose-figcaption:mt-2

        /* Code */
        prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[#8B0000]
        prose-pre:bg-zinc-900 prose-pre:text-zinc-100

        /* Strong/Bold */
        prose-strong:text-zinc-900 prose-strong:font-bold

        /* HR */
        prose-hr:border-zinc-200 prose-hr:my-8

        /* Dark mode */
        dark:prose-p:text-zinc-300
        dark:prose-headings:text-zinc-100
        dark:prose-a:text-[#FF6666]
        dark:prose-blockquote:bg-zinc-800/50 dark:prose-blockquote:text-zinc-400
        dark:prose-strong:text-zinc-100
        dark:prose-li:text-zinc-300
        dark:prose-code:bg-zinc-800 dark:prose-code:text-[#FF6666]
        dark:prose-hr:border-zinc-800

        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
