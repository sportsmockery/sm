'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArticleHeader } from '../articles/ArticleHeader';
import { GMInteraction } from '../articles/GMInteraction';
import { ScoutInsight } from '../articles/ScoutInsight';
import { UpdateBlock } from '../articles/UpdateBlock';
import { ReadingProgressBar } from '../articles/ReadingProgressBar';

interface RelatedArticle {
  title: string;
  slug: string;
  image?: string;
  team?: string;
}

interface StandardNewsTemplateProps {
  tags: string[];
  headline: string;
  subheadline?: string;
  author: string;
  updatedAt: string;
  readTime: string;
  paragraphs: string[];
  gmQuestion: string;
  scoutInsight: string;
  articleImage?: { src: string; alt: string };
  update?: { timestamp: string; text: string };
  relatedArticles?: RelatedArticle[];
}

export function StandardNewsTemplate({
  tags,
  headline,
  subheadline,
  author,
  updatedAt,
  readTime,
  paragraphs,
  gmQuestion,
  scoutInsight,
  articleImage,
  update,
  relatedArticles = [],
}: StandardNewsTemplateProps) {
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

        {/* Paragraph 1 */}
        {paragraphs[0] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[0]}</p>
        )}

        {/* Paragraph 2 */}
        {paragraphs[1] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[1]}</p>
        )}

        {/* GM Interaction */}
        <GMInteraction
          question={gmQuestion}
          options={['YES', 'NO']}
          reward={3}
        />

        {/* Paragraph 3 */}
        {paragraphs[2] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[2]}</p>
        )}

        {/* Scout Insight */}
        <ScoutInsight insight={scoutInsight} />

        {/* Paragraph 4 */}
        {paragraphs[3] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[3]}</p>
        )}

        {/* Image */}
        {articleImage && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden my-8">
            <Image
              src={articleImage.src}
              alt={articleImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        )}

        {/* Paragraph 5 */}
        {paragraphs[4] && (
          <p className="text-[18px] leading-7 text-white mb-5">{paragraphs[4]}</p>
        )}

        {/* Update Block */}
        {update && <UpdateBlock timestamp={update.timestamp} text={update.text} />}

        {/* Remaining paragraphs */}
        {paragraphs.slice(5).map((p, i) => (
          <p key={i} className="text-[18px] leading-7 text-white mb-5">{p}</p>
        ))}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/${article.slug}`}
                  className="group rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {article.image && (
                    <div className="relative aspect-video">
                      <Image src={article.image} alt={article.title} fill className="object-cover" sizes="240px" />
                    </div>
                  )}
                  <div className="p-3">
                    {article.team && (
                      <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#00D4FF' }}>
                        {article.team}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00D4FF] transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
