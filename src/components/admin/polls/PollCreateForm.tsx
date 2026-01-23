'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { CreatePollInput, PollType, ChicagoTeam, CreatePollOptionInput } from '@/types/polls'
import { TEAM_COLORS, EMOJI_OPTIONS, getTeamColors } from '@/types/polls'
import PollEmbed from '@/components/polls/PollEmbed'

interface PollCreateFormProps {
  editMode?: boolean
  initialData?: Partial<CreatePollInput> & { id?: string }
}

const POLL_TYPES: { value: PollType; label: string; icon: string; description: string }[] = [
  { value: 'single', label: 'Single Choice', icon: '🔘', description: 'Voters can select one option' },
  { value: 'multiple', label: 'Multiple Choice', icon: '☑️', description: 'Voters can select multiple options' },
  { value: 'scale', label: 'Scale', icon: '📊', description: 'Rate on a numeric scale (1-10)' },
  { value: 'emoji', label: 'Emoji Reaction', icon: '😊', description: 'React with emoji options' },
]

export default function PollCreateForm({ editMode = false, initialData }: PollCreateFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Form state
  const [title, setTitle] = useState(initialData?.title || '')
  const [question, setQuestion] = useState(initialData?.question || '')
  const [pollType, setPollType] = useState<PollType>(initialData?.poll_type || 'single')
  const [teamTheme, setTeamTheme] = useState<ChicagoTeam>(initialData?.team_theme || null)
  const [options, setOptions] = useState<CreatePollOptionInput[]>(
    initialData?.options || [{ option_text: '' }, { option_text: '' }]
  )

  // Scale options
  const [scaleMin, setScaleMin] = useState(initialData?.scale_min || 1)
  const [scaleMax, setScaleMax] = useState(initialData?.scale_max || 10)
  const [scaleLabelMin, setScaleLabelMin] = useState(initialData?.scale_labels?.min || 'Not at all')
  const [scaleLabelMax, setScaleLabelMax] = useState(initialData?.scale_labels?.max || 'Absolutely')

  // Settings
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous ?? false)
  const [showResults, setShowResults] = useState(initialData?.show_results ?? true)
  const [showLiveResults, setShowLiveResults] = useState(initialData?.show_live_results ?? true)
  const [startsAt, setStartsAt] = useState(initialData?.starts_at || '')
  const [endsAt, setEndsAt] = useState(initialData?.ends_at || '')

  const teamColors = getTeamColors(teamTheme)

  function addOption() {
    setOptions([...options, { option_text: '' }])
  }

  function removeOption(index: number) {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== index))
  }

  function updateOption(index: number, updates: Partial<CreatePollOptionInput>) {
    setOptions(options.map((opt, i) => (i === index ? { ...opt, ...updates } : opt)))
  }

  function selectEmoji(emoji: typeof EMOJI_OPTIONS[number]) {
    if (options.some(o => o.emoji === emoji)) {
      setOptions(options.filter(o => o.emoji !== emoji))
    } else {
      setOptions([...options, { option_text: emoji, emoji }])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const payload: CreatePollInput = {
        title,
        question,
        poll_type: pollType,
        team_theme: teamTheme,
        is_anonymous: isAnonymous,
        show_results: showResults,
        show_live_results: showLiveResults,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        options: pollType === 'scale' ? [] : options.filter(o => o.option_text.trim()),
      }

      if (pollType === 'scale') {
        payload.scale_min = scaleMin
        payload.scale_max = scaleMax
        payload.scale_labels = { min: scaleLabelMin, max: scaleLabelMax }
      }

      const url = editMode && initialData?.id ? `/api/polls/${initialData.id}` : '/api/polls'
      const method = editMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save poll')
      }

      // Redirect to polls list or edit page
      router.push('/polls')
    } catch (err: any) {
      setError(err.message || 'Failed to save poll')
    } finally {
      setSaving(false)
    }
  }

  // Build preview poll object
  const previewPoll = {
    id: 'preview',
    title,
    question,
    poll_type: pollType,
    status: 'active' as const,
    team_theme: teamTheme,
    is_anonymous: isAnonymous,
    show_results: showResults,
    show_live_results: showLiveResults,
    is_multi_select: pollType === 'multiple',
    scale_min: scaleMin,
    scale_max: scaleMax,
    scale_labels: { min: scaleLabelMin, max: scaleLabelMax },
    total_votes: 0,
    starts_at: startsAt,
    ends_at: endsAt,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: pollType === 'scale'
      ? Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => ({
          id: `${i}`,
          poll_id: 'preview',
          option_text: String(scaleMin + i),
          display_order: i,
          vote_count: 0,
          created_at: new Date().toISOString(),
        }))
      : options.map((opt, i) => ({
          id: `${i}`,
          poll_id: 'preview',
          option_text: opt.option_text,
          option_image: opt.option_image || null,
          team_tag: opt.team_tag || null,
          emoji: opt.emoji || null,
          display_order: i,
          vote_count: 0,
          created_at: new Date().toISOString(),
        })),
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Poll Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Poll Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {POLL_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setPollType(type.value)
                  if (type.value === 'emoji') {
                    setOptions(EMOJI_OPTIONS.slice(0, 4).map(e => ({ option_text: e, emoji: e as typeof EMOJI_OPTIONS[number] })))
                  } else if (type.value !== 'scale' && options.length < 2) {
                    setOptions([{ option_text: '' }, { option_text: '' }])
                  }
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  pollType === type.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="mt-2 font-medium text-gray-900 dark:text-white">{type.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Poll Title (internal reference)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bears QB Trade Poll"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's your take on the Bears trading for a new QB?"
              rows={2}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>
        </div>

        {/* Team Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Team Theme (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTeamTheme(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                teamTheme === null
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              None
            </button>
            {Object.entries(TEAM_COLORS).filter(([key]) => key !== 'default').map(([team, colors]) => (
              <button
                key={team}
                type="button"
                onClick={() => setTeamTheme(team as ChicagoTeam)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  teamTheme === team
                    ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900'
                    : ''
                }`}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.accent,
                  ...(teamTheme === team ? { ringColor: colors.primary } : {})
                }}
              >
                {team.charAt(0).toUpperCase() + team.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Options (for non-scale polls) */}
        {pollType !== 'scale' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {pollType === 'emoji' ? 'Emoji Options' : 'Answer Options'}
            </label>

            {pollType === 'emoji' ? (
              <div className="flex flex-wrap gap-3">
                {EMOJI_OPTIONS.map((emoji) => {
                  const isSelected = options.some(o => o.emoji === emoji)
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => selectEmoji(emoji)}
                      className={`text-3xl p-3 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={option.option_text}
                        onChange={(e) => updateOption(index, { option_text: e.target.value })}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <select
                        value={option.team_tag || ''}
                        onChange={(e) => updateOption(index, { team_tag: e.target.value as ChicagoTeam || null })}
                        className="px-3 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                      >
                        <option value="">No team</option>
                        {Object.keys(TEAM_COLORS).filter(t => t !== 'default').map(team => (
                          <option key={team} value={team}>
                            {team.charAt(0).toUpperCase() + team.slice(1)}
                          </option>
                        ))}
                      </select>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={addOption}
                  className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
                >
                  + Add Option
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scale Options */}
        {pollType === 'scale' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={scaleMin}
                  onChange={(e) => setScaleMin(parseInt(e.target.value))}
                  min={0}
                  max={scaleMax - 1}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(parseInt(e.target.value))}
                  min={scaleMin + 1}
                  max={10}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Label
                </label>
                <input
                  type="text"
                  value={scaleLabelMin}
                  onChange={(e) => setScaleLabelMin(e.target.value)}
                  placeholder="Not at all"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Label
                </label>
                <input
                  type="text"
                  value={scaleLabelMax}
                  onChange={(e) => setScaleLabelMax(e.target.value)}
                  placeholder="Absolutely"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showResults}
                onChange={(e) => setShowResults(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show results after voting
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showLiveResults}
                onChange={(e) => setShowLiveResults(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show live results before voting
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Anonymous voting (don't track user IDs)
              </span>
            </label>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date (optional)
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date (optional)
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving || !title || !question || (pollType !== 'scale' && options.filter(o => o.option_text.trim()).length < 2)}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : editMode ? (
              'Update Poll'
            ) : (
              'Create Poll'
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="lg:sticky lg:top-8 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h3>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-purple-600 dark:text-purple-400"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        <AnimatePresence>
          {(showPreview || question) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <PollEmbed poll={previewPoll} />
            </motion.div>
          )}
        </AnimatePresence>

        {!showPreview && !question && (
          <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-gray-500 dark:text-gray-400">
            <span className="text-3xl mb-3 block">🗳️</span>
            <p className="text-sm">Enter a question to see the preview</p>
          </div>
        )}
      </div>
    </div>
  )
}
