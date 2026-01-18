# SportsMockery Migration Project - UPDATED
## WordPress → Next.js/Supabase/Vercel
> **Generated:** January 9, 2026
> **Based on:** Site Audit
> **Target Launch:** 6-8 weeks

---

## 📊 SITE AUDIT SUMMARY

| Metric | Count | Notes |
|--------|-------|-------|
| **Posts** | 31,095 | Large site - needs batch migration |
| **Pages** | 89 | |
| **Media Files** | 49,257 | **235 GB** - biggest challenge |
| **Categories** | 32 | Including Chicago teams |
| **Tags** | 9,619 | |
| **Active Plugins** | 52 | Many can be dropped |
| **Writers** | 25 | Editors/Authors to migrate |
| **Subscribers** | 19,852 | Optional migration |
| **Database Size** | ~500 MB | Plus custom tables |

### Content by Category (Top 5)
| Category | Posts |
|----------|-------|
| Chicago Bears | 18,434 |
| Chicago Cubs | 4,751 |
| Chicago White Sox | 3,755 |
| Chicago Bulls | 1,873 |
| Chicago Blackhawks | 1,269 |

---

## ✅ COMPLETED

- [x] Dev environment setup
- [x] Created Next.js project (`sm`)
- [x] Installed dependencies
- [x] Configured Supabase client
- [x] Connected to GitHub
- [x] Deployed to Vercel (`sm-pmzp3b0sg-chris-burhans-projects.vercel.app`)
- [x] Ran migration audit plugin
- [x] Generated site audit JSON

---

## 🔴 PHASE 1: Database Schema (Week 1)
### Create Supabase tables for CMS

- [ ] **1.1 Run schema SQL in Supabase Dashboard**
```sql
-- Posts/Articles
CREATE TABLE sm_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(500) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  author_id INTEGER,
  category_id INTEGER,
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  views INTEGER DEFAULT 0,
  wp_id INTEGER, -- Original WP ID for reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE sm_categories (
  id SERIAL PRIMARY KEY,
  wp_id INTEGER,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES sm_categories(id),
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags
CREATE TABLE sm_tags (
  id SERIAL PRIMARY KEY,
  wp_id INTEGER,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL
);

-- Post-Tag relationship
CREATE TABLE sm_post_tags (
  post_id INTEGER REFERENCES sm_posts(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES sm_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Authors
CREATE TABLE sm_authors (
  id SERIAL PRIMARY KEY,
  wp_id INTEGER,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(200),
  bio TEXT,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'author',
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media (metadata only - files stay on CDN)
CREATE TABLE sm_media (
  id SERIAL PRIMARY KEY,
  wp_id INTEGER,
  filename VARCHAR(500),
  url TEXT NOT NULL,
  alt_text TEXT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Redirects (for old URLs)
CREATE TABLE sm_redirects (
  id SERIAL PRIMARY KEY,
  old_path VARCHAR(500) UNIQUE NOT NULL,
  new_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_posts_slug ON sm_posts(slug);
CREATE INDEX idx_posts_category ON sm_posts(category_id);
CREATE INDEX idx_posts_author ON sm_posts(author_id);
CREATE INDEX idx_posts_published ON sm_posts(published_at DESC);
CREATE INDEX idx_posts_status ON sm_posts(status);
CREATE INDEX idx_categories_slug ON sm_categories(slug);
CREATE INDEX idx_tags_slug ON sm_tags(slug);
```

- [ ] **1.2 Enable Row Level Security**
- [ ] **1.3 Verify tables created correctly**

---

## 🟡 PHASE 2: WordPress Export (Week 1)

- [ ] **2.1 Install export plugin on SportsMockery**

