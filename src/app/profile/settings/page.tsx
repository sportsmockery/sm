'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notifications
    breakingNews: true,
    teamUpdates: true,
    weeklyDigest: false,
    predictionResults: true,

    // Display
    darkMode: true,
    reducedMotion: false,
    compactMode: false,

    // Privacy
    showProfile: true,
    showActivity: false,
    allowAnalytics: true,

    // Favorite team
    favoriteTeam: 'bears',
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const teams = [
    { id: 'bears', name: 'Chicago Bears', color: '#C83200' },
    { id: 'bulls', name: 'Chicago Bulls', color: '#CE1141' },
    { id: 'cubs', name: 'Chicago Cubs', color: '#0E3386' },
    { id: 'white-sox', name: 'Chicago White Sox', color: '#27251F' },
    { id: 'blackhawks', name: 'Chicago Blackhawks', color: '#CF0A2C' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <section className="border-b border-zinc-800 py-8">
        <div className="mx-auto max-w-2xl px-4">
          <Link
            href="/profile"
            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-zinc-500">Manage your preferences and account settings</p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Favorite Team */}
        <section className="mb-8">
          <h2 className="mb-4 font-bold text-white">Favorite Team</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSettings(prev => ({ ...prev, favoriteTeam: team.id }))}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                  settings.favoriteTeam === team.id
                    ? 'border-white/50 bg-white/10'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm font-medium text-white">{team.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B0000]/20">
              <svg className="h-5 w-5 text-[#8B0000]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-white">Notifications</h2>
              <p className="text-xs text-zinc-500">Choose what updates you receive</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              label="Breaking News Alerts"
              description="Get notified about major breaking stories"
              enabled={settings.breakingNews}
              onChange={() => handleToggle('breakingNews')}
            />
            <ToggleSetting
              label="Team Updates"
              description="Updates about your favorite team"
              enabled={settings.teamUpdates}
              onChange={() => handleToggle('teamUpdates')}
            />
            <ToggleSetting
              label="Weekly Digest"
              description="Summary of the week&apos;s top stories"
              enabled={settings.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
            />
            <ToggleSetting
              label="Prediction Results"
              description="When SM Prophecy predictions are resolved"
              enabled={settings.predictionResults}
              onChange={() => handleToggle('predictionResults')}
            />
          </div>
        </section>

        {/* Display */}
        <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-white">Display</h2>
              <p className="text-xs text-zinc-500">Customize your viewing experience</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              label="Dark Mode"
              description="Use dark theme throughout the site"
              enabled={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
            <ToggleSetting
              label="Reduced Motion"
              description="Minimize animations for accessibility"
              enabled={settings.reducedMotion}
              onChange={() => handleToggle('reducedMotion')}
            />
            <ToggleSetting
              label="Compact Mode"
              description="Denser layout with smaller elements"
              enabled={settings.compactMode}
              onChange={() => handleToggle('compactMode')}
            />
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-white">Privacy</h2>
              <p className="text-xs text-zinc-500">Control your data and visibility</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleSetting
              label="Public Profile"
              description="Allow others to see your profile"
              enabled={settings.showProfile}
              onChange={() => handleToggle('showProfile')}
            />
            <ToggleSetting
              label="Activity Visibility"
              description="Show your reading activity on profile"
              enabled={settings.showActivity}
              onChange={() => handleToggle('showActivity')}
            />
            <ToggleSetting
              label="Analytics"
              description="Help improve SM with anonymous usage data"
              enabled={settings.allowAnalytics}
              onChange={() => handleToggle('allowAnalytics')}
            />
          </div>
        </section>

        {/* Account Actions */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-6 font-bold text-white">Account</h2>

          <div className="space-y-3">
            <button className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 text-left transition-colors hover:bg-white/10">
              <div>
                <p className="font-medium text-white">Change Password</p>
                <p className="text-xs text-zinc-500">Update your account password</p>
              </div>
              <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <button className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 text-left transition-colors hover:bg-white/10">
              <div>
                <p className="font-medium text-white">Export Data</p>
                <p className="text-xs text-zinc-500">Download all your data</p>
              </div>
              <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <button className="flex w-full items-center justify-between rounded-xl bg-red-500/10 p-4 text-left transition-colors hover:bg-red-500/20">
              <div>
                <p className="font-medium text-red-400">Delete Account</p>
                <p className="text-xs text-red-400/60">Permanently delete your account and data</p>
              </div>
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </section>

        {/* Save button */}
        <div className="mt-8 flex justify-end">
          <button className="rounded-xl bg-gradient-to-r from-[#8B0000] to-[#FF0000] px-8 py-3 font-bold text-white transition-all hover:from-[#a00000] hover:to-[#FF3333]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleSetting({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string
  description: string
  enabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          enabled ? 'bg-[#8B0000]' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}
