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
    <div className="rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Player Info
        </h3>
      </div>

      <div className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
        {bioItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{item.label}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
