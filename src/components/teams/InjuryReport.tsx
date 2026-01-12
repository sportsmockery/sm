'use client';

import Image from 'next/image';
import Link from 'next/link';
import { InjuryReport as InjuryReportType, Team } from '@/lib/types/sports';

interface InjuryReportProps {
  injuries: InjuryReportType[];
  team: Team;
}

export default function InjuryReport({ injuries, team }: InjuryReportProps) {
  if (injuries.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Injury Report
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No injuries reported.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'out':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'doubtful':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'questionable':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'probable':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Injury Report
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {injuries.map((injury, index) => (
          <div key={`${injury.player.id}-${index}`} className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={injury.player.headshot}
                  alt={injury.player.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/players/${injury.player.slug}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-white"
                  >
                    {injury.player.name}
                  </Link>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {injury.player.position}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {injury.injury}
                </p>
              </div>

              <span className={`flex-shrink-0 rounded px-2 py-1 text-xs font-semibold ${getStatusColor(injury.status)}`}>
                {formatStatus(injury.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Last updated: {new Date(injuries[0]?.updated || Date.now()).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
