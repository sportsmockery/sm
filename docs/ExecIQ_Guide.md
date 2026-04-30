# ExecIQ Guide

> Daily AI-generated optimization tips on the Overview tab of the Exec Dashboard.

**Last updated:** 2026-04-30
**Owner:** Chris
**Surface:** `https://test.sportsmockery.com/admin/exec-dashboard` → Overview tab → ExecIQ section

---

## What it does

Every morning at **6:30am Central** ExecIQ reads the exec dashboard for the past week, distills it down to the highest-signal data points, and asks Claude Opus 4.7 for **4–7 specific, actionable optimization tips**.

Each insight has:

| Field | Purpose |
|---|---|
| `severity` | `win` (green — keep doing it), `risk` (red — fix it), `opportunity` (cyan — go after it) |
| `category` | content / writers / audience / seo / social / timing / monetization |
| `title` | 5–8 word headline |
| `detail` | 1–2 sentences interpreting the data |
| `action` | The concrete thing to do this week |
| `metric` | The data point that triggered it (optional) |

The Overview tab pins ExecIQ to the top, with a one-paragraph executive summary above the cards.

---

## Manual refresh

You don't have to wait for tomorrow's cron — there's a **Generate / Refresh** button in the section header. It calls `POST /api/admin/exec-iq` with the dashboard's currently-selected range and overwrites the latest insight row.

Use cases:
- First-time setup: hit Generate before the cron has ever fired.
- After a major content push or news event: regenerate to see how the model reads the new data.
- Trying a different range: switch the dashboard date filter to "This Month" first, then Refresh — ExecIQ will distill that range instead.

The cron itself uses `this-week` regardless of what the UI is showing, since the daily briefing should be a consistent rolling window.

---

## How it works

```
Daily cron 11:30 UTC
   │
   ▼
GET /api/cron/exec-iq        ← verifyCronSecret
   │
   ├─ fetch /api/exec-dashboard?range=this-week
   │  → distillDashboard()    ← src/lib/exec-iq.ts
   │      → compact JSON (~3-5k tokens)
   │
   ├─ Anthropic Messages API
   │   model:  claude-opus-4-7
   │   system: SYSTEM_PROMPT  (prompt-cached, ephemeral)
   │   user:   the distilled JSON + "return the JSON now"
   │
   └─ supabaseAdmin.insert into exec_iq_insights
       fields: summary, insights[], model, input_tokens, output_tokens

Overview tab on next load
   │
   ▼
GET /api/admin/exec-iq        ← requireAdmin
   │
   └─ select * from exec_iq_insights order by generated_at desc limit 1
```

### Distillation — what the model actually sees

`distillDashboard()` in `src/lib/exec-iq.ts` strips the dashboard down to:

- `overview` — period posts, prev posts, period views, prev views, avgViews, velocity, totalAuthors
- `topWriters` — top 8 by views (name, posts, views, avgViews)
- `topContent` — top 10 articles (title, author, category, views, publishedAt)
- `categories` — top 8 (name, posts, views, avgViews)
- `dayOfWeek` — array of 7 (publish counts per day)
- `peakPublishHour` — single integer (hour with highest publish count)
- `monthlyTrend` — last 6 months (count + views)
- `social` — youtube channels, X accounts, Facebook pages with key counts
- `seo` — rank, organicKeywords, organicTraffic, top 8 keywords with delta, snapshotMonth

Anything else in the dashboard payload is dropped. Adjust this function if you want ExecIQ to know about more (e.g. GSC clicks, paymentSync totals, a freshness signal, etc.).

---

## Files

| File | Purpose |
|---|---|
| `src/lib/exec-iq.ts` | Distillation, prompt, Anthropic call, persist + read helpers |
| `src/app/api/cron/exec-iq/route.ts` | Daily cron — verifies CRON_SECRET, calls `generateExecIqInsights()` |
| `src/app/api/admin/exec-iq/route.ts` | Admin GET (latest) + POST (regenerate) — requireAdmin |
| `src/app/admin/exec-dashboard/page.tsx` | UI section pinned to Overview tab |
| `vercel.json` | Cron entry: `"schedule": "30 11 * * *"` |
| `supabase/migrations/…_exec_iq_insights.sql` | `exec_iq_insights` table |

---

## Database

Table: `public.exec_iq_insights` (RLS on, no policies → service-role only)

| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `generated_at` | timestamptz, default now() | |
| `period_label` | text | e.g. `this-week` |
| `period_start` / `period_end` | date | currently null; populate if needed |
| `summary` | text | 1-paragraph exec read |
| `insights` | jsonb | array of insight objects (see schema below) |
| `model` | text | `claude-opus-4-7` |
| `input_tokens` / `output_tokens` | int | for cost tracking |
| `error` | text | if a run failed |

