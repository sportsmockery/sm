# PostIQ Auto-Insert Charts & Polls

> **Last Updated:** January 25, 2026
> **Purpose:** Documentation for PostIQ's automatic chart and poll insertion features

---

## Overview

PostIQ can automatically analyze article content and insert relevant charts and polls when publishing. These features are available in both the Admin and Studio post editors.

---

## Feature Location

Both features appear in the **right sidebar** under "PostIQ Auto-Insert":

- `/admin/posts/new` (AdvancedPostEditor)
- `/studio/posts/new` (StudioPostEditor)
- `/admin/posts/[id]/edit` (editing existing posts)
- `/studio/posts/[id]/edit` (editing existing posts)

---

## Auto-Insert Chart

### How It Works

1. **Check the "Insert Chart" checkbox** in the right sidebar
2. **Set status to "Published"** (charts only insert on publish)
3. **Save/Publish the post**

PostIQ will:
1. Strip HTML and analyze the plain text content
2. Send content to Claude Sonnet 4 for analysis
3. Identify chartable data (statistics, comparisons, trends)
4. Determine the best chart type
5. Extract data points with labels and values
6. Create chart via `/api/charts` endpoint
7. Insert `[chart:id]` shortcode after the relevant paragraph

### Chart Types

PostIQ automatically chooses the best chart type based on content:

| Type | Best For | Example |
|------|----------|---------|
| `bar` | Comparing values, rankings | Player stats comparison |
| `line` | Trends over time | Season performance |
| `pie` | Percentages, distributions | Play type breakdown |

### Minimum Requirements

- **Content length:** At least 200 characters
- **Data needed:** Statistical data, comparisons, or trends
- **Status:** Must be set to "Published"

### API Details

**Endpoint:** `POST /api/admin/ai`

**Request:**
```json
{
  "action": "generate_chart",
  "title": "Article Title",
  "content": "<p>Article HTML content...</p>",
  "category": "Chicago Bears News & Rumors"
}
```

**Response (Success):**
```json
{
  "success": true,
  "chartId": "uuid-of-created-chart",
  "shortcode": "[chart:uuid]",
  "chartType": "bar",
  "chartTitle": "Bears Rushing Leaders 2025",
  "updatedContent": "<p>Content...</p>\n<div class=\"chart-embed my-6\">[chart:uuid]</div>\n<p>More content...</p>"
}
```

**Response (No Data Found):**
```json
{
  "success": false,
  "reason": "No suitable chart data found in article",
  "updatedContent": null
}
```

### Chart Styling

Charts automatically use team-specific color schemes based on the article category:

- **Bears:** Navy blue / Orange
- **Bulls:** Red / Black
- **Cubs:** Blue / Red
- **White Sox:** Black / Silver
- **Blackhawks:** Red / Black

---

## Auto-Add Poll

### How It Works

1. **Check the "Add Poll" checkbox** in the right sidebar
2. **Set status to "Published"** (polls only insert on publish)
3. **Save/Publish the post**

PostIQ will:
1. Analyze the article for debatable topics
2. Generate an engaging poll question
3. Create 2-4 answer options
4. Create poll via `/api/admin/polls` endpoint
5. Insert `[poll:id]` shortcode after relevant paragraph

### Poll Types That Work Well

| Category | Example Question |
|----------|------------------|
| Predictions | "Will the Bears make the playoffs?" |
| Opinions | "Who should start at QB?" |
| Debates | "Best Bears QB of all time?" |
| Fan sentiment | "How do you feel about this trade?" |
| Comparisons | "Which player has more potential?" |

### Minimum Requirements

- **Content length:** At least 200 characters
- **Topic needed:** Debatable topic, opinion, or prediction
- **Status:** Must be set to "Published"

### API Details

**Endpoint:** `POST /api/admin/ai`

**Request:**
```json
{
  "action": "generate_poll",
  "title": "Article Title",
  "content": "<p>Article HTML content...</p>",
  "category": "Chicago Bears News & Rumors"
}
```

