'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────

interface AuditEntry {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

type ControlStatus = 'verified' | 'partial' | 'missing' | 'not_tested'

interface SecurityControl {
  name: string
  category: string
  status: ControlStatus
  description: string
  lastVerified?: string
}

interface Finding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  status: 'resolved' | 'open' | 'in_progress'
  fixedIn?: string
}

// ── Static Data (compiled from our security work) ──────────────────────

const CONTROLS: SecurityControl[] = [
  { name: 'Admin Auth Enforcement', category: 'auth', status: 'verified', description: 'All /api/admin/* routes require requireAdmin()', lastVerified: '2026-04-24' },
  { name: 'Social Posting Auth', category: 'auth', status: 'verified', description: 'X, Facebook, post-to-x routes require admin', lastVerified: '2026-04-24' },
  { name: 'Debug Route Protection', category: 'auth', status: 'verified', description: 'Debug routes require admin auth', lastVerified: '2026-04-24' },
  { name: 'Bot Route API Key', category: 'auth', status: 'verified', description: 'Bot routes deny access when BOT_API_KEY is missing', lastVerified: '2026-04-24' },
  { name: 'Cron Route Auth', category: 'auth', status: 'verified', description: 'CRON_SECRET + Vercel signature validation', lastVerified: '2026-04-24' },
  { name: 'Open Redirect Prevention', category: 'auth', status: 'verified', description: 'Auth callback sanitizes redirect param', lastVerified: '2026-04-24' },
  { name: 'Freestar Admin Auth', category: 'auth', status: 'verified', description: '/admin/freestar now requires auth via middleware', lastVerified: '2026-04-24' },
  { name: 'Redis Rate Limiting', category: 'rate_limiting', status: 'verified', description: 'Upstash Redis — Scout, Fan Chat, Newsletter, Polls, GM Errors', lastVerified: '2026-04-24' },
  { name: 'Security Headers', category: 'headers', status: 'partial', description: 'HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. CSP pending.', lastVerified: '2026-04-24' },
  { name: 'DOMPurify Sanitization', category: 'input', status: 'verified', description: 'Article content sanitized before dangerouslySetInnerHTML', lastVerified: '2026-04-24' },
  { name: 'AI Jailbreak Protection', category: 'ai', status: 'verified', description: 'Input screening + system prompt hardening + output screening on all AI endpoints', lastVerified: '2026-04-24' },
  { name: 'AI Prompt Sanitization', category: 'ai', status: 'verified', description: 'Length limits and control char stripping on all AI queries', lastVerified: '2026-04-24' },
  { name: 'File Upload Validation', category: 'input', status: 'verified', description: 'Extension + MIME + magic byte checks on media and avatar uploads', lastVerified: '2026-04-24' },
  { name: 'Admin Audit Logging', category: 'logging', status: 'verified', description: 'Post create/publish, user create, media upload, PostIQ logged', lastVerified: '2026-04-24' },
  { name: 'Stripe Webhook Idempotency', category: 'payments', status: 'verified', description: 'Duplicate event IDs tracked in stripe_webhook_events table', lastVerified: '2026-04-24' },
  { name: 'Credential Storage', category: 'secrets', status: 'verified', description: 'DataLab credentials moved from source to env vars', lastVerified: '2026-04-24' },
  { name: 'Zod Schema Validation', category: 'input', status: 'partial', description: 'Zod installed but not yet integrated into API routes', lastVerified: '2026-04-24' },
  { name: 'Content Security Policy', category: 'headers', status: 'missing', description: 'CSP header not yet added — needs third-party script audit', lastVerified: undefined },
  { name: 'RLS Audit', category: 'data', status: 'not_tested', description: 'Row-level security not comprehensively verified across all tables', lastVerified: undefined },
]

