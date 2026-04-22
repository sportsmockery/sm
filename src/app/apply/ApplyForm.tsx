'use client'

import { useState, useRef, FormEvent } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

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
  const [resume, setResume] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) {
      setResume(null)
      return
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError('Please upload a PDF or DOCX file. Other formats are not accepted.')
      setResume(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File must be under 10 MB.')
      setResume(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setResume(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })
      if (resume) formData.append('resume', resume)

      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
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

        {/* Resume Upload */}
        <div>
          <label htmlFor="resume" style={labelStyle}>Resume</label>
          <div
            style={{
              position: 'relative',
              border: '1px dashed var(--sm-border)',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              id="resume"
              ref={fileInputRef}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {resume ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00D4FF">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sm-text)' }}>{resume.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setResume(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: 'var(--sm-text-muted)',
                  }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--sm-text-muted)" style={{ margin: '0 auto 8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', margin: '0 0 4px' }}>
                  Click to upload your resume
                </p>
                <p style={{ fontSize: '13px', color: 'var(--sm-text-dim)', margin: 0 }}>
                  PDF or DOCX only, 10 MB max
                </p>
              </>
            )}
          </div>
          {fileError && (
            <p style={{ fontSize: '13px', color: '#BC0000', margin: '8px 0 0' }}>{fileError}</p>
          )}
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
