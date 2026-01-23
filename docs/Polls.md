# Polls System User Guide

The SportsMockery Polls system allows you to create interactive, Chicago-sports-themed polls for your articles. Polls can be embedded directly into articles using shortcodes or shared via embed URLs.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating a Poll](#creating-a-poll)
3. [Poll Types](#poll-types)
4. [Team Theming](#team-theming)
5. [Embedding Polls](#embedding-polls)
6. [Managing Polls](#managing-polls)
7. [API Reference](#api-reference)

---

## Getting Started

Access the Polls management area at `/polls`. From here you can:

- View all polls with filtering and search
- Create new polls
- Edit existing polls
- View poll results and analytics
- Copy embed codes

### User Roles

The following roles can access poll management:

- **Admin**: Full access to create, edit, delete, and manage all polls
- **Editor**: Can create and edit polls
- **Author**: Can create polls and edit their own polls

---

## Creating a Poll

1. Navigate to `/polls` and click **New Poll**
2. Select a poll type (see [Poll Types](#poll-types))
3. Enter a title (internal reference) and question
4. Optionally select a team theme
5. Add answer options (varies by poll type)
6. Configure settings (show results, anonymous voting, etc.)
7. Optionally set start/end dates
8. Click **Create Poll**

### Form Fields

| Field | Description | Required |
|-------|-------------|----------|
| Title | Internal reference name | Yes |
| Question | The poll question displayed to users | Yes |
| Poll Type | Single, Multiple, Scale, or Emoji | Yes |
| Team Theme | Chicago team color scheme | No |
| Options | Answer choices (min 2 for non-scale) | Yes* |
| Show Results | Allow viewing results after voting | No |
| Show Live Results | Allow viewing results before voting | No |
| Anonymous Voting | Don't track user IDs | No |
| Start Date | When the poll becomes active | No |
| End Date | When the poll automatically closes | No |

---

## Poll Types

### Single Choice

Standard poll where users select one option.

**Use cases:**
- "Who should be the Bears' starting QB?"
- "Will the Bulls make the playoffs?"

### Multiple Choice

Users can select multiple options.

**Use cases:**
- "Which Bears players should make the Pro Bowl?" (select up to 3)
- "What improvements does the Bulls roster need?"

### Scale (1-10)

Rating scale from 1-10 with customizable labels.

**Use cases:**
- "Rate the Bears' offseason moves (1-10)"
- "How confident are you in the Cubs' starting rotation?"

**Configuration:**
- Min/Max values (default 1-10)
- Min/Max labels (e.g., "Not at all" to "Extremely")

### Emoji Reaction

Quick emoji-based reactions.

**Available emojis:**
- 🔥 Fire
- 😤 Angry
- 😂 Laughing
- 😴 Sleepy
- 💪 Strong
- 🏆 Trophy
- 👎 Thumbs down
- 🤔 Thinking

**Use cases:**
- Quick reaction to trade news
- Instant sentiment on game results

---

## Team Theming

Polls can be themed with Chicago team colors:

| Team | Primary Color | Secondary Color |
|------|--------------|-----------------|
| Bears | #0B162A (Navy) | #C83200 (Orange) |
| Bulls | #CE1141 (Red) | #000000 (Black) |
| Cubs | #0E3386 (Blue) | #CC3433 (Red) |
| White Sox | #27251F (Black) | #C4CED4 (Silver) |
| Blackhawks | #CF0A2C (Red) | #000000 (Black) |
| Fire | #AF2626 (Red) | #7CCDEF (Blue) |
| Sky | #5091CD (Blue) | #FED141 (Yellow) |

When a team theme is selected:
- Poll border accent uses team's primary color
- Vote button uses team's primary color
- Progress bars use team colors
- Team badge is displayed in the header

### Option-Level Team Tags

Individual options can have team tags for versus polls:

```
Question: "Who wins the Crosstown Classic?"
Option 1: Cubs [team_tag: cubs]
Option 2: White Sox [team_tag: whitesox]
```

---

## Embedding Polls

### Shortcode (Articles)

Use the shortcode format to embed polls in articles:

```
[poll:abc123-def456]
```

Where `abc123-def456` is the poll ID.

### Iframe Embed

For external sites, use the embed URL:

```html
<iframe
  src="https://sportsmockery.com/polls/embed/abc123-def456"
  width="100%"
  height="400"
  frameborder="0"
></iframe>
```

### React Component

Import and use the PollEmbed component:

```tsx
import PollEmbed from '@/components/polls/PollEmbed'

// With poll ID (fetches poll data)
<PollEmbed id="abc123-def456" />

// With poll data (for SSR)
<PollEmbed poll={pollData} />

// Compact mode for sidebars
<PollEmbed id="abc123" compact />
```

---

## Managing Polls

### Poll Status

| Status | Description |
|--------|-------------|
| Draft | Not visible to users, work in progress |
| Active | Currently accepting votes |
| Scheduled | Waiting for start date |
| Closed | No longer accepting votes, results visible |
| Archived | Hidden from admin list (soft delete) |

### Status Transitions

- **Activate**: Set a draft or closed poll to active
- **Close**: Stop accepting votes
- **Archive**: Soft delete (can be recovered)
- **Delete**: Permanent deletion (admin only)

### Filtering and Search

The polls list supports:

- **Status filter**: All, Draft, Active, Scheduled, Closed
- **Type filter**: Single, Multiple, Scale, Emoji
- **Team filter**: Filter by team theme
- **Search**: Search by title or question
- **Show archived**: Include archived polls

---

## API Reference

### List Polls

```
GET /api/polls
```

Query parameters:
- `status`: Filter by status (active, draft, closed, etc.)
- `type`: Filter by poll type
- `team`: Filter by team theme
- `search`: Search title/question
- `archived`: Include archived polls (true/false)
- `limit`: Results per page (default 50)
- `offset`: Pagination offset

### Get Single Poll

```
GET /api/polls/[id]
```

Returns poll with options, shortcode, and embed URL.

### Create Poll

```
POST /api/polls
```

Request body: See CreatePollInput type

### Update Poll

```
PUT /api/polls/[id]
```

Request body: Partial poll fields to update

### Delete/Archive Poll

```
DELETE /api/polls/[id]
DELETE /api/polls/[id]?hard=true  // Permanent delete
```

### Submit Vote

```
POST /api/polls/[id]/vote
```

Request body:
```json
{
  "option_ids": ["option-id-1", "option-id-2"],
  "anonymous_id": "user-generated-uuid"
}
```

### Check Vote Status

```
GET /api/polls/[id]/vote?anonymous_id=xxx
```

### Get Results

```
GET /api/polls/[id]/results?anonymous_id=xxx
```

---

## Chicago-Themed Microcopy

Polls automatically display Chicago-themed messages:

**Vote CTAs:**
- "What's your take, Chicago?"
- "Vote now, this is your call."
- "This one's for the city, cast your vote."
- "Time to weigh in, Chi-Town."
- "Make your voice heard, Chicago."
- "The Windy City wants to know."

**After Voting:**
- "You've made your call!"
- "Vote counted, Chicago!"
- "That's the Chicago spirit!"
- "Your voice has been heard!"

**Results Headers:**
- "Here's what Chicago thinks"
- "The fans have spoken"
- "Chi-Town's verdict"
- "The city has decided"

---

## Best Practices

1. **Keep questions short and clear** - Users should understand the question at a glance
2. **Use team themes appropriately** - Match the theme to the content
3. **Limit options** - 2-5 options work best for engagement
4. **Time your polls** - Close polls before they become stale
5. **Use emoji polls for quick reactions** - Great for breaking news
6. **Review results** - Use poll data to inform future content

---

## Troubleshooting

### Poll not appearing

- Check poll status is "active"
- Verify start date has passed
- Confirm shortcode format is correct

### Votes not counting

- Check poll hasn't ended (ends_at)
- Verify user hasn't already voted (check localStorage)
- Review browser console for API errors

### Styling issues in embed

- Ensure parent container has sufficient width
- Check for CSS conflicts with host site

---

## Support

For technical issues, contact the development team or create an issue in the repository.
