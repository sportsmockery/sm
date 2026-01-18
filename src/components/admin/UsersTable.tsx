'use client'

import Image from 'next/image'
import { Role, ROLE_COLORS, ALL_ROLES, ROLE_DEFINITIONS } from '@/lib/roles'

interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar_url?: string
  last_sign_in_at?: string
  created_at: string
  // Fan Council specific fields
  isFanCouncilMember?: boolean
  reputationScore?: number
}

interface UsersTableProps {
  users: User[]
  onRoleChange: (userId: string, role: Role) => void
  onDelete: (userId: string) => void
  // If true, show all roles including fan roles
  showAllRoles?: boolean
}

export default function UsersTable({
  users,
  onRoleChange,
  onDelete,
  showAllRoles = true
}: UsersTableProps) {
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
                  onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border bg-transparent focus:outline-none cursor-pointer ${ROLE_COLORS[user.role]}`}
                >
                  {ALL_ROLES.map(role => (
                    <option
                      key={role.value}
                      value={role.value}
                      className="bg-gray-800 text-white"
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
                {/* Show Fan Council badge if applicable */}
                {user.isFanCouncilMember && user.role === 'fan' && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Council Eligible
                  </span>
                )}
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
