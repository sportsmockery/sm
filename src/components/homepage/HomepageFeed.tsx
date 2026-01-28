// src/components/homepage/HomepageFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import { EditorPicksHero } from './EditorPicksHero';
import { TeamFilterTabs } from './TeamFilterTabs';
import { ForYouFeed } from './ForYouFeed';
import { TrendingSection } from './TrendingSection';

interface HomepageFeedProps {
  initialPosts: any[];
  editorPicks: any[];
  trendingPosts: any[];
  userTeamPreference: string | null;
  isLoggedIn: boolean;
}

export function HomepageFeed({
  initialPosts = [],
  editorPicks = [],
  trendingPosts = [],
  userTeamPreference = null,
  isLoggedIn = false
}: HomepageFeedProps) {
  const [activeTeam, setActiveTeam] = useState<string>('all');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (userTeamPreference && userTeamPreference !== 'all') {
      setActiveTeam(userTeamPreference);
    }
  }, [userTeamPreference]);

  // Ensure arrays are safe
  const safePosts = Array.isArray(initialPosts) ? initialPosts : [];
  const safeEditorPicks = Array.isArray(editorPicks) ? editorPicks : [];
  const safeTrendingPosts = Array.isArray(trendingPosts) ? trendingPosts : [];

  const filteredPosts = activeTeam === 'all'
    ? safePosts
    : safePosts.filter(post => post.team_slug === activeTeam);

  return (
    <div className="homepage-feed">
      {/* Editor Picks Hero - Always visible */}
      <EditorPicksHero
        picks={safeEditorPicks}
        isMobile={isMobile}
      />

      {/* Team Filter Tabs */}
      <TeamFilterTabs
        activeTeam={activeTeam}
        onTeamChange={setActiveTeam}
        userPreferredTeam={userTeamPreference}
      />

      {/* Main Content Grid */}
      <div className="homepage-content-grid">
        {/* For You Feed - Main Column */}
        <main className="main-feed-column">
          <ForYouFeed
            posts={filteredPosts}
            isLoggedIn={isLoggedIn}
            isMobile={isMobile}
            showTrendingInline={isMobile}
            trendingPosts={safeTrendingPosts}
          />
        </main>

        {/* Trending Sidebar - Desktop Only */}
        {!isMobile && safeTrendingPosts.length > 0 && (
          <aside className="trending-sidebar">
            <TrendingSection posts={safeTrendingPosts} />
          </aside>
        )}
      </div>
    </div>
  );
}
