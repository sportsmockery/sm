'use client'

import { useState, useEffect } from 'react'

interface ArticleActionsProps {
  articleId: number | string
  articleUrl: string
  articleTitle: string
  className?: string
}

export default function ArticleActions({
  articleId,
  articleUrl,
  articleTitle,
  className = '',
}: ArticleActionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [copied, setCopied] = useState(false)

  // Show/hide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load bookmark state from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('sm_bookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(String(articleId)))

    const reactions = JSON.parse(localStorage.getItem('sm_reactions') || '{}')
    setReaction(reactions[String(articleId)] || null)
  }, [articleId])

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('sm_bookmarks') || '[]')
    let newBookmarks: string[]

    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== String(articleId))
    } else {
      newBookmarks = [...bookmarks, String(articleId)]
    }

    localStorage.setItem('sm_bookmarks', JSON.stringify(newBookmarks))
    setIsBookmarked(!isBookmarked)
  }

  const handleReaction = (emoji: string) => {
    const reactions = JSON.parse(localStorage.getItem('sm_reactions') || '{}')

    if (reaction === emoji) {
      delete reactions[String(articleId)]
      setReaction(null)
    } else {
      reactions[String(articleId)] = emoji
      setReaction(emoji)
    }

    localStorage.setItem('sm_reactions', JSON.stringify(reactions))
    setShowReactions(false)
  }

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(articleUrl)
    const encodedTitle = encodeURIComponent(articleTitle)

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      copy: articleUrl,
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(articleUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback
        const input = document.createElement('input')
        input.value = articleUrl
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const reactions_list = [
    { emoji: '🔥', label: 'Fire' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😡', label: 'Angry' },
  ]

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 md:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      } ${className}`}
    >
      <div className="border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {/* Share */}
          <button
            onClick={() => handleShare('twitter')}
            className="flex flex-col items-center gap-1 text-zinc-600 transition-colors hover:text-[#1DA1F2] dark:text-zinc-400"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-[10px]">Tweet</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            className="flex flex-col items-center gap-1 text-zinc-600 transition-colors hover:text-[#1877F2] dark:text-zinc-400"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className="text-[10px]">Share</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={() => handleShare('copy')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              copied
                ? 'text-green-500'
                : 'text-zinc-600 hover:text-[#8B0000] dark:text-zinc-400'
            }`}
          >
            {copied ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            )}
            <span className="text-[10px]">{copied ? 'Copied!' : 'Link'}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isBookmarked
                ? 'text-[#8B0000] dark:text-[#FF6666]'
                : 'text-zinc-600 hover:text-[#8B0000] dark:text-zinc-400 dark:hover:text-[#FF6666]'
            }`}
          >
            <svg
              className="h-5 w-5"
              fill={isBookmarked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
            <span className="text-[10px]">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* React */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                reaction
                  ? 'text-[#8B0000] dark:text-[#FF6666]'
                  : 'text-zinc-600 hover:text-[#8B0000] dark:text-zinc-400 dark:hover:text-[#FF6666]'
              }`}
            >
              <span className="text-xl">{reaction || '❤️'}</span>
              <span className="text-[10px]">React</span>
            </button>

            {/* Reactions popup */}
            {showReactions && (
              <div className="absolute -top-16 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                {reactions_list.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => handleReaction(r.emoji)}
                    className={`rounded-full p-1 text-2xl transition-transform hover:scale-125 ${
                      reaction === r.emoji ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                    }`}
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
