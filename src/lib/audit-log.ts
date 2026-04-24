/**
 * Admin action audit logging utility.
 *
 * Logs privileged actions to `security_audit_log` table for accountability
 * and forensic investigation. INSERT-only — no UPDATE or DELETE.
 *
 * Usage:
 *   await auditLog({ userId, action: 'post_published', resourceType: 'post', resourceId: '123' })
 */

import { supabaseAdmin } from '@/lib/supabase-server'

export interface AuditLogEntry {
  /** User who performed the action */
  userId?: string | null
  /** Action performed (e.g., 'post_published', 'user_role_changed', 'media_uploaded') */
  action: string
  /** Type of resource affected (e.g., 'post', 'user', 'media', 'setting') */
  resourceType?: string | null
  /** ID of the affected resource */
  resourceId?: string | null
  /** Additional metadata (avoid secrets) */
  details?: Record<string, unknown> | null
  /** Client IP address */
  ipAddress?: string | null
  /** User agent string */
  userAgent?: string | null
}

/**
 * Log an admin/privileged action to the audit trail.
 * Fire-and-forget by default — does not throw on failure.
 */
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await supabaseAdmin.from('security_audit_log').insert({
      user_id: entry.userId || null,
      action: entry.action,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      details: entry.details || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
    })
  } catch (err) {
    // Never let audit logging failures break the request
    console.error('[AuditLog] Failed to write audit entry:', err)
  }
}

/**
 * Extract audit context from a NextRequest.
 */
export function getAuditContext(request: Request) {
  return {
    ipAddress: (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || null,
    userAgent: request.headers.get('user-agent') || null,
  }
}
