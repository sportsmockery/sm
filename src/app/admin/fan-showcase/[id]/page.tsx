import type { Metadata } from 'next'
import AdminShowcaseDetail from '@/components/fan-showcase/admin/AdminShowcaseDetail'

export const metadata: Metadata = {
  title: 'Review Submission | Fan Showcase Admin',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminFanShowcaseDetailPage({ params }: Props) {
  const { id } = await params
  return <AdminShowcaseDetail id={id} />
}
