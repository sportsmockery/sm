'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import UsersTable from '@/components/admin/UsersTable'
import InviteUser from '@/components/admin/InviteUser'
import { Role } from '@/lib/roles'

interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar_url?: string
  last_sign_in_at?: string
  created_at: string
  isFanCouncilMember?: boolean
  reputationScore?: number
}

interface PasswordModalState {
  isOpen: boolean
  userId: string
  email: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [passwordModal, setPasswordModal] = useState<PasswordModalState>({ isOpen: false, userId: '', email: '' })
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSyncUsers = async () => {
    setSyncing(true)
    setSyncMessage('')

    try {
      const response = await fetch('/api/admin/users/sync', {
        method: 'POST'
      })

      const data = await response.json()

      if (data.error) {
        setSyncMessage(`Error: ${data.error}`)
      } else {
        setSyncMessage(data.message)
        if (data.synced > 0) {
          fetchUsers() // Refresh the list
        }
      }

      // Clear message after 3 seconds
      setTimeout(() => setSyncMessage(''), 3000)
    } catch (error) {
      console.error('Error syncing users:', error)
      setSyncMessage('Failed to sync users')
    } finally {
      setSyncing(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sm_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, role: Role) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sm_users')
        .update({ role })
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sm_users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleInviteSuccess = () => {
    setShowInvite(false)
    fetchUsers()
  }

  const handleResetPassword = (userId: string, email: string) => {
    setPasswordModal({ isOpen: true, userId, email })
    setNewPassword('')
    setPasswordMessage('')
  }

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    setPasswordMessage('')

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordModal.userId,
          email: passwordModal.email,
          password: newPassword,
          action: 'set_password'
        })
      })

      const data = await response.json()

      if (data.error) {
        setPasswordMessage(`Error: ${data.error}`)
      } else {
        setPasswordMessage('Password updated successfully!')
        setTimeout(() => {
          setPasswordModal({ isOpen: false, userId: '', email: '' })
        }, 1500)
      }
    } catch (error) {
      console.error('Error setting password:', error)
      setPasswordMessage('Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSendResetEmail = async () => {
    setPasswordLoading(true)
    setPasswordMessage('')

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordModal.userId,
          email: passwordModal.email,
          action: 'send_reset'
        })
      })

      const data = await response.json()

      if (data.error) {
        setPasswordMessage(`Error: ${data.error}`)
      } else {
        setPasswordMessage('Password reset email sent!')
        setTimeout(() => {
          setPasswordModal({ isOpen: false, userId: '', email: '' })
        }, 1500)
      }
    } catch (error) {
      console.error('Error sending reset email:', error)
      setPasswordMessage('Failed to send reset email')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Users</h1>
          {syncMessage && (
            <p className={`text-sm mt-1 ${syncMessage.includes('Error') ? 'text-[#BC0000]' : 'text-[#00D4FF]'}`}>
              {syncMessage}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncUsers}
            disabled={syncing}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: 'var(--text-muted)' }}
            title="Sync users from Supabase Auth"
          >
            <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync Auth Users'}
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: 'var(--accent-red)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {showInvite && (
        <div className="mb-6">
          <InviteUser
            onSuccess={handleInviteSuccess}
            onCancel={() => setShowInvite(false)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-red)' }}></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p>No users found</p>
          <button
            onClick={() => setShowInvite(true)}
            className="mt-4 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-red)' }}
          >
            Invite your first user
          </button>
        </div>
      ) : (
        <UsersTable
          users={users}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
          onResetPassword={handleResetPassword}
        />
      )}

      {/* WordPress Writers Section */}
      <WordPressWritersSection />

      {/* Password Reset Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Manage Password
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              User: {passwordModal.email}
            </p>

            {passwordMessage && (
              <div className={`p-3 rounded-lg mb-4 text-sm ${
                passwordMessage.includes('Error') || passwordMessage.includes('Failed')
                  ? 'bg-red-500/20 border border-red-500/30 text-[#BC0000]'
                  : 'bg-[#00D4FF]/20 border border-green-500/30 text-[#00D4FF]'
              }`}>
                {passwordMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Set New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSetPassword}
                  disabled={passwordLoading || !newPassword}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: 'var(--accent-red)' }}
                >
                  {passwordLoading ? 'Setting...' : 'Set Password'}
                </button>
                <button
                  onClick={handleSendResetEmail}
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: 'var(--text-muted)' }}
                >
                  {passwordLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                onClick={() => setPasswordModal({ isOpen: false, userId: '', email: '' })}
                className="w-full px-4 py-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface WPWriter {
  id: string
  display_name: string
  email: string
  avatar_url?: string
  role?: string
  bio?: string
}

function WordPressWritersSection() {
  const [writers, setWriters] = useState<WPWriter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWriters() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('sm_authors')
          .select('id, display_name, email, avatar_url, role, bio')
          .order('display_name')
        setWriters(data || [])
      } catch (error) {
        console.error('Error fetching WP writers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchWriters()
  }, [])

  const roleColors: Record<string, string> = {
    editor: 'bg-[#00D4FF]/20 text-[#00D4FF] border border-blue-500/30',
    author: 'bg-[#00D4FF]/20 text-[#00D4FF] border border-green-500/30',
    admin: 'bg-red-500/20 text-[#BC0000] border border-red-500/30',
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>WordPress Writers</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {writers.length} writers imported from WordPress
          </p>
        </div>
        <Link
          href="/admin/writers"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--accent-red)' }}
        >
          Manage Writers →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-red)' }}></div>
        </div>
      ) : writers.length === 0 ? (
        <div className="text-center py-8 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No WordPress writers found</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Writer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {writers.map((writer) => (
                <tr key={writer.id} className="hover:opacity-90 transition-opacity" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {writer.avatar_url ? (
                        <Image src={writer.avatar_url} alt={writer.display_name} width={32} height={32} className="rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: 'var(--accent-red)' }}>
                          {writer.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{writer.display_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{ color: 'var(--text-muted)' }}>{writer.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[writer.role || ''] || 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'}`}>
                      {writer.role || 'author'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#BC0000]/20 text-[#BC0000] border border-orange-500/30">
                      WordPress
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