const FINDINGS: Finding[] = [
  { id: 'SEC-2026-001', severity: 'critical', title: 'PostIQ AI endpoint missing authentication', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-002', severity: 'critical', title: 'PostIQ internal key logged to console', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-003', severity: 'high', title: 'Open redirect in auth callback', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-004', severity: 'high', title: 'DataLab credentials hardcoded in source', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-005', severity: 'high', title: 'In-memory rate limiting ineffective on serverless', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-006', severity: 'high', title: 'Fan Chat rate limit shared globally', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-007', severity: 'medium', title: 'Missing security headers (HSTS, X-Frame, etc.)', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-008', severity: 'medium', title: 'No Zod schema validation on API routes', status: 'in_progress' },
  { id: 'SEC-2026-009', severity: 'medium', title: 'No admin action audit logging', status: 'resolved', fixedIn: 'Phase 2' },
  { id: 'SEC-2026-010', severity: 'medium', title: 'Cron routes — bearer token only', status: 'resolved', fixedIn: 'Phase 3' },
  { id: 'SEC-2026-011', severity: 'medium', title: 'GM error log unbounded payloads', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-012', severity: 'medium', title: 'Debug routes accessible without auth', status: 'resolved', fixedIn: 'Phase 1' },
  { id: 'SEC-2026-013', severity: 'medium', title: 'Freestar admin page skips middleware auth', status: 'resolved', fixedIn: 'Phase 3' },
  { id: 'SEC-2026-014', severity: 'medium', title: 'No prompt sanitization on AI inputs', status: 'resolved', fixedIn: 'Phase 2' },
  { id: 'SEC-2026-015', severity: 'medium', title: 'Stripe webhook lacks idempotency', status: 'resolved', fixedIn: 'Phase 3' },
  { id: 'SEC-2026-016', severity: 'low', title: 'File upload MIME-only validation', status: 'resolved', fixedIn: 'Phase 2' },
]

// ── Helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ControlStatus, { bg: string; text: string; dot: string }> = {
  verified: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', dot: '#22c55e' },
  partial: { bg: 'rgba(234,179,8,0.1)', text: '#eab308', dot: '#eab308' },
  missing: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', dot: '#ef4444' },
  not_tested: { bg: 'rgba(156,163,175,0.1)', text: '#9ca3af', dot: '#9ca3af' },
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

function computePostureScore(): number {
  const verified = CONTROLS.filter(c => c.status === 'verified').length
  const partial = CONTROLS.filter(c => c.status === 'partial').length
  const total = CONTROLS.length
  const openFindings = FINDINGS.filter(f => f.status !== 'resolved').length
  const score = Math.round(((verified + partial * 0.5) / total) * 100) - openFindings * 5
  return Math.max(0, Math.min(100, score))
}

// ── Component ──────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const score = computePostureScore()

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const res = await fetch('/api/admin/security/audit-log')
        if (res.ok) {
          const data = await res.json()
          setAuditLogs(data.logs || [])
        }
      } catch {
        // Audit log fetch is best-effort
      } finally {
        setLoading(false)
      }
    }
    fetchAuditLogs()
  }, [])

  const resolvedCount = FINDINGS.filter(f => f.status === 'resolved').length
  const openCount = FINDINGS.filter(f => f.status !== 'resolved').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>Security Posture</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>
          Security controls, findings, and audit trail for SM EDGE
        </p>
      </div>

      {/* Score + Finding Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Posture Score */}
        <div className="md:col-span-2 rounded-xl p-6" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--sm-text-muted)' }}>Posture Score</div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold" style={{ color: score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444' }}>
              {score}
            </span>
            <span className="text-lg mb-1" style={{ color: 'var(--sm-text-muted)' }}>/100</span>
          </div>
          <div className="mt-3 w-full h-2 rounded-full" style={{ backgroundColor: 'var(--sm-border)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444' }} />
          </div>
        </div>

        {/* Finding Counts */}
        {(['critical', 'high', 'medium'] as const).map(severity => {
          const total = FINDINGS.filter(f => f.severity === severity).length
          const open = FINDINGS.filter(f => f.severity === severity && f.status !== 'resolved').length
          return (
            <div key={severity} className="rounded-xl p-4" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
              <div className="text-xs font-medium uppercase mb-1" style={{ color: SEVERITY_COLORS[severity] }}>{severity}</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>{open}<span className="text-sm font-normal" style={{ color: 'var(--sm-text-muted)' }}> / {total}</span></div>
              <div className="text-xs mt-1" style={{ color: 'var(--sm-text-muted)' }}>{open === 0 ? 'All resolved' : `${open} open`}</div>
            </div>
          )
        })}
      </div>

      {/* Controls Grid */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--sm-text)' }}>Key Protections</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--sm-text-muted)' }}>Control</th>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--sm-text-muted)' }}>Status</th>
                <th className="text-left py-2 pr-4 font-medium hidden md:table-cell" style={{ color: 'var(--sm-text-muted)' }}>Description</th>
                <th className="text-left py-2 font-medium hidden lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>Verified</th>
              </tr>
            </thead>
            <tbody>
              {CONTROLS.map((c, i) => {
                const colors = STATUS_COLORS[c.status]
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--sm-border)' }}>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: 'var(--sm-text)' }}>{c.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 hidden md:table-cell text-xs" style={{ color: 'var(--sm-text-muted)' }}>{c.description}</td>
                    <td className="py-2.5 hidden lg:table-cell text-xs" style={{ color: 'var(--sm-text-muted)' }}>{c.lastVerified || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Findings</h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
            {resolvedCount}/{FINDINGS.length} resolved
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
                <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--sm-text-muted)' }}>ID</th>
                <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--sm-text-muted)' }}>Severity</th>
                <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--sm-text-muted)' }}>Title</th>
                <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--sm-text-muted)' }}>Status</th>
                <th className="text-left py-2 font-medium hidden md:table-cell" style={{ color: 'var(--sm-text-muted)' }}>Fixed In</th>
              </tr>
            </thead>
            <tbody>
              {FINDINGS.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--sm-border)' }}>
                  <td className="py-2.5 pr-3 font-mono text-xs" style={{ color: 'var(--sm-text-muted)' }}>{f.id}</td>
                  <td className="py-2.5 pr-3">
                    <span className="text-xs font-medium uppercase" style={{ color: SEVERITY_COLORS[f.severity] }}>{f.severity}</span>
                  </td>
                  <td className="py-2.5 pr-3" style={{ color: 'var(--sm-text)' }}>{f.title}</td>
                  <td className="py-2.5 pr-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                      backgroundColor: f.status === 'resolved' ? 'rgba(34,197,94,0.1)' : f.status === 'in_progress' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                      color: f.status === 'resolved' ? '#22c55e' : f.status === 'in_progress' ? '#eab308' : '#ef4444',
                    }}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--sm-text-muted)' }}>{f.fixedIn || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--sm-text)' }}>Recent Security Events</h2>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Loading audit log...</p>
        ) : auditLogs.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>No audit events recorded yet. Events appear when admin actions are performed (post create, user create, media upload, etc.).</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                <span className="text-xs font-mono shrink-0 mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>
                  {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>{log.action}</span>
                  {log.resource_type && (
                    <span className="text-xs ml-2" style={{ color: 'var(--sm-text-muted)' }}>
                      {log.resource_type}{log.resource_id ? ` #${log.resource_id.slice(0, 8)}` : ''}
                    </span>
                  )}
                  {log.ip_address && (
                    <span className="text-xs ml-2" style={{ color: 'var(--sm-text-muted)' }}>from {log.ip_address}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hardening Backlog */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--sm-card-bg)', border: '1px solid var(--sm-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--sm-text)' }}>Hardening Backlog</h2>
        <div className="space-y-2">
          {[
            { task: 'Add CSP header (needs third-party script audit)', priority: 'high' },
            { task: 'Zod schema validation on top 20 API routes', priority: 'high' },
            { task: 'RLS audit across all Supabase tables', priority: 'medium' },
            { task: 'Bot protection (Turnstile) on login/signup', priority: 'medium' },
            { task: 'Environment variable startup validation', priority: 'medium' },
            { task: 'RBAC expansion (editor/moderator roles)', priority: 'low' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{
                backgroundColor: item.priority === 'high' ? '#f97316' : item.priority === 'medium' ? '#eab308' : '#3b82f6'
              }} />
              <span className="text-sm" style={{ color: 'var(--sm-text)' }}>{item.task}</span>
              <span className="text-xs ml-auto uppercase font-medium" style={{
                color: item.priority === 'high' ? '#f97316' : item.priority === 'medium' ? '#eab308' : '#3b82f6'
              }}>{item.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
