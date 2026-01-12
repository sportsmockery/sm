<?php
/**
 * Plugin Name: SM Migration Audit
 * Description: Generates a complete site audit for migration to Next.js/Supabase
 * Version: 1.0.0
 * Author: Sports Mockery
 */

if (!defined('ABSPATH')) exit;

class SM_Migration_Audit {

    public function __construct() {
        add_action('admin_menu', array($this, 'add_menu'));
        add_action('wp_ajax_sm_export_audit', array($this, 'export_audit_json'));
    }

    public function add_menu() {
        add_management_page(
            'Migration Audit',
            'Migration Audit',
            'manage_options',
            'sm-migration-audit',
            array($this, 'admin_page')
        );
    }

    public function admin_page() {
        $audit = $this->run_full_audit();
        ?>
        <div class="wrap">
            <h1>📦 SportsMockery Migration Audit</h1>
            <p>Complete site analysis for Next.js/Supabase migration</p>
            
            <div style="margin: 20px 0;">
                <a href="<?php echo admin_url('admin-ajax.php?action=sm_export_audit&nonce=' . wp_create_nonce('sm_audit')); ?>" class="button button-primary">Download Audit JSON</a>
            </div>

            <!-- Summary -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>📊 Summary</h2>
                <table class="widefat striped">
                    <tbody>
                        <tr><td><strong>Total Posts</strong></td><td><?php echo number_format($audit['content']['posts']['total']); ?></td></tr>
                        <tr><td><strong>Total Pages</strong></td><td><?php echo number_format($audit['content']['pages']['total']); ?></td></tr>
                        <tr><td><strong>Total Media Files</strong></td><td><?php echo number_format($audit['content']['media']['total']); ?></td></tr>
                        <tr><td><strong>Total Users</strong></td><td><?php echo number_format($audit['users']['total']); ?></td></tr>
                        <tr><td><strong>Categories</strong></td><td><?php echo number_format($audit['content']['categories']['total']); ?></td></tr>
                        <tr><td><strong>Tags</strong></td><td><?php echo number_format($audit['content']['tags']['total']); ?></td></tr>
                        <tr><td><strong>Active Plugins</strong></td><td><?php echo count($audit['plugins']['active']); ?></td></tr>
                        <tr><td><strong>Database Size</strong></td><td><?php echo $audit['database']['size']; ?></td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Active Plugins -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>🔌 Active Plugins (<?php echo count($audit['plugins']['active']); ?>)</h2>
                <p>These need to be replicated or replaced in the new system:</p>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Plugin</th>
                            <th>Version</th>
                            <th>Migration Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($audit['plugins']['active'] as $plugin): ?>
                        <tr>
                            <td><strong><?php echo esc_html($plugin['name']); ?></strong></td>
                            <td><?php echo esc_html($plugin['version']); ?></td>
                            <td><?php echo esc_html($plugin['migration_action']); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Theme -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>🎨 Theme</h2>
                <table class="widefat striped">
                    <tbody>
                        <tr><td><strong>Active Theme</strong></td><td><?php echo esc_html($audit['theme']['name']); ?></td></tr>
                        <tr><td><strong>Version</strong></td><td><?php echo esc_html($audit['theme']['version']); ?></td></tr>
                        <tr><td><strong>Parent Theme</strong></td><td><?php echo esc_html($audit['theme']['parent'] ?: 'None'); ?></td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Categories -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>📁 Categories (<?php echo $audit['content']['categories']['total']; ?>)</h2>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Posts</th>
                            <th>Parent</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($audit['content']['categories']['list'] as $cat): ?>
                        <tr>
                            <td><strong><?php echo esc_html($cat['name']); ?></strong></td>
                            <td><code><?php echo esc_html($cat['slug']); ?></code></td>
                            <td><?php echo $cat['count']; ?></td>
                            <td><?php echo esc_html($cat['parent'] ?: '-'); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Users -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>👥 Users (<?php echo $audit['users']['total']; ?>)</h2>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($audit['users']['by_role'] as $role => $count): ?>
                        <tr>
                            <td><strong><?php echo esc_html(ucfirst($role)); ?></strong></td>
                            <td><?php echo $count; ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <h3 style="margin-top: 20px;">Writers/Authors</h3>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Posts</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($audit['users']['writers'] as $user): ?>
                        <tr>
                            <td><strong><?php echo esc_html($user['display_name']); ?></strong></td>
                            <td><?php echo esc_html($user['email']); ?></td>
                            <td><?php echo esc_html($user['role']); ?></td>
                            <td><?php echo $user['post_count']; ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Custom Post Types -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>📝 Post Types</h2>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Post Type</th>
                            <th>Published</th>
                            <th>Draft</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($audit['content']['post_types'] as $type => $counts): ?>
                        <tr>
                            <td><strong><?php echo esc_html($type); ?></strong></td>
                            <td><?php echo $counts['publish'] ?? 0; ?></td>
                            <td><?php echo $counts['draft'] ?? 0; ?></td>
                            <td><?php echo array_sum($counts); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Database Tables -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>🗄️ Custom Database Tables</h2>
                <p>Non-standard WordPress tables that may need migration:</p>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Table</th>
                            <th>Rows</th>
                            <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($audit['database']['custom_tables'] as $table): ?>
                        <tr>
                            <td><code><?php echo esc_html($table['name']); ?></code></td>
                            <td><?php echo number_format($table['rows']); ?></td>
                            <td><?php echo $table['size']; ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Shortcodes -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>🏷️ Shortcodes in Use</h2>
                <p>These need custom components in React:</p>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th>Shortcode</th>
                            <th>Usage Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($audit['content']['shortcodes'])): ?>
                        <tr><td colspan="2">No shortcodes found in content</td></tr>
                        <?php else: ?>
                        <?php foreach ($audit['content']['shortcodes'] as $code => $count): ?>
                        <tr>
                            <td><code>[<?php echo esc_html($code); ?>]</code></td>
                            <td><?php echo $count; ?></td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- URL Structure -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px;">
                <h2>🔗 URL Structure</h2>
                <table class="widefat striped">
                    <tbody>
                        <tr><td><strong>Permalink Structure</strong></td><td><code><?php echo esc_html($audit['settings']['permalink_structure']); ?></code></td></tr>
                        <tr><td><strong>Site URL</strong></td><td><?php echo esc_html($audit['settings']['site_url']); ?></td></tr>
                        <tr><td><strong>Home URL</strong></td><td><?php echo esc_html($audit['settings']['home_url']); ?></td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Migration Checklist -->
            <div class="card" style="max-width: 1200px; padding: 20px; margin-bottom: 20px; background: #f0f7ff;">
                <h2>✅ Migration Checklist</h2>
                <h3>Content to Migrate:</h3>
                <ul style="list-style: disc; margin-left: 20px;">
                    <li><?php echo number_format($audit['content']['posts']['total']); ?> posts</li>
                    <li><?php echo number_format($audit['content']['pages']['total']); ?> pages</li>
                    <li><?php echo number_format($audit['content']['media']['total']); ?> media files (<?php echo $audit['content']['media']['size']; ?>)</li>
                    <li><?php echo $audit['content']['categories']['total']; ?> categories</li>
                    <li><?php echo $audit['content']['tags']['total']; ?> tags</li>
                    <li><?php echo $audit['users']['total']; ?> users</li>
                </ul>
                
