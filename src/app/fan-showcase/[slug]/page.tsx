import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import DetailPageClient from '@/components/fan-showcase/DetailPageClient'

interface DetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data } = await supabaseAdmin
    .from('fan_submissions')
    .select('title, description, team, type, creator:fan_creators(display_name)')
    .eq('slug', slug)
    .in('status', ['approved', 'featured'])
    .maybeSingle()

  if (!data) {
    return { title: 'Not Found | Fan Showcase' }
  }

  const creatorRaw = data.creator as unknown as { display_name: string } | { display_name: string }[] | null
  const creatorName = Array.isArray(creatorRaw) ? creatorRaw[0]?.display_name : creatorRaw?.display_name || 'Fan Creator'

  return {
    title: `${data.title} by ${creatorName} | Fan Showcase`,
    description: data.description || `Fan ${data.type} submission for Chicago ${data.team} by ${creatorName}.`,
    openGraph: {
      title: `${data.title} | Fan Showcase`,
      description: data.description || `Check out this ${data.type} from ${creatorName}.`,
    },
  }
}

export default async function FanShowcaseDetailPage({ params }: DetailPageProps) {
  const { slug } = await params

  // Verify submission exists and is public
  const { data: submission } = await supabaseAdmin
    .from('fan_submissions')
    .select('id')
    .eq('slug', slug)
    .in('status', ['approved', 'featured'])
    .maybeSingle()

  if (!submission) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-[1300px] px-4 pb-16 pt-8 md:px-6">
      <DetailPageClient slug={slug} />
    </main>
  )
}
