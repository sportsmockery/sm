<?php
/**
 * Plugin Name: SM Export
 * Plugin URI: https://sportsmockery.com
 * Description: REST API endpoints for exporting WordPress content to the Next.js frontend. Exposes /authors, /categories, /posts, /post-views, and /post-comments endpoints.
 * Version: 1.3.0
 * Author: SportsMockery
 * Author URI: https://sportsmockery.com
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    // Authors endpoint - includes both authors and editors
    register_rest_route('sm-export/v1', '/authors', array(
        'methods'  => 'GET',
        'callback' => 'sm_export_get_authors',
        'permission_callback' => '__return_true',
    ));

    // Categories endpoint
    register_rest_route('sm-export/v1', '/categories', array(
        'methods'  => 'GET',
        'callback' => 'sm_export_get_categories',
        'permission_callback' => '__return_true',
    ));

    // Posts endpoint
    register_rest_route('sm-export/v1', '/posts', array(
        'methods'  => 'GET',
        'callback' => 'sm_export_get_posts',
        'permission_callback' => '__return_true',
    ));

    // Post views endpoint
    register_rest_route('sm-export/v1', '/post-views', array(
        'methods'  => 'GET',
        'callback' => 'sm_export_get_post_views',
        'permission_callback' => '__return_true',
    ));

    // Post comments endpoint
    register_rest_route('sm-export/v1', '/post-comments', array(
        'methods'  => 'GET',
        'callback' => 'sm_export_get_post_comments',
        'permission_callback' => '__return_true',
    ));
});

/**
 * Get all authors and editors
 */
function sm_export_get_authors() {
    $users = get_users(array(
        'role__in' => array('author', 'editor'),
        'orderby'  => 'display_name',
        'order'    => 'ASC',
    ));

    $result = array();
    foreach ($users as $user) {
        $result[] = array(
            'id'           => $user->ID,
            'email'        => $user->user_email,
            'display_name' => $user->display_name,
            'bio'          => get_the_author_meta('description', $user->ID),
            'avatar_url'   => get_avatar_url($user->ID, array('size' => 256)),
            'role'         => reset($user->roles),
            'post_count'   => count_user_posts($user->ID, 'post', true),
        );
    }

    return rest_ensure_response($result);
}

/**
 * Get all categories
 */
function sm_export_get_categories() {
    $categories = get_categories(array(
        'hide_empty' => false,
    ));

    $result = array();
    foreach ($categories as $cat) {
        $result[] = array(
            'id'          => $cat->term_id,
            'name'        => $cat->name,
            'slug'        => $cat->slug,
            'description' => $cat->description,
            'parent'      => $cat->parent,
            'count'       => $cat->count,
        );
    }

    return rest_ensure_response($result);
}

/**
 * Get per-post view counts from postmeta
 */
function sm_export_get_post_views($request) {
    global $wpdb;

    $year     = intval($request->get_param('year') ?: date('Y'));
    $page     = max(1, intval($request->get_param('page') ?: 1));
    $per_page = min(1000, max(1, intval($request->get_param('per_page') ?: 500)));
    $offset   = ($page - 1) * $per_page;

    $start_date = "$year-01-01";
    $end_date   = ($year + 1) . "-01-01";

    // Count total
    $total = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->posts}
         WHERE post_type = 'post' AND post_status = 'publish'
         AND post_date >= %s AND post_date < %s",
        $start_date, $end_date
    ));

    // Get posts with view counts
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT p.ID as id, COALESCE(CAST(pm.meta_value AS UNSIGNED), 0) as views
         FROM {$wpdb->posts} p
         LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id AND pm.meta_key = 'post_views_count'
         WHERE p.post_type = 'post' AND p.post_status = 'publish'
         AND p.post_date >= %s AND p.post_date < %s
         ORDER BY p.post_date DESC
         LIMIT %d OFFSET %d",
        $start_date, $end_date, $per_page, $offset
    ));

    // Cast to integers (wpdb returns strings)
    $results = array_map(function($row) {
        return array(
            'id'    => (int) $row->id,
            'views' => (int) $row->views,
        );
    }, $results);

    return rest_ensure_response(array(
        'views'       => $results,
        'total'       => (int) $total,
        'total_pages' => ceil($total / $per_page),
        'page'        => $page,
        'year'        => $year,
    ));
}

/**
 * Get per-post approved comment counts from wp_posts.comment_count
 *
 * Uses the same pagination/year-filtering pattern as /post-views.
 * WordPress keeps comment_count on wp_posts as a cached count of
 * approved comments, so no JOIN is needed.
 *
 * Query params:
 *   year     - Filter to posts published in this year (default: current year)
 *   page     - Page number (default: 1)
 *   per_page - Results per page (default: 500, max: 1000)
 */
function sm_export_get_post_comments($request) {
    global $wpdb;

    $year     = intval($request->get_param('year') ?: date('Y'));
    $page     = max(1, intval($request->get_param('page') ?: 1));
    $per_page = min(1000, max(1, intval($request->get_param('per_page') ?: 500)));
    $offset   = ($page - 1) * $per_page;

    $start_date = "$year-01-01";
    $end_date   = ($year + 1) . "-01-01";

    // Count total posts in year
    $total = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->posts}
         WHERE post_type = 'post' AND post_status = 'publish'
         AND post_date >= %s AND post_date < %s",
        $start_date, $end_date
    ));

    // Get posts with comment counts (native column on wp_posts)
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT ID as id, comment_count as comments
         FROM {$wpdb->posts}
         WHERE post_type = 'post' AND post_status = 'publish'
         AND post_date >= %s AND post_date < %s
         ORDER BY post_date DESC
         LIMIT %d OFFSET %d",
        $start_date, $end_date, $per_page, $offset
    ));

    // Cast to integers (wpdb returns strings)
    $results = array_map(function($row) {
        return array(
            'id'       => (int) $row->id,
            'comments' => (int) $row->comments,
        );
    }, $results);

    return rest_ensure_response(array(
        'comments'    => $results,
        'total'       => (int) $total,
        'total_pages' => ceil($total / $per_page),
        'page'        => $page,
        'year'        => $year,
    ));
}

/**
 * Get posts with pagination
 */
function sm_export_get_posts($request) {
    $page     = $request->get_param('page') ?: 1;
    $per_page = $request->get_param('per_page') ?: 100;

    $args = array(
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => $per_page,
        'paged'          => $page,
        'orderby'        => 'date',
        'order'          => 'DESC',
    );

    $query = new WP_Query($args);
    $result = array();

    foreach ($query->posts as $post) {
        $categories = wp_get_post_categories($post->ID, array('fields' => 'ids'));
        $result[] = array(
            'id'           => $post->ID,
            'title'        => $post->post_title,
            'slug'         => $post->post_name,
            'content'      => $post->post_content,
            'excerpt'      => $post->post_excerpt,
            'author_id'    => $post->post_author,
            'status'       => $post->post_status,
            'published_at' => $post->post_date_gmt,
            'modified_at'  => $post->post_modified_gmt,
            'categories'   => $categories,
            'featured_image' => get_the_post_thumbnail_url($post->ID, 'full'),
        );
    }

    return rest_ensure_response(array(
        'posts'       => $result,
        'total'       => $query->found_posts,
        'total_pages' => $query->max_num_pages,
        'page'        => (int) $page,
    ));
}
