'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar, { MobileSidebar } from '@/components/admin/Sidebar'

// Full-screen editor routes that should NOT show the AdminShell sidebar
const fullScreenEditorRoutes = [
  '/admin/posts/new',
  '/admin/posts/*/edit', // matches /admin/posts/[id]/edit
]

function isFullScreenRoute(pathname: string): boolean {
  return fullScreenEditorRoutes.some(route => {
    if (route.includes('*')) {
      const regex = new RegExp('^' + route.replace('*', '[^/]+') + '$')
      return regex.test(pathname)
    }
    return pathname === route
  })
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Full-screen editor pages render without AdminShell chrome
  const isFullScreen = isFullScreenRoute(pathname)

  if (isFullScreen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile Header - visible below lg breakpoint */}
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3 lg:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Open navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="text-base font-bold text-[var(--text-primary)]">Admin</span>
      </div>

      {/* Desktop Sidebar - hidden on mobile, positioned below global header */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:ml-60 transition-all duration-300">
        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
