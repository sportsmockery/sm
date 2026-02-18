// src/components/homepage/FeedSkeleton.tsx
'use client';

interface FeedSkeletonProps {
  count: number;
}

export function FeedSkeleton({ count }: FeedSkeletonProps) {
  return (
    <div className="feed-skeleton" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton-pill" />
            <div className="skeleton-title" />
            <div className="skeleton-title skeleton-title--short" />
            <div className="skeleton-meta-bottom">
              <div className="skeleton-author" />
              <div className="skeleton-date" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
