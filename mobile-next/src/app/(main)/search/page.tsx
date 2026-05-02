'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, type Post } from '@/lib/api';
import { ArticleCard } from '@/components/feed/ArticleCard';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 3) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api.search(q, { limit: 30 })
        .then((r) => { if (!cancelled) setResults(r); })
        .catch(() => { if (!cancelled) setResults([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <h1 className="text-display font-bold text-white mb-4">Search</h1>

      <div className="flex items-center gap-2 liquid-glass-dark rounded-full px-4 py-2">
        <Search size={16} className="text-white/60" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Articles, players, teams…"
          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="text-center text-xs text-white/50">Searching…</p>}
        {!loading && q.length >= 3 && results.length === 0 && (
          <p className="text-center text-xs text-white/50">No results.</p>
        )}
        {results.map((p) => <ArticleCard key={p.id} post={p} variant="compact" />)}
      </div>
    </main>
  );
}
