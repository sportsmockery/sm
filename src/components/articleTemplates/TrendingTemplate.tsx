'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { ArticleHeader } from '../articles/ArticleHeader';
import { ReactionStream } from '../articles/ReactionStream';
import { ScoutInsight } from '../articles/ScoutInsight';
import { ReadingProgressBar } from '../articles/ReadingProgressBar';

type HeatLevel = 'Warm' | 'Hot' | 'Nuclear';

interface Reaction {
  avatar: string;
  username: string;
  comment: string;
  timestamp: string;
}

interface TrendingTemplateProps {
  tags: string[];
  headline: string;
  subheadline?: string;
  author: string;
  updatedAt: string;
  readTime: string;
  heatLevel: HeatLevel;
  paragraphs: string[];
  reactions: Reaction[];
  videoUrl?: string;
  hotTake?: string;
  pollQuestion?: string;
  scoutInsight?: string;
}

const HEAT_LEVELS: HeatLevel[] = ['Warm', 'Hot', 'Nuclear'];

function HeatMeter({ level }: { level: HeatLevel }) {
  const activeIdx = HEAT_LEVELS.indexOf(level);

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} style={{ color: '#BC0000' }} />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Heat Meter</span>
      </div>
      <div className="flex gap-1">
        {HEAT_LEVELS.map((l, i) => (
          <div key={l} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-3 rounded-full transition-colors"
              style={{
                backgroundColor: i <= activeIdx ? '#BC0000' : 'rgba(255,255,255,0.1)',
              }}
            />
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: i <= activeIdx ? '#BC0000' : '#A0A8B0' }}
            >
              {l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FanPoll({ question, reward = 2 }: { question: string; reward?: number }) {
  const [vote, setVote] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handleVote = (option: string) => {
    if (vote) return;
    setVote(option);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  return (
    <div
      className="rounded-xl p-5 my-8 relative"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p className="text-[#0B0F14] dark:text-[#FAFAFB] text-[16px] font-medium mb-4">{question}</p>
      <div className="flex items-center gap-3">
        {['YES', 'NO'].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleVote(option)}
            disabled={!!vote}
            className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all min-h-[44px]"
            style={{
              backgroundColor: vote === option ? '#00D4FF' : 'rgba(0,212,255,0.1)',
              color: vote === option ? '#0B0F14' : '#00D4FF',
              border: `1px solid ${vote === option ? '#00D4FF' : 'rgba(0,212,255,0.3)'}`,
              opacity: vote && vote !== option ? 0.4 : 1,
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {showReward && (
          <motion.span
            className="absolute -top-4 right-4 text-sm font-bold"
            style={{ color: '#00D4FF' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            +{reward} GM Score
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TrendingTemplate({
  tags,
  headline,
  subheadline,
  author,
  updatedAt,
  readTime,
  heatLevel,
  paragraphs,
  reactions,
  videoUrl,
  hotTake,
  pollQuestion,
  scoutInsight,
}: TrendingTemplateProps) {
  return (
    <>
      <ReadingProgressBar />
      <article className="max-w-[720px] mx-auto px-4 py-8 bg-[#FAFAFB] dark:bg-[#0B0F14]">
        <ArticleHeader
          tags={[...tags]}
          headline={headline}
          subheadline={subheadline}
          author={author}
          updatedAt={updatedAt}
          readTime={readTime}
        />

        {/* Trending label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
            Trending
          </span>
        </div>

        {/* Heat Meter */}
        <HeatMeter level={heatLevel} />

        {/* Opening paragraph */}
        {paragraphs[0] && (
          <p className="text-[18px] leading-7 text-[#0B0F14] dark:text-[#FAFAFB] mb-5">{paragraphs[0]}</p>
        )}

        {/* Reaction Stream */}
        <ReactionStream reactions={reactions} />

        {/* Video block */}
        {videoUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden my-8">
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          </div>
        )}

        {/* Hot Take Card */}
        {hotTake && (
          <div
            className="rounded-xl p-5 my-8"
            style={{
              backgroundColor: 'rgba(214,176,94,0.06)',
              border: '1px solid rgba(214,176,94,0.2)',
            }}
          >
            <span className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: '#D6B05E' }}>
              Hot Take
            </span>
            <p className="text-[16px] text-[#0B0F14] dark:text-[#FAFAFB] font-medium leading-relaxed">{hotTake}</p>
          </div>
        )}

        {/* Paragraph 2 */}
        {paragraphs[1] && (
          <p className="text-[18px] leading-7 text-[#0B0F14] dark:text-[#FAFAFB] mb-5">{paragraphs[1]}</p>
        )}

        {/* Fan Poll */}
        {pollQuestion && <FanPoll question={pollQuestion} />}

        {/* Scout Insight */}
        {scoutInsight && <ScoutInsight insight={scoutInsight} />}

        {/* Remaining paragraphs */}
        {paragraphs.slice(2).map((p, i) => (
          <p key={i} className="text-[18px] leading-7 text-[#0B0F14] dark:text-[#FAFAFB] mb-5">{p}</p>
        ))}
      </article>
    </>
  );
}
