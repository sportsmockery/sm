// src/components/homepage/TeamPickerPrompt.tsx
'use client';

import { useState, useEffect } from 'react';

const TEAMS = [
  { slug: 'bears', label: 'Bears' },
  { slug: 'bulls', label: 'Bulls' },
  { slug: 'blackhawks', label: 'Blackhawks' },
  { slug: 'cubs', label: 'Cubs' },
  { slug: 'white-sox', label: 'White Sox' }
];

export function TeamPickerPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const pageViews = parseInt(localStorage.getItem('sm_page_views') || '0', 10);
    const dismissed = localStorage.getItem('sm_team_prompt_dismissed');
    const hasTeam = localStorage.getItem('sm_preferred_team');

    if (pageViews >= 3 && !dismissed && !hasTeam) {
      setIsVisible(true);
    }
  }, []);

  const handleSelect = (team: string) => {
    localStorage.setItem('sm_preferred_team', team);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('sm_team_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="team-picker-prompt" role="dialog" aria-label="Choose your team">
      <div className="team-picker-content">
        <button
          className="team-picker-close"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          &times;
        </button>
        <h3 className="team-picker-title">Pick your team for personalized stories</h3>
        <div className="team-picker-options">
          {TEAMS.map((team) => (
            <button
              key={team.slug}
              onClick={() => handleSelect(team.slug)}
              className="team-picker-option"
            >
              <span className="team-picker-label">{team.label}</span>
            </button>
          ))}
        </div>
        <button
          className="team-picker-skip"
          onClick={handleDismiss}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
