import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'post_published' | 'post_updated' | 'post_created' | 'category_created' | 'author_added' | 'comment_added'
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
  }
  link?: string
}

const activityIcons = {
  post_published: (
    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  post_updated: (
    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  ),
  post_created: (
    <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  category_created: (
    <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  author_added: (
    <svg className="h-4 w-4 text-pink-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  ),
  comment_added: (
    <svg className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
}

// Sample activities for development
const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'post_published',
    description: 'Published "Bears Win Big Against Packers"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user: { name: 'John Doe' },
  },
  {
    id: '2',
    type: 'post_created',
    description: 'Created draft "Bulls Trade Rumors Heat Up"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Jane Smith' },
  },
  {
    id: '3',
    type: 'category_created',
    description: 'Added category "Offseason News"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    user: { name: 'Admin' },
  },
  {
    id: '4',
    type: 'post_updated',
    description: 'Updated "Cubs Spring Training Preview"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: { name: 'John Doe' },
  },
]

interface ActivityFeedProps {
  activities?: Activity[]
  className?: string
}

export default function ActivityFeed({ activities = sampleActivities, className = '' }: ActivityFeedProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-white">Recent Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent activity</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 px-6 py-4">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-900 dark:text-white">
                  {activity.user && (
                    <span className="font-medium">{activity.user.name} </span>
                  )}
                  <span className="text-zinc-600 dark:text-zinc-400">{activity.description}</span>
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
        <button className="text-sm font-medium text-[#8B0000] hover:text-red-700 dark:text-[#FF6666] dark:hover:text-red-400">
          View all activity →
        </button>
      </div>
    </div>
  )
}
