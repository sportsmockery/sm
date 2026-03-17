'use client'

import Image from 'next/image'
import Link from 'next/link'
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
  onResetPassword?: (userId: string, email: string) => void
  // If true, show all roles including fan roles
  showAllRoles?: boolean
}

export default function UsersTable({
  users,
  onRoleChange,
  onDelete,
  onResetPassword,
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
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:opacity-90 transition-opacity" style={{ borderBottom: '1px solid var(--border-default)' }}>
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
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: 'var(--accent-red)' }}>
                      {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>{user.name || 'Unnamed'}</Link>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Joined {formatDate(user.created_at)}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
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
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
                {/* Show Fan Council badge if applicable */}
                {user.isFanCouncilMember && user.role === 'fan' && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[#D6B05E]/20 text-[#D6B05E] border border-[#D6B05E]/30">
                    Council Eligible
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(user.last_sign_in_at)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Edit user profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  {onResetPassword && (
                    <button
                      onClick={() => onResetPassword(user.id, user.email)}
                      className="text-[#00D4FF] hover:text-[#00D4FF] transition-colors"
                      title="Reset password"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-[#BC0000] hover:text-[#BC0000] transition-colors"
                    title="Delete user"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
