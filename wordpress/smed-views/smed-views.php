<?php
/**
 * Plugin Name: SMED Views
 * Description: Lightweight post view tracking for the SportsMockery Exec Dashboard.
 * Version:     1.0.0
 * Author:      SportsMockery
 * Text Domain: smed-views
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ACTIVATION — create / upgrade tables
   ═══════════════════════════════════════════════════════════════════════════════ */

register_activation_hook( __FILE__, 'smed_views_activate' );

function smed_views_activate() {
	global $wpdb;
	$charset = $wpdb->get_charset_collate();
	$table   = $wpdb->prefix . 'smed_views';

	$sql = "CREATE TABLE {$table} (
		id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		post_id     BIGINT UNSIGNED NOT NULL,
		view_date   DATE            NOT NULL,
		views       INT UNSIGNED    NOT NULL DEFAULT 1,
		PRIMARY KEY (id),
		UNIQUE KEY  post_date (post_id, view_date),
		KEY         date_idx  (view_date)
	) {$charset};";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql );

	update_option( 'smed_views_db_version', '1.0.0' );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   VIEW TRACKING — count a view on every singular post/page load
   ═══════════════════════════════════════════════════════════════════════════════ */

add_action( 'wp', 'smed_views_track' );

function smed_views_track() {
	if ( ! is_singular( 'post' ) ) {
		return;
	}
	// Skip bots, logged-in admins, and preview/customize requests.
	if ( is_preview() || is_customize_preview() ) {
		return;
	}
	if ( is_user_logged_in() && current_user_can( 'manage_options' ) ) {
		return;
	}

	$post_id = get_the_ID();
	if ( ! $post_id ) {
		return;
	}

	global $wpdb;
	$table = $wpdb->prefix . 'smed_views';
	$today = current_time( 'Y-m-d' );

	// Upsert: increment if row exists, insert otherwise.
	$wpdb->query( $wpdb->prepare(
		"INSERT INTO {$table} (post_id, view_date, views) VALUES (%d, %s, 1)
		 ON DUPLICATE KEY UPDATE views = views + 1",
		$post_id,
		$today
	) );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   REST API — /wp-json/smed/v1/views/*
   ═══════════════════════════════════════════════════════════════════════════════ */

add_action( 'rest_api_init', 'smed_views_register_routes' );

function smed_views_register_routes() {
	$ns = 'smed/v1';

	// GET /smed/v1/views/overview?start=YYYY-MM-DD&end=YYYY-MM-DD
	register_rest_route( $ns, '/views/overview', array(
		'methods'             => 'GET',
		'callback'            => 'smed_views_overview',
		'permission_callback' => '__return_true',
		'args'                => array(
			'start' => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
			'end'   => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
		),
	) );

	// GET /smed/v1/views/authors?months=12
	register_rest_route( $ns, '/views/authors', array(
		'methods'             => 'GET',
		'callback'            => 'smed_views_authors',
		'permission_callback' => '__return_true',
		'args'                => array(
			'months' => array( 'default' => 12, 'sanitize_callback' => 'absint' ),
		),
	) );

	// GET /smed/v1/views/posts?start=YYYY-MM-DD&end=YYYY-MM-DD&limit=50
	register_rest_route( $ns, '/views/posts', array(
		'methods'             => 'GET',
		'callback'            => 'smed_views_posts',
		'permission_callback' => '__return_true',
		'args'                => array(
			'start' => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
			'end'   => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
			'limit' => array( 'default' => 50, 'sanitize_callback' => 'absint' ),
		),
	) );
}

/* ── /views/overview ────────────────────────────────────────────────────────── */

function smed_views_overview( WP_REST_Request $request ) {
	global $wpdb;
	$table = $wpdb->prefix . 'smed_views';
	$start = $request->get_param( 'start' );
	$end   = $request->get_param( 'end' );

	// Period views
	$total_views = (int) $wpdb->get_var( $wpdb->prepare(
		"SELECT COALESCE(SUM(views), 0) FROM {$table} WHERE view_date >= %s AND view_date <= %s",
		$start, $end
	) );

	// All-time views
	$all_time_views = (int) $wpdb->get_var(
		"SELECT COALESCE(SUM(views), 0) FROM {$table}"
	);

	return rest_ensure_response( array(
		'total_views'    => (string) $total_views,
		'all_time_views' => (string) $all_time_views,
		'start'          => $start,
		'end'            => $end,
	) );
}

/* ── /views/authors ─────────────────────────────────────────────────────────── */

function smed_views_authors( WP_REST_Request $request ) {
	global $wpdb;
	$table  = $wpdb->prefix . 'smed_views';
	$months = min( $request->get_param( 'months' ), 24 );

	$since = date( 'Y-m-01', strtotime( "-{$months} months" ) );

	$rows = $wpdb->get_results( $wpdb->prepare(
		"SELECT
			p.post_author                           AS author_id,
			DATE_FORMAT(v.view_date, '%%Y-%%m')     AS month,
			COUNT(DISTINCT v.post_id)               AS total_posts,
			COALESCE(SUM(v.views), 0)               AS total_views
		FROM {$table} v
		INNER JOIN {$wpdb->posts} p ON p.ID = v.post_id
		WHERE v.view_date >= %s
		  AND p.post_status = 'publish'
		  AND p.post_type   = 'post'
		GROUP BY p.post_author, month
		ORDER BY month DESC, total_views DESC",
		$since
	) );

	// Enrich with display names
	$author_ids = array_unique( wp_list_pluck( $rows, 'author_id' ) );
	$names      = array();
	foreach ( $author_ids as $aid ) {
		$user = get_userdata( (int) $aid );
		$names[ $aid ] = $user ? $user->display_name : 'Unknown';
	}

	$result = array();
	foreach ( $rows as $row ) {
		$result[] = array(
			'author_id'    => (string) $row->author_id,
			'display_name' => $names[ $row->author_id ] ?? 'Unknown',
			'month'        => $row->month,
			'total_posts'  => (string) $row->total_posts,
			'total_views'  => (string) $row->total_views,
		);
	}

	return rest_ensure_response( $result );
}

/* ── /views/posts ───────────────────────────────────────────────────────────── */

function smed_views_posts( WP_REST_Request $request ) {
	global $wpdb;
	$table = $wpdb->prefix . 'smed_views';
	$start = $request->get_param( 'start' );
	$end   = $request->get_param( 'end' );
	$limit = min( $request->get_param( 'limit' ), 200 );

	$rows = $wpdb->get_results( $wpdb->prepare(
		"SELECT
			v.post_id,
			p.post_title                            AS title,
			p.post_name                             AS slug,
			p.post_date                             AS published_at,
			p.post_author,
			COALESCE(SUM(v.views), 0)               AS views
		FROM {$table} v
		INNER JOIN {$wpdb->posts} p ON p.ID = v.post_id
		WHERE v.view_date >= %s
		  AND v.view_date <= %s
		  AND p.post_status = 'publish'
		  AND p.post_type   = 'post'
		GROUP BY v.post_id
		ORDER BY views DESC
		LIMIT %d",
		$start, $end, $limit
	) );

	// Resolve author names
	$author_ids = array_unique( wp_list_pluck( $rows, 'post_author' ) );
	$names      = array();
	foreach ( $author_ids as $aid ) {
		$user = get_userdata( (int) $aid );
		$names[ $aid ] = $user ? $user->display_name : 'Unknown';
	}

	$result = array();
	foreach ( $rows as $row ) {
		$result[] = array(
			'post_id'      => (string) $row->post_id,
			'title'        => $row->title,
			'slug'         => $row->slug,
			'published_at' => $row->published_at,
			'author_name'  => $names[ $row->post_author ] ?? 'Unknown',
			'views'        => (string) $row->views,
		);
	}

	return rest_ensure_response( $result );
}
