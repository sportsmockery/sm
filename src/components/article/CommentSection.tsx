'use client'

import { useState } from 'react'

interface Comment {
  id: string
  author: string
  avatar?: string
  content: string
  timestamp: string
  likes: number
  replies?: Comment[]
}

interface CommentSectionProps {
  articleId: number | string
  commentCount?: number
  disqusShortname?: string
  className?: string
}

export default function CommentSection({
  articleId,
  commentCount = 0,
  disqusShortname,
  className = '',
}: CommentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')

  // Demo comments for UI display
  const demoComments: Comment[] = [
    {
      id: '1',
      author: 'ChicagoFan85',
      content:
        "Great analysis! I've been saying this all season. The team really needs to step up if they want to make the playoffs.",
      timestamp: '2 hours ago',
      likes: 24,
    },
    {
      id: '2',
      author: 'BearsForever',
      content:
        "Not sure I agree with all the points here, but it's well written. Looking forward to Sunday's game!",
      timestamp: '5 hours ago',
      likes: 12,
      replies: [
        {
          id: '2a',
          author: 'SportsFan2024',
          content: 'What parts do you disagree with? I thought the defense analysis was spot on.',
          timestamp: '4 hours ago',
          likes: 5,
        },
      ],
    },
  ]

  // If Disqus shortname is provided, render Disqus embed
  if (disqusShortname) {
    return (
      <section className={`border-t border-zinc-200 py-8 dark:border-zinc-800 ${className}`}>
        <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold text-zinc-900 dark:text-white">
          <svg
            className="h-6 w-6 text-[#8B0000] dark:text-[#FF6666]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          Comments
          {commentCount > 0 && (
            <span className="rounded-full bg-[#8B0000]/10 px-2.5 py-0.5 text-sm font-medium text-[#8B0000] dark:bg-[#FF6666]/10 dark:text-[#FF6666]">
              {commentCount}
            </span>
          )}
        </h2>

        {/* Disqus placeholder */}
        <div
          id="disqus_thread"
          className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-zinc-500 dark:text-zinc-400">
            Loading comments...
          </p>
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            Powered by Disqus
          </p>
        </div>
      </section>
    )
  }

  // Custom comment UI
  return (
    <section className={`border-t border-zinc-200 py-8 dark:border-zinc-800 ${className}`}>
      <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-bold text-zinc-900 dark:text-white">
        <svg
          className="h-6 w-6 text-[#8B0000] dark:text-[#FF6666]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
        Comments
        <span className="rounded-full bg-[#8B0000]/10 px-2.5 py-0.5 text-sm font-medium text-[#8B0000] dark:bg-[#FF6666]/10 dark:text-[#FF6666]">
          {demoComments.length}
        </span>
      </h2>

      {/* Comment input */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Join the discussion..."
          className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 placeholder-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
          rows={3}
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Be respectful. No hate speech or personal attacks.
          </p>
          <button className="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]">
            Post Comment
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {demoComments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Comment header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B0000] to-[#FF6666] text-sm font-bold text-white">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {comment.author}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {comment.timestamp}
                </p>
              </div>
            </div>

            {/* Comment content */}
            <p className="mb-3 text-zinc-700 dark:text-zinc-300">{comment.content}</p>

            {/* Comment actions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-[#8B0000] dark:text-zinc-400 dark:hover:text-[#FF6666]">
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
                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                  />
                </svg>
                {comment.likes}
              </button>
              <button className="text-sm text-zinc-500 transition-colors hover:text-[#8B0000] dark:text-zinc-400 dark:hover:text-[#FF6666]">
                Reply
              </button>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
                {comment.replies.map((reply) => (
                  <div key={reply.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        {reply.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {reply.author}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {reply.timestamp}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more */}
      <button className="mt-6 w-full rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800">
        Load More Comments
      </button>
    </section>
  )
}
