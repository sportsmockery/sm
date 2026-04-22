'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Job {
  id: string
  title: string
  type: string
  description: string
  active: boolean
  sort_order: number
  created_at: string
}

type EditingJob = Omit<Job, 'id' | 'created_at'> & { id?: string }

const EMPTY_JOB: EditingJob = { title: '', type: 'Full-time', description: '', active: true, sort_order: 0 }

export default function OpenJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [editing, setEditing] = useState<EditingJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('sm_open_jobs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[open-jobs] Fetch error:', error.message)
      setMessage({ text: 'Failed to load jobs. Table may need to be created.', type: 'error' })
    } else {
      setJobs(data || [])
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!editing?.title || !editing?.description) return
    setSaving(true)
    setMessage(null)

    const payload = {
      title: editing.title.trim(),
      type: editing.type.trim(),
      description: editing.description.trim(),
      active: editing.active,
      sort_order: editing.sort_order,
    }

    if (editing.id) {
      const { error } = await supabase
        .from('sm_open_jobs')
        .update(payload)
        .eq('id', editing.id)

      if (error) {
        setMessage({ text: `Update failed: ${error.message}`, type: 'error' })
      } else {
        setMessage({ text: 'Job updated', type: 'success' })
        setEditing(null)
        fetchJobs()
      }
    } else {
      const { error } = await supabase
        .from('sm_open_jobs')
        .insert(payload)

      if (error) {
        setMessage({ text: `Create failed: ${error.message}`, type: 'error' })
      } else {
        setMessage({ text: 'Job created', type: 'success' })
        setEditing(null)
        fetchJobs()
      }
    }
    setSaving(false)
  }

  async function toggleActive(job: Job) {
    const { error } = await supabase
      .from('sm_open_jobs')
      .update({ active: !job.active })
      .eq('id', job.id)

    if (!error) fetchJobs()
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job posting?')) return
    const { error } = await supabase
      .from('sm_open_jobs')
      .delete()
      .eq('id', id)

    if (!error) {
      setMessage({ text: 'Job deleted', type: 'success' })
      fetchJobs()
    }
  }

  const activeJobs = jobs.filter((j) => j.active)
  const inactiveJobs = jobs.filter((j) => !j.active)

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh' }}>
      <div className="mx-auto max-w-4xl" style={{ padding: '32px 24px' }}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Open Jobs
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Manage job postings shown on <a href="/apply" target="_blank" style={{ color: '#00D4FF' }}>/apply</a>
            </p>
          </div>
          <button
            onClick={() => setEditing({ ...EMPTY_JOB, sort_order: jobs.length })}
            style={{ backgroundColor: '#BC0000' }}
            className="rounded-lg px-4 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
          >
            + Add Job
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: message.type === 'success' ? 'rgba(0, 212, 255, 0.1)' : 'rgba(188, 0, 0, 0.1)',
              color: message.type === 'success' ? '#00D4FF' : '#BC0000',
              border: `1px solid ${message.type === 'success' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(188, 0, 0, 0.2)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Editor */}
        {editing && (
          <div
            style={{
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '14px',
              padding: '28px',
              marginBottom: '24px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>
              {editing.id ? 'Edit Job' : 'New Job'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    className="sm-input"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    placeholder="e.g. Sports Writer"
                    style={inputOverride}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    className="sm-input"
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                    style={{ ...inputOverride, appearance: 'auto' as React.CSSProperties['appearance'] }}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Freelance</option>
                    <option>Full-time / Freelance</option>
                    <option>Full-time / Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  className="sm-input sm-textarea"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the role..."
                  style={inputOverride}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Sort Order</label>
                  <input
                    type="number"
                    className="sm-input"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                    style={{ ...inputOverride, width: '80px' }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#00D4FF' }}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Active (visible on /apply)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving || !editing.title || !editing.description}
                  style={{
                    backgroundColor: '#BC0000',
                    opacity: saving || !editing.title || !editing.description ? 0.5 : 1,
                  }}
                  className="rounded-lg px-5 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Saving...' : editing.id ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  className="rounded-lg px-5 py-2.5 font-medium hover:opacity-80 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading...</p>
        )}

        {/* Active Jobs */}
        {!loading && activeJobs.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              Active ({activeJobs.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeJobs.map((job) => (
                <JobRow key={job.id} job={job} onEdit={() => setEditing(job)} onToggle={() => toggleActive(job)} onDelete={() => deleteJob(job.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Jobs */}
        {!loading && inactiveJobs.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              Inactive ({inactiveJobs.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {inactiveJobs.map((job) => (
                <JobRow key={job.id} job={job} onEdit={() => setEditing(job)} onToggle={() => toggleActive(job)} onDelete={() => deleteJob(job.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && jobs.length === 0 && !editing && (
          <div
            style={{
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '14px',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              No job postings yet
            </p>
            <button
              onClick={() => setEditing({ ...EMPTY_JOB })}
              style={{ backgroundColor: '#BC0000' }}
              className="rounded-lg px-4 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
            >
              Create First Job
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function JobRow({
  job,
  onEdit,
  onToggle,
  onDelete,
}: {
  job: Job
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      style={{
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        opacity: job.active ? 1 : 0.6,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {job.title}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              color: '#00D4FF',
            }}
          >
            {job.type}
          </span>
          {!job.active && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(188, 0, 0, 0.1)',
                color: '#BC0000',
              }}
            >
              Hidden
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {job.description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={onToggle}
          title={job.active ? 'Hide from /apply' : 'Show on /apply'}
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          {job.active ? (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          )}
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: '#BC0000',
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--text-secondary)',
  marginBottom: '6px',
}

const inputOverride: React.CSSProperties = {
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
}