Create `sm-data-export.php`:
```php
<?php
/**
 * Plugin Name: SM Data Export
 * Description: Exports content for Next.js migration
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    // Posts endpoint with pagination
    register_rest_route('sm-export/v1', '/posts', [
        'methods' => 'GET',
        'callback' => 'sm_export_posts',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
    
    // Categories
    register_rest_route('sm-export/v1', '/categories', [
        'methods' => 'GET',
        'callback' => 'sm_export_categories',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
    
    // Tags
    register_rest_route('sm-export/v1', '/tags', [
        'methods' => 'GET',
        'callback' => 'sm_export_tags',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
    
    // Authors
    register_rest_route('sm-export/v1', '/authors', [
        'methods' => 'GET',
        'callback' => 'sm_export_authors',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
});

function sm_export_posts($request) {
    $page = $request->get_param('page') ?? 1;
    $per_page = $request->get_param('per_page') ?? 100;
    
    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $per_page,
        'paged' => $page,
        'orderby' => 'ID',
        'order' => 'ASC'
    ]);
    
    $export = [];
    foreach ($posts as $post) {
        $categories = wp_get_post_categories($post->ID, ['fields' => 'all']);
        $tags = wp_get_post_tags($post->ID, ['fields' => 'all']);
        
        // Get Yoast SEO data
        $seo_title = get_post_meta($post->ID, '_yoast_wpseo_title', true);
        $seo_desc = get_post_meta($post->ID, '_yoast_wpseo_metadesc', true);
        
        $export[] = [
            'id' => $post->ID,
            'slug' => $post->post_name,
            'title' => $post->post_title,
            'content' => $post->post_content,
            'excerpt' => $post->post_excerpt,
            'featured_image' => get_the_post_thumbnail_url($post->ID, 'full'),
            'author_id' => $post->post_author,
            'categories' => array_map(fn($c) => $c->term_id, $categories),
            'tags' => array_map(fn($t) => $t->term_id, $tags),
            'seo_title' => $seo_title,
            'seo_description' => $seo_desc,
            'published_at' => $post->post_date_gmt,
            'created_at' => $post->post_date_gmt,
            'updated_at' => $post->post_modified_gmt
        ];
    }
    
    $total = wp_count_posts()->publish;
    
    return [
        'page' => (int)$page,
        'per_page' => (int)$per_page,
        'total' => (int)$total,
        'total_pages' => ceil($total / $per_page),
        'posts' => $export
    ];
}

function sm_export_categories() {
    $categories = get_categories(['hide_empty' => false]);
    return array_map(function($c) {
        return [
            'id' => $c->term_id,
            'name' => html_entity_decode($c->name),
            'slug' => $c->slug,
            'description' => $c->description,
            'parent_id' => $c->parent ?: null,
            'count' => $c->count
        ];
    }, $categories);
}

function sm_export_tags() {
    $page = $_GET['page'] ?? 1;
    $per_page = 500;
    
    $tags = get_tags([
        'hide_empty' => false,
        'number' => $per_page,
        'offset' => ($page - 1) * $per_page
    ]);
    
    $total = wp_count_terms('post_tag');
    
    return [
        'page' => (int)$page,
        'total' => (int)$total,
        'tags' => array_map(fn($t) => [
            'id' => $t->term_id,
            'name' => $t->name,
            'slug' => $t->slug
        ], $tags)
    ];
}

function sm_export_authors() {
    $users = get_users([
        'role__in' => ['administrator', 'editor', 'author', 'contributor']
    ]);
    
    return array_map(function($u) {
        return [
            'id' => $u->ID,
            'email' => $u->user_email,
            'display_name' => $u->display_name,
            'bio' => get_user_meta($u->ID, 'description', true),
            'avatar' => get_avatar_url($u->ID),
            'role' => $u->roles[0] ?? 'author',
            'post_count' => count_user_posts($u->ID)
        ];
    }, $users);
}
```

- [ ] **2.2 Test export endpoints**
  - `/wp-json/sm-export/v1/categories`
  - `/wp-json/sm-export/v1/authors`
  - `/wp-json/sm-export/v1/tags?page=1`
  - `/wp-json/sm-export/v1/posts?page=1&per_page=10`

---

## 🟢 PHASE 3: Migration Scripts (Week 2)

- [ ] **3.1 Create migration script**

Tell Claude Code:
```
Create scripts/migrate-wordpress.ts that:

1. Fetches from SportsMockery export API
2. Imports in order: categories → authors → tags → posts
3. Handles 31,000+ posts in batches of 100
4. Maps WP IDs to new Supabase IDs
5. Preserves relationships (categories, tags, authors)
6. Logs progress
7. Can resume if interrupted

Add WP_EXPORT_URL and WP_EXPORT_AUTH to .env.local
```

