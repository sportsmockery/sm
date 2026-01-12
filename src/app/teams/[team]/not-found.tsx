import Link from 'next/link';

export default function TeamNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-black text-zinc-900 dark:text-white">404</h1>
        <h2 className="mb-4 text-2xl font-bold text-zinc-700 dark:text-zinc-300">
          Team Not Found
        </h2>
        <p className="mb-8 text-zinc-500 dark:text-zinc-400">
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
            className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
