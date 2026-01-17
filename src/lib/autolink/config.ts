/**
 * Auto-linking configuration
 *
 * Feature flags and settings for the auto-linking system.
 * These can be toggled to enable/disable auto-linking behavior.
 */

export interface AutoLinkConfig {
  // Enable auto-linking for team names
  enableTeamLinks: boolean

  // Enable auto-linking for player names
  enablePlayerLinks: boolean

  // Use case-sensitive matching for names
  caseSensitive: boolean
}

// Default configuration
export const defaultAutoLinkConfig: AutoLinkConfig = {
  enableTeamLinks: true,
  enablePlayerLinks: true,
  caseSensitive: true,
}

// Environment-based configuration
export function getAutoLinkConfig(): AutoLinkConfig {
  return {
    enableTeamLinks: process.env.AUTO_LINK_TEAMS !== 'false',
    enablePlayerLinks: process.env.AUTO_LINK_PLAYERS !== 'false',
    caseSensitive: process.env.AUTO_LINK_CASE_SENSITIVE !== 'false',
  }
}
