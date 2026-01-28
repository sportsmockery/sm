// src/hooks/useEngagementTracking.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase';

interface TrackingOptions {
  postId: string;
  teamSlug: string;
  authorId: string | null;
  primaryTopic: string | null;
  contentType: string;
}

export function useEngagementTracking(options: TrackingOptions) {
  const { postId, teamSlug, authorId, primaryTopic, contentType } = options;
  const supabase = createClient();
  const startTime = useRef<number>(Date.now());
  const maxScroll = useRef<number>(0);
  const hasTrackedClick = useRef<boolean>(false);

  // Track page view (click)
  const trackClick = useCallback(async () => {
    if (hasTrackedClick.current) return;
    hasTrackedClick.current = true;

    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = localStorage.getItem('sm_session_id') || crypto.randomUUID();
    localStorage.setItem('sm_session_id', sessionId);

    // Increment page view counter
    localStorage.setItem(
      'sm_page_views',
      String(parseInt(localStorage.getItem('sm_page_views') || '0', 10) + 1)
    );

    await supabase.from('user_interactions').insert({
      user_id: user?.id || null,
      post_id: postId,
      session_id: sessionId,
      clicked: true
    });
  }, [postId, supabase]);

  // Track scroll depth
  const trackScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    maxScroll.current = Math.max(maxScroll.current, scrollPercent);
  }, []);

  // Update engagement profile on unmount
  const updateEngagementProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const readTimeSeconds = Math.round((Date.now() - startTime.current) / 1000);
    const sessionId = localStorage.getItem('sm_session_id');

    // Update interaction record
    await supabase
      .from('user_interactions')
      .update({
        read_time_seconds: readTimeSeconds,
        scroll_depth_percent: maxScroll.current
      })
      .eq('post_id', postId)
      .eq('session_id', sessionId);

    // Update user engagement profile
    const { data: profile } = await supabase
      .from('user_engagement_profile')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      // Update team scores (+3 for click, +5 for >30s read)
      const teamBoost = readTimeSeconds > 30 ? 5 : 3;
      const teamScores = { ...profile.team_scores };
      teamScores[teamSlug] = Math.min(100, (teamScores[teamSlug] || 30) + teamBoost);
      updates.team_scores = teamScores;

      // Update format preferences
      const formatPrefs = { ...profile.format_prefs };
      const currentPref = formatPrefs[contentType] || 0.33;
      formatPrefs[contentType] = Math.min(0.6, currentPref + 0.02);
      // Normalize to sum to 1
      const total = Object.values(formatPrefs).reduce((a: number, b: unknown) => a + (b as number), 0);
      Object.keys(formatPrefs).forEach(k => {
        formatPrefs[k] = (formatPrefs[k] as number) / (total as number);
      });
      updates.format_prefs = formatPrefs;

      // Update author reads
      if (authorId) {
        const authorReads = { ...profile.author_reads };
        authorReads[authorId] = (authorReads[authorId] || 0) + 1;
        updates.author_reads = authorReads;
      }

      // Update topic views today
      if (primaryTopic) {
        const topicViews = { ...profile.topic_views_today };
        topicViews[primaryTopic] = (topicViews[primaryTopic] || 0) + 1;
        updates.topic_views_today = topicViews;
      }

      await supabase
        .from('user_engagement_profile')
        .update(updates)
        .eq('user_id', user.id);
    }
  }, [postId, teamSlug, authorId, primaryTopic, contentType, supabase]);

  useEffect(() => {
    trackClick();
    window.addEventListener('scroll', trackScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', trackScroll);
      updateEngagementProfile();
    };
  }, [trackClick, trackScroll, updateEngagementProfile]);
}
