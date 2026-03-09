'use client';

import React from 'react';
import { Share2, Bookmark, Volume2, Sparkles } from 'lucide-react';
import { TagChip } from './TagChip';

interface ArticleHeaderProps {
  tags: string[];
  headline: string;
  subheadline?: string;
  author: string;
  updatedAt: string;
  readTime: string;
  onShare?: () => void;
  onSave?: () => void;
  onListen?: () => void;
  onScoutSummary?: () => void;
}

export function ArticleHeader({
  tags,
  headline,
  subheadline,
  author,
  updatedAt,
  readTime,
  onShare,
  onSave,
  onListen,
  onScoutSummary,
}: ArticleHeaderProps) {
  const iconButtons = [
    { icon: Share2, label: 'Share', onClick: onShare },
    { icon: Bookmark, label: 'Save', onClick: onSave },
    { icon: Volume2, label: 'Listen', onClick: onListen },
    { icon: Sparkles, label: 'Scout Summary', onClick: onScoutSummary },
  ];

  return (
    <header className="mb-8">
      {/* Row 1: Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
      </div>

      {/* Row 2: Headline */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
        {headline}
      </h1>

      {/* Row 3: Subheadline */}
      {subheadline && (
        <p className="text-lg text-slate-400 mb-4">{subheadline}</p>
      )}

      {/* Row 4: Metadata */}
      <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
        <span>By {author}</span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span>Updated {updatedAt}</span>
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span>{readTime}</span>
      </div>

      {/* Row 5: Utility icons */}
      <div className="flex items-center gap-3">
        {iconButtons.map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            aria-label={label}
          >
            <Icon size={14} className="text-slate-400" />
          </button>
        ))}
      </div>
    </header>
  );
}
