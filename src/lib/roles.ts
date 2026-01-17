/**
 * User roles and permissions for SportsMockery
 *
 * Role hierarchy (highest to lowest):
 * - admin: Full access to all features and settings
 * - editor: Can edit and publish all posts
 * - author: Can create and edit own posts
 * - fan_council: Elevated fan with governance voting rights
 * - fan: Basic logged-in user with reading and commenting access
 */

// All available roles in the system
export type Role = 'admin' | 'editor' | 'author' | 'fan_council' | 'fan'

// Staff roles that have content management privileges
export type StaffRole = 'admin' | 'editor' | 'author'

// Fan roles for community members
export type FanRole = 'fan_council' | 'fan'

// Role definitions with metadata
export interface RoleDefinition {
  value: Role
  label: string
  description: string
  color: string
  borderColor: string
  isStaffRole: boolean
  canManageContent: boolean
  canPublish: boolean
  canVoteOnGovernance: boolean
}

// Complete role definitions
export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  admin: {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features and settings',
    color: 'bg-red-500/20 text-red-400',
    borderColor: 'border-red-500',
    isStaffRole: true,
    canManageContent: true,
    canPublish: true,
    canVoteOnGovernance: true,
  },
  editor: {
    value: 'editor',
    label: 'Editor',
    description: 'Can edit and publish all posts',
    color: 'bg-blue-500/20 text-blue-400',
    borderColor: 'border-blue-500',
    isStaffRole: true,
    canManageContent: true,
    canPublish: true,
    canVoteOnGovernance: false,
  },
  author: {
    value: 'author',
    label: 'Author',
    description: 'Can create and edit own posts',
    color: 'bg-green-500/20 text-green-400',
    borderColor: 'border-green-500',
    isStaffRole: true,
    canManageContent: true,
    canPublish: false,
    canVoteOnGovernance: false,
  },
  fan_council: {
    value: 'fan_council',
    label: 'Fan Council Member',
    description: 'Elevated fan with governance voting rights',
    color: 'bg-purple-500/20 text-purple-400',
    borderColor: 'border-purple-500',
    isStaffRole: false,
    canManageContent: false,
    canPublish: false,
    canVoteOnGovernance: true,
  },
  fan: {
    value: 'fan',
    label: 'Fan',
    description: 'Logged-in fan with commenting access',
    color: 'bg-gray-500/20 text-gray-400',
    borderColor: 'border-gray-500',
    isStaffRole: false,
    canManageContent: false,
    canPublish: false,
    canVoteOnGovernance: false,
  },
}

// Get all roles as an array (ordered by privilege level)
export const ALL_ROLES: RoleDefinition[] = [
  ROLE_DEFINITIONS.admin,
  ROLE_DEFINITIONS.editor,
  ROLE_DEFINITIONS.author,
  ROLE_DEFINITIONS.fan_council,
  ROLE_DEFINITIONS.fan,
]

// Get only staff roles for admin invite/management
export const STAFF_ROLES: RoleDefinition[] = ALL_ROLES.filter(r => r.isStaffRole)

// Get role colors for display
export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  author: 'bg-green-500/20 text-green-400 border-green-500/30',
  fan_council: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  fan: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

// Permission check helpers
export function canManageContent(role: Role): boolean {
  return ROLE_DEFINITIONS[role].canManageContent
}

export function canPublishContent(role: Role): boolean {
  return ROLE_DEFINITIONS[role].canPublish
}

export function canVoteOnGovernance(role: Role): boolean {
  return ROLE_DEFINITIONS[role].canVoteOnGovernance
}

export function isStaffMember(role: Role): boolean {
  return ROLE_DEFINITIONS[role].isStaffRole
}

export function isFanCouncilMember(role: Role): boolean {
  return role === 'fan_council'
}

/**
 * Check if a role has higher privilege than another
 * Used for permission checks and override logic
 */
export function hasHigherPrivilege(roleA: Role, roleB: Role): boolean {
  const roleOrder: Role[] = ['admin', 'editor', 'author', 'fan_council', 'fan']
  return roleOrder.indexOf(roleA) < roleOrder.indexOf(roleB)
}

/**
 * Check if admin/editor decisions should override fan council
 * Per spec: Admin and Editor choices override Fan Council outcomes
 */
export function overridesFanCouncil(role: Role): boolean {
  return role === 'admin' || role === 'editor'
}

// Fan Council eligibility configuration
export interface FanCouncilEligibility {
  // Minimum reputation score required
  minReputationScore: number
  // Whether to use reputation-based eligibility
  useReputationThreshold: boolean
}

// Default Fan Council eligibility settings
export const DEFAULT_FAN_COUNCIL_ELIGIBILITY: FanCouncilEligibility = {
  minReputationScore: 100,
  useReputationThreshold: true,
}

/**
 * Check if a user is eligible for Fan Council based on their profile
 * Eligibility: meets reputation threshold OR has isFanCouncilMember flag
 */
export function isEligibleForFanCouncil(
  userProfile: {
    role: Role
    reputationScore?: number
    isFanCouncilMember?: boolean
  },
  config: FanCouncilEligibility = DEFAULT_FAN_COUNCIL_ELIGIBILITY
): boolean {
  // Must be a fan or fan_council member
  if (userProfile.role !== 'fan' && userProfile.role !== 'fan_council') {
    return false
  }

  // Check explicit flag
  if (userProfile.isFanCouncilMember === true) {
    return true
  }

  // Check reputation threshold
  if (config.useReputationThreshold) {
    const score = userProfile.reputationScore ?? 0
    return score >= config.minReputationScore
  }

  return false
}
