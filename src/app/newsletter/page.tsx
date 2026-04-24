import { Metadata } from 'next'
import NewsletterForm from './NewsletterForm'
import styles from './newsletter.module.css'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Edge Daily Newsletter | Sports Mockery',
  description: 'Get the Edge Daily — Chicago sports intelligence delivered to your inbox every morning. Scores, stories, Scout AI insights, and more.',
  alternates: { canonical: 'https://sportsmockery.com/newsletter' },
  openGraph: {
    title: 'Edge Daily Newsletter | Sports Mockery',
    description: 'Chicago sports intelligence delivered to your inbox every morning.',
    type: 'website',
  },
}

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Every Score, Every Team',
    desc: 'Bears, Bulls, Cubs, Sox, Hawks — all five Chicago teams in one glance. No app-hopping.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </svg>
    ),
    title: 'Scout AI Insights',
    desc: 'AI-generated angles and questions the mainstream coverage misses — an analyst in your inbox.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Top Stories, Ranked',
    desc: 'The biggest Chicago sports stories curated by readership. Headlines that actually matter.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    title: 'Video & Shows',
    desc: 'Untold Chicago Stories, Pinwheels & Ivy, No Strokes — direct links, zero searching.',
  },
]

const PROOF_POINTS = [
  { value: '6 AM CT', label: 'Every morning' },
  { value: '< 5 min', label: 'Quick read' },
  { value: '5 teams', label: 'One email' },
  { value: '100%', label: 'Free forever' },
]

export default function NewsletterPage() {
  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* ── HERO SECTION ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* Left: Copy + Form */}
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              <span className={styles.badgeText}>Free Daily Briefing</span>
            </div>

            <h1 className={styles.headline}>
              Wake up with
              <br />
              <span className={styles.headlineAccent}>the Edge.</span>
            </h1>

            <p className={styles.subheadline}>
              Chicago sports intelligence in your inbox every morning.
              Scores, stories, Scout AI insights, and video — one email, zero noise.
            </p>

            {/* Inline stats bar */}
            <div className={styles.proofBar}>
              {PROOF_POINTS.map((p) => (
                <div key={p.label} className={styles.proofItem}>
                  <span className={styles.proofValue}>{p.value}</span>
                  <span className={styles.proofLabel}>{p.label}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className={styles.heroForm}>
              <NewsletterForm />
            </div>
          </div>

          {/* Right: Email Preview */}
          <div className={styles.previewContainer}>
            <div className={styles.previewFrame}>
              <div className={styles.previewDots}>
                <span /><span /><span />
              </div>
              <div className={styles.previewImageWrap}>
                <Image
                  src="/edge-email-preview.png"
                  alt="Edge Daily newsletter preview showing scores, top stories, and Scout AI insights"
                  width={380}
                  height={700}
                  className={styles.previewImage}
                  priority
                />
              </div>
            </div>
            <div className={styles.previewGlow} />
          </div>
        </div>
      </section>

      {/* ── WHAT'S INSIDE ── */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionLabel}>
          <span className={styles.sectionLine} />
          <span className={styles.sectionLabelText}>What&apos;s Inside Every Edition</span>
          <span className={styles.sectionLine} />
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY EDGE ── */}
      <section className={styles.whySection}>
        <h2 className={styles.whyHeadline}>
          Built for the Chicago fan who wants<br className={styles.desktopBreak} /> more than a box score.
        </h2>

        <div className={styles.whyGrid}>
          {[
            {
              num: '01',
              title: 'All five teams, one email',
              desc: 'Stop checking five different apps. Bears, Bulls, Cubs, White Sox, and Blackhawks — consolidated into a single morning read.',
            },
            {
              num: '02',
              title: 'Written for Chicago fans',
              desc: 'Not a national wire recap. Every story, score, and insight is filtered through a Chicago lens by people who actually watch the games.',
            },
            {
              num: '03',
              title: 'AI-powered angles',
              desc: 'Scout AI surfaces questions and storylines the mainstream coverage misses — like having a sports analyst in your inbox.',
            },
            {
              num: '04',
              title: 'Under 5 minutes',
              desc: 'Designed to scan fast. Get fully caught up on your commute, over coffee, or before the group chat starts buzzing.',
            },
          ].map((item) => (
            <div key={item.num} className={styles.whyItem}>
              <span className={styles.whyNum}>{item.num}</span>
              <div>
                <h3 className={styles.whyItemTitle}>{item.title}</h3>
                <p className={styles.whyItemDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaHeadline}>
            Tomorrow morning, 6 AM.
          </h2>
          <p className={styles.ctaSubline}>
            Your inbox. Your teams. Your Edge.
          </p>
          <div className={styles.ctaForm}>
            <NewsletterForm variant="compact" />
          </div>
          <p className={styles.ctaFine}>
            Free forever. No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  )
}
