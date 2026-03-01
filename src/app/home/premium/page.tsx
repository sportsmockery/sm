'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Scout AI — 10 queries/day',
      'Basic team stats & scores',
      'Fan Hub access (read only)',
      'Ad-supported content',
    ],
    cta: 'Get Started',
    href: '/scout-ai',
  },
  {
    name: 'SM+ Monthly',
    price: '$9.99',
    period: '/month',
    featured: true,
    features: [
      'Unlimited Scout AI queries',
      'GM Trade Simulator',
      'Mock Draft Engine',
      'Full Data Cosmos access',
      'Fan Hub — post & vote',
      'Ad-free experience',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/pricing',
  },
  {
    name: 'SM+ Annual',
    price: '$79.99',
    period: '/year',
    features: [
      'Everything in Monthly',
      'Save 33% vs monthly',
      'Early access to new features',
      'Exclusive annual badge',
      'Extended draft history',
    ],
    cta: 'Go Annual',
    href: '/pricing',
  },
]

const PERKS = [
  {
    icon: <Image src="/downloads/scout-v2.png" alt="Scout AI" width={24} height={24} style={{ borderRadius: '50%' }} />,
    title: 'Unlimited Scout AI',
    description: 'No daily limits. Ask anything, anytime.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
    title: 'Trade Simulator',
    description: 'Full access to AI-graded trade builder across all leagues.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: 'Mock Draft Engine',
    description: 'Run unlimited mock drafts with AI-powered boards.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Full Data Access',
    description: 'Complete stats, charts, and analytics across all teams.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Fan Hub Access',
    description: 'Post, vote, and interact in all team chat rooms.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    title: 'Ad-Free Experience',
    description: 'Clean, distraction-free interface across the platform.',
  },
]

const FAQ = [
  {
    q: 'What is SM+ and what do I get?',
    a: 'SM+ is the premium tier of Sports Mockery. It unlocks unlimited Scout AI queries, full access to the GM Trade Simulator and Mock Draft Engine, complete Data Cosmos analytics, Fan Hub posting privileges, and an ad-free experience across the entire platform.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. Your premium features will remain active through the end of your current billing period. No contracts, no hidden fees.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! New SM+ subscribers get a 7-day free trial with full access to all premium features. Cancel before the trial ends and you won\'t be charged.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and PayPal. All payments are processed securely through Stripe.',
  },
]

export default function PremiumPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('hm-visible') }) },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.hm-animate').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hm-page-hero">
        <div className="hm-page-hero-bg" />
        <div className="hm-scan-line" />
        <div className="hm-hero-content hm-animate" style={{ position: 'relative', zIndex: 2 }}>
          <span className="hm-tag" style={{ marginBottom: 24 }}>Premium</span>
          <h1><span className="hm-gradient-text">SM+</span> Premium</h1>
          <p>Unlock the full power of Sports Mockery. Unlimited AI, full simulator access, ad-free experience, and more.</p>
        </div>
      </section>

      <div className="hm-container" style={{ paddingBottom: 120 }}>
        {/* Pricing Cards */}
        <div className="hm-pricing-grid hm-animate">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`hm-price-card ${plan.featured ? 'hm-price-featured' : ''}`}
            >
              {plan.featured && <div className="hm-price-badge">Most Popular</div>}
              <div className="hm-price-name">{plan.name}</div>
              <div className="hm-price-amount">{plan.price}</div>
              <div className="hm-price-period">{plan.period}</div>
              <ul className="hm-price-features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={plan.featured ? 'hm-btn-primary' : 'hm-btn-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Perks */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="hm-tag">What You Get</span>
          <h2 style={{ fontFamily: "Barlow, sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: -1, marginTop: 20, color: '#fff' }}>
            Premium Perks
          </h2>
        </div>
        <div className="hm-perks-grid">
          {PERKS.map((perk) => (
            <div key={perk.title} className="hm-glass-card" style={{ padding: 24, textAlign: 'center' }}>
              <div className="hm-feature-icon" style={{ margin: '0 auto 16px' }}>{perk.icon}</div>
              <h3 style={{ fontSize: 16 }}>{perk.title}</h3>
              <p>{perk.description}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="hm-tag">FAQ</span>
          <h2 style={{ fontFamily: "Barlow, sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, letterSpacing: -1, marginTop: 20, color: '#fff' }}>
            Common Questions
          </h2>
        </div>
        <div className="hm-faq-list">
          {FAQ.map((item, i) => (
            <div key={i} className="hm-faq-item">
              <button
                className="hm-faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span className={`hm-faq-arrow ${openFaq === i ? 'hm-faq-arrow-open' : ''}`}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="hm-faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <Link href="/pricing" className="hm-btn-primary">
            Unlock SM+ Premium &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}
