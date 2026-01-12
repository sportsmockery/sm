'use client'

import { useState } from 'react'

interface AIGeneration {
  id: string
  type: string
  prompt: string
  result: string
  createdAt: string
}

const promptTemplates = [
  {
    id: 'headline',
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
    id: 'mockery',
    title: 'Mockery Polish',
    description: 'Add Sports Mockery wit and humor to your content',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    placeholder: 'Enter the content you want to make more entertaining...',
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

// Mock history
const mockHistory: AIGeneration[] = [
  {
    id: '1',
    type: 'headline',
    prompt: 'Bears trade rumors for 2024 draft',
    result: '5 generated headlines',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'mockery',
    prompt: 'Article about Cubs losing streak',
    result: 'Content polished with humor',
    createdAt: '2024-01-14T14:20:00Z',
  },
]

export default function AIAssistantPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(promptTemplates[0])
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [tone, setTone] = useState('witty')
  const [team, setTeam] = useState('bears')

  const handleGenerate = async () => {
    if (!inputText.trim()) return

    setIsGenerating(true)
    setResult(null)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock result
    if (selectedTemplate.id === 'headline') {
      setResult(`Generated Headlines:
1. "Bears Trade Drama: What Chicago Fans Need to Know"
2. "Breaking Down the Bears' Bold 2024 Draft Strategy"
3. "Chicago's Front Office Makes Waves with Trade Talks"
4. "Will the Bears Finally Get It Right? Trade Analysis"
5. "Hot Takes: Bears' Latest Move Could Change Everything"`)
    } else if (selectedTemplate.id === 'seo') {
      setResult(`SEO Analysis:
• Meta Title: "Bears Trade Rumors 2024: Everything You Need to Know | Sports Mockery"
• Meta Description: "Get the inside scoop on the Chicago Bears' latest trade rumors. Our experts break down what these moves mean for the 2024 season."
• Keywords: Bears trade, Chicago Bears 2024, NFL trade rumors, Bears draft picks`)
    } else {
      setResult(`Here's your ${selectedTemplate.title} result based on your input. This is a mock response demonstrating the AI assistant functionality.`)
    }

    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Assistant</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Use AI to generate content, headlines, and more
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
              <div className="flex gap-2">
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
                >
                  <option value="bears">Bears</option>
                  <option value="bulls">Bulls</option>
                  <option value="cubs">Cubs</option>
                  <option value="whitesox">White Sox</option>
                  <option value="blackhawks">Blackhawks</option>
                </select>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-sm text-[var(--text-primary)]"
                >
                  <option value="witty">Witty</option>
                  <option value="serious">Serious</option>
                  <option value="satirical">Satirical</option>
                  <option value="analytical">Analytical</option>
                </select>
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
                disabled={!inputText.trim() || isGenerating}
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
            <div className="divide-y divide-[var(--border-subtle)]">
              {mockHistory.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[var(--accent-red)] uppercase">
                      {item.type}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] truncate">{item.prompt}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{item.result}</p>
                </div>
              ))}
            </div>
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
