'use client';

import { Player } from '@/lib/types/sports';

interface PlayerBioProps {
  player: Player;
}

export default function PlayerBio({ player }: PlayerBioProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const bioItems = [
    { label: 'Height', value: player.height },
    { label: 'Weight', value: `${player.weight} lbs` },
    { label: 'Age', value: player.age.toString() },
    { label: 'Born', value: formatDate(player.birthDate) },
    ...(player.birthPlace ? [{ label: 'Birthplace', value: player.birthPlace }] : []),
    { label: 'College', value: player.college },
    { label: 'Experience', value: player.experience },
    ...(player.draftInfo
      ? [
          {
            label: 'Draft',
            value: `${player.draftInfo.year} Rd ${player.draftInfo.round}, Pick ${player.draftInfo.pick} (${player.draftInfo.team})`,
          },
        ]
      : [{ label: 'Draft', value: 'Undrafted' }]),
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Player Info
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {bioItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
