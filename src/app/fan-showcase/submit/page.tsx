import type { Metadata } from 'next'
import SubmitForm from '@/components/fan-showcase/SubmitForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Submit to Fan Showcase | Sports Mockery',
  description:
    'Submit your fan edits, artwork, takes, or fantasy wins for a chance to be featured on Sports Mockery\'s Fan Showcase.',
  openGraph: {
    title: 'Submit to Fan Showcase | Sports Mockery',
    description:
      'Got content worth featuring? Submit your work and represent Chicago.',
  },
}

export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-[1300px] px-4 pb-16 pt-8 md:px-6">
      <div className="mb-8">
        <Link
          href="/fan-showcase"
          className="text-sm text-[var(--text-muted)] hover:text-[#BC0000]"
        >
          &larr; Back to Showcase
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-[var(--text-primary)]">
          Submit Your Work
        </h1>
        <p className="mt-2 max-w-xl text-[var(--text-muted)]">
          Show Chicago what you&apos;ve got. Edits, art, takes, fantasy receipts — if it&apos;s
          about the Bears, Bulls, Cubs, White Sox, or Blackhawks, we want to see it.
          Every submission is reviewed by our team before it goes live.
        </p>
      </div>

      <SubmitForm />
    </main>
  )
}
