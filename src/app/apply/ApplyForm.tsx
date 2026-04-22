'use client'

import { useState, FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ApplyForm({ roles }: { roles: string[] }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    portfolio: '',
    coverLetter: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
          Application Received
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--sm-text-muted)', margin: 0, lineHeight: 1.6 }}>
          Thanks for your interest in joining Sports Mockery. We&apos;ll review your application and get back to you soon.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card glass-card-static" style={{ padding: '36px 32px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Name + Email */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="name" style={labelStyle}>
              Full Name <span style={{ color: '#BC0000' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              className="sm-input"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="apply-email" style={labelStyle}>
              Email <span style={{ color: '#BC0000' }}>*</span>
            </label>
            <input
              type="email"
              id="apply-email"
              required
              className="sm-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
        </div>

        {/* Phone + Position */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="phone" style={labelStyle}>Phone</label>
            <input
              type="tel"
              id="phone"
              className="sm-input"
              placeholder="(555) 555-5555"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="position" style={labelStyle}>
              Position <span style={{ color: '#BC0000' }}>*</span>
            </label>
            <select
              id="position"
              required
              className="sm-input"
              value={form.position}
              onChange={(e) => update('position', e.target.value)}
              style={{
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 16px center',
              }}
            >
              <option value="">Select a role</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label htmlFor="experience" style={labelStyle}>Years of Experience</label>
          <select
            id="experience"
            className="sm-input"
            value={form.experience}
            onChange={(e) => update('experience', e.target.value)}
            style={{
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 16px center',
            }}
          >
            <option value="">Select</option>
            <option value="0-1 years">0–1 years</option>
            <option value="1-3 years">1–3 years</option>
            <option value="3-5 years">3–5 years</option>
            <option value="5-10 years">5–10 years</option>
            <option value="10+ years">10+ years</option>
          </select>
        </div>

        {/* Portfolio */}
        <div>
          <label htmlFor="portfolio" style={labelStyle}>Portfolio / LinkedIn URL</label>
          <input
            type="url"
            id="portfolio"
            className="sm-input"
            placeholder="https://"
            value={form.portfolio}
            onChange={(e) => update('portfolio', e.target.value)}
          />
        </div>

        {/* Cover Letter */}
        <div>
          <label htmlFor="coverLetter" style={labelStyle}>
            Cover Letter <span style={{ color: '#BC0000' }}>*</span>
          </label>
          <textarea
            id="coverLetter"
            required
            className="sm-input sm-textarea"
            rows={8}
            placeholder="Tell us why you want to join Sports Mockery, what you'd bring to the team, and any relevant experience..."
            value={form.coverLetter}
            onChange={(e) => update('coverLetter', e.target.value)}
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
          {status === 'loading' ? 'Submitting...' : 'Submit Application'}
        </button>

        <p style={{ fontSize: '13px', color: 'var(--sm-text-dim)', margin: 0, textAlign: 'center' }}>
          Your application will be sent to our hiring team at jobs@sportsmockery.com
        </p>
      </form>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--sm-text)',
  marginBottom: '8px',
}
