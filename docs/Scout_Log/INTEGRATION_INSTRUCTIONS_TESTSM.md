# Scout Error Logging Integration - test.sportsmockery.com

**Date:** January 25, 2026
**From:** SM Data Lab
**To:** test.sportsmockery.com Frontend Team

---

## Overview

We've created a shared `scout_errors` table in Supabase that both systems can use for debugging Scout AI failures. When Scout fails on the frontend, log it to this table so we can debug together.

---

## Table Schema

```sql
CREATE TABLE scout_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  source TEXT NOT NULL,           -- 'frontend' or 'backend'
  error_type TEXT NOT NULL,       -- timeout, cors, parse, network, api, unknown
  error_message TEXT,             -- The actual error message
  user_query TEXT,                -- What the user asked
  session_id TEXT,                -- Scout session ID if available
  response_time_ms INTEGER,       -- How long the request took
  request_payload JSONB,          -- The request that was sent
  response_payload JSONB,         -- The response received (if any)
  user_agent TEXT,                -- Browser info
  metadata JSONB                  -- Any additional context
);
```

---

## Error Types (Use These Consistently)

| Error Type | When to Use |
|------------|-------------|
| `timeout` | Request exceeded time limit |
| `cors` | CORS policy blocked the request |
| `parse` | Failed to parse JSON response |
| `network` | Network connection failed |
| `api` | API returned an error response |
| `unknown` | Any other error |

---

## Implementation

### 1. Add the Logging Utility

Create a utility function to log errors:

```typescript
// src/lib/scoutErrorLogger.ts

import { supabase } from './supabase' // Your Supabase client

export type ScoutErrorType = 'timeout' | 'cors' | 'parse' | 'network' | 'api' | 'unknown'

interface LogScoutErrorParams {
  errorType: ScoutErrorType
  errorMessage: string
  userQuery?: string
  sessionId?: string
  responseTimeMs?: number
  requestPayload?: Record<string, unknown>
  responsePayload?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export async function logScoutError(params: LogScoutErrorParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('scout_errors')
      .insert({
        source: 'frontend',
        error_type: params.errorType,
        error_message: params.errorMessage,
        user_query: params.userQuery,
        session_id: params.sessionId,
        response_time_ms: params.responseTimeMs,
        request_payload: params.requestPayload,
        response_payload: params.responsePayload,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        metadata: params.metadata,
      })

    if (error) {
      console.error('[Scout Error Logger] Failed to log error:', error)
    }
  } catch (e) {
    // Don't throw - error logging should never break the app
    console.error('[Scout Error Logger] Exception:', e)
  }
}

// Helper to determine error type from error object
export function getErrorType(error: unknown): ScoutErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('timeout') || message.includes('aborted')) return 'timeout'
    if (message.includes('cors')) return 'cors'
    if (message.includes('json') || message.includes('parse')) return 'parse'
    if (message.includes('network') || message.includes('fetch')) return 'network'
  }
  return 'unknown'
}
```

### 2. Wrap Your Scout API Calls

Update your Scout API call to log errors:

```typescript
// In your Scout AI component or API route

import { logScoutError, getErrorType } from '@/lib/scoutErrorLogger'

async function callScoutAPI(query: string, sessionId?: string) {
  const startTime = Date.now()
  const requestPayload = { query, sessionId }

  try {
    const response = await fetch('/api/ask-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    const responseTimeMs = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()

      await logScoutError({
        errorType: 'api',
        errorMessage: `HTTP ${response.status}: ${errorText}`,
        userQuery: query,
        sessionId,
        responseTimeMs,
        requestPayload,
        responsePayload: { status: response.status, body: errorText },
      })

      throw new Error(`Scout API error: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    const responseTimeMs = Date.now() - startTime

    // Only log if we haven't already logged (e.g., for api errors above)
    if (!(error instanceof Error && error.message.startsWith('Scout API error'))) {
      await logScoutError({
        errorType: getErrorType(error),
        errorMessage: error instanceof Error ? error.message : String(error),
        userQuery: query,
        sessionId,
        responseTimeMs,
        requestPayload,
      })
    }

    throw error
  }
}
```

### 3. Alternative: Log in API Route

If you prefer to log in the API route instead of the component:

```typescript
// src/app/api/ask-ai/route.ts

import { logScoutError } from '@/lib/scoutErrorLogger'

export async function POST(request: Request) {
  const startTime = Date.now()
  let userQuery: string | undefined
  let sessionId: string | undefined

  try {
    const body = await request.json()
    userQuery = body.query
    sessionId = body.sessionId

    // ... your existing Scout API call logic ...

  } catch (error) {
    const responseTimeMs = Date.now() - startTime

    await logScoutError({
      errorType: getErrorType(error),
      errorMessage: error instanceof Error ? error.message : String(error),
      userQuery,
      sessionId,
      responseTimeMs,
      metadata: {
        url: request.url,
        method: request.method,
      },
    })

    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

---

## Viewing Errors

### Query Recent Frontend Errors

```sql
SELECT
  created_at,
  error_type,
  error_message,
  user_query,
  response_time_ms
FROM scout_errors
WHERE source = 'frontend'
ORDER BY created_at DESC
LIMIT 20;
```

### Query Errors by Type

```sql
SELECT
  error_type,
  COUNT(*) as count,
  AVG(response_time_ms) as avg_response_time
FROM scout_errors
WHERE source = 'frontend'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY count DESC;
```

### Query Slow Requests

```sql
SELECT *
FROM scout_errors
WHERE response_time_ms > 10000  -- Over 10 seconds
ORDER BY created_at DESC;
```

---

## Testing the Integration

After implementing, test by:

1. **Force a timeout**: Set a very short timeout (1ms) temporarily
2. **Force a parse error**: Modify the response parsing to fail
3. **Check the table**: Run `SELECT * FROM scout_errors ORDER BY created_at DESC LIMIT 5`

---

## Supabase Access

You should already have access to the Supabase project. The `scout_errors` table is in the public schema.

If you need access, contact the Data Lab team.

---

## Questions?

Contact Data Lab via the usual channels. We monitor this table and will see errors from both frontend and backend.
