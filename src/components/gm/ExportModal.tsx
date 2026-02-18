'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export type ExportFormat = 'json' | 'csv' | 'pdf'

interface ExportModalProps {
  show: boolean
  onClose: () => void
  tradeIds: string[]
  singleTrade?: boolean
}

const FORMAT_OPTIONS: Array<{ value: ExportFormat; label: string; icon: string; description: string }> = [
  { value: 'pdf', label: 'PDF', icon: '📄', description: 'Print-ready document with full details' },
  { value: 'csv', label: 'CSV', icon: '📊', description: 'Spreadsheet format for analysis' },
  { value: 'json', label: 'JSON', icon: '{ }', description: 'Raw data for developers' },
]

export function ExportModal({ show, onClose, tradeIds, singleTrade = false }: ExportModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'

  async function handleExport() {
    if (tradeIds.length === 0) {
      setError('No trades selected')
      return
    }

    setExporting(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/gm/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_ids: tradeIds, format }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Export failed')
      }

      const data = await res.json()

      switch (format) {
        case 'json':
          downloadFile(
            JSON.stringify(data.data, null, 2),
            `gm-trades-${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
          )
          break

        case 'csv':
          downloadFile(
            data.content,
            data.filename || 'gm-trades.csv',
            'text/csv'
          )
          break

        case 'pdf':
          // Open HTML content in new window for printing
          const printWindow = window.open('', '_blank')
          if (printWindow) {
            printWindow.document.write(data.html_content)
            printWindow.document.close()
            printWindow.onload = () => {
              printWindow.print()
            }
          } else {
            throw new Error('Please allow popups to print the PDF')
          }
          break
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="glass-card glass-card-static"
          style={{
            maxWidth: 400,
            width: '100%',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                Export {singleTrade ? 'Trade' : 'Trades'}
              </h2>
              <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
                {tradeIds.length} trade{tradeIds.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: subText,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Format selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: textColor, marginBottom: 10 }}>
              Export Format
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FORMAT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `2px solid ${format === opt.value ? '#bc0000' : borderColor}`,
                    backgroundColor: format === opt.value ? '#bc000010' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: format === opt.value ? '#bc0000' : textColor }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: subText }}>
                      {opt.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              backgroundColor: '#ef444420',
              color: '#ef4444',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#22c55e20',
                color: '#22c55e',
                fontSize: '13px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              Export complete!
            </motion.div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: `2px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || tradeIds.length === 0}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#bc0000',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
