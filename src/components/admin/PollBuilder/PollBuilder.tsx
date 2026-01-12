'use client'

import { useState, useCallback } from 'react'
import { motion, Reorder } from 'framer-motion'

export interface PollOption {
  id: string
  text: string
  color?: string
}

export interface PollConfig {
  question: string
  options: PollOption[]
  pollType: 'single' | 'multiple'
  showResults: boolean
  endsAt: string | null
}

interface PollBuilderProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: PollConfig) => void
  initialConfig?: Partial<PollConfig>
}

const defaultOption = (): PollOption => ({
  id: crypto.randomUUID(),
  text: '',
})

const defaultConfig: PollConfig = {
  question: '',
  options: [defaultOption(), defaultOption()],
  pollType: 'single',
  showResults: true,
  endsAt: null,
}

const colorOptions = [
  { value: '', label: 'Default' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Emerald' },
  { value: '#EF4444', label: 'Red' },
]

export default function PollBuilder({ isOpen, onClose, onSave, initialConfig }: PollBuilderProps) {
  const [config, setConfig] = useState<PollConfig>({
    ...defaultConfig,
    ...initialConfig,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateConfig = useCallback((updates: Partial<PollConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
    setErrors({})
  }, [])

  const addOption = () => {
    if (config.options.length >= 10) return
    updateConfig({
      options: [...config.options, defaultOption()],
    })
  }

  const removeOption = (id: string) => {
    if (config.options.length <= 2) return
    updateConfig({
      options: config.options.filter((opt) => opt.id !== id),
    })
  }

  const updateOption = (id: string, updates: Partial<PollOption>) => {
    updateConfig({
      options: config.options.map((opt) =>
        opt.id === id ? { ...opt, ...updates } : opt
      ),
    })
  }

  const handleReorder = (newOptions: PollOption[]) => {
    updateConfig({ options: newOptions })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!config.question.trim()) {
      newErrors.question = 'Question is required'
    }

    const emptyOptions = config.options.filter((opt) => !opt.text.trim())
    if (emptyOptions.length > 0) {
      newErrors.options = 'All options must have text'
    }

    if (config.options.length < 2) {
      newErrors.options = 'At least 2 options are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(config)
    setConfig(defaultConfig)
    onClose()
  }

  const handleClose = () => {
    setConfig(defaultConfig)
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-[#1c1c1f] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗳️</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Poll</h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Poll Question
            </label>
            <input
              type="text"
              value={config.question}
              onChange={(e) => updateConfig({ question: e.target.value })}
              placeholder="Who will win the championship this year?"
              className={`w-full rounded-lg border ${
                errors.question
                  ? 'border-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              } bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            />
            {errors.question && (
              <p className="text-xs text-red-500">{errors.question}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Options (drag to reorder)
              </label>
              <span className="text-xs text-gray-500">{config.options.length}/10</span>
            </div>

            <Reorder.Group
              axis="y"
              values={config.options}
              onReorder={handleReorder}
              className="space-y-2"
            >
              {config.options.map((option, index) => (
                <Reorder.Item
                  key={option.id}
                  value={option}
                  className="flex items-center gap-2"
                >
                  {/* Drag handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Option number */}
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-xs font-medium text-purple-500">
                    {index + 1}
                  </span>

                  {/* Option input */}
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, { text: e.target.value })}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                  />

                  {/* Color picker */}
                  <select
                    value={option.color || ''}
                    onChange={(e) => updateOption(option.id, { color: e.target.value || undefined })}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-2 text-sm text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
                  >
                    {colorOptions.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>

                  {/* Remove button */}
                  <button
                    onClick={() => removeOption(option.id)}
                    disabled={config.options.length <= 2}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {errors.options && (
              <p className="text-xs text-red-500">{errors.options}</p>
            )}

            {/* Add option button */}
            <button
              onClick={addOption}
              disabled={config.options.length >= 10}
              className="w-full rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 py-3 text-sm font-medium text-gray-500 hover:border-purple-500 hover:text-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              + Add Option
            </button>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Settings</h3>

            {/* Poll Type */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Poll Type</p>
                <p className="text-xs text-gray-500">Allow single or multiple selections</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateConfig({ pollType: 'single' })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    config.pollType === 'single'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Single Choice
                </button>
                <button
                  onClick={() => updateConfig({ pollType: 'multiple' })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    config.pollType === 'multiple'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Multiple Choice
                </button>
              </div>
            </div>

            {/* Show Results Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Results</p>
                <p className="text-xs text-gray-500">Let users see results before voting</p>
              </div>
              <button
                onClick={() => updateConfig({ showResults: !config.showResults })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  config.showResults ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    config.showResults ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>

            {/* End Date */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</p>
                <p className="text-xs text-gray-500">Optional: close poll automatically</p>
              </div>
              <input
                type="datetime-local"
                value={config.endsAt || ''}
                onChange={(e) => updateConfig({ endsAt: e.target.value || null })}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  )
}
