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
      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Injury Report
        </h3>
        <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
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
    <div className="rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Injury Report
        </h3>
      </div>

      <div className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
        {injuries.map((injury, index) => (
          <div key={`${injury.player.id}-${index}`} className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
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
                    className="font-medium hover:underline"
                    style={{ color: 'var(--sm-text)' }}
                  >
                    {injury.player.name}
                  </Link>
                  <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                    {injury.player.position}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
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

      <div className="border-t px-5 py-3" style={{ borderColor: 'var(--sm-border)' }}>
        <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
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
