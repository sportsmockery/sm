'use client'

export default function FeedScoringPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
        Oracle Feed Scoring System
      </h1>

      <div className="space-y-8">
        {/* Overview */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Overview</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            The Oracle Feed uses a scoring algorithm to rank articles and determine what appears in
            the Featured, Top Headlines, and Latest News sections on the homepage. Each article
            receives a <strong className="text-[var(--text-primary)]">final score</strong> calculated
            from multiple factors.
          </p>
        </section>

        {/* Base Score */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            1. Base Score: importance_score
          </h2>
          <div className="space-y-4">
            <p className="text-[var(--text-secondary)]">
              Every article has an <code className="px-2 py-0.5 bg-[var(--bg-hover)] rounded text-[var(--accent-red)]">importance_score</code> field
              in the database (default: 50).
            </p>
            <div className="bg-[var(--bg-primary)] rounded-lg p-4 border border-[var(--border-default)]">
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Recommended Values:</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-center gap-3">
                  <span className="w-20 text-right font-mono text-[var(--accent-red)]">90-100</span>
                  <span>Breaking news, major trades, championship wins</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-20 text-right font-mono text-[var(--accent-red)]">70-89</span>
                  <span>Important updates, key player news, game recaps</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-20 text-right font-mono text-[var(--accent-red)]">50-69</span>
                  <span>Standard articles, analysis, opinion pieces</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-20 text-right font-mono text-[var(--accent-red)]">30-49</span>
                  <span>Minor updates, historical content</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-20 text-right font-mono text-[var(--accent-red)]">0-29</span>
                  <span>Low priority, evergreen filler content</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Score Modifiers */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            2. Score Modifiers
          </h2>
          <div className="space-y-6">
            {/* Recency */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-2">Recency Decay</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Older articles receive a penalty to keep fresh content at the top.
              </p>
              <div className="bg-[var(--bg-primary)] rounded p-3 font-mono text-sm">
                <span className="text-red-400">-5 points</span> per day old (max <span className="text-red-400">-30 points</span>)
              </div>
            </div>

            {/* Team Preference */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-2">Team Preference Boost</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Articles about a reader's favorite teams get boosted. Preferences are learned from reading history.
              </p>
              <div className="bg-[var(--bg-primary)] rounded p-3 font-mono text-sm">
                <span className="text-green-400">+15 points</span> if matches user's top 3 teams
              </div>
            </div>

            {/* Trending */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-2">Trending Boost</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Articles with high view counts in the last 24 hours get a popularity boost.
              </p>
              <div className="bg-[var(--bg-primary)] rounded p-3 font-mono text-sm">
                <span className="text-yellow-400">+10 points</span> if in top 10 trending
              </div>
            </div>

            {/* Unseen */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium text-[var(--text-primary)] mb-2">Unseen Bonus</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Articles the user hasn't viewed yet get a small boost to encourage discovery.
              </p>
              <div className="bg-[var(--bg-primary)] rounded p-3 font-mono text-sm">
                <span className="text-purple-400">+5 points</span> if not in user's view history
              </div>
            </div>
          </div>
        </section>

        {/* Final Score Calculation */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            3. Final Score Calculation
          </h2>
          <div className="bg-[var(--bg-primary)] rounded-lg p-4 border border-[var(--border-default)] font-mono text-sm">
            <p className="text-[var(--text-secondary)]">final_score = </p>
            <p className="pl-4 text-[var(--text-primary)]">importance_score</p>
            <p className="pl-4 text-red-400">- recency_penalty (0 to 30)</p>
            <p className="pl-4 text-green-400">+ team_boost (0 or 15)</p>
            <p className="pl-4 text-yellow-400">+ trending_boost (0 or 10)</p>
            <p className="pl-4 text-purple-400">+ unseen_bonus (0 or 5)</p>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Articles are sorted by final_score descending. The highest-scoring article becomes the Featured article.
          </p>
        </section>

        {/* Homepage Sections */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            4. Homepage Sections
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-primary)]">Section</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-primary)]">Articles</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-primary)]">Description</th>
                </tr>
              </thead>
              <tbody className="text-[var(--text-secondary)]">
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-3 px-4 font-medium">Featured</td>
                  <td className="py-3 px-4">#1</td>
                  <td className="py-3 px-4">Hero section with large image</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-3 px-4 font-medium">Top Headlines</td>
                  <td className="py-3 px-4">#2 - #7</td>
                  <td className="py-3 px-4">Numbered list in sidebar</td>
                </tr>
                <tr className="border-b border-[var(--border-subtle)]">
                  <td className="py-3 px-4 font-medium">Latest News</td>
                  <td className="py-3 px-4">#8 - #20</td>
                  <td className="py-3 px-4">Card grid below headlines</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Team Sections</td>
                  <td className="py-3 px-4">Up to 4 each</td>
                  <td className="py-3 px-4">Filtered by category slug (bears, bulls, etc.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to Influence */}
        <section className="bg-gradient-to-r from-[var(--accent-red)]/10 to-transparent border border-[var(--accent-red)]/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            How to Feature an Article
          </h2>
          <ol className="space-y-3 text-[var(--text-secondary)]">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-red)] text-white text-sm flex items-center justify-center">1</span>
              <span>Go to <strong>Posts</strong> in the admin and edit the article</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-red)] text-white text-sm flex items-center justify-center">2</span>
              <span>Set the <code className="px-1.5 py-0.5 bg-[var(--bg-hover)] rounded">importance_score</code> to 90-100</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent-red)] text-white text-sm flex items-center justify-center">3</span>
              <span>The article will appear in Featured/Top Headlines based on its final score</span>
            </li>
          </ol>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Note: Recency still affects scoring, so even high-importance articles will drop after ~6 days.
          </p>
        </section>

        {/* Technical Details */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Technical Details
          </h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li><strong>API Endpoint:</strong> <code className="text-[var(--accent-red)]">GET/POST /api/feed</code></li>
            <li><strong>Database Column:</strong> <code className="text-[var(--accent-red)]">sm_posts.importance_score</code> (INTEGER, default 50)</li>
            <li><strong>View Tracking:</strong> Stored in localStorage (48h expiry) + server-side in <code className="text-[var(--accent-red)]">sm_user_views</code></li>
            <li><strong>Refresh Rate:</strong> Feed auto-refreshes every 5 minutes on the homepage</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
