import Link from 'next/link';

export default function TeamNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--sm-card)' }}>
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-black" style={{ color: 'var(--sm-text)' }}>404</h1>
        <h2 className="mb-4 text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
          Team Not Found
        </h2>
        <p className="mb-8" style={{ color: 'var(--sm-text-muted)' }}>
          We couldn&apos;t find the team you&apos;re looking for.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/teams"
            className="rounded-lg bg-[#8B0000] px-6 py-3 font-semibold text-white transition-colors hover:bg-red-800"
          >
            View All Teams
          </Link>
          <Link
            href="/"
            className="rounded-lg border px-6 py-3 font-semibold transition-colors"
            style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
