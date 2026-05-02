'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ArticleDocument } from '@/components/admin/BlockEditor'
import { RULES, getRule, type RuleMode } from '@/lib/post-publish'
import type { CheckResult, PreflightResponse, RuleId } from '@/lib/post-publish'

interface PublishChecklistProps {
  /** Live post form values; the checklist refreshes on debounce when any change. */
  postId?: string | null
  title: string
  slug: string
  document: ArticleDocument | null
  categoryId?: string | null
  categorySlug?: string | null
  featuredImageUrl?: string | null
  featuredImageAlt?: string | null
  metaDescription?: string | null
  /** Called every time the preflight result changes, with the latest readiness summary. */
  onReadyChange?: (ready: boolean, failedCount: number) => void
}

const DEBOUNCE_MS = 500

export default function PublishChecklist(props: PublishChecklistProps) {
  const [response, setResponse] = useState<PreflightResponse | null>(null)
  const [pending, setPending] = useState(false)
  const [expanded, setExpanded] = useState<Set<RuleId>>(new Set())
  const fetchRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onReadyChangeRef = useRef(props.onReadyChange)
  useEffect(() => {
    onReadyChangeRef.current = props.onReadyChange
  }, [props.onReadyChange])

  const payload = useMemo(
    () => ({
      post_id: props.postId ?? null,
      title: props.title,
      slug: props.slug,
      body_blocks: props.document,
      category_id: props.categoryId ?? null,
      category_slug: props.categorySlug ?? null,
      featured_image_url: props.featuredImageUrl ?? null,
      featured_image_alt: props.featuredImageAlt ?? null,
      meta_description: props.metaDescription ?? null,
    }),
    [
      props.postId,
      props.title,
      props.slug,
      props.document,
      props.categoryId,
      props.categorySlug,
      props.featuredImageUrl,
      props.featuredImageAlt,
      props.metaDescription,
    ]
  )

  const runPreflight = useCallback(async () => {
    fetchRef.current?.abort()
    const ctrl = new AbortController()
    fetchRef.current = ctrl
    setPending(true)
    try {
      const res = await fetch('/api/posts/preflight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      })
      if (!res.ok) throw new Error(`preflight ${res.status}`)
      const data = (await res.json()) as PreflightResponse
      setResponse(data)
      onReadyChangeRef.current?.(data.ready, data.checks.filter((c) => !c.passed).length)
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return
      console.warn('[publish-checklist] preflight failed:', err)
    } finally {
      setPending(false)
    }
  }, [payload])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(runPreflight, DEBOUNCE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [runPreflight])

  const toggle = (rule: RuleId) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(rule)) next.delete(rule)
      else next.add(rule)
      return next
    })
  }

  const passed = response?.passed ?? 0
  const total = response?.total ?? RULES.length
  const wordCount = response?.word_count ?? 0
  const ready = response?.ready ?? false
  const checksById = new Map(response?.checks.map((c) => [c.rule, c]) || [])

  return (
    <section
      aria-label="Publish checklist"
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)]"
    >
      <header className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Publish checklist
          </p>
          <p className="mt-0.5 text-sm font-medium">
            <span style={{ color: ready ? '#16A34A' : '#BC0000' }}>
              {passed} / {total}
            </span>{' '}
            ready to publish
          </p>
        </div>
        <div className="text-right text-xs text-[var(--text-muted)]">
          <div>{wordCount} words</div>
          <div className="mt-0.5">{pending ? 'Checking…' : 'Up to date'}</div>
        </div>
      </header>

      <ul className="divide-y divide-[var(--border-default)]">
        {RULES.map((rule) => {
          const check = checksById.get(rule.id)
          const isExpanded = expanded.has(rule.id)
          return (
            <li key={rule.id}>
              <button
                type="button"
                onClick={() => toggle(rule.id)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-hover)]"
              >
                <StatusIcon passed={check?.passed} mode={rule.mode} />
                <span className="flex-1">{rule.label}</span>
                <ModeChip mode={rule.mode} />
                <svg
                  className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {isExpanded && check && !check.passed && (
                <FailureCard check={check} />
              )}
              {isExpanded && check?.passed && (
                <p className="px-12 pb-3 pt-1 text-xs text-[var(--text-muted)]">
                  Looks good — no action needed.
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {response?.auto_fixed && response.auto_fixed.length > 0 && (
        <footer className="border-t border-[var(--border-default)] px-4 py-3 text-xs">
          <p className="font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Auto-fixed
          </p>
          <ul className="mt-1 space-y-1">
            {response.auto_fixed.map((af) => (
              <li key={af.rule} className="text-[var(--text-secondary)]">
                <span className="mr-1.5 font-medium">{getRule(af.rule).label}:</span>
                {af.note}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </section>
  )
}

/* ---------------- subcomponents ---------------- */

function StatusIcon({ passed, mode }: { passed: boolean | undefined; mode: RuleMode }) {
  if (passed === undefined) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center text-[var(--text-muted)]">
        ⏳
      </span>
    )
  }
  if (passed) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center text-emerald-500">
        ✓
      </span>
    )
  }
  if (mode === 'auto-fix') {
    return <span className="inline-flex h-4 w-4 items-center justify-center text-amber-500">🤖</span>
  }
  if (mode === 'auto-suggest') {
    return <span className="inline-flex h-4 w-4 items-center justify-center text-amber-500">⚙</span>
  }
  return <span className="inline-flex h-4 w-4 items-center justify-center text-[#BC0000]">✕</span>
}

function ModeChip({ mode }: { mode: RuleMode }) {
  const label =
    mode === 'auto-fix' ? 'Auto-fix' : mode === 'auto-suggest' ? 'Suggest' : 'Writer fix'
  const tint =
    mode === 'auto-fix'
      ? 'bg-amber-500/10 text-amber-500'
      : mode === 'auto-suggest'
        ? 'bg-cyan-500/10 text-cyan-500'
        : 'bg-red-500/10 text-red-500'
  return (
    <span className={`hidden rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline ${tint}`}>
      {label}
    </span>
  )
}

function FailureCard({ check }: { check: CheckResult }) {
  return (
    <div className="px-12 pb-3 pt-1 text-xs">
      <p className="font-semibold text-[var(--text-primary)]">{check.what_failed}</p>
      {check.why_it_matters && (
        <p className="mt-1 text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-secondary)]">Why it matters: </span>
          {check.why_it_matters}
        </p>
      )}
      {check.how_to_fix && check.how_to_fix.length > 0 && (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--text-secondary)]">
          {check.how_to_fix.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
      {check.sub_checks && check.sub_checks.length > 0 && (
        <ul className="mt-2 space-y-1">
          {check.sub_checks.map((sub) => (
            <li key={sub.id} className="flex items-start gap-2 text-[var(--text-secondary)]">
              <span style={{ color: sub.passed ? '#16A34A' : '#BC0000' }}>
                {sub.passed ? '✓' : '✕'}
              </span>
              <span>
                <span className="font-medium">{sub.label}: </span>
                {sub.passed ? 'pass' : sub.what_failed}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
