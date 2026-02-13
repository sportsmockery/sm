'use client'

import { useState } from 'react'
import Image from 'next/image'

// Team configuration with logos
const TEAMS = [
  { value: 'bears', label: 'Bears', fullName: 'Chicago Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { value: 'bulls', label: 'Bulls', fullName: 'Chicago Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { value: 'blackhawks', label: 'Blackhawks', fullName: 'Chicago Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  { value: 'cubs', label: 'Cubs', fullName: 'Chicago Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { value: 'whitesox', label: 'White Sox', fullName: 'Chicago White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
]

interface AIGeneration {
  id: string
  type: string
  prompt: string
  result: string
  createdAt: string
}

const promptTemplates = [
  {
    id: 'headlines',
    title: 'Generate Headlines',
    description: 'Create catchy headlines for your article',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    placeholder: 'Enter your article topic or key points...',
  },
  {
    id: 'seo',
    title: 'SEO Optimizer',
    description: 'Generate SEO-friendly meta descriptions and keywords',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    placeholder: 'Paste your article content here...',
  },
  {
    id: 'grammar',
    title: 'Grammar Check',
    description: 'Check grammar, spelling, and punctuation',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    placeholder: 'Paste content to check for grammar and spelling issues...',
  },
  {
    id: 'ideas',
    title: 'Article Ideas',
    description: 'Generate article ideas based on current sports news',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    placeholder: 'Enter a team or topic you want ideas for...',
  },
  {
    id: 'excerpt',
    title: 'Auto Excerpt',
    description: 'Generate compelling article excerpts',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
    placeholder: 'Paste your full article content...',
  },
]

export default function PostIQPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(promptTemplates[0])
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [team, setTeam] = useState('bears')
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)
  const [history, setHistory] = useState<AIGeneration[]>([])

  const handleGenerate = async () => {
    // Ideas can work without input text
    if (!inputText.trim() && selectedTemplate.id !== 'ideas') return

    setIsGenerating(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedTemplate.id,
          content: inputText,
          title: inputText.slice(0, 100),
          team,
        }),
      })

      if (!response.ok) {
        throw new Error('AI service temporarily unavailable')
      }

      const data = await response.json()

      // Format result based on action type
      if (selectedTemplate.id === 'headlines' && data.headlines) {
        setResult(data.headlines.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n'))
      } else if (selectedTemplate.id === 'seo') {
        setResult(`SEO Title: ${data.seoTitle || 'N/A'}

Meta Description: ${data.metaDescription || 'N/A'}

Focus Keyword: ${data.focusKeyword || 'N/A'}

Secondary Keywords: ${data.secondaryKeywords?.join(', ') || 'N/A'}

Mockery Score: ${data.mockeryScore?.score || 'N/A'}/100
${data.mockeryScore?.feedback || ''}

Improvements:
${data.improvements?.map((i: string) => `• ${i}`).join('\n') || 'None'}`)
      } else if (selectedTemplate.id === 'ideas' && data.ideas) {
        setResult(data.ideas.map((idea: { headline: string; angle: string; type: string }, i: number) =>
          `${i + 1}. ${idea.headline}\n   Angle: ${idea.angle}\n   Type: ${idea.type}`
        ).join('\n\n'))
      } else if (selectedTemplate.id === 'grammar') {
        if (data.issueCount === 0) {
          setResult('No grammar or spelling issues found!')
        } else {
          setResult(`Found ${data.issueCount} issue(s):

${data.issues?.map((issue: { original: string; corrected: string; explanation: string }) =>
  `• "${issue.original}" → "${issue.corrected}"\n  ${issue.explanation}`
).join('\n\n') || ''}

Corrected Content:
${data.correctedContent || inputText}`)
        }
      } else if (selectedTemplate.id === 'excerpt' && data.excerpt) {
        setResult(data.excerpt)
      } else if (data.error) {
        setResult(`Error: ${data.error}`)
      } else {
        setResult(JSON.stringify(data, null, 2))
      }

      // Add to history
      setHistory(prev => [{
        id: Date.now().toString(),
        type: selectedTemplate.id,
        prompt: inputText.slice(0, 50) + (inputText.length > 50 ? '...' : '') || `${team} content`,
        result: selectedTemplate.title + ' generated',
        createdAt: new Date().toISOString(),
      }, ...prev.slice(0, 9)])
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'An error occurred'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">PostIQ</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          AI-powered content tools for headlines, SEO, ideas, and more
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {promptTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template)
                  setResult(null)
                }}
                className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-[var(--accent-red)] bg-[var(--accent-red-glow)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--accent-red)]'
                }`}
              >
                <div className={`${selectedTemplate.id === template.id ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}`}>
                  {template.icon}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{template.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{template.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-primary)]">{selectedTemplate.title}</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  <Image src={TEAMS.find(t => t.value === team)?.logo || TEAMS[0].logo} alt="" width={20} height={20} className="object-contain" />
                  <span>{TEAMS.find(t => t.value === team)?.label || 'Bears'}</span>
                  <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showTeamDropdown && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] py-1 shadow-lg">
                    {TEAMS.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => { setTeam(t.value); setShowTeamDropdown(false) }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--bg-hover)] ${team === t.value ? 'bg-[var(--accent-red-glow)] text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}`}
                      >
                        <Image src={t.logo} alt={t.fullName} width={24} height={24} className="object-contain" />
                        <span>{t.fullName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedTemplate.placeholder}
              rows={6}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)] resize-none"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">
                {inputText.length} characters
              </p>
              <button
                onClick={handleGenerate}
                disabled={(!inputText.trim() && selectedTemplate.id !== 'ideas') || isGenerating}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Area */}
          {result && (
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Result</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                  Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg p-4">
                {result}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar - History */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="border-b border-[var(--border-default)] px-6 py-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Recent Generations</h2>
            </div>
            {history.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
                No generations yet. Try one of the tools above!
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {history.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[var(--accent-red)] uppercase">
                        {item.type}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] truncate">{item.prompt}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{item.result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Be specific with your prompts for better results
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Include team names for context-aware content
              </li>
              <li className="flex items-start gap-2">
                <svg className="h-4 w-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Always review and edit AI-generated content
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
