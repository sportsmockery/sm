=== SportsMockery SEO Triage ===
Contributors: sportsmockery
Tags: seo, noindex, author, 410, internal-linking
Requires at least: 5.0
Tested up to: 6.7
Stable tag: 1.0.0
License: GPLv2 or later

Phase 1 SEO triage fixes for SportsMockery.com based on the February 2026 SEMRush audit.

== Description ==

This plugin implements the Phase 1 "Triage" fixes identified in the SportsMockery SEO audit:

1. **Author Page Noindex** — Adds `noindex, follow` to all author archive pages to stop them from cannibalizing team hub page rankings
2. **Off-Brand Content 410** — Returns HTTP 410 (Gone) for `/wives-girlfriends/` and specific tabloid URLs that damage E-E-A-T signals
3. **Force HTTPS** — 301 redirects any HTTP requests to HTTPS (safety net for legacy URLs)
4. **Homepage Cannibalization Fix** — Injects brand-focused meta description on the homepage
5. **Team Hub Internal Links** — Adds footer nav with exact-match anchor text to team hubs, "More [Team] News" links on articles, and BreadcrumbList schema

== Safety Features ==

* **Dry-run mode** — Enabled by default on activation. Logs all actions without executing them.
* **Per-feature toggles** — Every fix can be turned on/off independently.
* **Activity log** — Every action is logged with timestamp.
* **No database modifications** — Nothing is deleted, moved, or altered in the database.
* **Fully reversible** — Deactivate the plugin to remove all effects instantly.
* **No conflicts** — Works alongside Yoast, RankMath, or All In One SEO.

== Installation ==

1. Upload the `sm-seo-triage` folder to `/wp-content/plugins/`
2. Activate through the Plugins menu
3. Go to Settings > SM SEO Triage
4. Review each fix — all are ON but in DRY RUN mode
5. Check the activity log after 24 hours to verify expected behavior
6. Turn off dry-run mode when ready to go live

== Recommended Deployment Order ==

1. Activate with dry-run ON (default)
2. Wait 24 hours, review logs
3. Turn off dry-run (all fixes go live simultaneously)
4. Monitor Google Search Console for 1 week
5. Verify author pages are deindexing (check "site:sportsmockery.com/author/")
6. Verify /wives-girlfriends/ returns 410 in browser

== Changelog ==

= 1.0.0 =
* Initial release
* Author page noindex
* Off-brand content 410
* HTTPS force redirect
* Homepage meta fix
* Team hub internal links + breadcrumb schema
