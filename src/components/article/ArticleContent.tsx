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
        prose-p:text-lg prose-p:leading-[1.8] prose-p:mb-6

        /* Headings */
        prose-headings:font-heading prose-headings:font-bold
        prose-h2:text-[28px] prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-[22px] prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
        prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2

        /* Links */
        prose-a:no-underline prose-a:font-medium
        hover:prose-a:underline

        /* Blockquotes */
        prose-blockquote:border-l-4
        prose-blockquote:py-4 prose-blockquote:px-6
        prose-blockquote:rounded-r-lg prose-blockquote:not-italic
        prose-blockquote:font-medium

        /* Lists */
        prose-ul:my-6 prose-ul:pl-6
        prose-ol:my-6 prose-ol:pl-6
        prose-li:my-2

        /* Images */
        prose-img:rounded-xl prose-img:shadow-lg prose-img:w-full
        prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:mt-2

        /* Code */
        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        prose-pre:text-zinc-100

        /* Strong/Bold */
        prose-strong:font-bold

        /* HR */
        prose-hr:my-8

        ${className}`}
      style={{
        '--tw-prose-body': 'var(--sm-text-muted)',
        '--tw-prose-headings': 'var(--sm-text)',
        '--tw-prose-links': 'var(--sm-accent)',
        '--tw-prose-bold': 'var(--sm-text)',
        '--tw-prose-counters': 'var(--sm-accent)',
        '--tw-prose-bullets': 'var(--sm-accent)',
        '--tw-prose-hr': 'var(--sm-border)',
        '--tw-prose-quotes': 'var(--sm-text-muted)',
        '--tw-prose-quote-borders': 'var(--sm-accent)',
        '--tw-prose-captions': 'var(--sm-text-muted)',
        '--tw-prose-code': 'var(--sm-accent)',
        '--tw-prose-pre-bg': '#1a1a2e',
        '--tw-prose-th-borders': 'var(--sm-border)',
        '--tw-prose-td-borders': 'var(--sm-border)',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