**Response (Success):**
```json
{
  "success": true,
  "pollId": "uuid-of-created-poll",
  "shortcode": "[poll:uuid]",
  "question": "Should the Bears trade up for a WR?",
  "options": ["Yes, we need weapons", "No, build the line first", "Maybe, depends on price"],
  "updatedContent": "<p>Content...</p>\n<div class=\"poll-embed my-6\">[poll:uuid]</div>\n<p>More content...</p>"
}
```

**Response (No Poll Topic Found):**
```json
{
  "success": false,
  "reason": "No suitable poll topic found in article",
  "updatedContent": null
}
```

---

## Using Both Together

You can enable both checkboxes simultaneously. When both are enabled:

1. Chart is generated and inserted first
2. Poll is generated and inserted second
3. Both appear in the article at optimal positions

The order ensures the poll doesn't interfere with chart placement.

---

## Technical Implementation

### Frontend (StudioPostEditor.tsx / AdvancedPostEditor.tsx)

```typescript
// State variables
const [autoInsertChart, setAutoInsertChart] = useState(false)
const [autoAddPoll, setAutoAddPoll] = useState(false)
const [autoInsertingContent, setAutoInsertingContent] = useState<string | null>(null)

// In handleSubmit
if (autoInsertChart && formData.status === 'published') {
  setAutoInsertingContent('chart')
  const response = await fetch('/api/admin/ai', {
    method: 'POST',
    body: JSON.stringify({ action: 'generate_chart', ... })
  })
  // Update content with chart shortcode
}

if (autoAddPoll && formData.status === 'published') {
  setAutoInsertingContent('poll')
  const response = await fetch('/api/admin/ai', {
    method: 'POST',
    body: JSON.stringify({ action: 'generate_poll', ... })
  })
  // Update content with poll shortcode
}
```

### Backend (api/admin/ai/route.ts)

```typescript
// Chart generation
async function generateChartForPost(title: string, content: string, category?: string) {
  // 1. Analyze content with Claude
  // 2. Extract chart data
  // 3. Create chart via /api/charts
  // 4. Insert shortcode into content
  // 5. Return updated content
}

// Poll generation
async function generatePollForPost(title: string, content: string, category?: string) {
  // 1. Analyze content with Claude
  // 2. Generate poll question and options
  // 3. Create poll via /api/admin/polls
  // 4. Insert shortcode into content
  // 5. Return updated content
}
```

### Shortcode Insertion

Shortcodes are inserted after specific paragraphs:

```typescript
function insertShortcodeAfterParagraph(
  htmlContent: string,
  shortcode: string,
  paragraphIndex: number
): string {
  // Find nth </p> tag and insert shortcode after it
  const chartBlock = `\n<div class="chart-embed my-6">${shortcode}</div>\n`
  // Insert at position
}
```

---

## Rendering Shortcodes

Shortcodes are rendered by the `ShortcodeContent` component:

- `[chart:uuid]` → `<ChartEmbed id="uuid" />`
- `[poll:uuid]` → `<PollEmbed id="uuid" />`

Charts use Chart.js for rendering with team-specific color schemes.
Polls use the native poll system with real-time vote updates.

---

## Files Modified

| File | Purpose |
|------|---------|
| `/src/app/api/admin/ai/route.ts` | Added `generate_poll` action |
| `/src/app/studio/posts/new/StudioPostEditor.tsx` | Added checkboxes and submit logic |
| `/src/components/admin/PostEditor/AdvancedPostEditor.tsx` | Added checkboxes and submit logic |

---

## Troubleshooting

### Chart not appearing

1. Check content has at least 200 characters
2. Verify content contains statistical data
3. Check browser console for errors
4. Verify status is "Published"

### Poll not appearing

1. Check content has at least 200 characters
2. Verify content has debatable/opinion content
3. Check browser console for errors
4. Verify status is "Published"

### Loading indicator stuck

If "PostIQ is generating..." stays visible, check:
- Network tab for API errors
- Server logs for Anthropic API issues
- Supabase connection for database errors

---

## Future Enhancements

- [ ] Preview chart/poll before inserting
- [ ] Choose insertion position manually
- [ ] Edit generated poll question before inserting
- [ ] Support for additional chart types (radar, scatter)
- [ ] Data Lab integration for live data charts
