# Mock Draft - RPC Functions Request for Datalab

**From:** SM Frontend Team
**To:** Datalab Team
**Date:** January 29, 2026
**Priority:** HIGH - Blocking Mock Draft Feature

---

## Problem

The views (`gm_mock_drafts`, `gm_mock_draft_picks`) are **read-only** because they have column transformations/aliases from the underlying tables (`draft_mocks`, `draft_picks`).

When SM tries to insert:
```typescript
await datalabAdmin.from('gm_mock_drafts').insert({
  user_id: '...',
  chicago_team: 'bears',  // This column doesn't exist in draft_mocks
  sport: 'nfl',
  ...
})
```

We get: `Could not find the 'chicago_team' column of 'draft_mocks' in the schema cache`

---

## Solution Options

### Option 1: Make Views Updatable (Preferred if simple)

If the views are simple SELECT statements with column aliases, PostgreSQL can make them updatable with `INSTEAD OF` triggers:

```sql
-- For gm_mock_drafts view
CREATE OR REPLACE FUNCTION gm_mock_drafts_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO draft_mocks (
    -- map view columns to table columns
    user_id,
    user_email,
    team,           -- if chicago_team maps to 'team'
    league,         -- if sport maps to 'league'
    year,           -- if draft_year maps to 'year'
    status,
    current_pick,
    total_picks
  ) VALUES (
    NEW.user_id,
    NEW.user_email,
    NEW.chicago_team,
    NEW.sport,
    NEW.draft_year,
    NEW.status,
    NEW.current_pick,
    NEW.total_picks
  )
  RETURNING * INTO NEW;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gm_mock_drafts_insert
INSTEAD OF INSERT ON gm_mock_drafts
FOR EACH ROW EXECUTE FUNCTION gm_mock_drafts_insert_trigger();
```

### Option 2: Create RPC Functions (More flexible)

Create PostgreSQL functions that SM can call:

```sql
-- Function to create a mock draft
CREATE OR REPLACE FUNCTION create_mock_draft(
  p_user_id TEXT,
  p_user_email TEXT,
  p_chicago_team TEXT,
  p_sport TEXT,
  p_draft_year INTEGER,
  p_total_picks INTEGER
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO draft_mocks (
    user_id,
    user_email,
    team,           -- actual column name
    league,         -- actual column name
    year,           -- actual column name
    status,
    current_pick,
    total_picks
  ) VALUES (
    p_user_id,
    p_user_email,
    p_chicago_team,
    p_sport,
    p_draft_year,
    'in_progress',
    1,
    p_total_picks
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create picks
CREATE OR REPLACE FUNCTION create_mock_draft_picks(
  p_picks JSONB
) RETURNS VOID AS $$
DECLARE
  pick JSONB;
BEGIN
  FOR pick IN SELECT * FROM jsonb_array_elements(p_picks)
  LOOP
    INSERT INTO draft_picks (
      mock_draft_id,
      pick_number,
      round,
      team_key,
      team_name,
      team_logo,
      team_color,
      is_user_pick
    ) VALUES (
      (pick->>'mock_draft_id')::UUID,
      (pick->>'pick_number')::INTEGER,
      (pick->>'round')::INTEGER,
      pick->>'team_key',
      pick->>'team_name',
      pick->>'team_logo',
      pick->>'team_color',
      (pick->>'is_user_pick')::BOOLEAN
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a pick with selected prospect
CREATE OR REPLACE FUNCTION update_mock_draft_pick(
  p_mock_draft_id UUID,
  p_pick_number INTEGER,
  p_prospect_id TEXT,
  p_prospect_name TEXT,
  p_prospect_position TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE draft_picks
  SET
    prospect_id = p_prospect_id,
    prospect_name = p_prospect_name,
    prospect_position = p_prospect_position
  WHERE mock_draft_id = p_mock_draft_id
    AND pick_number = p_pick_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update mock draft status
CREATE OR REPLACE FUNCTION update_mock_draft_status(
  p_mock_draft_id UUID,
  p_current_pick INTEGER,
  p_status TEXT,
  p_overall_grade INTEGER DEFAULT NULL,
  p_letter_grade TEXT DEFAULT NULL,
  p_analysis TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE draft_mocks
  SET
    current_pick = p_current_pick,
    status = p_status,
    overall_grade = COALESCE(p_overall_grade, overall_grade),
    letter_grade = COALESCE(p_letter_grade, letter_grade),
    analysis = COALESCE(p_analysis, analysis),
    updated_at = NOW()
  WHERE id = p_mock_draft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## What SM Needs

Please provide ONE of the following:

### A) The actual column names in `draft_mocks` and `draft_picks` tables

So we can insert directly:

```
draft_mocks table columns:
- id (UUID)
- user_id (TEXT)
- ??? (what is chicago_team mapped from?)
- ??? (what is sport mapped from?)
- ??? (what is draft_year mapped from?)
- status (TEXT)
- current_pick (INTEGER)
- total_picks (INTEGER)
- ...

draft_picks table columns:
- id (UUID)
- mock_draft_id (UUID)
- ??? (what is pick_number mapped from?)
- ...
```

### B) RPC functions as shown above

### C) Make the views updatable with INSTEAD OF triggers

---

## Current SM Code

SM is already set up to try RPC functions first, then fall back to direct view insert:

```typescript
// Try RPC function first
const { data: rpcResult, error: rpcError } = await datalabAdmin.rpc('create_mock_draft', {
  p_user_id: user.id,
  p_user_email: user.email,
  p_chicago_team: chicago_team,
  p_sport: teamInfo.sport,
  p_draft_year: year,
  p_total_picks: draftOrder.length,
})

if (rpcError) {
  // Fall back to direct insert (currently failing)
  ...
}
```

---

## Urgency

This is blocking the Mock Draft feature from working. The views are great for reading data, but we need a way to write data back.

Please let us know:
1. Which solution you prefer
2. Timeline for implementation
3. Any questions about the data we need to insert

Thank you!
