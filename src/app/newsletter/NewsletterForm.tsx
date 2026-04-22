'use client'

import { useState, FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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

  if (status === 'success') {
    return (
      <div
        className="glass-card glass-card-static"
        style={{ padding: '48px 32px', textAlign: 'center' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--sm-text)', marginBottom: '12px' }}>
          You&apos;re In
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--sm-text-muted)', margin: 0, lineHeight: 1.6 }}>
          Welcome to the Edge Daily. Your first briefing arrives tomorrow at 6 AM CT.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card glass-card-static" style={{ padding: '36px 32px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label
              htmlFor="firstName"
              style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              className="sm-input"
              placeholder="First"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              className="sm-input"
              placeholder="Last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: 'var(--sm-text)', marginBottom: '8px' }}
          >
            Email <span style={{ color: '#BC0000' }}>*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            className="sm-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {status === 'error' && (
          <p style={{ fontSize: '14px', color: '#BC0000', margin: 0 }}>{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary btn-full"
          style={{
            backgroundColor: '#BC0000',
            color: '#FAFAFB',
            opacity: status === 'loading' ? 0.7 : 1,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe to Edge Daily'}
        </button>

        <p style={{ fontSize: '13px', color: 'var(--sm-text-dim)', margin: 0, textAlign: 'center' }}>
          Free forever. No spam. Unsubscribe anytime.
        </p>
      </form>
    </div>
  )
}
