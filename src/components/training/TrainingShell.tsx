import React from 'react'

export function TrainingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#07080d] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.16),transparent_35%),radial-gradient(circle_at_top_right,rgba(188,0,0,0.18),transparent_35%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}
