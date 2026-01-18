# Auto-linking Feature Tasks (v7)

## Overview
Implement automatic internal linking in article content for teams and players.

---

## Tasks

### 1. Inspect existing data models and routes
- [x] Examine team schema/config to find slug and full_name fields
- [x] Examine player schema to find slug, full_name, and profile URL pattern
- [x] Identify existing URL builders for teams and players
- [x] Determine article content storage format (HTML, Markdown, etc.)

### 2. Create entity types and URL helpers
- [x] Create `lib/autolink/entities.ts` with TeamLink and PlayerLink interfaces
- [x] Implement `teamUrlFromSlug()` function using correct pattern
- [x] Implement `playerUrlFromId()` function using existing route pattern

### 3. Build auto-link context helper
- [x] Create `lib/autolink/context.ts`
- [x] Implement `buildAutoLinkContextForPost()` to gather teams and players for a post

### 4. Implement HTML transform function
- [x] Create `lib/autolink/applyAutoLinks.ts`
- [x] Implement text-node transform for first-occurrence linking
- [x] Ensure existing `<a>` tags are not modified
- [x] Handle both team and player linking

### 5. Add configuration/feature flags
- [x] Add config for AUTO_LINK_TEAMS and AUTO_LINK_PLAYERS toggles
- [x] Support per-article opt-out flag

### 6. Integrate into article render pipeline
- [x] Find the article page component (`src/app/[category]/[slug]/page.tsx`)
- [x] Apply auto-linking transform to article content HTML
- [x] Ensure transform runs after context loading, before `stripDuplicateFeaturedImage`

### 7. Test and verify
- [x] TypeScript type check passes
- [x] Team links use correct URL format: `https://test.sportsmockery.com/<team-slug>`
- [x] Player links use existing profile route pattern: `/players/<player-id>`
- [x] Only first occurrence is linked
- [x] Existing links are not modified

---

## Progress Log

### Completed: 2025-01-17

**Files created:**
- `src/lib/autolink/entities.ts` - Entity types and URL helpers
- `src/lib/autolink/config.ts` - Feature flags and configuration
- `src/lib/autolink/context.ts` - Context builder for posts
- `src/lib/autolink/applyAutoLinks.ts` - HTML transformation logic
- `src/lib/autolink/index.ts` - Module exports

**Files modified:**
- `src/app/[category]/[slug]/page.tsx` - Integrated auto-linking into article render

**Implementation details:**
- Team URLs: `https://test.sportsmockery.com/{team-slug}` (e.g., `chicago-bears`)
- Player URLs: `/players/{player-id}` using existing route pattern
- Transforms only first occurrence of each name
- Skips text already inside `<a>` tags
- Configurable via environment variables:
  - `AUTO_LINK_TEAMS=true|false`
  - `AUTO_LINK_PLAYERS=true|false`
  - `AUTO_LINK_CASE_SENSITIVE=true|false`

---

## Additional Tasks

### 8. Add Fan Council Member Role
- [x] Add Fan Council Member to existing roles model
- [x] Define eligibility logic (reputation threshold or admin flag)
- [x] Implement council-specific permissions and prompts
- [x] Add council vote/pick labels
- [x] Ensure Admin/Editor overrides take precedence

**Fan Council Implementation (Completed 2025-01-17):**

**Files created:**
- `src/lib/roles.ts` - Centralized roles module with types and helpers

**Files modified:**
- `src/components/admin/RoleSelector.tsx` - Updated to use centralized roles
- `src/components/admin/UsersTable.tsx` - Added all role colors and Fan Council badge
- `src/components/admin/InviteUser.tsx` - Updated to use STAFF_ROLES
- `src/components/admin/AuthorForm.tsx` - Updated to use StaffRole type
- `src/app/admin/users/page.tsx` - Updated to use Role type

**Role Hierarchy:**
1. `admin` - Full access to all features and settings
2. `editor` - Can edit and publish all posts
3. `author` - Can create and edit own posts
4. `fan_council` - Elevated fan with governance voting rights
5. `fan` - Basic logged-in fan with commenting access

**Key Features:**
- `isEligibleForFanCouncil()` - Checks reputation score OR explicit flag
- `overridesFanCouncil()` - Admin/Editor choices override Fan Council
- `canVoteOnGovernance()` - Permission check for council voting
- Configurable reputation threshold via `FanCouncilEligibility` config
- Staff roles separated from fan roles for admin workflows

---

### 9. Article Audio Player
- [x] Create `lib/audioPlayer.ts` with data layer
- [x] Create stub TTS API route at `/api/audio/[slug]`
- [x] Create `ArticleAudioPlayer` client component
- [x] Create `/api/audio/next` route for playlist functionality
- [x] Wire into article page under featured image
- [x] Build and deploy to Vercel

**Article Audio Player Implementation (Completed 2025-01-17):**

**Files created:**
- `src/lib/audioPlayer.ts` - Data layer with Supabase queries
- `src/app/api/audio/[slug]/route.ts` - Stub TTS endpoint
- `src/app/api/audio/next/route.ts` - Next article in sequence API
- `src/components/article/ArticleAudioPlayer.tsx` - Client-side audio player

**Files modified:**
- `src/app/[category]/[slug]/page.tsx` - Added audio player component

**Features:**
- Play/pause current article audio
- Mode toggle: "Team" (same category) vs "Most recent"
- Auto-advance to next article when audio ends
- Skip to next article button
- Error handling and loading states
- Dark mode support

**API Routes:**
- `GET /api/audio/[slug]` - Stub for TTS audio (returns 204 for now)
- `GET /api/audio/next?articleId=X&mode=team|recent&team=Y` - Get next article

**Note:** TTS is stubbed - implement actual TTS provider (ElevenLabs, Google, etc.) later
