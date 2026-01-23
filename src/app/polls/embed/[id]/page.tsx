import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import PollEmbed from '@/components/polls/PollEmbed'
import type { Poll } from '@/types/polls'

interface EmbedPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EmbedPageProps): Promise<Metadata> {
  const { id } = await params

  const { data: poll } = await supabaseAdmin
    .from('sm_polls')
    .select('title, question')
    .eq('id', id)
    .single()

  return {
    title: poll?.title || 'Poll | SportsMockery',
    description: poll?.question || 'Vote in this poll from SportsMockery',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function PollEmbedPage({ params }: EmbedPageProps) {
  const { id } = await params

  // Fetch poll
  const { data: poll, error } = await supabaseAdmin
    .from('sm_polls')
    .select(`
      *,
      options:sm_poll_options(*)
    `)
    .eq('id', id)
    .single()

  if (error || !poll) {
    notFound()
  }

  // Sort options by display order
  if (poll.options) {
    poll.options.sort((a: any, b: any) => a.display_order - b.display_order)
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: transparent;
          }
          @media (prefers-color-scheme: dark) {
            body {
              color-scheme: dark;
            }
          }
        `}} />
      </head>
      <body>
        <PollEmbed poll={poll as Poll} compact />
      </body>
    </html>
  )
}
