'use client'

import Image from 'next/image'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'author'
  avatar_url?: string
  last_sign_in_at?: string
  created_at: string
}

interface UsersTableProps {
  users: User[]
  onRoleChange: (userId: string, role: User['role']) => void
  onDelete: (userId: string) => void
}

const roleColors = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  author: 'bg-green-500/20 text-green-400 border-green-500/30'
}

export default function UsersTable({ users, onRoleChange, onDelete }: UsersTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-900/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{user.name || 'Unnamed'}</p>
                    <p className="text-sm text-gray-500">Joined {formatDate(user.created_at)}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-300">{user.email}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.id, e.target.value as User['role'])}
                  className={`px-3 py-1 rounded-full text-sm font-medium border bg-transparent focus:outline-none cursor-pointer ${roleColors[user.role]}`}
                >
                  <option value="admin" className="bg-gray-800 text-white">Admin</option>
                  <option value="editor" className="bg-gray-800 text-white">Editor</option>
                  <option value="author" className="bg-gray-800 text-white">Author</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-400 text-sm">{formatDate(user.last_sign_in_at)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => onDelete(user.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete user"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
