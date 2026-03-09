'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArticleHeader } from '../articles/ArticleHeader';
import { DebateBlock } from '../articles/DebateBlock';
import { ScoutInsight } from '../articles/ScoutInsight';
import { ReadingProgressBar } from '../articles/ReadingProgressBar';

interface FanTake {
  username: string;
  gmRank: string;
  argument: string;
}

interface FanChatTemplateProps {
  tags: string[];
  headline: string;
  subheadline?: string;
  author: string;
  updatedAt: string;
  readTime: string;
  introParagraph: string;
  proArgument: string;
  conArgument: string;
  fanTakes: FanTake[];
  scoutSummary: string;
  paragraphs?: string[];
}

export function FanChatTemplate({
  tags,
  headline,
  subheadline,
  author,
  updatedAt,
  readTime,
  introParagraph,
  proArgument,
  conArgument,
  fanTakes,
  scoutSummary,
  paragraphs = [],
}: FanChatTemplateProps) {
  return (
    <>
      <ReadingProgressBar />
      <article className="max-w-[720px] mx-auto px-4 py-8" style={{ backgroundColor: '#0B0F14' }}>
        <ArticleHeader
          tags={tags}
          headline={headline}
          subheadline={subheadline}
          author={author}
          updatedAt={updatedAt}
          readTime={readTime}
        />

        {/* Intro */}
        <p className="text-[18px] leading-7 text-white mb-5">{introParagraph}</p>

        {/* Debate Block (includes PRO/CON cards + vote) */}
        <DebateBlock
          proArgument={proArgument}
          conArgument={conArgument}
          reward={3}
        />

        {/* Additional paragraphs */}
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[18px] leading-7 text-white mb-5">{p}</p>
        ))}

        {/* Top Fan Takes */}
        {fanTakes.length > 0 && (
          <div className="my-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Top Fan Takes
            </h3>
            <div className="space-y-3">
              {fanTakes.map((take, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-white">{take.username}</span>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(0,212,255,0.15)',
                        color: '#00D4FF',
                      }}
                    >
                      {take.gmRank}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{take.argument}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scout Summary */}
        <ScoutInsight insight={scoutSummary} />
      </article>
    </>
  );
}
