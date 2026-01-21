# Ask AI External Source Functions

This document describes the AI External Source Logging system for Sports Mockery, which tracks, validates, and imports data when the Ask AI function needs to use external sources instead of the Datalab database.

## Overview

When users ask questions that cannot be answered from the internal Datalab database, the system:

1. **Logs** the query and external source used
2. **Validates** the response with at least 2 independent sources
3. **Imports** verified data into team-specific AI tables
4. **Caches** validated data for future queries

This reduces external API calls and ensures data consistency across sessions.

## Architecture

### Database Tables

#### Main Logging Table: `ai_external_queries_log`

Tracks all AI queries that required external sources.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `query` | TEXT | The original user question |
| `team` | VARCHAR(50) | Team identifier (bears, bulls, cubs, whitesox, blackhawks) |
| `team_display_name` | VARCHAR(100) | Human-readable team name |
| `external_source_used` | TEXT | Source that provided the answer (e.g., 'web_search', 'espn_api') |
| `response_received` | TEXT | The response from the external source |
| `validation_source_1` | TEXT | First validation source name |
| `validation_source_1_result` | TEXT | Result from first validation |
| `validation_source_2` | TEXT | Second validation source name (required) |
| `validation_source_2_result` | TEXT | Result from second validation |
| `validation_source_3` | TEXT | Optional third validation source |
| `validation_source_3_result` | TEXT | Result from third validation |
| `is_validated` | BOOLEAN | Whether data passed validation (requires 2+ sources) |
| `validation_match_score` | DECIMAL(3,2) | Confidence score (0.00 to 1.00) |
| `data_imported` | BOOLEAN | Whether data was imported to team AI table |
| `import_table` | VARCHAR(100) | Target table for imported data |
| `import_record_id` | UUID | ID of the imported record |
| `created_at` | TIMESTAMPTZ | When the query was logged |

#### Team AI Tables

Each team has a dedicated AI table for storing validated external data:

- `bears_AI` - Chicago Bears data
- `bulls_AI` - Chicago Bulls data
- `cubs_AI` - Chicago Cubs data
- `whitesox_AI` - Chicago White Sox data
- `blackhawks_AI` - Chicago Blackhawks data

**Schema (same for all team tables):**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `query_log_id` | UUID | Reference to ai_external_queries_log |
| `data_type` | VARCHAR(50) | Type: player_stat, game_info, roster, news, historical, general |
| `data_key` | VARCHAR(255) | Unique key for the data (normalized query) |
| `data_value` | JSONB | The actual data as JSON |
| `related_player_id` | INTEGER | FK to team players table if applicable |
| `related_game_id` | VARCHAR(50) | FK to team games table if applicable |
| `season` | INTEGER | Season year if applicable |
| `week` | INTEGER | Week number (NFL) if applicable |
| `external_source` | TEXT | Original external source |
| `validation_sources` | TEXT[] | Array of sources that validated the data |
| `confidence_score` | DECIMAL(3,2) | Validation confidence (0.00 to 1.00) |
| `is_active` | BOOLEAN | Whether this data is currently valid |
| `expires_at` | TIMESTAMPTZ | Optional expiration for time-sensitive data |
| `created_at` | TIMESTAMPTZ | When data was imported |

#### Additional Tables (if needed)

If imported data cannot be joined to existing team tables, additional tables are created:

- `{team_name}_AI_2` - Second overflow table
- `{team_name}_AI_3` - Third overflow table
- etc.

Tables are named incrementally: `bears_AI_2`, `bears_AI_3`, etc.

### Validation Sources

The system validates data against multiple trusted sources:

| Source | Type | Reliability Score | Notes |
|--------|------|-------------------|-------|
| ESPN API | API | 0.95 | Official ESPN sports data |
| Pro Football Reference | Website | 0.92 | Detailed NFL statistics |
| Basketball Reference | Website | 0.92 | Detailed NBA statistics |
| Baseball Reference | Website | 0.92 | Detailed MLB statistics |
| Hockey Reference | Website | 0.92 | Detailed NHL statistics |
| Sports Reference | Website | 0.90 | Comprehensive historical stats |
| NFL.com | Website | 0.95 | Official NFL data |
| NBA.com | Website | 0.95 | Official NBA data |
| MLB.com | Website | 0.95 | Official MLB data |
| NHL.com | Website | 0.95 | Official NHL data |

