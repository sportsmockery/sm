# D3 Chart Builder for SportsMockery Admin
## Simplified Chart Creation for Writers

### Overview
Writers can create professional D3.js charts directly in the post editor without knowing any code. The chart builder provides a simple form interface that generates the chart automatically.

---

## User Flow

### Step 1: Writer clicks "Insert Chart" button in editor toolbar
```
[B] [I] [Link] [Image] [📊 Chart] [Quote] [H2]
                         ↑
                   Click this
```

### Step 2: Chart Builder Modal Opens
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Create Chart                                        [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Chart Type:  [▼ Bar Chart        ]                        │
│               • Bar Chart (compare values)                  │
│               • Line Chart (trends over time)               │
│               • Pie Chart (percentages)                     │
│               • Player Comparison                           │
│               • Team Stats Comparison                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Chart Title: [Bears Passing Yards by Game          ]      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Data Source:  ○ Enter Manually                            │
│                ● Pull from Data Lab                         │
│                ○ Upload CSV                                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Select Team: Bears ▼] [Stat: Passing Yards ▼] [2024 ▼]   │
│                                                             │
│                    ─── OR ───                               │
│                                                             │
│  Manual Data Entry:                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Label          │  Value                            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Week 1         │  285                              │   │
│  │  Week 2         │  242                              │   │
│  │  Week 3         │  301                              │   │
│  │  Week 4         │  198                              │   │
│  │  [+ Add Row]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Colors:  ● Team Colors (auto)                             │
│           ○ Custom: [#FF0000]                              │
│                                                             │
│  Size:    ○ Small   ● Medium   ○ Large   ○ Full Width     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  PREVIEW:                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │    Bears Passing Yards by Game                     │   │
│  │    ████████████████████  285                       │   │
│  │    ███████████████      242                        │   │
│  │    ██████████████████████  301                     │   │
│  │    ████████████         198                        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                          [Cancel]  [Insert Chart]           │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Chart is inserted into post
The chart appears in the editor as a placeholder block. When the post is published, it renders as an interactive D3 chart.

---

## Chart Types Available

### 1. Bar Chart
**Use for:** Comparing values (player stats, team rankings)
```
Writer inputs:
- Title
- Labels (Week 1, Week 2, etc. OR Player names)
- Values (numbers)
- Color scheme
```

### 2. Line Chart
**Use for:** Showing trends over time (season progress, ratings)
```
Writer inputs:
- Title
- X-axis labels (dates, weeks, games)
- Y-axis values
- Multiple lines option (compare 2-3 players)
```

### 3. Pie/Donut Chart
**Use for:** Showing percentages (play distribution, snap counts)
```
Writer inputs:
- Title
- Categories (Run, Pass, Screen)
- Percentages (auto-calculates from values)
```

### 4. Player Comparison
**Use for:** Side-by-side player stats
```
Writer selects:
- Player 1 (dropdown from Data Lab)
- Player 2
- Stats to compare (auto-populated checkboxes)
```

### 5. Team Stats
**Use for:** Team performance visualization
```
Writer selects:
- Team (dropdown)
- Stat category (Offense, Defense, Special Teams)
- Comparison (vs League Avg, vs Division, vs Last Year)
```

---

## Data Lab Integration

When writer selects "Pull from Data Lab":

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Pull Data from SM Data Lab                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Team: [Chicago Bears ▼]                                    │
│                                                             │
│  Data Type:                                                 │
│    ○ Player Stats                                          │
│    ● Team Stats                                            │
│    ○ Game Results                                          │
│    ○ Season Standings                                      │
│                                                             │
│  Stat Category: [Passing ▼]                                │
│                                                             │
│  Time Period:                                               │
│    ○ Single Game: [Week 14 vs MIN ▼]                       │
│    ● Season 2024                                           │
│    ○ Last 5 Games                                          │
│    ○ Custom Range                                          │
│                                                             │
│  Available Stats:                                           │
│    ☑ Passing Yards                                         │
│    ☑ Passing TDs                                           │
│    ☐ Interceptions                                         │
│    ☐ Completion %                                          │
│    ☐ Passer Rating                                         │
│                                                             │
│                              [Cancel]  [Load Data]          │
└─────────────────────────────────────────────────────────────┘
```

**API Call (behind the scenes):**
```javascript
// Fetches from datalab.sportsmockery.com API
const data = await fetch('https://datalab.sportsmockery.com/api/stats', {
  team: 'bears',
  type: 'passing',
  season: 2024,
  stats: ['yards', 'touchdowns']
});
```

---

## Technical Implementation

### Files to Create

```
src/components/admin/ChartBuilder/
├── ChartBuilderModal.tsx      # Main modal component
├── ChartTypeSelector.tsx      # Chart type picker
├── DataEntryForm.tsx          # Manual data entry
├── DataLabPicker.tsx          # Pull from Data Lab
├── ChartPreview.tsx           # Live D3 preview
├── ChartColorPicker.tsx       # Color scheme selector
├── charts/
│   ├── BarChart.tsx           # D3 bar chart component
│   ├── LineChart.tsx          # D3 line chart component
│   ├── PieChart.tsx           # D3 pie chart component
│   ├── PlayerComparison.tsx   # Player comparison chart
│   └── TeamStats.tsx          # Team stats chart
└── index.ts

src/components/article/
├── ArticleChart.tsx           # Renders chart in published article
└── ChartPlaceholder.tsx       # Shows in editor preview

src/lib/
├── chartUtils.ts              # Chart helper functions
└── dataLabApi.ts              # Data Lab API integration
```

### Database Schema Addition

```sql
-- Add to sm_posts or create new table
CREATE TABLE sm_charts (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES sm_posts(id),
  chart_type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  config JSONB NOT NULL,  -- Stores all chart configuration
  data JSONB NOT NULL,    -- Stores chart data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Chart Config JSON Structure

```json
{
  "type": "bar",
  "title": "Bears Passing Yards by Game",
  "size": "medium",
  "colors": {
    "scheme": "team",
    "team": "bears"
  },
  "data": {
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "values": [285, 242, 301, 198]
  },
  "source": {
    "type": "datalab",
    "query": {
      "team": "bears",
      "stat": "passing_yards",
      "season": 2024
    }
  }
}
```

### Rendering in Article

When article loads, chart placeholder is replaced with actual D3 chart:

```tsx
// In article page
{post.content.includes('[chart:') && (
  <ArticleChart 
    chartId={extractChartId(post.content)} 
  />
)}
```

---

## Preset Templates

Writers can choose from pre-built templates:

### Quick Charts (One Click)
```
📊 "How [Player] is Performing"
   → Auto-generates last 5 games line chart

📊 "Team Offense vs League Average"
   → Auto-generates comparison bar chart

📊 "[Team] Record This Season"
   → Auto-generates win/loss pie chart

📊 "Player vs Player Showdown"
   → Opens comparison builder with 2 player slots

📊 "Weekly Power Rankings"
   → Bar chart with all teams, sortable
```

---

## Example Usage

### Writer wants to show Caleb Williams' passing yards this season:

1. Click "📊 Chart" in toolbar
2. Select "Line Chart"
3. Select "Pull from Data Lab"
4. Choose: Bears → Player Stats → Caleb Williams → Passing Yards → 2024
5. Click "Load Data" - chart auto-populates
6. Adjust title: "Caleb Williams' 2024 Passing Yards Journey"
7. Click "Insert Chart"
8. Chart appears in article

**Time: ~30 seconds**

### Writer wants to compare two players:

1. Click "📊 Chart" in toolbar
2. Select "Player Comparison"
3. Player 1: Caleb Williams
4. Player 2: Justin Fields
5. Check stats: Passing Yards, TDs, Passer Rating
6. Click "Generate Comparison"
7. Side-by-side bar chart appears
8. Click "Insert Chart"

**Time: ~20 seconds**

---

## Mobile Admin Support

Chart builder works on iPad/tablet:
- Touch-friendly buttons
- Swipe to see preview
- Simplified data entry with number pad
- Templates prominently featured

---

## Future Enhancements

1. **AI-Suggested Charts**
   - Claude reads article draft
   - Suggests relevant charts: "This article mentions passing yards - want to add a chart?"

2. **Real-Time Data**
   - Charts auto-update during live games
   - "Live" badge on chart

3. **Embeddable Charts**
   - Share chart URL for social media
   - Charts have their own OG images

4. **Chart Library**
   - Save charts for reuse
   - "Trending charts" across site

5. **Animation Options**
   - Bars grow on scroll
   - Numbers count up
   - Lines draw progressively
