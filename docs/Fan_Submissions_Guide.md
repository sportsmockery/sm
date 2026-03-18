# Fan Showcase — Developer & Admin Guide

Technical documentation for the Fan Showcase feature: fan-generated content submissions, moderation, and display.

---

## Overview

The Fan Showcase lets independent Chicago sports creators submit edits, art, takes, and fantasy wins for moderation and public display on `/fan-showcase`. All submissions are reviewed by admins before going live.

**Content types:**
| Type | Key | Description |
|------|-----|-------------|
| Fan Edit | `edit` | Video edits, clips, remixes (external link required) |
| Fan Art | `art` | Original artwork (image upload required) |
| Fan Take | `take` | Written analysis or opinion (text required) |
| Fantasy Win | `fantasy_win` | League championship proof (screenshot required) |

**Teams:** `bears`, `bulls`, `cubs`, `white_sox`, `blackhawks`

---

## Routes

### Public Pages

| Route | Purpose |
|-------|---------|
| `/fan-showcase` | Landing page — hero carousel, featured strips, filters, creator rail, CTA |
| `/fan-showcase/submit` | Multi-section submission form |
| `/fan-showcase/[slug]` | Individual submission detail page |
| `/fan-showcase/policy` | Submission guidelines, content policy, creator rights |

### Admin Pages

| Route | Purpose |
|-------|---------|
| `/admin/fan-showcase` | Submission list — filters, search, bulk actions |
| `/admin/fan-showcase/[id]` | Full review workspace — assets, AI analysis, moderation log, actions |

### API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/fan-showcase` | Public | Showcase data with filters/pagination |
| POST | `/api/fan-showcase/submit` | Public | Create submission |
| POST | `/api/fan-showcase/upload` | Public | Upload file to Supabase Storage |
| GET | `/api/fan-showcase/[slug]` | Public | Detail page data + similar creators |
| GET | `/api/admin/fan-showcase` | Admin | Admin submission list |
| GET | `/api/admin/fan-showcase/[id]` | Admin | Admin submission detail |
| PATCH | `/api/admin/fan-showcase/[id]` | Admin | Moderation action (approve, reject, etc.) |
| POST | `/api/admin/fan-showcase/bulk` | Admin | Bulk approve/reject/feature/unfeature |

---

## Database Schema

All tables live in the main SM Supabase instance. Migration: `supabase/migrations/20260318000001_fan_showcase.sql`.

### Tables

#### `fan_creators`
Stores creator profiles. Deduplicated by email — returning creators update their profile on each submission.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `display_name` | text | Required |
| `handle` | text | e.g. `@chicagofan42` |
| `email` | text | Required, indexed |
| `bio` | text | Max 500 chars |
| `profile_url` | text | Social/website link |
| `avatar_url` | text | |
| `primary_team` | text | `bears`, `bulls`, `cubs`, `white_sox`, `blackhawks` |
| `content_focus` | text | `edit`, `art`, `take`, `fantasy_win` |
| `social_tag_permission` | boolean | Default `false` — SM may tag on social |
| `newsletter_feature_permission` | boolean | Default `false` — SM may feature in newsletter |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `fan_submissions`
Core submissions table. Every submission starts as `pending_review`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `slug` | text UNIQUE | Auto-generated from title + timestamp |
| `creator_id` | uuid FK → `fan_creators` | |
| `type` | text | `edit`, `art`, `take`, `fantasy_win` |
| `team` | text | `bears`, `bulls`, `cubs`, `white_sox`, `blackhawks` |
| `title` | text | Max 150 chars |
| `description` | text | Max 1000 chars |
| `written_take` | text | Required when type = `take`, max 5000 chars |
| `source_platform` | text | `tiktok`, `instagram`, `youtube`, `x`, `other` |
| `source_url` | text | Required when type = `edit` |
| `medium` | text | Art medium (optional) |
| `league_name` | text | Required when type = `fantasy_win` |
| `fantasy_platform` | text | e.g. ESPN, Yahoo, Sleeper |
| `brag_line` | text | Max 300 chars |
| `status` | text | See Submission Statuses below |
| `rights_agreed` | boolean | |
| `moderation_acknowledged` | boolean | |
| `ownership_confirmed` | boolean | |
| `non_infringement_confirmed` | boolean | |
| `ai_relevance_score` | numeric | 0–100, deterministic |
| `ai_relevance_reason` | text | Explanation of score components |
| `ai_non_chicago_flag` | boolean | `true` if rival keywords detected without Chicago context |
| `ai_safety_flag` | boolean | Reserved for future content safety checks |
| `ai_caption_1` | text | Generated Chicago-style caption option 1 |
| `ai_caption_2` | text | Generated caption option 2 |
| `ai_caption_3` | text | Generated caption option 3 |
| `featured_at` | timestamptz | Set when status → `featured` |
| `viewed_count` | integer | Incremented on detail page load |
| `submitted_at` | timestamptz | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `fan_submission_assets`
File uploads linked to submissions. Stored in Supabase Storage `media` bucket under `fan-showcase/{submission_id}/`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `submission_id` | uuid FK → `fan_submissions` | |
| `asset_type` | text | `image`, `screenshot`, `thumbnail` |
| `asset_url` | text | Public URL from Supabase Storage |
| `thumbnail_url` | text | Optional |
| `width` | integer | Optional |
| `height` | integer | Optional |
| `mime_type` | text | e.g. `image/jpeg` |
| `created_at` | timestamptz | |

