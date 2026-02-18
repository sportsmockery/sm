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
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div style={{ width: 32, height: 32, border: '3px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      <main style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '32px 16px', paddingTop: 96, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--sm-text)', margin: 0, letterSpacing: '-0.025em' }}>
              GM Analytics
            </h1>
            <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: '4px 0 0' }}>
              Track your trade performance and patterns
            </p>
          </div>
          <Link href="/gm" className="btn btn-primary btn-md" style={{ gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to War Room
          </Link>
        </div>

        {/* Dashboard */}
        <div className="glass-card glass-card-static">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
  )
}
