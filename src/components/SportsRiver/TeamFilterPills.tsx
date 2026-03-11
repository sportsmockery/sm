'use client';

import React, { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TEAMS = [
  { key: 'all', label: 'All' },
  { key: 'bears', label: 'Bears' },
  { key: 'cubs', label: 'Cubs' },
  { key: 'bulls', label: 'Bulls' },
  { key: 'blackhawks', label: 'Blackhawks' },
  { key: 'white-sox', label: 'White Sox' },
];

const LS_TEAM_FILTER = 'sm_team_filter';

interface TeamFilterPillsProps {
  currentTeam: string;
  onTeamChange: (team: string) => void;
}

export default function TeamFilterPills({ currentTeam, onTeamChange }: TeamFilterPillsProps) {
  const { isAuthenticated } = useAuth();

  // Restore persisted filter on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(LS_TEAM_FILTER);
    if (saved && saved !== currentTeam && TEAMS.some(t => t.key === saved)) {
      onTeamChange(saved);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (team: string) => {
      onTeamChange(team);

      if (isAuthenticated) {
        fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamFilter: team }),
        }).catch(() => {});
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(LS_TEAM_FILTER, team);
      }
    },
    [onTeamChange, isAuthenticated]
  );

  const pillStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    border: `1px solid ${isActive ? '#BC0000' : '#2B3442'}`,
    backgroundColor: isActive ? 'rgba(188, 0, 0, 0.1)' : '#1B2430',
    color: isActive ? '#BC0000' : 'rgba(230, 232, 236, 0.7)',
    outline: 'none',
   
  });

  return (
    <>
      {/* Desktop: vertical list */}
      <nav
        aria-label="Team filter"
        className="hidden md:flex"
        style={{ flexDirection: 'column', gap: 4 }}
      >
        {TEAMS.map(team => {
          const isActive = currentTeam === team.key;
          return (
            <button
              key={team.key}
              onClick={() => handleChange(team.key)}
              aria-pressed={isActive}
              aria-label={`Filter by ${team.label}`}
              style={pillStyle(isActive)}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#2B3442';
                  e.currentTarget.style.color = '#FAFAFB';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#2B3442';
                  e.currentTarget.style.color = 'rgba(230, 232, 236, 0.7)';
                }
              }}
              onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(188, 0, 0, 0.4)'; }}
              onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {team.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile: horizontal scrollable strip */}
      <nav
        aria-label="Team filter"
        className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {TEAMS.map(team => {
          const isActive = currentTeam === team.key;
          return (
            <button
              key={team.key}
              onClick={() => handleChange(team.key)}
              aria-pressed={isActive}
              aria-label={`Filter by ${team.label}`}
              style={pillStyle(isActive)}
            >
              {team.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
