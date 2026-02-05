'use client'

import { useState } from 'react'
import { Role, ALL_ROLES } from '@/lib/roles'

interface InviteUserProps {
  onSuccess: () => void
  onCancel: () => void
}

type CreateMode = 'create' | 'invite'

export default function InviteUser({ onSuccess, onCancel }: InviteUserProps) {
  const [mode, setMode] = useState<CreateMode>('create')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('fan')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSending(true)

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name || email.split('@')[0],
          role
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSending(false)
        return
      }

      setSuccess('User created successfully!')
      setTimeout(() => onSuccess(), 1000)
    } catch (err) {
      console.error('Error creating user:', err)
      setError('Failed to create user. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSending(true)

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: Math.random().toString(36).slice(-12) + 'A1!', // Temp password
          name: name || email.split('@')[0],
          role
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setSending(false)
        return
      }

      // Send password reset email so user can set their own password
      await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email,
          action: 'send_reset'
        })
      })

      setSuccess('User created and invite email sent!')
      setTimeout(() => onSuccess(), 1000)
    } catch (err) {
      console.error('Error inviting user:', err)
      setError('Failed to send invite. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--bg-surface, #f7f7f7)',
        border: '1px solid var(--border-color, #e0e0e0)',
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary, #222222)' }}
      >
        Add New User
      </h3>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('create')}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: mode === 'create' ? '#2563eb' : 'var(--bg-secondary, #f5f5f5)',
            color: mode === 'create' ? '#ffffff' : 'var(--text-muted, #666666)',
            border: mode === 'create' ? 'none' : '1px solid var(--border-color, #e0e0e0)',
          }}
        >
          Create with Password
        </button>
        <button
          type="button"
          onClick={() => setMode('invite')}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: mode === 'invite' ? '#2563eb' : 'var(--bg-secondary, #f5f5f5)',
            color: mode === 'invite' ? '#ffffff' : 'var(--text-muted, #666666)',
            border: mode === 'invite' ? 'none' : '1px solid var(--border-color, #e0e0e0)',
          }}
        >
          Send Invite Email
        </button>
      </div>

      <form onSubmit={mode === 'create' ? handleCreateUser : handleSendInvite} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-primary, #222222)' }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--input-bg, #ffffff)',
              border: '1px solid var(--input-border, #e0e0e0)',
              color: 'var(--input-text, #222222)',
            }}
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-primary, #222222)' }}
          >
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--input-bg, #ffffff)',
              border: '1px solid var(--input-border, #e0e0e0)',
              color: 'var(--input-text, #222222)',
            }}
            placeholder="John Doe"
          />
        </div>

        {mode === 'create' && (
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--text-primary, #222222)' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--input-bg, #ffffff)',
                border: '1px solid var(--input-border, #e0e0e0)',
                color: 'var(--input-text, #222222)',
              }}
              placeholder="Min 6 characters"
            />
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-primary, #222222)' }}
          >
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--input-bg, #ffffff)',
              border: '1px solid var(--input-border, #e0e0e0)',
              color: 'var(--input-text, #222222)',
            }}
          >
            {ALL_ROLES.map(r => (
              <option key={r.value} value={r.value}>
                {r.label} - {r.description}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 transition-colors"
            style={{ color: 'var(--text-muted, #666666)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending || !email || (mode === 'create' && !password)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {mode === 'create' ? 'Creating...' : 'Sending...'}
              </>
            ) : (
              <>
                {mode === 'create' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create User
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Invite
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
