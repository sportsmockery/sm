/**
 * WordPress legacy origin — used by sync/migration API routes that still call
 * the old WP REST API.  Centralised here so the literal string
 * "https://www.sportsmockery.com" does not appear scattered across src/.
 *
 * Once WordPress is fully decommissioned, delete this file and the routes
 * that depend on it.
 */
export const WP_ORIGIN = 'https://www.sportsmockery.com'
