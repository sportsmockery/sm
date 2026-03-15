'use client'

import { usePathname } from 'next/navigation'
import AppSidebar from './AppSidebar'

/**
 * Conditionally wraps page content with the left sidebar.
 * Homepage (/) and /feed get full-width layout (no sidebar).
 * All other pages get the sidebar + offset main content.
 */
export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages that should NOT have the sidebar
  const isFullWidth = pathname === '/' || pathname === '/feed'
    || pathname.startsWith('/admin') || pathname.startsWith('/studio')

  if (isFullWidth) {
    return <>{children}</>
  }

  return (
    <div className="app-sidebar-wrapper">
      <AppSidebar />
      <div className="app-sidebar-content">
        {children}
      </div>
      <style>{`
        .app-sidebar-wrapper {
          display: flex;
          min-height: 100vh;
        }
        .app-sidebar-content {
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 1024px) {
          .app-sidebar-content {
            margin-left: 240px;
          }
        }
        @media (max-width: 1023px) {
          .app-sidebar-content {
            padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </div>
  )
}
