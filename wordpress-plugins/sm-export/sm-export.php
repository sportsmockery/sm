<?php
/**
 * Plugin Name: SM Export
 * Plugin URI: https://sportsmockery.com
 * Description: REST API endpoints for exporting WordPress content to the Next.js frontend. Exposes /authors, /categories, and /posts endpoints.
 * Version: 1.1.0
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
