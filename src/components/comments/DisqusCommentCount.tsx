'use client'

import { useEffect } from 'react'

interface DisqusCommentCountProps {
  identifier: string  // Article slug
  url: string        // Full URL to the article
  className?: string
}

// Declare global Disqus types
declare global {
  interface Window {
    DISQUSWIDGETS?: {
      getCount: (options?: { reset: boolean }) => void
    }
    disqus_shortname?: string
  }
}

export const DISQUS_SHORTNAME = 'sportsmockery'

export default function DisqusCommentCount({
  identifier,
  url,
  className = '',
}: DisqusCommentCountProps) {
  useEffect(() => {
    // Load Disqus count script if not already loaded
    if (!window.DISQUSWIDGETS) {
      const script = document.createElement('script')
      script.src = `https://${DISQUS_SHORTNAME}.disqus.com/count.js`
      script.id = 'dsq-count-scr'
      script.async = true
      document.body.appendChild(script)
    } else {
      // Refresh counts if script already loaded
      window.DISQUSWIDGETS.getCount({ reset: true })
    }
  }, [identifier])

  return (
    <span className={`disqus-comment-count inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 ${className}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <a
        href={`${url}#disqus_thread`}
        data-disqus-identifier={identifier}
        className="hover:text-[#8B0000] dark:hover:text-[#FF6666] transition-colors"
      >
        0 Comments
      </a>
    </span>
  )
}
