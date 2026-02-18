'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Team } from '@/lib/types/sports';

interface Article {
  id: string;
  title: string;
  slug: string;
  featured_image?: string;
  published_at: string;
}

interface TeamNewsWidgetProps {
  articles: Article[];
  team: Team;
  limit?: number;
}

export default function TeamNewsWidget({ articles, team, limit = 5 }: TeamNewsWidgetProps) {
  const displayArticles = articles.slice(0, limit);

  if (displayArticles.length === 0) {
    return (
      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Latest News
        </h3>
        <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>No recent news.</p>
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
    <div className="rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Latest News
        </h3>
      </div>

      <div className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
        {displayArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/${team.slug}/${article.slug}`}
            className="group block p-4 transition-colors"
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
                <h4 className="font-medium line-clamp-2 group-hover:text-[#8B0000] dark:group-hover:text-[#FF6666]" style={{ color: 'var(--sm-text)' }}>
                  {article.title}
                </h4>
                <p className="mt-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  {formatDate(article.published_at)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href={`/${team.slug}`}
        className="block border-t px-5 py-3 text-center text-sm font-semibold transition-colors"
        style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)' }}
      >
        View All News →
      </Link>
    </div>
  );
}
