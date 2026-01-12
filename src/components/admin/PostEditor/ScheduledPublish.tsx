'use client'

import { useState, useEffect } from 'react'
import { format, parseISO, isBefore, addHours, addDays, startOfHour, setHours, setMinutes } from 'date-fns'

type PublishStatus = 'draft' | 'published' | 'scheduled'

interface ScheduledPublishProps {
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  onStatusChange: (status: PublishStatus) => void
  onScheduleChange: (dateTime: string | null) => void
}

export default function ScheduledPublish({
  status,
  scheduledAt,
  publishedAt,
  onStatusChange,
  onScheduleChange,
}: ScheduledPublishProps) {
  const [showScheduler, setShowScheduler] = useState(status === 'scheduled')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')

  // Initialize from existing schedule
  useEffect(() => {
    if (scheduledAt) {
      const date = parseISO(scheduledAt)
      setScheduleDate(format(date, 'yyyy-MM-dd'))
      setScheduleTime(format(date, 'HH:mm'))
    }
  }, [scheduledAt])

  // Update parent when date/time changes
  useEffect(() => {
    if (showScheduler && scheduleDate && scheduleTime) {
      const dateTime = `${scheduleDate}T${scheduleTime}:00`
      onScheduleChange(dateTime)
      onStatusChange('scheduled')
    }
  }, [scheduleDate, scheduleTime, showScheduler]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusSelect = (newStatus: PublishStatus) => {
    if (newStatus === 'scheduled') {
      setShowScheduler(true)
      // Default to next hour
      const nextHour = startOfHour(addHours(new Date(), 1))
      setScheduleDate(format(nextHour, 'yyyy-MM-dd'))
      setScheduleTime(format(nextHour, 'HH:mm'))
    } else {
      setShowScheduler(false)
      onScheduleChange(null)
      onStatusChange(newStatus)
    }
  }

  const quickSchedule = (hours: number) => {
    const date = addHours(new Date(), hours)
    setScheduleDate(format(date, 'yyyy-MM-dd'))
    setScheduleTime(format(startOfHour(date), 'HH:mm'))
  }

  const scheduleForTime = (hour: number) => {
    let date = setMinutes(setHours(new Date(), hour), 0)
    // If time has passed today, schedule for tomorrow
    if (isBefore(date, new Date())) {
      date = addDays(date, 1)
    }
    setScheduleDate(format(date, 'yyyy-MM-dd'))
    setScheduleTime(format(date, 'HH:mm'))
  }

  const isValidSchedule = scheduleDate && scheduleTime &&
    !isBefore(parseISO(`${scheduleDate}T${scheduleTime}`), new Date())

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Publish</h2>

      {/* Status selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status
        </label>
        <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {[
            { value: 'draft', label: 'Draft', icon: '📝' },
            { value: 'scheduled', label: 'Schedule', icon: '⏰' },
            { value: 'published', label: 'Publish', icon: '🚀' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleStatusSelect(option.value as PublishStatus)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                (status === option.value || (status === 'scheduled' && option.value === 'scheduled'))
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Published info */}
      {status === 'published' && publishedAt && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-400">
            Published on {format(parseISO(publishedAt), 'MMM d, yyyy \'at\' h:mm a')}
          </p>
        </div>
      )}

      {/* Schedule picker */}
      {showScheduler && (
        <div className="mt-4 space-y-4">
          {/* Quick schedule buttons */}
          <div>
            <label className="block text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400 mb-2">
              Quick Schedule
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => quickSchedule(1)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                In 1 hour
              </button>
              <button
                type="button"
                onClick={() => quickSchedule(3)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                In 3 hours
              </button>
              <button
                type="button"
                onClick={() => scheduleForTime(9)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                9 AM
              </button>
              <button
                type="button"
                onClick={() => scheduleForTime(12)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                12 PM
              </button>
              <button
                type="button"
                onClick={() => scheduleForTime(17)}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                5 PM
              </button>
            </div>
          </div>

          {/* Date picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Schedule preview */}
          {scheduleDate && scheduleTime && (
            <div className={`rounded-lg p-3 ${
              isValidSchedule
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              {isValidSchedule ? (
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Will publish on{' '}
                  <strong>
                    {format(parseISO(`${scheduleDate}T${scheduleTime}`), 'EEEE, MMM d, yyyy \'at\' h:mm a')}
                  </strong>
                </p>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-400">
                  Schedule time must be in the future
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Visibility note */}
      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {status === 'draft' && 'Drafts are only visible to editors'}
        {status === 'scheduled' && 'Scheduled posts will auto-publish at the set time'}
        {status === 'published' && 'Published posts are visible to everyone'}
      </div>
    </div>
  )
}
