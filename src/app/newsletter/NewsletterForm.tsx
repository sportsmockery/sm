'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import styles from './newsletter.module.css'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showName, setShowName] = useState(false)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'success' && successRef.current) {
      successRef.current.focus()
    }
  }, [status])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/audience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong')
        return
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  /* ── Success state ── */
  if (status === 'success') {
    return (
      <div ref={successRef} tabIndex={-1} className={styles.successCard}>
        <div className={styles.successCheck}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className={styles.successTitle}>You&apos;re in.</h2>
        <p className={styles.successDesc}>
          Welcome to the Edge Daily. Your first briefing arrives tomorrow at 6 AM CT.
        </p>
      </div>
    )
  }

  /* ── Compact variant (bottom CTA) ── */
  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={styles.compactForm}>
        <div className={styles.compactRow}>
          <input
            type="email"
            required
            className={`sm-input ${styles.compactInput}`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={styles.compactBtn}
            style={{
              backgroundColor: '#BC0000',
              color: '#FAFAFB',
              opacity: status === 'loading' ? 0.7 : 1,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'loading' ? 'Joining...' : 'Get the Edge'}
          </button>
        </div>
        {status === 'error' && (
          <p className={styles.errorText}>{errorMsg}</p>
        )}
      </form>
    )
  }

  /* ── Full variant (hero) ── */
  return (
    <form onSubmit={handleSubmit} className={styles.fullForm}>
      {/* Email — primary field, always visible */}
      <div className={styles.emailRow}>
        <input
          type="email"
          required
          className={`sm-input ${styles.emailInput}`}
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={styles.submitBtn}
          style={{
            backgroundColor: '#BC0000',
            color: '#FAFAFB',
            opacity: status === 'loading' ? 0.7 : 1,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'loading' ? (
            <span className={styles.loadingDots}>
              <span /><span /><span />
            </span>
          ) : (
            'Subscribe Free'
          )}
        </button>
      </div>

      {/* Optional name fields — progressive disclosure */}
      {!showName ? (
        <button
          type="button"
          onClick={() => setShowName(true)}
          className={styles.addNameBtn}
        >
          + Add your name <span className={styles.optionalTag}>(optional)</span>
        </button>
      ) : (
        <div className={styles.nameRow}>
          <input
            type="text"
            className={`sm-input ${styles.nameInput}`}
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-label="First name"
          />
          <input
            type="text"
            className={`sm-input ${styles.nameInput}`}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-label="Last name"
          />
        </div>
      )}

      {status === 'error' && (
        <p className={styles.errorText}>{errorMsg}</p>
      )}

      <p className={styles.finePrint}>
        Free forever. No spam. Unsubscribe anytime.
      </p>
    </form>
  )
}
