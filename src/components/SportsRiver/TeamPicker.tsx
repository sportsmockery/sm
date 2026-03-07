'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAMS = [
  { key: 'bears', label: 'Bears' },
  { key: 'cubs', label: 'Cubs' },
  { key: 'bulls', label: 'Bulls' },
  { key: 'blackhawks', label: 'Blackhawks' },
  { key: 'white-sox', label: 'White Sox' },
];

const LS_TEAM_PREFS = 'sm_team_prefs';
const LS_PICKER_DISMISSED = 'sm_picker_dismissed_at';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface TeamPickerProps {
  onComplete: (selectedTeams: string[]) => void;
  onDismiss: () => void;
}

export default function TeamPicker({ onComplete, onDismiss }: TeamPickerProps) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [allTeams, setAllTeams] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefs = localStorage.getItem(LS_TEAM_PREFS);
    if (prefs !== null) return;
    const dismissedAt = localStorage.getItem(LS_PICKER_DISMISSED);
    if (dismissedAt && Date.now() - Number(dismissedAt) < SEVEN_DAYS_MS) return;
    setVisible(true);
  }, []);

  const handleToggleTeam = useCallback((key: string) => {
    setAllTeams(false);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleAllTeams = useCallback(() => {
    setAllTeams(prev => !prev);
    setSelected(new Set());
  }, []);

  const handleSubmit = useCallback(() => {
    const teams = allTeams ? TEAMS.map(t => t.key) : Array.from(selected);
    if (teams.length === 0) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_TEAM_PREFS, JSON.stringify(teams));
    }
    setVisible(false);
    setTimeout(() => onComplete(teams), 300);
  }, [allTeams, selected, onComplete]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_PICKER_DISMISSED, String(Date.now()));
    }
    setVisible(false);
    setTimeout(() => onDismiss(), 300);
  }, [onDismiss]);

  const hasSelection = allTeams || selected.size > 0;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop — click to dismiss, does NOT block scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1099,
              pointerEvents: 'auto',
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-label="Choose your favorite teams"
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 680,
              zIndex: 1100,
              background: 'rgba(27, 36, 48, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid #2B3442',
              borderBottom: 'none',
              borderRadius: '16px 16px 0 0',
              padding: 24,
              pointerEvents: 'auto',
            }}
          >
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: '#FAFAFB',
                margin: 0,
                marginBottom: 4,
              }}
            >
              Which teams do you follow?
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                color: '#8899AA',
                margin: 0,
                marginBottom: 20,
              }}
            >
              We&apos;ll personalize your River instantly.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {TEAMS.map(team => {
                const isActive = selected.has(team.key);
                return (
                  <button
                    key={team.key}
                    onClick={() => handleToggleTeam(team.key)}
                    aria-pressed={isActive}
                    aria-label={`Select ${team.label}`}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : '#1B2430',
                      border: `1px solid ${isActive ? '#00D4FF' : '#2B3442'}`,
                      color: isActive ? '#00D4FF' : '#FAFAFB',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #00D4FF'; }}
                    onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {team.label}
                  </button>
                );
              })}
              <button
                onClick={handleAllTeams}
                aria-pressed={allTeams}
                aria-label="Select all teams"
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  backgroundColor: allTeams ? 'rgba(0, 212, 255, 0.1)' : '#1B2430',
                  border: `1px solid ${allTeams ? '#00D4FF' : '#2B3442'}`,
                  color: allTeams ? '#00D4FF' : '#FAFAFB',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #00D4FF'; }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                All Teams
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={handleSubmit}
                disabled={!hasSelection}
                aria-label="Start my River feed"
                style={{
                  backgroundColor: hasSelection ? '#BC0000' : '#555',
                  color: '#FAFAFB',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: hasSelection ? 'pointer' : 'not-allowed',
                  transition: 'opacity 0.15s',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #BC0000'; }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                Start My River →
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Skip team selection"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8899AA',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '4px 0',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                onBlur={e => { e.currentTarget.style.textDecoration = 'none'; }}
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
