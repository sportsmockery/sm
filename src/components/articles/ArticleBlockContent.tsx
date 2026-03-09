'use client';

import React from 'react';
import { BlockPreviewRenderer } from '@/components/admin/BlockEditor/BlockPreviewRenderer';
import { ReadingProgressBar } from './ReadingProgressBar';
import type { ArticleDocument } from '@/components/admin/BlockEditor';

interface ArticleBlockContentProps {
  document: ArticleDocument;
}

export function ArticleBlockContent({ document }: ArticleBlockContentProps) {
  return (
    <>
      <ReadingProgressBar />
      <div className="article-block-content">
        <BlockPreviewRenderer blocks={document.blocks} />
      </div>
    </>
  );
}
