'use client'

import { useEffect, useRef } from 'react'
import { DISQUS_SHORTNAME } from './DisqusCommentCount'

interface DisqusCommentsProps {
  identifier: string  // Unique identifier (slug)
  url: string        // Full URL to the article
  title: string      // Article title
}

// Declare global Disqus types
declare global {
  interface Window {
    DISQUS?: {
      reset: (options: { reload: boolean; config: () => void }) => void
    }
    disqus_config?: () => void
  }
}

export default function DisqusComments({
  identifier,
  url,
  title,
}: DisqusCommentsProps) {
  const disqusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reset if DISQUS already loaded
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function() {
          // @ts-expect-error - Disqus config uses this binding
          this.page.identifier = identifier
          // @ts-expect-error
          this.page.url = url
          // @ts-expect-error
          this.page.title = title
        },
      })
      return
    }

    // Configure Disqus
    window.disqus_config = function() {
      // @ts-expect-error - Disqus config uses this binding
      this.page.url = url
      // @ts-expect-error
      this.page.identifier = identifier
      // @ts-expect-error
      this.page.title = title
    }

    // Load Disqus embed script
    const script = document.createElement('script')
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`
    script.setAttribute('data-timestamp', String(+new Date()))
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup: Remove the script
      const existingScript = document.querySelector(`script[src*="${DISQUS_SHORTNAME}.disqus.com/embed.js"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [identifier, url, title])

  return (
    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-[#8B0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments
      </h2>
      <div ref={disqusRef} id="disqus_thread" />
      <noscript>
        <p className="text-zinc-500">
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" className="text-[#8B0000] hover:underline">
            comments powered by Disqus.
          </a>
        </p>
      </noscript>
    </div>
  )
}
