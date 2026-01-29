'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export interface GMPreferences {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  favorite_team: string | null
  team_phase: 'rebuilding' | 'contending' | 'win_now' | 'auto'
  preferred_trade_style: 'balanced' | 'star_hunting' | 'depth_building' | 'draft_focused'
  cap_flexibility_priority: 'low' | 'medium' | 'high'
  age_preference: 'young' | 'prime' | 'veteran' | 'any'
}

const DEFAULT_PREFERENCES: GMPreferences = {
  risk_tolerance: 'moderate',
  favorite_team: null,
  team_phase: 'auto',
  preferred_trade_style: 'balanced',
  cap_flexibility_priority: 'medium',
  age_preference: 'any',
}

interface PreferencesModalProps {
  show: boolean
  onClose: () => void
  preferences: GMPreferences
  onSave: (prefs: GMPreferences) => void
}

interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
  description?: string
}

function OptionButton({ label, selected, onClick, description }: OptionButtonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: description ? '10px 12px' : '8px 12px',
        borderRadius: 8,
        border: `2px solid ${selected ? '#bc0000' : (isDark ? '#374151' : '#e5e7eb')}`,
        backgroundColor: selected ? '#bc000015' : 'transparent',
        color: selected ? '#bc0000' : (isDark ? '#fff' : '#1a1a1a'),
        fontWeight: selected ? 700 : 500,
        fontSize: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <div>{label}</div>
      {description && (
        <div style={{ fontSize: '10px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: 2 }}>
          {description}
        </div>
      )}
    </button>
  )
}

export function PreferencesModal({ show, onClose, preferences, onSave }: PreferencesModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [localPrefs, setLocalPrefs] = useState<GMPreferences>(preferences)
  const [saving, setSaving] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  useEffect(() => {
    if (show) {
      setLocalPrefs(preferences)
    }
  }, [show, preferences])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/gm/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: localPrefs }),
      })
      onSave(localPrefs)
      onClose()
    } catch (e) {
      console.error('Failed to save preferences:', e)
    }
    setSaving(false)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                GM Preferences
              </h2>
              <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
                Customize how the AI evaluates your trades
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: subText,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Risk Tolerance */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Risk Tolerance
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['conservative', 'moderate', 'aggressive'] as const).map(opt => (
                <OptionButton
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={localPrefs.risk_tolerance === opt}
                  onClick={() => setLocalPrefs(p => ({ ...p, risk_tolerance: opt }))}
                />
              ))}
            </div>
          </div>

          {/* Team Phase */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Team Building Phase
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { value: 'auto', label: 'Auto Detect', desc: 'AI determines based on roster' },
                { value: 'rebuilding', label: 'Rebuilding', desc: 'Prioritize youth & picks' },
                { value: 'contending', label: 'Contending', desc: 'Balance present & future' },
                { value: 'win_now', label: 'Win Now', desc: 'Maximize current talent' },
              ] as const).map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  selected={localPrefs.team_phase === opt.value}
                  onClick={() => setLocalPrefs(p => ({ ...p, team_phase: opt.value }))}
                />
              ))}
            </div>
          </div>

          {/* Trade Style */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Preferred Trade Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { value: 'balanced', label: 'Balanced', desc: 'Equal weight to all factors' },
                { value: 'star_hunting', label: 'Star Hunting', desc: 'Target elite talent' },
                { value: 'depth_building', label: 'Depth Building', desc: 'Acquire multiple contributors' },
                { value: 'draft_focused', label: 'Draft Focused', desc: 'Value draft picks highly' },
              ] as const).map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  selected={localPrefs.preferred_trade_style === opt.value}
                  onClick={() => setLocalPrefs(p => ({ ...p, preferred_trade_style: opt.value }))}
                />
              ))}
            </div>
          </div>

          {/* Cap Flexibility */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Cap Flexibility Priority
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['low', 'medium', 'high'] as const).map(opt => (
                <OptionButton
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={localPrefs.cap_flexibility_priority === opt}
                  onClick={() => setLocalPrefs(p => ({ ...p, cap_flexibility_priority: opt }))}
                />
              ))}
            </div>
          </div>

          {/* Age Preference */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
              Player Age Preference
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {([
                { value: 'any', label: 'Any' },
                { value: 'young', label: 'Young' },
                { value: 'prime', label: 'Prime' },
                { value: 'veteran', label: 'Veteran' },
              ] as const).map(opt => (
                <OptionButton
                  key={opt.value}
                  label={opt.label}
                  selected={localPrefs.age_preference === opt.value}
                  onClick={() => setLocalPrefs(p => ({ ...p, age_preference: opt.value }))}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setLocalPrefs(DEFAULT_PREFERENCES)}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: `2px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#bc0000',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
