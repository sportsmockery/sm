'use client'

import { useState } from 'react'
import Sidebar, { MobileSidebar } from '@/components/admin/Sidebar'

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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
