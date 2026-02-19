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

export function FeaturedSkeleton() {
  return (
    <div className="featured-skeleton" aria-hidden="true">
      <div className="featured-skeleton-main">
        <div className="skeleton-image" style={{ aspectRatio: '16/9', borderRadius: '16px' }} />
        <div className="skeleton-body" style={{ padding: '20px 0' }}>
          <div className="skeleton-pill" />
          <div className="skeleton-title" style={{ height: '24px' }} />
          <div className="skeleton-title skeleton-title--short" />
        </div>
      </div>
      <div className="featured-skeleton-side">
        {[0, 1].map((i) => (
          <div key={i} className="featured-skeleton-side-card">
            <div className="skeleton-image" style={{ aspectRatio: '1', borderRadius: '12px', width: '140px' }} />
            <div className="skeleton-body" style={{ flex: 1 }}>
              <div className="skeleton-pill" />
              <div className="skeleton-title" />
              <div className="skeleton-title skeleton-title--short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
