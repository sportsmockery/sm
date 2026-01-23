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
    <div className="min-h-screen bg-[var(--bg-primary)] pt-[92px]">
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
