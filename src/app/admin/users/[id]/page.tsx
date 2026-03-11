'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Role, ALL_ROLES, ROLE_COLORS } from '@/lib/roles'

interface UserData {
  id: string
  email: string
  name: string
  role: Role
  avatar_url?: string
  last_sign_in_at?: string
  created_at: string
  updated_at?: string
  is_fan_council_member?: boolean
  reputation_score?: number
}

interface UserPreferences {
  favorite_teams?: string[]
  notification_preferences?: Record<string, boolean>
  eliminate_other_teams?: boolean
}

const TEAM_LABELS: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks',
  cubs: 'Cubs', whitesox: 'White Sox',
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('fan')
  const [isFanCouncil, setIsFanCouncil] = useState(false)
  const [reputationScore, setReputationScore] = useState(0)

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (!res.ok) throw new Error('User not found')
      const data = await res.json()
      setUser(data.user)
      setPreferences(data.preferences)
      setName(data.user.name || '')
      setRole(data.user.role || 'fan')
      setIsFanCouncil(data.user.is_fan_council_member || false)
      setReputationScore(data.user.reputation_score || 0)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load user' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, is_fan_council_member: isFanCouncil, reputation_score: reputationScore }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setUser(data.user)
      setMessage({ type: 'success', text: 'User updated successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }
    setPasswordLoading(true)
    setPasswordMessage('')
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: user?.email, password: newPassword, action: 'set_password' }),
      })
      const data = await res.json()
      if (data.error) { setPasswordMessage(`Error: ${data.error}`); return }
      setPasswordMessage('Password updated successfully!')
      setNewPassword('')
      setTimeout(() => setPasswordMessage(''), 3000)
    } catch {
      setPasswordMessage('Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSendResetEmail = async () => {
    setPasswordLoading(true)
    setPasswordMessage('')
    try {
      const res = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: user?.email, action: 'send_reset' }),
      })
      const data = await res.json()
      if (data.error) { setPasswordMessage(`Error: ${data.error}`); return }
      setPasswordMessage('Password reset email sent!')
      setTimeout(() => setPasswordMessage(''), 3000)
    } catch {
      setPasswordMessage('Failed to send reset email')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/admin/users')
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete user' })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-red)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <Link href="/admin/users" className="text-sm hover:underline" style={{ color: 'var(--accent-red)' }}>
          ← Back to Users
        </Link>
        <div className="mt-8 text-center" style={{ color: 'var(--text-muted)' }}>User not found</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users" className="text-sm hover:underline" style={{ color: 'var(--accent-red)' }}>
          ← Back to Users
        </Link>
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-6 text-sm ${
          message.type === 'error'
            ? 'bg-red-500/20 border border-red-500/30 text-[#BC0000]'
            : 'bg-[#00D4FF]/20 border border-green-500/30 text-[#00D4FF]'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-4 mb-6">
              {user.avatar_url ? (
                <Image src={user.avatar_url} alt={user.name} width={80} height={80} className="rounded-full" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: 'var(--accent-red)' }}>
                  {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name || 'Unnamed'}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                  {ALL_ROLES.find(r => r.value === user.role)?.label || user.role}
                </span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <p className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  {user.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                >
                  {ALL_ROLES.map(r => (
                    <option key={r.value} value={r.value} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fanCouncil"
                  checked={isFanCouncil}
                  onChange={(e) => setIsFanCouncil(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="fanCouncil" className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Fan Council Member
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Reputation Score</label>
                <input
                  type="number"
                  value={reputationScore}
                  onChange={(e) => setReputationScore(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: 'var(--accent-red)' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Account Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt style={{ color: 'var(--text-muted)' }}>User ID</dt>
                <dd className="font-mono text-xs mt-0.5 break-all" style={{ color: 'var(--text-secondary)' }}>{user.id}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--text-muted)' }}>Joined</dt>
                <dd style={{ color: 'var(--text-secondary)' }}>{formatDate(user.created_at)}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--text-muted)' }}>Last Login</dt>
                <dd style={{ color: 'var(--text-secondary)' }}>{formatDate(user.last_sign_in_at)}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--text-muted)' }}>Updated</dt>
                <dd style={{ color: 'var(--text-secondary)' }}>{formatDate(user.updated_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Password Management */}
          <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Password</h3>

            {passwordMessage && (
              <div className={`p-2 rounded-lg mb-3 text-xs ${
                passwordMessage.includes('Error') || passwordMessage.includes('Failed')
                  ? 'bg-red-500/20 border border-red-500/30 text-[#BC0000]'
                  : 'bg-[#00D4FF]/20 border border-green-500/30 text-[#00D4FF]'
              }`}>
                {passwordMessage}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={handleSetPassword}
                disabled={passwordLoading || !newPassword}
                className="w-full px-3 py-2 text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: 'var(--accent-red)' }}
              >
                {passwordLoading ? 'Setting...' : 'Set Password'}
              </button>
              <button
                onClick={handleSendResetEmail}
                disabled={passwordLoading}
                className="w-full px-3 py-2 text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                {passwordLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </div>

          {/* Preferences */}
          {preferences && (
            <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>Preferences</h3>
              <div className="space-y-3 text-sm">
                {preferences.favorite_teams && preferences.favorite_teams.length > 0 ? (
                  <div>
                    <dt style={{ color: 'var(--text-muted)' }}>Favorite Teams</dt>
                    <dd className="flex flex-wrap gap-1.5 mt-1">
                      {preferences.favorite_teams.map((team: string) => (
                        <span key={team} className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#00D4FF]/20 text-[#00D4FF] border border-blue-500/30">
                          {TEAM_LABELS[team] || team}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No favorite teams set</p>
                )}
                {preferences.eliminate_other_teams !== undefined && (
                  <div>
                    <dt style={{ color: 'var(--text-muted)' }}>Hide Other Teams</dt>
                    <dd style={{ color: 'var(--text-secondary)' }}>{preferences.eliminate_other_teams ? 'Yes' : 'No'}</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-lg p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #BC0000' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-[#BC0000]">Danger Zone</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Permanently delete this user and their auth account. This cannot be undone.
            </p>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#BC0000' }}
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