#### `fan_submission_tags`
Tags for submissions (admin-assignable or auto-generated).

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `submission_id` | uuid FK → `fan_submissions` |
| `tag` | text |

#### `fan_moderation_events`
Immutable audit log of every moderation action.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `submission_id` | uuid FK → `fan_submissions` | |
| `action` | text | `submitted`, `approve`, `reject`, `request_changes`, `feature`, `unfeature`, `archive`, `bulk_*` |
| `previous_status` | text | |
| `new_status` | text | |
| `note` | text | Admin notes |
| `acted_by` | text | Admin email or ID |
| `created_at` | timestamptz | |

#### `fan_featured_slots`
Controls which submissions appear in homepage featured sections.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `submission_id` | uuid FK → `fan_submissions` | |
| `slot_type` | text | `edit_of_week`, `art_gallery`, `take_of_day`, `fantasy_champion` |
| `starts_at` | timestamptz | |
| `ends_at` | timestamptz | Optional |
| `active` | boolean | Only active slots display |
| `created_at` | timestamptz | |

When a submission is featured into a slot, all previous active slots of the same type are deactivated.

#### `fan_creator_similarity_cache`
Pre-computed similarity scores for the "Similar Creators" section.

| Column | Type |
|--------|------|
| `id` | uuid PK |
| `creator_id` | uuid FK → `fan_creators` |
| `similar_creator_id` | uuid FK → `fan_creators` |
| `score` | numeric |
| `reason` | text |
| `created_at` | timestamptz |

### RLS Policies

- **Public read** on approved/featured submissions, their assets, tags, and active featured slots
- **Public insert** on creators, submissions, assets, and tags (for the submit form)
- **Admin** uses `supabaseAdmin` which bypasses RLS via service role key
- Moderation events are not publicly readable

---

## Submission Statuses

```
pending_review → approved → featured
                         ↘ archived
               → rejected
               → changes_requested → (resubmit) → pending_review
               → archived
```

| Status | Meaning |
|--------|---------|
| `pending_review` | Default for new submissions. Awaiting admin review. |
| `approved` | Passed review. Visible on `/fan-showcase`. |
| `rejected` | Did not pass review. Not visible. |
| `changes_requested` | Admin asked for modifications. |
| `featured` | Approved + highlighted in hero/sections. |
| `archived` | Removed from public display. |

---

## Submission Flow

### 1. Creator submits via `/fan-showcase/submit`

1. Client-side validation runs (`src/lib/fan-showcase/validation.ts`)
2. POST to `/api/fan-showcase/submit` with form JSON
3. Server-side validation repeats all checks
4. Creator is found by email or created
5. AI helper fields are computed:
   - `ai_non_chicago_flag` — rival keyword detection
   - `ai_relevance_score` + `ai_relevance_reason` — keyword/completeness scoring
   - `ai_caption_1/2/3` — template-based caption suggestions