- [ ] **3.2 Run category migration** (32 categories)
- [ ] **3.3 Run author migration** (25 writers)
- [ ] **3.4 Run tag migration** (9,619 tags - batched)
- [ ] **3.5 Run post migration** (31,095 posts - batched)
  - Estimated time: 2-3 hours at 100 posts/min

- [ ] **3.6 Verify migration counts**
  | Content | WordPress | Supabase |
  |---------|-----------|----------|
  | Posts | 31,095 | _______ |
  | Categories | 32 | _______ |
  | Tags | 9,619 | _______ |
  | Authors | 25 | _______ |

---

## 🔵 PHASE 4: Media Strategy (Week 2)

**235 GB of media is too large to move. Strategy:**

- [ ] **4.1 Keep images on current hosting** (Liquid Web)
- [ ] **4.2 Set up CDN/proxy** 
  - Option A: Keep Cloudflare proxying images from Liquid Web
  - Option B: Use Vercel Image Optimization with remote patterns
- [ ] **4.3 Configure Next.js for remote images**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sportsmockery.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
}
```

- [ ] **4.4 Test image loading from old URLs**

---

## 🟣 PHASE 5: Public Frontend (Week 3-4)

### 5.1 Core Layout
- [ ] Header with navigation
- [ ] Footer
- [ ] Mobile responsive menu
- [ ] Team color theming (Bears orange, Cubs blue, etc.)

### 5.2 Pages
- [ ] **Homepage** (`/`)
  - Hero with featured article
  - Team category blocks
  - Latest articles feed
  - Trending sidebar
  
- [ ] **Category Pages** (`/chicago-bears`, `/chicago-cubs`, etc.)
  - Team header with branding
  - Paginated article list
  - 32 categories to support

- [ ] **Article Pages** (`/[category]/[slug]`)
  - Article content
  - Author bio
  - Related articles
  - Social share buttons
  - Disqus comments (keep existing)

- [ ] **Author Pages** (`/author/[slug]`)
  - Author bio
  - Their articles

- [ ] **Search** (`/search`)
  - Full-text search
  - Filter by category

### 5.3 SEO
- [ ] Dynamic meta tags
- [ ] Open Graph tags
- [ ] Twitter cards
- [ ] JSON-LD structured data
- [ ] Sitemap generation
- [ ] robots.txt

### 5.4 URL Structure
Current: `/%category%/%postname%/`
- [ ] Match existing URL structure for SEO
- [ ] Create redirects for any changed URLs

---

## ⚫ PHASE 6: Admin CMS (Week 4-5)

### 6.1 Authentication
- [ ] Supabase Auth setup
- [ ] Login page
- [ ] Role-based access (admin, editor, author)
- [ ] Migrate writer accounts

### 6.2 Admin Pages
- [ ] **Dashboard** (`/admin`)
  - Stats overview
  - Recent posts
  - Quick actions

- [ ] **Posts List** (`/admin/posts`)
  - Filterable table
  - Status filter
  - Search
  - Bulk actions

- [ ] **Post Editor** (`/admin/posts/new`, `/admin/posts/[id]/edit`)
  - TipTap rich text editor
  - Title, slug, excerpt
  - Featured image picker
  - Category/tag selector
  - SEO fields
  - Publish/draft/schedule
  - Auto-save

- [ ] **Media Library** (`/admin/media`)
  - Upload new images
  - Browse existing
  - Search

- [ ] **Categories** (`/admin/categories`)
- [ ] **Users** (`/admin/users`)

---

## 🟤 PHASE 7: Plugin Replacements (Week 5)

### Must Replicate
| WordPress Plugin | Next.js Replacement |
|-----------------|---------------------|
| Yoast SEO | Next.js metadata API + next-sitemap |
| WP Rocket | Vercel Edge caching (automatic) |
| Autoptimize | Next.js built-in optimization |
| Smush Pro | Next.js Image optimization |
| Wordfence | Supabase RLS + Cloudflare |
| Disqus | Keep Disqus embed |
| tagDiv theme | Custom React components |
| Ad Inserter | Custom ad components |
| AMP | Not needed (Next.js is fast) |

### Already Done / Not Needed
| Plugin | Status |
|--------|--------|
| SM Chicago Sports Hub | Already in Data Lab |
| SM Data Lab API | Already built |
| SM Game Widgets | Move to Data Lab |
| UpdraftPlus | Not needed |
| All-in-One WP Migration | Not needed |
| Classic Widgets | Not needed |
| Activity Log | Not needed |

### Evaluate
| Plugin | Decision |
|--------|----------|
| MobiLoud | Keep mobile app? |
| Mailchimp Forms | Resend replacement? |
| Zapier | Keep or replace? |
| Sports Data IO | Move to Data Lab? |

---

## 🔴 PHASE 8: Testing (Week 6)

- [ ] **Content Verification**
  - [ ] Sample 100 random articles
  - [ ] All images load
  - [ ] All internal links work
  - [ ] Categories display correctly

- [ ] **Performance**
  - [ ] Lighthouse score > 90
  - [ ] Core Web Vitals pass
  - [ ] Page load < 2 seconds

- [ ] **SEO**
  - [ ] Meta tags present
  - [ ] OG tags working (Facebook debugger)
  - [ ] Sitemap valid
  - [ ] Google can crawl

- [ ] **CMS**
  - [ ] Writers can log in
  - [ ] Can create/edit posts
  - [ ] Can upload images
  - [ ] Publishing works

- [ ] **Cross-browser**
  - [ ] Chrome
  - [ ] Safari
  - [ ] Firefox
  - [ ] Mobile Safari
  - [ ] Mobile Chrome

---

## 🚀 PHASE 9: Launch (Week 6-7)

### Pre-Launch
- [ ] Final content sync
- [ ] Notify team
- [ ] Schedule low-traffic window

### DNS Cutover
- [ ] Point sportsmockery.com to Vercel
- [ ] Keep WordPress at old.sportsmockery.com (30 days)
- [ ] Verify SSL

### Post-Launch
- [ ] Submit sitemap to Google
- [ ] Monitor for errors
- [ ] Watch analytics
- [ ] Get writer feedback

---

## 📁 KEY FILES TO CREATE

| File | Purpose |
|------|---------|
| `sm-data-export.php` | WordPress export plugin |
| `scripts/migrate-wordpress.ts` | Migration script |
| `src/app/(public)/page.tsx` | Homepage |
| `src/app/(public)/[category]/page.tsx` | Category pages |
| `src/app/(public)/[category]/[slug]/page.tsx` | Article pages |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/admin/posts/page.tsx` | Posts list |
| `src/components/admin/PostEditor.tsx` | Rich text editor |
| `src/components/ArticleCard.tsx` | Article preview card |
| `src/components/Header.tsx` | Site header |

