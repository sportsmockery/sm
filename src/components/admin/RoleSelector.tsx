'use client'

type Role = 'admin' | 'editor' | 'author'

interface RoleSelectorProps {
  value: Role
  onChange: (role: Role) => void
}

const roles: {
  value: Role
  label: string
  description: string
  color: string
}[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features and settings',
    color: 'border-red-500 bg-red-500/10 text-red-400'
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can edit and publish all posts',
    color: 'border-blue-500 bg-blue-500/10 text-blue-400'
  },
  {
    value: 'author',
    label: 'Author',
    description: 'Can create and edit own posts',
    color: 'border-green-500 bg-green-500/10 text-green-400'
  }
]

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      {roles.map((role) => (
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
