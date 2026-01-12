# SportsMockery Migration Project - UPDATED
## WordPress → Next.js/Supabase/Vercel
> **Generated:** January 9, 2026
> **Last Updated:** January 9, 2026
> **Based on:** Site Audit
> **Target Launch:** 6-8 weeks

---

## ✅ COMPLETED TODAY (Jan 9)

- [x] Dev environment setup (Next.js, Supabase, Vercel)
- [x] Deployed to Vercel: `sm-pmzp3b0sg-chris-burhans-projects.vercel.app`
- [x] Created Supabase schema (sm_posts, sm_categories, sm_authors)
- [x] Created WordPress export plugin (sm-data-export.php)
- [x] Migrated 31,096 posts from WordPress
- [x] Migrated 32 categories
- [x] Migrated 23 authors (admin, editor, author roles only)
- [x] Built Homepage with article grid
- [x] Built Article page ([category]/[slug])
- [x] Built Category page ([category])
- [x] Built Header with team navigation (Bears, Bulls, Cubs, Sox, Hawks)
- [x] Built Search page with query support
- [x] Added mobile hamburger menu
- [x] Configured Next.js for remote images (sportsmockery.com)
- [x] Added foreign key relationships in Supabase
- [x] Running: Category ID fix script (mapping wp_id to id)

---

## 🔄 IN PROGRESS

- [ ] Category ID fix script (updating 31K posts) - ~15 min remaining
- [ ] Author page (src/app/author/[id]/page.tsx)

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

## 🔴 UP NEXT (Today/Tomorrow)

- [ ] Test category pages after fix script completes
- [ ] Build Author page (src/app/author/[id]/page.tsx)
- [ ] Add SEO meta tags to article pages (generateMetadata)
- [ ] Add sitemap generation (next-sitemap)
- [ ] Add JSON-LD structured data for articles
- [ ] Fix author_id mapping (same issue as category_id)

---

## 🟡 THIS WEEK

- [ ] Style refinements (match SM branding/colors)
- [ ] Add pagination to homepage
- [ ] Add "Related Articles" to article page
- [ ] Add social share buttons
- [ ] Connect Disqus comments
- [ ] Build Admin CMS dashboard
- [ ] Deploy to production domain

---

## 🟢 LATER (Before Launch)

- [ ] Admin authentication (Supabase Auth)
- [ ] Post editor (TipTap)
- [ ] Media library
- [ ] Writer accounts migration
- [ ] URL redirects from old structure
- [ ] Performance optimization
- [ ] Analytics setup

---

## 📁 FILES CREATED

| File | Purpose |
|------|---------|
| `sm-data-export.php` | WordPress export plugin |
| `migrate-wordpress.ts` | Migration script |
| `fix-categories.ts` | Category ID fix script |
| `src/app/page.tsx` | Homepage |
| `src/app/[category]/page.tsx` | Category pages |
| `src/app/[category]/[slug]/page.tsx` | Article pages |
| `src/app/search/page.tsx` | Search page |
| `src/components/Header.tsx` | Site header with nav |
| `src/components/ArticleCard.tsx` | Article preview card |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/supabase-server.ts` | Supabase admin client |

---

## 🔑 ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://siwoqfzzcxmngnseyzpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📝 NOTES

- Media files (235 GB) staying on Liquid Web, proxied through Next.js Image
- Using same Supabase project as Data Lab
- Categories use slug URLs: /chicago-bears, /chicago-cubs, etc.
- Posts link format: /[category-slug]/[post-slug]
