// Google audit service.
// Append-only event log for the Google intelligence pipeline. Every score
// recompute, every rule evaluation, every recommendation state transition,
// every ruleset activation, and every suppression goes through here.
//
// We intentionally accept a SupabaseClient via dependency injection so this
// module remains usable from API routes, server components, and the worker.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuditLogEvent, ScoringTrigger, SystemEvent } from './types'

export interface AuditClient {
  from(table: string): {
    insert(rows: unknown): Promise<{ error: { message: string } | null }>
    select(cols: string): {
      order(col: string, opts?: { ascending: boolean }): {
        limit(n: number): Promise<{ data: unknown[] | null; error: { message: string } | null }>
      }
    }
  }
}

export class GoogleAuditService {
  constructor(private readonly db: SupabaseClient | AuditClient) {}

  async log(event: Omit<AuditLogEvent, 'id' | 'occurredAt'>): Promise<void> {
    const row = {
      actor: event.actor,
      action: event.action,
      target: event.target,
      metadata: event.metadata ?? {},
      occurred_at: new Date().toISOString(),
    }
    const { error } = await (this.db as SupabaseClient).from('google_audit_log').insert(row)
    if (error) {
      // Audit failures must never silently swallow signal — log to stderr.
      console.error('[google-audit] failed to write audit event', { row, error })
    }
  }

  async recordSystemEvent(event: Omit<SystemEvent, 'id' | 'occurredAt'> & { type: SystemEvent['type'] | ScoringTrigger }): Promise<void> {
    const row = {
      type: event.type,
      article_id: event.articleId,
      author_id: event.authorId,
      payload: event.payload ?? {},
      occurred_at: new Date().toISOString(),
    }
    const { error } = await (this.db as SupabaseClient).from('google_system_events').insert(row)
    if (error) console.error('[google-audit] failed to write system event', { row, error })
  }

  async logTransparencyEvent(args: { actor: string; assetId: string; action: string; metadata?: Record<string, unknown> }): Promise<void> {
    return this.log({
      actor: args.actor,
      action: args.action,
      target: args.assetId,
      metadata: { kind: 'transparency_asset', ...(args.metadata ?? {}) },
    })
  }

  async recent(limit = 25): Promise<AuditLogEvent[]> {
    const { data, error } = await (this.db as SupabaseClient)
      .from('google_audit_log')
      .select('id,actor,action,target,metadata,occurred_at')
      .order('occurred_at', { ascending: false })
      .limit(limit)
    if (error || !data) return []
    return (data as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      actor: String(r.actor),
      action: String(r.action),
      target: String(r.target),
      metadata: (r.metadata as Record<string, unknown>) ?? {},
      occurredAt: String(r.occurred_at),
    }))
  }
}