---

## 🔑 ENVIRONMENT VARIABLES

```env
# Supabase (already set)
NEXT_PUBLIC_SUPABASE_URL=https://siwoqfzzcxmngnseyzpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# WordPress Export (for migration)
WP_EXPORT_URL=https://sportsmockery.com/wp-json/sm-export/v1
WP_EXPORT_USER=your-admin-username
WP_EXPORT_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Resend (email)
RESEND_API_KEY=re_xxx

# Claude AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Site
NEXT_PUBLIC_SITE_URL=https://sportsmockery.com
```

---

## ⚠️ RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| 235 GB media migration | High | Keep on Liquid Web, proxy through CDN |
| SEO ranking drop | High | Match URL structure, proper redirects, submit sitemaps |
| 31K post migration fails | Medium | Batch processing, resume capability, verify counts |
| Writers confused by new CMS | Medium | Training session, documentation |
| Disqus comments lost | Medium | Keep Disqus, same thread IDs |

---

## 📅 TIMELINE

| Week | Focus |
|------|-------|
| Week 1 | Database schema, export plugin, start migration |
| Week 2 | Complete migration, media strategy |
| Week 3 | Public frontend - homepage, categories |
| Week 4 | Public frontend - articles, search, SEO |
| Week 5 | Admin CMS |
| Week 6 | Testing, bug fixes |
| Week 7 | Launch, monitoring |

---

## 🏁 NEXT IMMEDIATE STEPS

1. **Run schema SQL** in Supabase Dashboard (Phase 1.1)
2. **Create export plugin** and install on WordPress (Phase 2.1)
3. **Test export endpoints** work correctly (Phase 2.2)
4. **Start building migration script** (Phase 3.1)

---

**Ready to start? Begin with running the schema SQL in Supabase.**
