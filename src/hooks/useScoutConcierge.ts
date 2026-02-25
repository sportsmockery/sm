// src/hooks/useScoutConcierge.ts
'use client';

import { useState, useCallback, useRef } from 'react';

interface ScoutPost {
  id: string;
  title: string;
  excerpt: string | null;
  category_slug: string | null;
  team_slug?: string | null;
}

interface ScoutData {
  summary: string;
  tl_dr: string;
  next_watch: string[];
}

interface UseScoutConciergeReturn {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  data: ScoutData | null;
  trigger: () => void;
  close: () => void;
}

function deriveTeamSlug(post: ScoutPost): string {
  // From category_slug: "chicago-bears" → "bears"
  if (post.category_slug) {
    const slug = post.category_slug.replace('chicago-', '');
    if (slug === 'white-sox') return 'whitesox';
    return slug;
  }
  // Fallback to team_slug
  if (post.team_slug) {
    if (post.team_slug === 'white-sox') return 'whitesox';
    return post.team_slug;
  }
  return 'sports';
}

export function useScoutConcierge(post: ScoutPost): UseScoutConciergeReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScoutData | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const trigger = useCallback(async () => {
    // If already open with data for this post, just reopen
    if (data && isOpen) return;

    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const teamSlug = deriveTeamSlug(post);

      const res = await fetch('https://datalab.sportsmockery.com/api/scout/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          postTitle: post.title,
          excerpt: post.excerpt || '',
          team: teamSlug,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      setData({
        summary: json.summary || 'No summary available.',
        tl_dr: json.tl_dr || json.summary || '',
        next_watch: Array.isArray(json.next_watch) ? json.next_watch.slice(0, 3) : [],
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError("Scout couldn't load this one. Try again in a bit.");
    } finally {
      setIsLoading(false);
    }
  }, [post, data, isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { isOpen, isLoading, error, data, trigger, close };
}
