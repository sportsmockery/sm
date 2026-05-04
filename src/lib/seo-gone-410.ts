// Tip #33 — paths classified gone_410 in audit/redirect-map-{date}.csv.
//   /tag/<slug>(/...)         WP tag archives — 6k+ entries, mostly noise
//   /app-pages(/...)          orphan WP container pages
//   /cart-2, /checkout, /apply, /advertise — WP-era commerce/marketing
//   /author/* with spam-keyword slug or known-hacked slug — toxic backlink
//     targets identified by SEMrush Backlink Audit attacking sportsmockery.com
//     (casino/slot/HHC/betting spam pointed at compromised WP author URLs).
//     Matched here so the toxicity does not carry over to test.sportsmockery.com.
export const LEGACY_GONE_410 =
  /^\/(?:tag\/[^/]+|app-pages(?:\/.*)?|cart-2|checkout|apply|advertise|author\/(?:[^/]*(?:casino|slot|gambling|gambl|poker|sportsbook|lottery|porn|escort|cbd|vape|crypto|betting|hhc|bet-)[^/]*|the-importance-reputable-casino-slot-play[^/]*|safe-place-to-do-betting[^/]*|exploring-the-deliciou-world-of[^/]*)(?:\/.*)?)\/?$/
