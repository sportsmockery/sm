import type { Metadata } from 'next'
import AdminShowcaseClient from '@/components/fan-showcase/admin/AdminShowcaseList'

export const metadata: Metadata = {
  title: 'Fan Showcase Admin | Sports Mockery',
}

export default function AdminFanShowcasePage() {
  return <AdminShowcaseClient />
}
