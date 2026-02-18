'use client'
import { motion } from 'framer-motion'
import type { AuditResult, Discrepancy } from '@/types/gm-audit'

interface AuditReportCardProps {
  audit: AuditResult
  gmGrade: number
  isDark?: boolean
}

const gradeColors: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  F: '#ef4444',
}

const gradeBgColors: Record<string, string> = {
  A: '#22c55e20',
  B: '#3b82f620',
  C: '#eab30820',
  D: '#f9731620',
  F: '#ef444420',
}

const severityColors: Record<string, string> = {
  minor: '#eab308',
  moderate: '#f97316',
  major: '#ef4444',
}

export function AuditReportCard({ audit, gmGrade, isDark = true }: AuditReportCardProps) {
  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const cardBg = isDark ? '#111827' : '#f9fafb'
  const innerBg = 'var(--sm-card)'
  const borderColor = 'var(--sm-border)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: 20,
        marginTop: 16,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: textColor, margin: 0 }}>
          Audit Report
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            backgroundColor: gradeBgColors[audit.audit_grade],
            color: gradeColors[audit.audit_grade],
            fontWeight: 800,
            fontSize: '14px',
            padding: '4px 12px',
            borderRadius: 8,
          }}>
            {audit.audit_grade}
          </span>
          <span style={{ color: subText, fontSize: '13px' }}>
            Score: {audit.audit_score}/100
          </span>
          <span style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: '12px' }}>
            ({audit.confidence}% confidence)
          </span>
        </div>
      </div>

      {/* Validation Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 16,
      }}>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: textColor }}>
            {audit.validation_summary.fields_validated}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Validated</div>
        </div>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#22c55e' }}>
            {audit.validation_summary.fields_confirmed}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Confirmed</div>
        </div>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#eab308' }}>
            {audit.validation_summary.fields_conflicting}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Conflicting</div>
        </div>
        <div style={{
          backgroundColor: innerBg,
          borderRadius: 8,
          padding: 12,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: subText }}>
            {audit.validation_summary.fields_unverified}
          </div>
          <div style={{ fontSize: '11px', color: subText }}>Unverified</div>
        </div>
      </div>

      {/* Overall Assessment */}
      <div style={{
        backgroundColor: innerBg,
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
      }}>
        <p style={{ fontSize: '13px', lineHeight: 1.6, color: textColor, margin: 0 }}>
          {audit.overall_assessment}
        </p>
      </div>

      {/* Discrepancies */}
      {audit.discrepancies && audit.discrepancies.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 700,
            color: subText,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Data Discrepancies
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {audit.discrepancies.map((d: Discrepancy, i: number) => (
              <div
                key={i}
                style={{
                  backgroundColor: innerBg,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: textColor }}>
                    {d.field}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: severityColors[d.severity],
                    textTransform: 'uppercase',
                  }}>
                    {d.severity}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: subText }}>
                  GM: <span style={{ color: '#ef4444' }}>{d.gm_value}</span>
                  {' → '}
                  Actual: <span style={{ color: '#22c55e' }}>{d.actual_value}</span>
                </div>
                <div style={{ fontSize: '10px', color: isDark ? '#4b5563' : '#9ca3af', marginTop: 4 }}>
                  Sources: {d.sources_checked.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {audit.recommendations?.for_user && audit.recommendations.for_user.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 700,
            color: subText,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            What You Should Know
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: '13px',
            color: textColor,
            lineHeight: 1.6,
          }}>
            {audit.recommendations.for_user.map((r: string, i: number) => (
              <li key={i} style={{ marginBottom: 4 }}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cached indicator */}
      {audit.cached && (
        <div style={{
          marginTop: 12,
          fontSize: '11px',
          color: subText,
          textAlign: 'right',
        }}>
          Loaded from cache
        </div>
      )}
    </motion.div>
  )
}