6. Submission row inserted with `status = 'pending_review'`
7. Moderation event logged: `action = 'submitted'`
8. If files were selected, client uploads them via POST to `/api/fan-showcase/upload`
9. Success screen shown

### 2. Admin reviews via `/admin/fan-showcase`

- Filter by status, team, type; search by title
- AI flags (NON-CHI, SAFETY) and relevance scores visible in list
- Click into `/admin/fan-showcase/[id]` for full review
- All submitted fields, assets, creator info, AI analysis, and generated captions displayed
- Admin can: **Approve**, **Reject**, **Request Changes**, **Feature** (with slot type), **Unfeature**, **Archive**
- Every action is logged in `fan_moderation_events` with optional notes
- Bulk actions available from list view

### 3. Approved content appears on `/fan-showcase`

- Hero carousel shows featured submissions
- Four featured strips powered by `fan_featured_slots`
- All approved/featured submissions appear in the filterable grid
- Creator discovery rail shows creators with approved work

---

## File Structure

```
src/
├── types/
│   └── fan-showcase.ts              # All types, enums, display constants
├── lib/
│   └── fan-showcase/
│       ├── validation.ts            # Client/server validation, slug generation
│       └── ai-helpers.ts            # Non-Chicago flag, relevance score, captions, similarity
├── app/
│   ├── fan-showcase/
│   │   ├── page.tsx                 # Public landing page
│   │   ├── submit/page.tsx          # Submission form page
│   │   ├── [slug]/page.tsx          # Detail page (server metadata)
│   │   └── policy/page.tsx          # Guidelines & content policy
│   ├── admin/
│   │   └── fan-showcase/
│   │       ├── page.tsx             # Admin list page
│   │       └── [id]/page.tsx        # Admin detail page
│   └── api/
│       ├── fan-showcase/
│       │   ├── route.ts             # GET showcase data
│       │   ├── submit/route.ts      # POST create submission
│       │   ├── upload/route.ts      # POST file upload
│       │   └── [slug]/route.ts      # GET detail + similar creators
│       └── admin/
│           └── fan-showcase/
│               ├── route.ts         # GET admin list
│               ├── [id]/route.ts    # GET/PATCH admin detail
│               └── bulk/route.ts    # POST bulk actions
└── components/
    └── fan-showcase/
        ├── ShowcaseCard.tsx          # default/compact/hero variants
        ├── HeroCarousel.tsx          # Auto-rotating featured carousel
        ├── FeaturedSection.tsx       # Grid/masonry/list section layouts
        ├── ShowcaseFilters.tsx       # Team/type/sort URL-param filters
        ├── CreatorCard.tsx           # Creator discovery card
        ├── ShowcasePageClient.tsx    # Full showcase page (client)
        ├── DetailPageClient.tsx      # Detail page (client)
        ├── SubmitForm.tsx            # Multi-section submission form
        └── admin/
            ├── AdminShowcaseList.tsx  # Admin list + table + bulk actions
            └── AdminShowcaseDetail.tsx # Admin review workspace
```

---

## AI Helpers (Deterministic — No External API)

All AI logic is in `src/lib/fan-showcase/ai-helpers.ts`. These are rule-based placeholders designed to be swapped for real AI later.

### Non-Chicago Flag

Scans title, description, written take, and source URL for rival team keywords (Packers, Vikings, Celtics, Yankees, Cardinals, Red Wings, etc.) without corresponding Chicago keywords. A flag only — does not auto-reject.

```typescript
detectNonChicagoFlag(title, description, writtenTake, sourceUrl) → boolean
```

### Relevance Score (0–100)

Scores based on:
- Team name mentions in text (+15–25)
- Chicago mention (+15)
- Description length (+10–15)
- Type-specific completeness (+10)
- Sports keyword richness (up to +20)
- Base score for submitting (+15)

```typescript
calculateRelevanceScore({ title, description, written_take, source_url, type, team }) → { score, reason }
```

### Caption Generation

Template-based captions with team name substitution. Three captions per submission, Chicago-tone.

```typescript
generateCaptions(type, team) → [string, string, string]
```

### Similar Creators

Deterministic scoring:
- Same team: +50
- Same content focus: +30
- Overlapping submission types: +10 each
- Has approved/featured work: +15

