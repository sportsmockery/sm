'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Role, STAFF_ROLES } from '@/lib/roles'

interface InviteUserProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function InviteUser({ onSuccess, onCancel }: InviteUserProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('author')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const supabase = createClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('sm_users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        setError('A user with this email already exists')
        setSending(false)
        return
      }

      // Send invite using Supabase Auth
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          role
        }
      })

      if (inviteError) {
        // Fallback: create user record directly (they'll need to sign up)
        const { error: createError } = await supabase
          .from('sm_users')
          .insert({
            email,
            role,
            name: email.split('@')[0],
            invited: true
          })

        if (createError) throw createError
      }

      onSuccess()
    } catch (err) {
      console.error('Error inviting user:', err)
      setError('Failed to send invite. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Invite New User</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {STAFF_ROLES.map(r => (
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
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending || !email}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Invite
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
