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
          :root {
            --sm-red: #bc0000;
            --sm-red-light: #ff4444;
            --sm-red-glow: rgba(188, 0, 0, 0.3);
            --sm-dark: #050508;
            --sm-surface: #0c0c12;
            --sm-card: #13131d;
            --sm-card-hover: #1a1a28;
            --sm-border: rgba(255, 255, 255, 0.06);
            --sm-text: #ffffff;
            --sm-text-muted: #8a8a9a;
            --sm-text-dim: #55556a;
            --sm-gradient: linear-gradient(135deg, #bc0000, #ff4444);
            --sm-gradient-subtle: linear-gradient(135deg, rgba(188,0,0,0.15), rgba(255,68,68,0.05));
            --sm-radius-sm: 10px;
            --sm-radius-md: 16px;
            --sm-radius-lg: 20px;
            --sm-radius-pill: 100px;
            --sm-font-heading: Barlow, sans-serif;
            --sm-font-body: Barlow, system-ui, sans-serif;
          }
          body {
            font-family: var(--sm-font-body);
            background: transparent;
            color: var(--sm-text);
          }
          @media (prefers-color-scheme: light) {
            :root {
              --sm-dark: #f8f8fa;
              --sm-surface: #ffffff;
              --sm-card: #ffffff;
              --sm-card-hover: #f0f0f5;
              --sm-border: rgba(0, 0, 0, 0.08);
              --sm-text: #111118;
              --sm-text-muted: #555566;
              --sm-text-dim: #888899;
              --sm-red-glow: rgba(188, 0, 0, 0.12);
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
