'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Team } from '@/lib/types/sports';

interface SeasonSelectorProps {
  team: Team;
  currentSeason?: string;
}

export default function SeasonSelector({ team, currentSeason }: SeasonSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate season options based on sport
  const getSeasons = () => {
    const currentYear = new Date().getFullYear();
    const seasons: { value: string; label: string }[] = [];

    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;

      if (team.sport === 'nfl') {
        seasons.push({ value: String(year), label: `${year} Season` });
      } else if (team.sport === 'nba' || team.sport === 'nhl') {
        seasons.push({ value: `${year}-${(year + 1).toString().slice(2)}`, label: `${year}-${(year + 1).toString().slice(2)}` });
      } else if (team.sport === 'mlb') {
        seasons.push({ value: String(year), label: `${year} Season` });
      }
    }

    return seasons;
  };

  const seasons = getSeasons();
  const selectedSeason = currentSeason || seasons[0]?.value;

  const handleSeasonChange = (season: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', season);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <label htmlFor="season-select" className="text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>
        Season:
      </label>
      <select
        id="season-select"
        value={selectedSeason}
        onChange={(e) => handleSeasonChange(e.target.value)}
        className="rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none"
        style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
      >
        {seasons.map((season) => (
          <option key={season.value} value={season.value}>
            {season.label}
          </option>
        ))}
      </select>
    </div>
  );
}
