'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Player } from '@/lib/types/sports';

interface Article {
  id: string;
  title: string;
  slug: string;
  featured_image?: string;
  published_at: string;
}

interface PlayerNewsProps {
  articles: Article[];
  player: Player;
  limit?: number;
}

export default function PlayerNews({ articles, player, limit = 5 }: PlayerNewsProps) {
  const displayArticles = articles.slice(0, limit);

  if (displayArticles.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Related News
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No recent news about {player.name}.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Related News
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {displayArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/${player.team.slug}/${article.slug}`}
            className="group block p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex gap-3">
              {article.featured_image && index === 0 && (
                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={article.featured_image}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-zinc-900 line-clamp-2 group-hover:text-[#8B0000] dark:text-white dark:group-hover:text-[#FF6666]">
                  {article.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(article.published_at)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
