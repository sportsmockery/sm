// src/components/feed/FeedPersonalization.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface FeedPersonalizationProps {
  userId: string;
  initialTeamScores?: Record<string, number>;
  initialFormatPrefs?: Record<string, number>;
}

const DEFAULT_TEAM_SCORES: Record<string, number> = {
  bears: 50,
  bulls: 50,
  blackhawks: 50,
  cubs: 50,
  'white-sox': 50,
};

const DEFAULT_FORMAT_PREFS: Record<string, number> = {
  article: 50,
  video: 50,
  analysis: 50,
  podcast: 50,
};

const TEAM_NAMES: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  'white-sox': 'White Sox',
};

const FORMAT_NAMES: Record<string, string> = {
  article: 'News',
  video: 'Video',
  analysis: 'Analysis',
  podcast: 'Podcasts',
};

export function FeedPersonalization({
  userId,
  initialTeamScores,
  initialFormatPrefs,
}: FeedPersonalizationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamScores, setTeamScores] = useState<Record<string, number>>(
    initialTeamScores || DEFAULT_TEAM_SCORES
  );
  const [formatPrefs, setFormatPrefs] = useState<Record<string, number>>(
    initialFormatPrefs || DEFAULT_FORMAT_PREFS
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasPreferences = !!(initialTeamScores || initialFormatPrefs);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('user_engagement_profile')
        .upsert(
          {
            user_id: userId,
            team_scores: teamScores,
            format_prefs: formatPrefs,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Failed to save preferences:', error);
      } else {
        setSaved(true);
        // Reload to apply hard filters server-side
        setTimeout(() => window.location.reload(), 800);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="personalization-panel">
      <button
        className="personalization-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M6 2v2M6 12v2M10 2v4M10 10v4M2 6h2M12 6h2M2 10h6M10 10h4"
            strokeLinecap="round"
          />
        </svg>
        <span>Customize Your Feed</span>
        <svg
          className={`personalization-chevron ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M3 5l3 3 3-3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="personalization-body">
          <div className="pref-section">
            <h4>Team Priority</h4>
            <p className="pref-desc">
              Set how much of each team you want to see. <strong>0% = completely hidden</strong> from your feed.
            </p>
            {Object.entries(teamScores).map(([team, value]) => (
              <div className="pref-slider-row" key={team} style={value === 0 ? { opacity: 0.5 } : undefined}>
                <label>{TEAM_NAMES[team] || team}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) =>
                    setTeamScores((prev) => ({
                      ...prev,
                      [team]: parseInt(e.target.value),
                    }))
                  }
                  className="pref-slider"
                />
                <span className="pref-value" style={value === 0 ? { color: '#bc0000', fontWeight: 700 } : undefined}>
                  {value === 0 ? 'HIDDEN' : `${value}%`}
                </span>
              </div>
            ))}
          </div>

          <div className="pref-section">
            <h4>Content Types</h4>
            <p className="pref-desc">
              What kind of content do you want more of?
            </p>
            {Object.entries(formatPrefs).map(([format, value]) => (
              <div className="pref-slider-row" key={format}>
                <label>{FORMAT_NAMES[format] || format}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) =>
                    setFormatPrefs((prev) => ({
                      ...prev,
                      [format]: parseInt(e.target.value),
                    }))
                  }
                  className="pref-slider"
                />
                <span className="pref-value">{value}%</span>
              </div>
            ))}
          </div>

          <button
            className="save-prefs-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>
      )}

      {!hasPreferences && !isOpen && (
        <div className="first-run-banner">
          <p>
            Welcome! Customize your feed above, or just start reading — we'll
            learn your preferences over time.
          </p>
        </div>
      )}
    </div>
  );
}
