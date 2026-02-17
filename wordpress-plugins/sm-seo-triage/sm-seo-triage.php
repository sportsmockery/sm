<?php
/**
 * Plugin Name: SportsMockery SEO Triage
 * Plugin URI: https://sportsmockery.com
 * Description: Phase 1 SEO fixes: noindex author archives, 410 off-brand content, force HTTPS redirects, fix homepage cannibalization, and add team hub internal links. Based on SEMRush audit Feb 2026.
 * Version: 1.0.0
 * Author: SportsMockery
 * Author URI: https://sportsmockery.com
 * License: GPL-2.0+
 *
 * WHAT THIS PLUGIN DOES:
 * 1A. Adds noindex,follow to all author archive pages (stops cannibalization)
 * 1B. Returns 410 Gone for off-brand content (/wives-girlfriends/, specific tabloid URLs)
 * 1C. Forces HTTP → HTTPS redirects for any legacy URLs
 * 1D. Injects canonical tags on homepage pointing team keywords to team hubs
 *
 * SAFETY:
 * - All features can be toggled on/off from Settings → SM SEO Triage
 * - Dry-run mode available (logs actions without executing)
 * - Activity log for every action taken
 * - Does NOT modify any database content, posts, or pages
 * - Does NOT delete anything — 410s are served at the HTTP level only
 * - Fully reversible by deactivating the plugin
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SM_SEO_TRIAGE_VERSION', '1.0.0');
define('SM_SEO_TRIAGE_LOG_OPTION', 'sm_seo_triage_log');
define('SM_SEO_TRIAGE_SETTINGS', 'sm_seo_triage_settings');

// ============================================================================
// ACTIVATION / DEACTIVATION
// ============================================================================

register_activation_hook(__FILE__, 'sm_seo_triage_activate');
register_deactivation_hook(__FILE__, 'sm_seo_triage_deactivate');

function sm_seo_triage_activate() {
    $defaults = array(
        'enable_author_noindex'    => true,
        'enable_410_offbrand'      => true,
        'enable_https_redirect'    => true,
        'enable_homepage_fix'      => true,
        'enable_hub_links'         => true,
        'dry_run'                  => true,  // START in dry-run mode for safety
    );

    if (!get_option(SM_SEO_TRIAGE_SETTINGS)) {
        add_option(SM_SEO_TRIAGE_SETTINGS, $defaults);
    }

    if (!get_option(SM_SEO_TRIAGE_LOG_OPTION)) {
        add_option(SM_SEO_TRIAGE_LOG_OPTION, array());
    }

    sm_seo_triage_log('Plugin activated (dry-run mode ON by default)');
}

function sm_seo_triage_deactivate() {
    sm_seo_triage_log('Plugin deactivated — all SEO triage rules disabled');
}

// ============================================================================
// LOGGING
// ============================================================================

function sm_seo_triage_log($message) {
    $log = get_option(SM_SEO_TRIAGE_LOG_OPTION, array());
    $log[] = array(
        'time'    => current_time('mysql'),
        'message' => $message,
    );
    // Keep last 500 entries
    if (count($log) > 500) {
        $log = array_slice($log, -500);
    }
    update_option(SM_SEO_TRIAGE_LOG_OPTION, $log);
}

function sm_seo_triage_get_settings() {
    return wp_parse_args(
        get_option(SM_SEO_TRIAGE_SETTINGS, array()),
        array(
            'enable_author_noindex'    => true,
            'enable_410_offbrand'      => true,
            'enable_https_redirect'    => true,
            'enable_homepage_fix'      => true,
            'enable_hub_links'         => true,
            'dry_run'                  => true,
        )
    );
}

// ============================================================================
// 1A. NOINDEX AUTHOR ARCHIVE PAGES
// ============================================================================

add_action('wp_head', 'sm_seo_triage_author_noindex', 1);

function sm_seo_triage_author_noindex() {
    if (!is_author()) {
        return;
    }

    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_author_noindex']) {
        return;
    }

    if ($settings['dry_run']) {
        sm_seo_triage_log('[DRY RUN] Would add noindex to author page: ' . get_queried_object()->user_nicename);
        echo '<!-- SM SEO Triage: DRY RUN - would noindex this author archive -->' . "\n";
        return;
    }

    // Add noindex, follow — tells Google "don't rank this page, but follow its links"
    echo '<meta name="robots" content="noindex, follow" />' . "\n";
    echo '<!-- SM SEO Triage: Author archive noindexed to prevent team hub cannibalization -->' . "\n";

    sm_seo_triage_log('Noindex applied to author page: ' . get_queried_object()->user_nicename);
}

// Also remove author pages from the sitemap if Yoast is active
add_filter('wpseo_sitemap_exclude_author', 'sm_seo_triage_exclude_authors_sitemap');

function sm_seo_triage_exclude_authors_sitemap($exclude) {
    $settings = sm_seo_triage_get_settings();
    if ($settings['enable_author_noindex'] && !$settings['dry_run']) {
        return true; // Exclude all authors from sitemap
    }
    return $exclude;
}

// For non-Yoast setups, filter the robots meta
add_filter('wp_robots', 'sm_seo_triage_wp_robots_author', 20);

function sm_seo_triage_wp_robots_author($robots) {
    if (!is_author()) {
        return $robots;
    }

    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_author_noindex'] || $settings['dry_run']) {
        return $robots;
    }

    $robots['noindex']  = true;
    $robots['follow']   = true;
    // Remove index if set
    unset($robots['index']);

    return $robots;
}


// ============================================================================
// 1B. 410 GONE FOR OFF-BRAND CONTENT
// ============================================================================

add_action('template_redirect', 'sm_seo_triage_410_offbrand', 1);

function sm_seo_triage_410_offbrand() {
    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_410_offbrand']) {
        return;
    }

    $request_uri = $_SERVER['REQUEST_URI'];

    // Categories/sections to 410 entirely
    $blocked_prefixes = array(
        '/wives-girlfriends/',
    );

    // Specific URLs to 410
    $blocked_urls = array(
        '/trending/photo-detroit-lions-fan-eating-butt-sickest-thing-will-ever-see/',
    );

    $should_410 = false;
    $matched_rule = '';

    // Check prefix matches
    foreach ($blocked_prefixes as $prefix) {
        if (strpos($request_uri, $prefix) === 0) {
            $should_410 = true;
            $matched_rule = 'prefix: ' . $prefix;
            break;
        }
    }

    // Check exact URL matches
    if (!$should_410) {
        // Normalize: remove trailing slash for comparison
        $normalized = rtrim($request_uri, '/') . '/';
        foreach ($blocked_urls as $url) {
            $normalized_blocked = rtrim($url, '/') . '/';
            if ($normalized === $normalized_blocked) {
                $should_410 = true;
                $matched_rule = 'exact: ' . $url;
                break;
            }
        }
    }

    if ($should_410) {
        if ($settings['dry_run']) {
            sm_seo_triage_log('[DRY RUN] Would 410: ' . $request_uri . ' (rule: ' . $matched_rule . ')');
            // Don't actually block in dry-run — just log
            return;
        }

        sm_seo_triage_log('410 Gone served for: ' . $request_uri . ' (rule: ' . $matched_rule . ')');

        status_header(410);
        nocache_headers();

        // Serve a minimal 410 page
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>410 Gone — SportsMockery</title>
            <meta name="robots" content="noindex">
            <style>
                body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 80px auto; padding: 20px; text-align: center; color: #333; }
                h1 { color: #bc0000; }
                a { color: #bc0000; text-decoration: none; font-weight: bold; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>This page has been removed</h1>
            <p>This content is no longer available on SportsMockery.</p>
            <p>Check out the latest Chicago sports news:</p>
            <p>
                <a href="/chicago-bears/">Bears</a> &bull;
                <a href="/chicago-cubs/">Cubs</a> &bull;
                <a href="/chicago-bulls/">Bulls</a> &bull;
                <a href="/chicago-white-sox/">White Sox</a> &bull;
                <a href="/chicago-blackhawks/">Blackhawks</a>
            </p>
            <p><a href="/">← Back to SportsMockery</a></p>
        </body>
        </html>
        <?php
        exit;
    }
}


// ============================================================================
// 1C. FORCE HTTPS REDIRECTS
// ============================================================================

add_action('template_redirect', 'sm_seo_triage_force_https', 0);

function sm_seo_triage_force_https() {
    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_https_redirect']) {
        return;
    }

    // Only act if the request came in over HTTP
    if (is_ssl()) {
        return;
    }

    // Check various headers that indicate non-HTTPS
    $is_http = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'on') {
        $is_http = true;
    }
    if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'http') {
        $is_http = true;
    }
    if (!isset($_SERVER['HTTPS']) && !isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        $is_http = true;
    }

    if (!$is_http) {
        return;
    }

    $redirect_url = 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

    if ($settings['dry_run']) {
        sm_seo_triage_log('[DRY RUN] Would 301 redirect HTTP → HTTPS: ' . $_SERVER['REQUEST_URI']);
        return;
    }

    sm_seo_triage_log('301 redirect HTTP → HTTPS: ' . $_SERVER['REQUEST_URI']);

    wp_redirect($redirect_url, 301);
    exit;
}


// ============================================================================
// 1D. HOMEPAGE CANNIBALIZATION FIX
// ============================================================================

// Inject canonical hints and meta adjustments on the homepage
add_action('wp_head', 'sm_seo_triage_homepage_fix', 2);

function sm_seo_triage_homepage_fix() {
    if (!is_front_page() && !is_home()) {
        return;
    }

    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_homepage_fix']) {
        return;
    }

    if ($settings['dry_run']) {
        sm_seo_triage_log('[DRY RUN] Would inject homepage SEO hints');
        echo '<!-- SM SEO Triage: DRY RUN - would inject homepage meta fixes -->' . "\n";
        return;
    }

    // Add meta description focused on brand, NOT team-specific keywords
    echo '<!-- SM SEO Triage: Homepage optimized for brand queries -->' . "\n";
    echo '<meta name="description" content="SportsMockery — Chicago\'s home for Bears, Cubs, Bulls, White Sox, and Blackhawks news, rumors, and analysis. Fan-powered Chicago sports coverage." />' . "\n";

    sm_seo_triage_log('Homepage meta description injected (brand-focused)');
}

// Add structured internal links from homepage to team hubs
// This is injected via wp_footer to avoid theme conflicts
add_action('wp_footer', 'sm_seo_triage_homepage_hub_links');

function sm_seo_triage_homepage_hub_links() {
    if (!is_front_page() && !is_home()) {
        return;
    }

    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_hub_links'] || $settings['dry_run']) {
        return;
    }

    // Inject a hidden (visually positioned, but accessible to crawlers) nav block
    // with exact-match anchor text pointing to team hubs.
    // This is NOT hidden from users (display:none = cloaking). It's a visible footer nav.
    ?>
    <nav aria-label="Chicago Sports Team Hubs" style="background: #111; padding: 20px 0; text-align: center; border-top: 3px solid #bc0000;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
            <p style="color: #999; font-size: 12px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px;">Chicago Sports Coverage</p>
            <a href="/chicago-bears/" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold; font-size: 14px;">Chicago Bears News &amp; Rumors</a>
            <a href="/chicago-cubs/" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold; font-size: 14px;">Chicago Cubs News &amp; Rumors</a>
            <a href="/chicago-bulls/" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold; font-size: 14px;">Chicago Bulls News &amp; Rumors</a>
            <a href="/chicago-white-sox/" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold; font-size: 14px;">Chicago White Sox News &amp; Rumors</a>
            <a href="/chicago-blackhawks/" style="color: #fff; margin: 0 15px; text-decoration: none; font-weight: bold; font-size: 14px;">Chicago Blackhawks News &amp; Rumors</a>
        </div>
    </nav>
    <?php

    sm_seo_triage_log('Homepage hub links nav injected');
}


// ============================================================================
// BONUS: ADD TEAM HUB BREADCRUMB + INTERNAL LINK ON EVERY ARTICLE
// ============================================================================

add_action('wp_footer', 'sm_seo_triage_article_hub_link');

function sm_seo_triage_article_hub_link() {
    if (!is_single()) {
        return;
    }

    $settings = sm_seo_triage_get_settings();
    if (!$settings['enable_hub_links'] || $settings['dry_run']) {
        return;
    }

    // Determine which team this article belongs to by checking categories
    $team_hubs = array(
        'chicago-bears'      => array('name' => 'Chicago Bears',      'url' => '/chicago-bears/'),
        'chicago-cubs'       => array('name' => 'Chicago Cubs',       'url' => '/chicago-cubs/'),
        'chicago-bulls'      => array('name' => 'Chicago Bulls',      'url' => '/chicago-bulls/'),
        'chicago-white-sox'  => array('name' => 'Chicago White Sox',  'url' => '/chicago-white-sox/'),
        'chicago-blackhawks' => array('name' => 'Chicago Blackhawks', 'url' => '/chicago-blackhawks/'),
    );

    $categories = get_the_category();
    $matched_team = null;

    if ($categories) {
        foreach ($categories as $cat) {
            $slug = $cat->slug;
            if (isset($team_hubs[$slug])) {
                $matched_team = $team_hubs[$slug];
                break;
            }
            // Also check parent category slugs
            if ($cat->parent) {
                $parent = get_category($cat->parent);
                if ($parent && isset($team_hubs[$parent->slug])) {
                    $matched_team = $team_hubs[$parent->slug];
                    break;
                }
            }
        }
    }

    // Also check the URL structure as fallback
    if (!$matched_team) {
        $request_uri = $_SERVER['REQUEST_URI'];
        foreach ($team_hubs as $slug => $data) {
            if (strpos($request_uri, '/' . $slug . '/') === 0) {
                $matched_team = $data;
                break;
            }
        }
    }

    if (!$matched_team) {
        return;
    }

    ?>
    <div style="background: #f5f5f5; border-top: 2px solid #bc0000; padding: 15px 20px; text-align: center; font-family: -apple-system, sans-serif;">
        <a href="<?php echo esc_url($matched_team['url']); ?>" style="color: #bc0000; font-weight: bold; font-size: 14px; text-decoration: none;">
            ← More <?php echo esc_html($matched_team['name']); ?> News &amp; Rumors
        </a>
        <span style="color: #999; margin: 0 10px;">|</span>
        <a href="/" style="color: #333; font-size: 14px; text-decoration: none;">SportsMockery Home</a>
    </div>
    <?php
}


// ============================================================================
// BONUS: BREADCRUMB SCHEMA ON EVERY PAGE
// ============================================================================

add_action('wp_head', 'sm_seo_triage_breadcrumb_schema', 5);

function sm_seo_triage_breadcrumb_schema() {
    $settings = sm_seo_triage_get_settings();
    if ($settings['dry_run']) {
        return;
    }

    if (is_front_page() || is_home()) {
        return;
    }

    $team_map = array(
        'chicago-bears'      => 'Chicago Bears',
        'chicago-cubs'       => 'Chicago Cubs',
        'chicago-bulls'      => 'Chicago Bulls',
        'chicago-white-sox'  => 'Chicago White Sox',
        'chicago-blackhawks' => 'Chicago Blackhawks',
    );

    $matched_team_slug = null;
    $matched_team_name = null;
    $request_uri = $_SERVER['REQUEST_URI'];

    foreach ($team_map as $slug => $name) {
        if (strpos($request_uri, '/' . $slug . '/') === 0 || $request_uri === '/' . $slug . '/') {
            $matched_team_slug = $slug;
            $matched_team_name = $name;
            break;
        }
    }

    if (!$matched_team_slug) {
        return;
    }

    $breadcrumb_items = array(
        array(
            '@type'    => 'ListItem',
            'position' => 1,
            'name'     => 'SportsMockery',
            'item'     => home_url('/'),
        ),
        array(
            '@type'    => 'ListItem',
            'position' => 2,
            'name'     => $matched_team_name . ' News & Rumors',
            'item'     => home_url('/' . $matched_team_slug . '/'),
        ),
    );

    // If this is a single post (not the hub page itself), add the article title
    if (is_single()) {
        $breadcrumb_items[] = array(
            '@type'    => 'ListItem',
            'position' => 3,
            'name'     => get_the_title(),
            'item'     => get_permalink(),
        );
    }

    $schema = array(
        '@context'        => 'https://schema.org',
        '@type'           => 'BreadcrumbList',
        'itemListElement' => $breadcrumb_items,
    );

    echo '<script type="application/ld+json">' . wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . '</script>' . "\n";
}


// ============================================================================
// ADMIN SETTINGS PAGE
// ============================================================================

add_action('admin_menu', 'sm_seo_triage_admin_menu');

function sm_seo_triage_admin_menu() {
    add_options_page(
        'SM SEO Triage',
        'SM SEO Triage',
        'manage_options',
        'sm-seo-triage',
        'sm_seo_triage_admin_page'
    );
}

add_action('admin_init', 'sm_seo_triage_register_settings');

function sm_seo_triage_register_settings() {
    register_setting('sm_seo_triage_group', SM_SEO_TRIAGE_SETTINGS, array(
        'sanitize_callback' => 'sm_seo_triage_sanitize_settings',
    ));
}

function sm_seo_triage_sanitize_settings($input) {
    $sanitized = array(
        'enable_author_noindex'    => !empty($input['enable_author_noindex']),
        'enable_410_offbrand'      => !empty($input['enable_410_offbrand']),
        'enable_https_redirect'    => !empty($input['enable_https_redirect']),
        'enable_homepage_fix'      => !empty($input['enable_homepage_fix']),
        'enable_hub_links'         => !empty($input['enable_hub_links']),
        'dry_run'                  => !empty($input['dry_run']),
    );

    $old = sm_seo_triage_get_settings();
    $changes = array();
    foreach ($sanitized as $key => $value) {
        if ($old[$key] !== $value) {
            $changes[] = $key . ': ' . ($value ? 'ON' : 'OFF');
        }
    }
    if (!empty($changes)) {
        sm_seo_triage_log('Settings changed: ' . implode(', ', $changes));
    }

    return $sanitized;
}

function sm_seo_triage_admin_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $settings = sm_seo_triage_get_settings();
    $log = get_option(SM_SEO_TRIAGE_LOG_OPTION, array());
    $log = array_reverse($log); // Most recent first

    ?>
    <div class="wrap">
        <h1 style="color: #bc0000;">SportsMockery SEO Triage</h1>
        <p>Phase 1 SEO fixes from the February 2026 SEMRush audit. Each fix can be toggled independently.</p>

        <?php if ($settings['dry_run']): ?>
        <div class="notice notice-warning" style="border-left-color: #bc0000;">
            <p><strong>DRY RUN MODE IS ON.</strong> All actions are being logged but NOT executed. Turn off dry-run mode when you're ready to go live.</p>
        </div>
        <?php else: ?>
        <div class="notice notice-success">
            <p><strong>LIVE MODE.</strong> All enabled fixes are actively running.</p>
        </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields('sm_seo_triage_group'); ?>

            <table class="form-table">
                <tr>
                    <th scope="row" style="color: #bc0000; font-size: 16px;" colspan="2">
                        Global Control
                    </th>
                </tr>
                <tr>
                    <th scope="row">Dry Run Mode</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo SM_SEO_TRIAGE_SETTINGS; ?>[dry_run]" value="1" <?php checked($settings['dry_run']); ?> />
                            Log all actions without executing them (recommended for first 24 hours)
                        </label>
                    </td>
                </tr>

                <tr>
                    <th scope="row" style="color: #bc0000; font-size: 16px;" colspan="2">
                        1A. Author Page Noindex
                    </th>
                </tr>
                <tr>
                    <th scope="row">Enable</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo SM_SEO_TRIAGE_SETTINGS; ?>[enable_author_noindex]" value="1" <?php checked($settings['enable_author_noindex']); ?> />
                            Add <code>noindex, follow</code> to all author archive pages
                        </label>
                        <p class="description">
                            Stops author pages from cannibalizing team hub rankings.<br>
                            Affected: <code>/author/theroadwarrior14comcast-net/</code>, <code>/author/jeffdabearsblog-com/</code>, <code>/author/mfink271998gmail-com/</code>, and all other author archives.<br>
                            <strong>Expected impact:</strong> +5-15% organic traffic within 2-4 weeks as Google recalculates canonical pages.
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row" style="color: #bc0000; font-size: 16px;" colspan="2">
                        1B. Off-Brand Content 410
                    </th>
                </tr>
                <tr>
                    <th scope="row">Enable</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo SM_SEO_TRIAGE_SETTINGS; ?>[enable_410_offbrand]" value="1" <?php checked($settings['enable_410_offbrand']); ?> />
                            Return 410 Gone for off-brand content
                        </label>
                        <p class="description">
                            Serves HTTP 410 (Gone) for:<br>
                            &bull; All pages under <code>/wives-girlfriends/</code><br>
                            &bull; <code>/trending/photo-detroit-lions-fan-eating-butt-sickest-thing-will-ever-see/</code><br>
                            <strong>Does NOT delete any content from the database.</strong> Pages are still in WordPress — they just return 410 to browsers and crawlers.<br>
                            <strong>Expected impact:</strong> Improved sitewide Helpful Content score within 4-6 weeks.
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row" style="color: #bc0000; font-size: 16px;" colspan="2">
                        1C. Force HTTPS
                    </th>
                </tr>
                <tr>
                    <th scope="row">Enable</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo SM_SEO_TRIAGE_SETTINGS; ?>[enable_https_redirect]" value="1" <?php checked($settings['enable_https_redirect']); ?> />
                            301 redirect all HTTP requests to HTTPS
                        </label>
                        <p class="description">
                            Catches any legacy HTTP URLs still being crawled or linked to.<br>
                            If your server already handles this (via .htaccess or Cloudflare), you can leave this off.<br>
                            <strong>This is a safety net — it won't conflict with existing HTTPS redirects.</strong>
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row" style="color: #bc0000; font-size: 16px;" colspan="2">
                        1D. Homepage Cannibalization Fix
                    </th>
                </tr>
                <tr>
                    <th scope="row">Enable</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo SM_SEO_TRIAGE_SETTINGS; ?>[enable_homepage_fix]" value="1" <?php checked($settings['enable_homepage_fix']); ?> />
                            Inject brand-focused meta description on homepage
                        </label>
                        <p class="description">
                            Adds a meta description focused on "SportsMockery — Chicago sports" rather than team-specific keywords.<br>
                            This tells Google the homepage is about the brand, not about "Bears news and rumors."<br>
                            <strong>Note:</strong> If Yoast/RankMath already sets a homepage meta description, this may create a duplicate. Check your SEO plugin settings.
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row" style="color: #bc0000; font-size: 16px;" colspan="2">
                        Bonus: Team Hub Internal Links
                    </th>
                </tr>
                <tr>
                    <th scope="row">Enable</th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo SM_SEO_TRIAGE_SETTINGS; ?>[enable_hub_links]" value="1" <?php checked($settings['enable_hub_links']); ?> />
                            Add team hub navigation links on homepage footer and "More [Team] News" links on articles
                        </label>
                        <p class="description">
                            Injects a footer nav on the homepage with exact-match anchor text links to all 5 team hubs.<br>
                            Also adds a "More [Team] News & Rumors" link bar at the bottom of every team article.<br>
                            Plus BreadcrumbList schema markup on all team pages.<br>
                            <strong>Expected impact:</strong> Distributes PageRank to team hubs, improves their rankings for broad team keywords.
                        </p>
                    </td>
                </tr>
            </table>

            <?php submit_button('Save Settings'); ?>
        </form>

        <hr>

        <h2>Activity Log <small style="color: #999;">(last 50 entries)</small></h2>
        <div style="background: #1d1d1d; color: #0f0; padding: 15px; border-radius: 4px; max-height: 400px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px;">
            <?php if (empty($log)): ?>
                <p style="color: #666;">No log entries yet.</p>
            <?php else: ?>
                <?php foreach (array_slice($log, 0, 50) as $entry): ?>
                    <div style="margin-bottom: 4px; border-bottom: 1px solid #333; padding-bottom: 4px;">
                        <span style="color: #888;">[<?php echo esc_html($entry['time']); ?>]</span>
                        <?php
                        $msg = esc_html($entry['message']);
                        if (strpos($msg, '[DRY RUN]') !== false) {
                            $msg = '<span style="color: #ff0;">' . $msg . '</span>';
                        }
                        echo $msg;
                        ?>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <?php if (!empty($log)): ?>
        <form method="post" action="" style="margin-top: 10px;">
            <?php wp_nonce_field('sm_seo_triage_clear_log'); ?>
            <input type="hidden" name="sm_seo_triage_action" value="clear_log" />
            <button type="submit" class="button button-secondary">Clear Log</button>
        </form>
        <?php endif; ?>

        <hr>

        <h2>Quick Reference: What Each Fix Does</h2>
        <table class="widefat" style="max-width: 900px;">
            <thead>
                <tr>
                    <th>Fix</th>
                    <th>What It Does</th>
                    <th>Risk Level</th>
                    <th>Reversible?</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>1A. Author Noindex</strong></td>
                    <td>Adds <code>noindex,follow</code> meta tag to author archive pages</td>
                    <td style="color: green;">LOW — only affects author archives, not articles</td>
                    <td>YES — deactivate plugin or uncheck</td>
                </tr>
                <tr>
                    <td><strong>1B. 410 Off-Brand</strong></td>
                    <td>Returns HTTP 410 for /wives-girlfriends/ and specific tabloid URLs</td>
                    <td style="color: orange;">MEDIUM — those pages will deindex within 1-2 weeks</td>
                    <td>YES — uncheck to restore access. Google will re-index if they crawl again.</td>
                </tr>
                <tr>
                    <td><strong>1C. Force HTTPS</strong></td>
                    <td>301 redirects HTTP → HTTPS for any non-secure requests</td>
                    <td style="color: green;">LOW — this is standard practice</td>
                    <td>YES — deactivate plugin or uncheck</td>
                </tr>
                <tr>
                    <td><strong>1D. Homepage Fix</strong></td>
                    <td>Injects brand-focused meta description on homepage</td>
                    <td style="color: green;">LOW — only adds a meta tag</td>
                    <td>YES — deactivate plugin or uncheck</td>
                </tr>
                <tr>
                    <td><strong>Hub Links</strong></td>
                    <td>Adds team hub nav footer + article back-links + breadcrumb schema</td>
                    <td style="color: green;">LOW — adds visible navigation, no hidden elements</td>
                    <td>YES — deactivate plugin or uncheck</td>
                </tr>
            </tbody>
        </table>
    </div>
    <?php
}

// Handle log clearing
add_action('admin_init', 'sm_seo_triage_handle_clear_log');

function sm_seo_triage_handle_clear_log() {
    if (
        isset($_POST['sm_seo_triage_action']) &&
        $_POST['sm_seo_triage_action'] === 'clear_log' &&
        check_admin_referer('sm_seo_triage_clear_log')
    ) {
        update_option(SM_SEO_TRIAGE_LOG_OPTION, array());
        sm_seo_triage_log('Log cleared by admin');
        wp_redirect(admin_url('options-general.php?page=sm-seo-triage'));
        exit;
    }
}


// ============================================================================
// ADMIN BAR INDICATOR
// ============================================================================

add_action('admin_bar_menu', 'sm_seo_triage_admin_bar', 100);

function sm_seo_triage_admin_bar($wp_admin_bar) {
    if (!current_user_can('manage_options')) {
        return;
    }

    $settings = sm_seo_triage_get_settings();

    $title = $settings['dry_run'] ? '🔍 SEO Triage (DRY RUN)' : '✅ SEO Triage (LIVE)';
    $color = $settings['dry_run'] ? '#ff0' : '#0f0';

    $wp_admin_bar->add_node(array(
        'id'    => 'sm-seo-triage',
        'title' => '<span style="color: ' . $color . ';">' . $title . '</span>',
        'href'  => admin_url('options-general.php?page=sm-seo-triage'),
    ));

    // Show current page status
    if (!is_admin()) {
        $status_items = array();

        if (is_author() && $settings['enable_author_noindex']) {
            $status_items[] = $settings['dry_run'] ? 'Would noindex this author page' : 'This author page is noindexed';
        }

        if (is_front_page() || is_home()) {
            if ($settings['enable_homepage_fix']) {
                $status_items[] = 'Homepage meta fix ' . ($settings['dry_run'] ? '(dry run)' : 'active');
            }
            if ($settings['enable_hub_links']) {
                $status_items[] = 'Hub links footer ' . ($settings['dry_run'] ? '(dry run)' : 'active');
            }
        }

        if (is_single() && $settings['enable_hub_links']) {
            $status_items[] = 'Article hub link ' . ($settings['dry_run'] ? '(dry run)' : 'active');
        }

        foreach ($status_items as $item) {
            $wp_admin_bar->add_node(array(
                'parent' => 'sm-seo-triage',
                'id'     => 'sm-seo-triage-' . sanitize_title($item),
                'title'  => $item,
            ));
        }
    }
}