**Validation Rules:**
- At least **2 sources** must confirm the data
- Data is NOT imported if validation fails
- Confidence score is averaged from matching sources

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ask-ai/
│   │   │   └── route.ts          # Main AI query endpoint (modified)
│   │   └── admin/
│   │       └── ai-logging/
│   │           └── route.ts      # Admin API for logging management
│   └── admin/
│       └── ai-logging/
│           └── page.tsx          # Admin UI page
├── components/
│   └── admin/
│       └── Sidebar.tsx           # Updated with AI Logging link
└── lib/
    └── ai-external-service.ts    # Core service functions

supabase/
└── ai-external-logging-schema.sql  # Database schema
```

## API Endpoints

### Public API

#### `POST /api/ask-ai`

Handles AI queries with automatic caching and logging.

**Request:**
```json
{
  "query": "How many touchdowns did Caleb Williams throw?"
}
```

**Response:**
```json
{
  "response": "Caleb Williams threw 20 touchdowns in the 2024 season...",
  "source": "ai" | "web_fallback" | "error",
  "team": "bears",
  "teamDisplayName": "Chicago Bears",
  "cachedResponse": true,  // If served from cache
  "cacheSource": "bears_AI"
}
```

**Flow:**
1. Check `{team}_AI` table for cached response
2. If found, return cached data with `source: "ai"`
3. If not found, forward to Datalab
4. If Datalab uses external source (`web_fallback`):
   - Log query to `ai_external_queries_log`
   - Validate with 2+ sources
   - Import to team AI table if validated
5. Return response to user

### Admin API

#### `GET /api/admin/ai-logging`

Fetch query logs, team data, or statistics.

**Query Parameters:**
- `action`: `logs` | `team-data` | `stats`
- `team`: Filter by team
- `validated`: `true` | `false`
- `imported`: `true` | `false`
- `limit`: Number of records (default 50)
- `offset`: Pagination offset

**Examples:**
```
GET /api/admin/ai-logging?action=logs&team=bears&validated=true
GET /api/admin/ai-logging?action=stats
GET /api/admin/ai-logging?action=team-data&team=bulls
```

#### `POST /api/admin/ai-logging`

Perform validation, import, or update actions.

**Actions:**

1. **Validate data:**
```json
{
  "action": "validate",
  "team": "bears",
  "data": { "player_name": "Caleb Williams", "touchdowns": 20 },
  "dataType": "player_stat"
}
```

2. **Import data:**
```json
{
  "action": "import",
  "team": "bears",
  "query": "Caleb Williams touchdowns 2024",
  "data": { "player_name": "Caleb Williams", "touchdowns": 20 },
  "dataType": "player_stat",
  "externalSource": "espn_api",
  "validationSources": ["ESPN API", "Pro Football Reference"]
}
```

3. **Update log:**
```json
{
  "action": "update-log",
  "logId": "uuid-here",
  "updates": { "is_validated": true }
}
```

## Admin Interface

Access the admin interface at: `/admin/ai-logging`

### Features:

1. **Query Logs Tab**
   - View all external queries with filtering
   - Filter by team, validation status, import status
   - Expand logs to see validation details
   - Pagination support

2. **Imported Data Tab**
   - View data imported to team AI tables
   - Filter by team
   - Shows confidence scores
   - Data type categorization

3. **Statistics Tab**
   - Total queries count
   - Validation success rate
   - Import success rate
   - Breakdown by team
   - Visual progress bars

## Service Functions

Located in `src/lib/ai-external-service.ts`:

### Core Functions

```typescript
// Check if cached data exists for a query
checkAICache(team: string, query: string): Promise<{
  found: boolean;
  data?: Record<string, any>;
  source?: string;
}>

// Log an external query
logExternalQuery(log: ExternalQueryLog): Promise<string | null>

// Validate data with multiple sources
validateWithMultipleSources(data, team, dataType): Promise<{
  isValid: boolean;
  validations: ValidationResult[];
  matchScore: number;
}>

