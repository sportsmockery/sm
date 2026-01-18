'use client'

import { Role, ALL_ROLES, STAFF_ROLES, ROLE_DEFINITIONS } from '@/lib/roles'

interface RoleSelectorProps {
  value: Role
  onChange: (role: Role) => void
  // If true, only show staff roles (for admin invite flow)
  staffOnly?: boolean
  // If true, include fan roles in selection
  includeFanRoles?: boolean
}

// Build role options with styling
function getRoleOptions(staffOnly: boolean, includeFanRoles: boolean) {
  let roles = staffOnly ? STAFF_ROLES : ALL_ROLES

  if (!includeFanRoles && !staffOnly) {
    // Default: show staff roles only unless explicitly including fan roles
    roles = STAFF_ROLES
  }

  return roles.map(role => ({
    value: role.value,
    label: role.label,
    description: role.description,
    color: `${role.borderColor} ${role.color.replace('text-', 'bg-').replace('/20', '/10')}`
  }))
}

export default function RoleSelector({
  value,
  onChange,
  staffOnly = false,
  includeFanRoles = false
}: RoleSelectorProps) {
  const roleOptions = getRoleOptions(staffOnly, includeFanRoles)

  return (
    <div className="space-y-2">
      {roleOptions.map((role) => (
        <label
          key={role.value}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            value === role.value
              ? role.color
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <input
            type="radio"
            name="role"
            value={role.value}
            checked={value === role.value}
            onChange={() => onChange(role.value)}
            className="mt-1"
          />
          <div>
            <div className="font-medium text-white">{role.label}</div>
            <div className="text-sm text-gray-400">{role.description}</div>
          </div>
        </label>
      ))}
    </div>
  )
}
