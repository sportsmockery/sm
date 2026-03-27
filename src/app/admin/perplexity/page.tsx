'use client'

export default function PerplexityTrackerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Perplexity Computer</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Task tracker, unshipped features, and overwrite issues for SM projects</p>
        </div>
        <a href="https://www.perplexity.ai/computer/a/pc-task-tracker-Fhvkic4NSTSMBqJury5KAQ" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent-blue)] hover:underline flex items-center gap-1">
          Full Tracker ↗
        </a>
      </div>
      <iframe
        src="https://www.perplexity.ai/computer/a/pc-task-tracker-Fhvkic4NSTSMBqJury5KAQ"
        className="w-full border border-[var(--border-default)] rounded-lg"
        style={{ height: 'calc(100vh - 180px)', minHeight: '600px' }}
        title="Perplexity Computer Task Tracker"
      />
    </div>
  )
}
