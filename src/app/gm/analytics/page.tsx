'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { AnalyticsDashboard } from '@/components/gm/AnalyticsDashboard'

export default function GMAnalyticsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = 'shadow-sm'

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login?next=/gm/analytics')
      return
    }
    setPageLoading(false)
  }, [authLoading, isAuthenticated, router])

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#bc0000', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--sm-text)' }}>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: textColor, margin: 0, letterSpacing: '-0.5px' }}>
              GM Analytics
            </h1>
            <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
              Track your trade performance and patterns
            </p>
          </div>
          <Link
            href="/gm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: 10,
              backgroundColor: '#bc0000',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to War Room
          </Link>
        </div>

        {/* Dashboard */}
        <div className={`rounded-xl p-6 ${cardBg}`} style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
