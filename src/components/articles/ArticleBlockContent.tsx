'use client';

import React, { useState, useEffect } from 'react';
import { BlockPreviewRenderer } from '@/components/admin/BlockEditor/BlockPreviewRenderer';
import { ReadingProgressBar } from './ReadingProgressBar';
import type { ArticleDocument } from '@/components/admin/BlockEditor';

interface ArticleBlockContentProps {
  document: ArticleDocument;
}

/**
 * Renders block-based article content CLIENT-ONLY to prevent React
 * hydration mismatches (removeChild errors). WordPress-imported HTML
 * inside block.data.html contains structures that browsers normalize
 * differently than the server, causing DOM mismatches on hydration.
 *
 * SEO is preserved because the article title, meta, featured image,
 * and structured data are all rendered server-side in the parent page.
 */
export function ArticleBlockContent({ document }: ArticleBlockContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ReadingProgressBar />
      {mounted ? (
        <div className="article-block-content">
          <BlockPreviewRenderer blocks={document.blocks} />
        </div>
      ) : (
        <div className="article-block-content" aria-busy="true">
          {/* Skeleton matching article body layout to prevent CLS */}
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 rounded" style={{ background: 'var(--hp-border, rgba(0,0,0,0.08))', width: i === 0 ? '90%' : i === 3 ? '70%' : '100%' }} />
                {i < 5 && <div className="h-4 rounded mt-2" style={{ background: 'var(--hp-border, rgba(0,0,0,0.08))', width: i % 2 === 0 ? '95%' : '80%' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
