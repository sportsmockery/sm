# SportsMockery Admin Guide

Technical documentation for administrators and developers.

## Architecture Overview

SportsMockery is built with:
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Supabase** (PostgreSQL) for database
- **Tailwind CSS** for styling

### Key Design Principles
1. **Bears-First**: All features prioritize Bears content
2. **Personalization**: User preferences affect content ordering
3. **Performance**: Server-side rendering with client-side enhancements
4. **Accessibility**: WCAG 2.1 AA compliance target

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── feed/          # Homepage feed API
│   │   ├── team/[slug]/   # Team-specific API
│   │   └── user/          # User preferences API
│   ├── bears/             # Bears hub page
│   ├── [category]/        # Dynamic category pages
│   │   └── [slug]/        # Article pages
│   └── page.tsx           # Homepage
├── components/
│   ├── bears/             # Bears-specific components
│   ├── home/              # Homepage components
│   ├── layout/            # Header, Footer, etc.
│   ├── article/           # Article components
│   └── category/          # Category page components
└── lib/
    ├── types.ts           # TypeScript type definitions
    ├── db.ts              # Supabase helpers
    ├── bears.ts           # Bears data functions
    ├── users.ts           # User preferences
    └── posts.ts           # Post queries
```

## Database Schema

### Tables

#### `sm_posts`
| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| slug | text | URL slug |
| title | text | Article title |
| excerpt | text | Short summary |
| content | text | HTML content |
| featured_image | text | Image URL |
| published_at | timestamp | Publication date |
| status | text | draft/published |
| views | int | View count |
| importance_score | int | 0-100 ranking |
| author_id | int | FK to sm_authors |
| category_id | int | FK to sm_categories |

#### `sm_categories`
| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| name | text | Display name |
| slug | text | URL slug |
| wp_id | int | Legacy WordPress ID |

Category slugs map to teams:
- `bears`, `chicago-bears` → Bears
- `cubs`, `chicago-cubs` → Cubs
- `white-sox`, `chicago-white-sox` → White Sox
- `bulls`, `chicago-bulls` → Bulls
- `blackhawks`, `chicago-blackhawks` → Blackhawks

#### `sm_authors`
| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| display_name | text | Author name |
| bio | text | Biography |
| avatar_url | text | Profile image |
| email | text | Contact email |
| slug | text | URL slug |

#### `sm_user_preferences`
| Column | Type | Description |
|--------|------|-------------|
| user_id | text | User identifier |
| favorite_teams | text[] | Array of TeamSlug |
| notification_prefs | jsonb | Notification settings |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

## Type System

### TeamSlug
```typescript
type TeamSlug = 'bears' | 'cubs' | 'white-sox' | 'bulls' | 'blackhawks'
```

### PostSummary
Lightweight post for lists:
```typescript
interface PostSummary {
  id: number
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string
  views: number
  author: { id: number; displayName: string; avatarUrl: string | null }
  team: TeamSlug
  categorySlug: string
  categoryName: string
}
```

### TEAM_INFO
Team branding information:
```typescript
const TEAM_INFO: Record<TeamSlug, TeamInfo> = {
  bears: {
    primaryColor: '#0B162A',
    secondaryColor: '#C83803',
    // ...
  },
  // ...
}
```

## API Endpoints

### GET /api/feed
Homepage feed with personalization.

Query params:
- `team`: Filter by team slug
- `limit`: Number of posts (default 20, max 50)
- `offset`: Pagination offset
- `sort`: latest | popular | trending

### POST /api/feed
Personalized feed with viewed tracking.

Body:
```json
{
  "viewed_ids": [1, 2, 3],
  "team_preferences": ["bears", "bulls"]
}
```

### GET /api/team/[slug]
Team-specific data.

Returns:
- Team info
- Recent posts
- Featured posts
- Pagination

### GET /api/user/preferences
Get user preferences. Requires `x-user-id` header.

### POST /api/user/preferences
Create/update preferences.

Body:
```json
{
  "favoriteTeams": ["bears", "bulls"],
  "notificationPrefs": {
    "breaking_news": true,
    "game_alerts": true
  }
}
```

### PATCH /api/user/preferences
Partial update.

Body:
```json
{
  "addTeam": "cubs",
  "removeTeam": "bulls",
  "notificationPrefs": { "trade_rumors": true }
}
```

## Components

### BearsStickyBar
48px sticky bar below header. Shows:
- Bears record
- Next game
- Quick links
- CTA button

### HeroCarousel
5-story carousel with:
- Auto-play (5s interval)
- Thumbnail navigation
- Bears priority highlighting
- Progress indicators

### TeamSpotlight
Expandable team cards:
- Bears expanded by default
- Quick stats
- Latest posts preview

### BearsSeasonCard
Season overview widget:
- Win-loss record
- Division standing
- Game schedule

### PersonalizedFeed
Content reordering:
- Uses `reorderByFavorites()` from `/lib/users.ts`
- Team filter buttons
- Favorite indicators

## CSS Architecture

### Design Tokens (globals.css)
```css
:root {
  /* Team Colors */
  --bears-primary: #0B162A;
  --bears-secondary: #C83803;
  --cubs-primary: #0E3386;
  /* ... */

  /* Container */
  --container-max-width: 1110px;
}
```

### Team-Themed Classes
```css
.team-bears { --team-primary: var(--bears-primary); }
.team-cubs { --team-primary: var(--cubs-primary); }
/* ... */
```

### Utility Classes
- `.sm-main` - 1110px container
- `.hover-lift` - Lift on hover
- `.hover-scale` - Scale on hover
- `.hover-glow` - Glow effect

## SEO Configuration

### Metadata (layout.tsx)
- Bears-first title template
- Team-focused keywords
- OpenGraph images
- Twitter cards

### Dynamic Metadata
Each page can override with:
```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  description: '...',
}
```

## Performance Considerations

### Image Optimization
- Use Next.js `Image` component
- Set `priority` for above-fold images
- Lazy load below-fold content

### Data Fetching
- Server components for initial data
- API routes for client-side updates
- Supabase connection pooling

### Caching
- Static pages where possible
- ISR for dynamic content
- Client-side SWR for updates

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Build Command
```bash
npm run build
```

### Health Checks
- `/api/feed` should return 200
- Database connection verified on startup

## Monitoring

### Error Tracking
Console errors are logged with context:
```typescript
console.error('Feed API error:', error)
```

### Analytics
Integrate with:
- Google Analytics
- Vercel Analytics
- Custom event tracking

## Content Management

### Publishing Workflow
1. Create post in Supabase (`status: 'draft'`)
2. Set `importance_score` (0-100)
3. Add category and author
4. Set `status: 'published'`

### Importance Score Guidelines
- 90-100: Breaking news, major trades
- 70-89: Game recaps, significant updates
- 50-69: Regular articles
- 30-49: Opinion pieces
- 0-29: Historical/archive content

## Troubleshooting

### Common Issues

**Empty feed**: Check that posts have `status: 'published'` and valid `category_id`.

**Missing team colors**: Verify `categorySlugToTeam()` maps correctly.

**Preferences not saving**: Ensure `sm_user_preferences` table exists.

### Debug Mode
Enable verbose logging:
```typescript
const DEBUG = process.env.NODE_ENV === 'development'
if (DEBUG) console.log('Debug info:', data)
```

## Security

### API Protection
- Validate all input
- Use parameterized queries (Supabase handles this)
- Rate limiting on preferences API

### User Data
- No sensitive data in URLs
- Preferences stored securely
- GDPR compliance for EU users
