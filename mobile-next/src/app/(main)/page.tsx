import { FeedShell } from '@/components/feed/FeedShell';

export default function FeedPage() {
  return (
    <main className="min-h-dvh">
      <header className="px-5 pt-6 pb-3 safe-top">
        <h1 className="text-hero font-bold tracking-tight text-white">Sports Mockery</h1>
        <p className="text-sm text-white/60 mt-1">Chicago sports intelligence.</p>
      </header>
      <FeedShell />
    </main>
  );
}