### Insight JSON schema

```json
{
  "title": "string",
  "severity": "win | risk | opportunity",
  "category": "content | writers | audience | seo | social | timing | monetization",
  "detail": "string",
  "action": "string",
  "metric": "string (optional)"
}
```

---

## Tuning

### Change the model

Edit `MODEL` at the top of `src/lib/exec-iq.ts`:

| Model | Cost / run | Use when |
|---|---|---|
| `claude-opus-4-7` (default) | ~$0.15–0.25 | Best pattern detection, daily briefing quality matters |
| `claude-sonnet-4-6` | ~$0.03–0.05 | Plenty for structured data, ~5x cheaper |
| `claude-haiku-4-5-20251001` | ~$0.01 | One-shot rapid; insights become more obvious / less subtle |

### Change the voice or count

Edit `SYSTEM_PROMPT` in `src/lib/exec-iq.ts`. The current prompt asks for "4–7 specific, actionable optimization tips" — bump to 6–10 if you want denser briefings. Add concrete style rules (e.g. "always include at least one Bears insight when Bears is the largest team category") to push behavior.

### Change the range

The cron always uses `this-week`. Switch to `this-month` if you'd rather get a longer-window read each morning — change `range` default in `src/app/api/cron/exec-iq/route.ts`.

### Change the schedule

`vercel.json` cron entry uses `30 11 * * *` (UTC). Adjust if you want a different time. **Keep it after `0 5 * * *`** (writer-views sync) so writer numbers are fresh.

---

## Operational notes

- **First run** is manual — click Generate. The cron creates the daily row from then on.
- **Each run inserts a new row** (it doesn't overwrite). The Overview tab reads the most recent row only, so older rows accumulate as a history. Useful for spotting drift over time; query `select generated_at, summary from exec_iq_insights order by generated_at desc limit 30` to scan a month of briefings.
- **Cost tracking**: `input_tokens` and `output_tokens` are persisted on every row. To check monthly spend:
  ```sql
  select to_char(generated_at, 'YYYY-MM') as month,
         sum(input_tokens) as in_tok,
         sum(output_tokens) as out_tok
  from exec_iq_insights
  group by 1 order by 1 desc;
  ```
- **Failures are logged but the row may not be inserted** if the LLM call itself fails. Check Vercel logs for `[exec-iq cron]` if a morning's row goes missing.
- **Prompt caching**: the system prompt is sent with `cache_control: { type: 'ephemeral' }` so repeat runs within 5 minutes pay reduced input cost. Helps when you click Refresh twice in a row debugging.

---

## Required env vars

Already set in Vercel:

| Var | Used in |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API call |
| `CRON_SECRET` | Cron auth |
| `SUPABASE_SERVICE_ROLE_KEY` | DB writes (already used elsewhere) |

Optional:

| Var | Default | Purpose |
|---|---|---|
| `EXEC_IQ_BASE_URL` | derived from request | Force a specific base URL when fetching the dashboard. Useful if the cron host isn't reachable from itself. |

---

## Why Claude Opus 4.7 (not Scout)

The CLAUDE.md memory rule says route AI features through Scout, but Scout is a Perplexity-based RAG over sports knowledge — it returns text answers with citations. ExecIQ is structured-data analysis (numerical KPIs in, structured JSON out), which is the same shape as PostIQ. PostIQ uses `@anthropic-ai/sdk` directly and that pattern was kept here. If a Scout-routed equivalent ever makes sense, replace the Anthropic call in `generateExecIqInsights()` with a Scout query — the rest of the wiring is provider-agnostic.

---

## What it doesn't do (yet)

- **No notification.** Insights only show up when you visit the dashboard. Easy add: ping a Slack webhook with the summary on cron success.
- **No history view.** Only the latest row is shown in the UI. The data is stored — adding a "Past briefings" panel is a small UI job.
- **No "mark as actioned" workflow.** Insights are advisory; if you want to track which ones you acted on (and have ExecIQ stop repeating them), that's a future schema change (`actioned_at`, `dismissed_at` columns + a Mark Done button).

---

## Removing or rolling back

```bash
# Pull from cron rotation
# Delete the cron entry in vercel.json
#   { "path": "/api/cron/exec-iq", "schedule": "30 11 * * *" }

# (Optional) drop the table
# In Supabase SQL editor:
#   drop table public.exec_iq_insights;

# (Optional) remove code
rm src/lib/exec-iq.ts
rm -rf src/app/api/cron/exec-iq
rm -rf src/app/api/admin/exec-iq
# Then remove the ExecIQ <Section> block from src/app/admin/exec-dashboard/page.tsx
```
