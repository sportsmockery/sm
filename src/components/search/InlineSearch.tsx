// src/components/search/InlineSearch.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const FEATURES = [
  { name: 'Scout AI', description: 'Ask anything about Chicago sports', href: '/scout-ai', icon: 'AI' },
  { name: 'Trade Simulator', description: 'Build and grade trades', href: '/gm', icon: 'GM' },
  { name: 'Mock Draft', description: 'Run full mock drafts', href: '/mock-draft', icon: 'MD' },
  { name: 'Fan Chat', description: 'Team chat rooms with AI', href: '/fan-chat', icon: 'FC' },
  { name: 'Data Hub', description: 'Stats, scores, schedules', href: '/datahub', icon: 'DH' },
  { name: 'Leaderboards', description: 'Fan rankings & GM scores', href: '/leaderboards', icon: 'LB' },
  { name: 'Predictions', description: 'SM Prophecy predictions', href: '/predictions', icon: 'PR' },
  { name: 'My Profile', description: 'Account settings', href: '/profile', icon: 'ME' },
];

const TEAMS = [
  { name: 'Chicago Bears', href: '/chicago-bears', slug: 'bears' },
  { name: 'Chicago Bulls', href: '/chicago-bulls', slug: 'bulls' },
  { name: 'Chicago Blackhawks', href: '/chicago-blackhawks', slug: 'blackhawks' },
  { name: 'Chicago Cubs', href: '/chicago-cubs', slug: 'cubs' },
  { name: 'Chicago White Sox', href: '/chicago-white-sox', slug: 'whitesox' },
];

interface SearchResults {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    team_slug: string | null;
    category_slug: string | null;
    published_at: string;
  }>;
  features: typeof FEATURES;
  teams: typeof TEAMS;
}

const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

export function InlineSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    articles: [],
    features: [],
    teams: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleInput(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults({ articles: [], features: [], teams: [] });
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    debounceRef.current = setTimeout(async () => {
      const q = value.toLowerCase();

      // Filter features
      const matchedFeatures = FEATURES.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );

      // Filter teams
      const matchedTeams = TEAMS.filter(
        (t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)
      );

      // Search articles in Supabase
      let articles: SearchResults['articles'] = [];
      if (supabase) {
        const { data } = await supabase
          .from('sm_posts')
          .select(
            'id, title, slug, published_at, category:sm_categories!category_id(slug)'
          )
          .eq('status', 'published')
          .ilike('title', `%${value}%`)
          .order('published_at', { ascending: false })
          .limit(6);

        articles = (data || []).map((a: any) => {
          const cat = Array.isArray(a.category) ? a.category[0] : a.category;
          const catSlug = cat?.slug || null;
          let teamSlug: string | null = null;
          if (catSlug?.includes('bears')) teamSlug = 'bears';
          else if (catSlug?.includes('bulls')) teamSlug = 'bulls';
          else if (catSlug?.includes('blackhawks')) teamSlug = 'blackhawks';
          else if (catSlug?.includes('cubs')) teamSlug = 'cubs';
          else if (catSlug?.includes('white-sox') || catSlug?.includes('whitesox'))
            teamSlug = 'whitesox';
          return {
            id: a.id,
            title: a.title,
            slug: a.slug,
            team_slug: teamSlug,
            category_slug: catSlug,
            published_at: a.published_at,
          };
        });
      }

      setResults({
        articles,
        features: matchedFeatures,
        teams: matchedTeams,
      });
      setIsLoading(false);
    }, 250);
  }

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasResults =
    results.articles.length > 0 ||
    results.features.length > 0 ||
    results.teams.length > 0;

  return (
    <div className="inline-search" ref={containerRef}>
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search articles, teams, features..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          id="sm-search-input"
        />
        <kbd className="search-shortcut">&#8984;K</kbd>
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {isLoading && (
            <div className="search-loading">Searching...</div>
          )}

          {!isLoading && results.features.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">Features</div>
              {results.features.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className="search-result-item"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="result-icon">{f.icon}</span>
                  <div>
                    <div className="result-name">{f.name}</div>
                    <div className="result-desc">{f.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && results.teams.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">Teams</div>
              {results.teams.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="search-result-item"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="result-icon">T</span>
                  <div className="result-name">{t.name}</div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && results.articles.length > 0 && (
            <div className="search-section">
              <div className="search-section-label">Articles</div>
              {results.articles.map((a) => (
                <Link
                  key={a.id}
                  href={
                    a.category_slug
                      ? `/${a.category_slug}/${a.slug}`
                      : `/${a.slug}`
                  }
                  className="search-result-item"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="result-icon">A</span>
                  <div>
                    <div className="result-name">{a.title}</div>
                    <div className="result-desc">
                      {a.team_slug || 'Sports'} &middot;{' '}
                      {new Date(a.published_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="search-empty">No results for &quot;{query}&quot;</div>
          )}

          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            className="search-see-all"
            onClick={() => setIsOpen(false)}
          >
            See all results for &quot;{query}&quot; &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