```typescript
findSimilarCreators(targetCreator, targetSubs, allCreators, allSubs, limit) → Array<{ creator, score, reason }>
```

---

## Validation Rules

Defined in `src/lib/fan-showcase/validation.ts`.

### Field Limits

| Field | Max Length |
|-------|-----------|
| Title | 150 chars |
| Description | 1,000 chars |
| Written Take | 5,000 chars |
| Brag Line | 300 chars |
| Bio | 500 chars |
| League Name | 100 chars |

### File Limits

| Type | Allowed MIME Types | Max Size |
|------|-------------------|----------|
| Image | JPEG, PNG, GIF, WebP | 10 MB |
| Video | MP4, WebM | 50 MB |

### Required Checkboxes

All four must be checked:
1. Ownership confirmation
2. Rights license agreement
3. Moderation acknowledgment
4. Non-infringement confirmation

### Conditional Required Fields

| Content Type | Required Fields |
|-------------|----------------|
| `edit` | `source_url` |
| `art` | Image upload |
| `take` | `written_take` |
| `fantasy_win` | Screenshot upload, `league_name` |

---

## Featured Slots

Featured slots control the four homepage sections. Each slot type maps to a section:

| Slot Type | Homepage Section |
|-----------|-----------------|
| `edit_of_week` | Fan Edit of the Week |
| `art_gallery` | Fan Art Gallery |
| `take_of_day` | Fan Take of the Day |
| `fantasy_champion` | Fantasy League Champion |

When an admin features a submission with a slot type:
1. All existing active slots of that type are deactivated
2. A new active slot is created
3. The submission status is set to `featured`

If no slots exist for a section, the showcase page falls back to showing featured submissions of that content type.

---

## Admin Sidebar

Fan Showcase appears in the admin sidebar under **FEATURES** → **Fan Showcase** (`/admin/fan-showcase`). Added in `src/components/admin/Sidebar.tsx`.

---

## Permissions & Social Badges

Two optional boolean fields on creators:

| Field | Admin Badge | Meaning |
|-------|-------------|---------|
| `social_tag_permission` | **Social OK** (cyan) | SM may tag this creator on social media |
| `newsletter_feature_permission` | **Newsletter OK** (gold) | SM may feature in newsletter |

These are display-only in admin for now. No automated sending is built.

---

## Testing Checklist

| # | Test | How to Verify |
|---|------|---------------|
| 1 | Submit each content type | Fill form for edit, art, take, fantasy_win → success screen |
| 2 | Missing checkbox blocks submit | Uncheck any agreement → validation error |
| 3 | Invalid URL rejected | Enter `notaurl` in source URL → validation error |
| 4 | Oversized file rejected | Upload >10MB image → error message |
| 5 | Submissions default to `pending_review` | Check DB after submit |
| 6 | Admin approve | `/admin/fan-showcase/[id]` → Approve → status changes |
| 7 | Admin reject | Same → Reject → status changes, moderation event logged |
| 8 | Admin feature | Same → Feature with slot → appears on showcase |
| 9 | Featured content on `/fan-showcase` | Featured submission appears in hero and section |
| 10 | Filters work | Change team/type/sort → results update |
| 11 | Detail page by slug | Click card → `/fan-showcase/[slug]` loads |
| 12 | Similar creators appear | Detail page shows "Similar Chicago Creators" |
| 13 | Policy page loads | `/fan-showcase/policy` renders all sections |
| 14 | Light + dark mode | Toggle theme → all components render correctly |
| 15 | Mobile 375px | Resize → cards stack, form usable, no horizontal scroll |
| 16 | Desktop 1400px | Full width → 3-column grid, hero fills width |

---

## Phase 2 (Not Yet Built)

- **Real AI scoring** — Replace deterministic relevance/captions with Claude or similar
- **Analytics events** — `showcase_page_view`, `showcase_submission_completed`, etc.
- **Newsletter integration** — Auto-send featured content to subscribers
- **Social auto-posting** — Post featured submissions to SM social accounts
- **View count deduplication** — Rate-limit by IP or session
- **Embedding-based similarity** — Replace keyword matching with vector similarity
- **Creator profiles** — Public profile pages at `/fan-showcase/creator/[handle]`
- **Resubmission flow** — Let creators resubmit after `changes_requested`
