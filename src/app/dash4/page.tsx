import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: 'Chicago Sports Intelligence Center',
  description: 'Real-time intelligence dashboard for all five Chicago sports teams.',
}

export default function Dash4Page() {
  return <DashboardShell />
}
