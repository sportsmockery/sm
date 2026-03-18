import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fan Showcase Policy | Sports Mockery',
  description:
    'Submission guidelines, content policy, creator rights, and moderation standards for the Sports Mockery Fan Showcase.',
  openGraph: {
    title: 'Fan Showcase Policy | Sports Mockery',
    description: 'Everything you need to know about submitting to the Fan Showcase.',
  },
}

export default function PolicyPage() {
  return (
    <main className="mx-auto max-w-[720px] px-4 pb-16 pt-8 md:px-6">
      <Link href="/fan-showcase" className="text-sm text-[var(--text-muted)] hover:text-[#BC0000]">
        &larr; Back to Showcase
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)]">
        Fan Showcase Policy
      </h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Last updated: March 18, 2026
      </p>

      <div className="prose-sm mt-8 space-y-8 text-[var(--text-primary)]">
        {/* What qualifies */}
        <section>
          <h2 className="text-xl font-bold">What Qualifies for Submission</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            We accept four types of fan-created content focused on Chicago&apos;s five major sports
            teams: Bears, Bulls, Cubs, White Sox, and Blackhawks.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li><strong className="text-[var(--text-primary)]">Fan Edits</strong> &mdash; Video edits, clips, remixes, or highlight reels shared via TikTok, Instagram Reels, YouTube Shorts, X, or other platforms.</li>
            <li><strong className="text-[var(--text-primary)]">Fan Art</strong> &mdash; Original artwork in any medium: digital, traditional, mixed media, or graphic design.</li>
            <li><strong className="text-[var(--text-primary)]">Fan Takes</strong> &mdash; Written analysis, opinions, or commentary about Chicago sports.</li>
            <li><strong className="text-[var(--text-primary)]">Fantasy Wins</strong> &mdash; Screenshots and proof of fantasy league championships, standout performances, or bragging rights.</li>
          </ul>
        </section>

        {/* What does NOT qualify */}
        <section>
          <h2 className="text-xl font-bold">What Does Not Qualify</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>Content not related to the Bears, Bulls, Cubs, White Sox, or Blackhawks.</li>
            <li>Content you did not create or do not have permission to submit.</li>
            <li>Content that primarily promotes a product, service, or commercial venture.</li>
            <li>Low-effort or spam submissions.</li>
            <li>AI-generated content presented as original creative work without disclosure.</li>
          </ul>
        </section>

        {/* Moderation */}
        <section>
          <h2 className="text-xl font-bold">Moderation</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Every submission is reviewed by the Sports Mockery team before it appears on the
            showcase. We review for quality, relevance, and compliance with this policy. Submissions
            may be approved, declined, or returned with a request for changes.
          </p>
          <p className="mt-2 text-[var(--text-muted)]">
            Publication is not guaranteed. We reserve the right to decline any submission for any
            reason, and to remove or stop featuring previously published content at our discretion.
          </p>
        </section>

        {/* Creator rights */}
        <section>
          <h2 className="text-xl font-bold">Creator Rights</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            You retain full ownership and copyright of everything you submit. Submitting to the Fan
            Showcase does not transfer ownership of your work.
          </p>
          <p className="mt-2 text-[var(--text-muted)]">
            By submitting, you grant Sports Mockery a <strong className="text-[var(--text-primary)]">non-exclusive, royalty-free license</strong> to:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>Display your content on the Fan Showcase and related pages on sportsmockery.com.</li>
            <li>Promote your content on Sports Mockery social media channels.</li>
            <li>Include your content in the Sports Mockery newsletter.</li>
            <li>Crop, resize, or reformat your content for display purposes.</li>
          </ul>
          <p className="mt-2 text-[var(--text-muted)]">
            This license is non-exclusive — you can share, publish, sell, or license your work
            anywhere else. If you want your content removed from the showcase, contact us and we
            will remove it promptly.
          </p>
        </section>

        {/* SM usage rights */}
        <section>
          <h2 className="text-xl font-bold">Sports Mockery Usage Rights</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Sports Mockery will always credit the creator when displaying submitted content. We will
            not claim ownership of submitted work. We will not sell submitted content to third
            parties. We may feature submissions in editorial contexts, social posts, and newsletters
            with appropriate attribution.
          </p>
        </section>

        {/* Prohibited content */}
        <section>
          <h2 className="text-xl font-bold text-[#BC0000]">Prohibited Content</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            The following types of content are not allowed and will be rejected or removed:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>Hate speech or content targeting individuals or groups based on race, ethnicity, gender, religion, sexual orientation, disability, or other protected characteristics.</li>
            <li>Harassment, threats, bullying, or doxxing of any person.</li>
            <li>Explicit sexual content or nudity.</li>
            <li>Unlawful content, including content that promotes illegal activity.</li>
            <li>Impersonation of players, coaches, team staff, or other public figures.</li>
            <li>Spam, repetitive submissions, or bot-generated content.</li>
            <li>Stolen or infringing work — content you did not create and do not have permission to share.</li>
            <li>Misleading team attribution — content that falsely claims to be about or from a Chicago team.</li>
            <li>Content unrelated to Chicago sports.</li>
          </ul>
        </section>

        {/* Reporting & removal */}
        <section>
          <h2 className="text-xl font-bold">Reporting & Removal</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            If you believe content on the Fan Showcase violates this policy, infringes your rights,
            or should be removed for any reason, contact us at{' '}
            <a href="mailto:showcase@sportsmockery.com" className="text-[#BC0000] hover:underline">
              showcase@sportsmockery.com
            </a>.
          </p>
          <p className="mt-2 text-[var(--text-muted)]">
            If you submitted content and want it removed, email us from the same address you used
            to submit and we will take it down promptly.
          </p>
        </section>

        {/* Enforcement */}
        <section>
          <h2 className="text-xl font-bold">Enforcement</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Repeated violations of this policy — including submitting prohibited content, spam, or
            infringing material — may result in the submitter being blocked from future submissions.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-[var(--border-default)] pt-6 text-center">
        <Link
          href="/fan-showcase/submit"
          className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: '#BC0000' }}
        >
          Submit Your Work
        </Link>
      </div>
    </main>
  )
}