// Import validated data to team AI table
importValidatedData(team, importData, queryLogId?): Promise<{
  success: boolean;
  recordId?: string;
  error?: string;
}>

// Full processing pipeline
processExternalQueryResponse(
  query: string,
  team: string | null,
  teamDisplayName: string | null,
  externalSource: string,
  response: string,
  parsedData?: Record<string, any>,
  dataType?: AIImportData['data_type']
): Promise<{
  logged: boolean;
  validated: boolean;
  imported: boolean;
  logId?: string;
  importId?: string;
  validations?: ValidationResult[];
}>
```

### Helper Functions

```typescript
// Get the AI table name for a team
getTeamAITable(team: string): string | null

// Generate a unique data key from a query
generateDataKey(query: string): string

// Get query logs with filters
getExternalQueryLogs(options): Promise<{ logs: ExternalQueryLog[]; total: number }>

// Get team AI data
getTeamAIData(team: string, options?): Promise<AIImportData[]>

// Get statistics
getAIQueryStats(): Promise<Stats>
```

## Data Types

Queries are categorized into data types:

| Type | Pattern Matches | Example Query |
|------|-----------------|---------------|
| `player_stat` | stats, yards, points, touchdowns, goals | "Caleb Williams passing yards" |
| `game_info` | game, score, won, lost, vs | "Bears vs Packers score" |
| `roster` | roster, lineup, starting, position | "Bears starting lineup" |
| `news` | news, rumor, trade, sign, contract | "Bears trade rumors" |
| `historical` | history, all-time, record, season 2024 | "Bears all-time wins" |
| `general` | Everything else | "Why are the Bears bad?" |

## Joining Data to Team Tables

Imported data can be joined to existing team tables using:

1. **Player ID Join:**
   - `related_player_id` → `{team}_players.id`

2. **Game ID Join:**
   - `related_game_id` → `{team}_games.game_id`

3. **Season/Week Join:**
   - `season` + `week` → Multiple tables

Example SQL:
```sql
-- Get player stats with AI-imported data
SELECT
  p.name,
  s.pass_yds,
  ai.data_value->>'additional_context' as ai_context
FROM bears_players p
JOIN bears_player_season_stats s ON p.id = s.player_id
LEFT JOIN bears_AI ai ON ai.related_player_id = p.id
WHERE s.season = 2024;
```

## Setup Instructions

1. **Run the database migration:**
   ```bash
   # Execute in Supabase SQL editor
   psql -f supabase/ai-external-logging-schema.sql
   ```

2. **Environment variables required:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
   - `DATALAB_API_URL` (optional, defaults to production)

3. **Access the admin page:**
   - Navigate to `/admin/ai-logging`
   - Requires admin authentication

## Monitoring

### Key Metrics to Track:

1. **Cache Hit Rate:** `cached_queries / total_queries`
2. **Validation Success Rate:** `validated_queries / total_external_queries`
3. **Import Success Rate:** `imported_queries / validated_queries`
4. **External Source Usage:** Queries by `external_source_used`

### Alerts to Set:

- High external source usage (> 50% of queries)
- Low validation success rate (< 70%)
- Database growth (AI tables > 1GB)

## Troubleshooting

### Common Issues:

1. **Data not being cached:**
   - Check `is_active` flag in AI tables
   - Verify `data_key` is being generated correctly
   - Check Supabase service role key is set

2. **Validation always failing:**
   - Verify validation sources are accessible
   - Check data structure matches expected format
   - Review `confidence_score` thresholds

3. **Imports not appearing:**
   - Check `data_imported` flag in logs
   - Verify `import_table` is correct
   - Look for errors in server logs

### Debug Mode:

Set `NODE_ENV=development` to include debug info in API responses.

## Future Enhancements

1. **Real-time validation:** Connect to actual sports APIs for live validation
2. **ML-based data extraction:** Better parsing of unstructured responses
3. **Automatic expiration:** Time-based invalidation for stale data
4. **Cross-team queries:** Handle queries spanning multiple teams
5. **Bulk import:** Admin tool for manual data imports
6. **Notification system:** Alerts for high-value queries not in database
