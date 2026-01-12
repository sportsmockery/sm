'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import UsersTable from '@/components/admin/UsersTable'
import InviteUser from '@/components/admin/InviteUser'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'author'
  avatar_url?: string
  last_sign_in_at?: string
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        setLoading(false)
        return
      }
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

  const handleRoleChange = async (userId: string, role: User['role']) => {
    try {
      const supabase = createClient()
      if (!supabase) return
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
      if (!supabase) return
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Invite User
        </button>
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
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p>No users found</p>
          <button
            onClick={() => setShowInvite(true)}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            Invite your first user
          </button>
        </div>
      ) : (
        <UsersTable
          users={users}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