                <h3>Features to Replicate:</h3>
                <ul style="list-style: disc; margin-left: 20px;">
                    <?php foreach ($audit['plugins']['active'] as $plugin): ?>
                    <?php if ($plugin['migration_action'] !== 'Not needed'): ?>
                    <li><strong><?php echo esc_html($plugin['name']); ?></strong> → <?php echo esc_html($plugin['migration_action']); ?></li>
                    <?php endif; ?>
                    <?php endforeach; ?>
                </ul>

                <h3>Estimated Migration Time:</h3>
                <p><strong><?php echo $audit['estimates']['time']; ?></strong></p>
            </div>

        </div>
        <?php
    }

    public function run_full_audit() {
        global $wpdb;

        $audit = array(
            'generated_at' => current_time('mysql'),
            'site_url' => site_url(),
            'content' => array(),
            'plugins' => array(),
            'theme' => array(),
            'users' => array(),
            'database' => array(),
            'settings' => array(),
            'estimates' => array()
        );

        // Content counts
        $audit['content']['posts'] = array(
            'total' => wp_count_posts()->publish,
            'drafts' => wp_count_posts()->draft
        );
        
        $audit['content']['pages'] = array(
            'total' => wp_count_posts('page')->publish
        );

        // Media
        $media_count = wp_count_posts('attachment')->inherit;
        $upload_dir = wp_upload_dir();
        $upload_size = $this->get_directory_size($upload_dir['basedir']);
        $audit['content']['media'] = array(
            'total' => $media_count,
            'size' => size_format($upload_size)
        );

        // Categories
        $categories = get_categories(array('hide_empty' => false));
        $cat_list = array();
        foreach ($categories as $cat) {
            $parent_name = '';
            if ($cat->parent) {
                $parent_cat = get_category($cat->parent);
                $parent_name = $parent_cat ? $parent_cat->name : '';
            }
            $cat_list[] = array(
                'id' => $cat->term_id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'count' => $cat->count,
                'parent' => $parent_name
            );
        }
        $audit['content']['categories'] = array(
            'total' => count($categories),
            'list' => $cat_list
        );

        // Tags
        $tags = get_tags(array('hide_empty' => false));
        $audit['content']['tags'] = array(
            'total' => count($tags)
        );

        // Post types
        $post_types = get_post_types(array('public' => true), 'names');
        $type_counts = array();
        foreach ($post_types as $type) {
            $counts = wp_count_posts($type);
            $type_counts[$type] = array(
                'publish' => $counts->publish ?? 0,
                'draft' => $counts->draft ?? 0
            );
        }
        $audit['content']['post_types'] = $type_counts;

        // Shortcodes in content
        $shortcodes = array();
        $posts_with_shortcodes = $wpdb->get_results("
            SELECT post_content FROM {$wpdb->posts} 
            WHERE post_status = 'publish' AND post_type = 'post'
            AND post_content LIKE '%[%'
            LIMIT 1000
        ");
        foreach ($posts_with_shortcodes as $post) {
            preg_match_all('/\[([a-zA-Z0-9_-]+)/', $post->post_content, $matches);
            if (!empty($matches[1])) {
                foreach ($matches[1] as $code) {
                    if (!isset($shortcodes[$code])) {
                        $shortcodes[$code] = 0;
                    }
                    $shortcodes[$code]++;
                }
            }
        }
        arsort($shortcodes);
        $audit['content']['shortcodes'] = array_slice($shortcodes, 0, 20);

        // Plugins
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        
        $migration_actions = array(
            'yoast' => 'Next.js metadata API + next-sitemap',
            'seo' => 'Next.js metadata API + next-sitemap',
            'rank math' => 'Next.js metadata API + next-sitemap',
            'rocket' => 'Vercel Edge caching (automatic)',
            'cache' => 'Vercel Edge caching (automatic)',
            'autoptimize' => 'Next.js built-in optimization',
            'wordfence' => 'Supabase RLS + Cloudflare',
            'security' => 'Supabase RLS + Cloudflare',
            'smush' => 'Next.js Image optimization',
            'imagify' => 'Next.js Image optimization',
            'contact form' => 'React form + Resend email',
            'mailchimp' => 'Resend + custom integration',
            'newsletter' => 'Resend + custom integration',
            'google analytics' => 'Vercel Analytics or GA script',
            'analytics' => 'Vercel Analytics',
            'social' => 'Custom share buttons',
            'jetpack' => 'Various Next.js features',
            'elementor' => 'React components',
            'tagdiv' => 'Custom React theme',
            'newspaper' => 'Custom React theme',
            'sports hub' => 'Already in Data Lab',
            'datalab' => 'Already built',
        );

        $active_list = array();
        foreach ($active_plugins as $plugin_file) {
            if (isset($all_plugins[$plugin_file])) {
                $plugin = $all_plugins[$plugin_file];
                $name = $plugin['Name'];
                
                $action = 'Evaluate need';
                foreach ($migration_actions as $key => $value) {
                    if (stripos($name, $key) !== false) {
                        $action = $value;
                        break;
                    }
                }
                
                $active_list[] = array(
                    'name' => $name,
                    'version' => $plugin['Version'],
                    'file' => $plugin_file,
                    'migration_action' => $action
                );
            }
        }
        $audit['plugins']['active'] = $active_list;
        $audit['plugins']['total'] = count($active_list);

        // Theme
        $theme = wp_get_theme();
        $audit['theme'] = array(
            'name' => $theme->get('Name'),
            'version' => $theme->get('Version'),
            'parent' => $theme->parent() ? $theme->parent()->get('Name') : null
        );

        // Users
        $users = count_users();
        $audit['users']['total'] = $users['total_users'];
        $audit['users']['by_role'] = $users['avail_roles'];

        $writers = get_users(array(
            'role__in' => array('administrator', 'editor', 'author', 'contributor')
        ));
        $writer_list = array();
        foreach ($writers as $user) {
            $writer_list[] = array(
                'id' => $user->ID,
                'display_name' => $user->display_name,
                'email' => $user->user_email,
                'role' => implode(', ', $user->roles),
                'post_count' => count_user_posts($user->ID)
            );
        }
        $audit['users']['writers'] = $writer_list;

        // Database
        $tables = $wpdb->get_results("SHOW TABLE STATUS");
        $total_size = 0;
        $custom_tables = array();
        $wp_tables = array(
            'commentmeta', 'comments', 'links', 'options', 'postmeta', 
            'posts', 'termmeta', 'terms', 'term_relationships', 
            'term_taxonomy', 'usermeta', 'users'
        );
        
        foreach ($tables as $table) {
            $size = $table->Data_length + $table->Index_length;
            $total_size += $size;
            
            $is_wp_core = false;
            foreach ($wp_tables as $wp_table) {
                if (preg_match('/' . $wp_table . '$/', $table->Name)) {
                    $is_wp_core = true;
                    break;
                }
            }
            
            if (!$is_wp_core) {
                $custom_tables[] = array(
                    'name' => $table->Name,
                    'rows' => $table->Rows,
                    'size' => size_format($size)
                );
            }
        }
        
        $audit['database']['size'] = size_format($total_size);
        $audit['database']['custom_tables'] = $custom_tables;

        // Settings
        $audit['settings'] = array(
            'permalink_structure' => get_option('permalink_structure'),
            'site_url' => site_url(),
            'home_url' => home_url(),
            'timezone' => get_option('timezone_string'),
            'date_format' => get_option('date_format')
        );

        // Estimates
        $post_count = $audit['content']['posts']['total'];
        if ($post_count < 1000) {
            $time = '2-3 weeks';
        } elseif ($post_count < 10000) {
            $time = '4-5 weeks';
        } else {
            $time = '6-8 weeks';
        }
        $audit['estimates']['time'] = $time;

        return $audit;
    }

    private function get_directory_size($path) {
        $size = 0;
        if (is_dir($path)) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS)
            );
            foreach ($iterator as $file) {
                $size += $file->getSize();
            }
        }
        return $size;
    }

    public function export_audit_json() {
        if (!wp_verify_nonce($_GET['nonce'] ?? '', 'sm_audit')) {
            wp_die('Invalid nonce');
        }
        
        if (!current_user_can('manage_options')) {
            wp_die('Permission denied');
        }

        $audit = $this->run_full_audit();
        
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="sportsmockery-audit-' . date('Y-m-d') . '.json"');
        echo json_encode($audit, JSON_PRETTY_PRINT);
        exit;
    }
}

new SM_Migration_Audit();
