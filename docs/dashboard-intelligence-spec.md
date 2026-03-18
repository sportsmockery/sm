Chicago sports intelligence dashboard — production-ready v0 build

---

## Data Source

**DataLab intelligence API** at https://datalab.sportsmockery.com/api/dashboard/intelligence, backed by ESPN and other feeds. The frontend should never call ESPN directly; it consumes a single, typed payload from DataLab that already encodes cityOverview, teamMatrix, liveGames, trends, teamDrilldowns, and leaderboards.

## Data Access

Assume the dashboard receives a `DashboardIntelligencePayload` object from datalab.sportsmockery.com (either via direct Supabase snapshot read or via the `/api/dashboard/intelligence` endpoint). Build components against that shape and keep data mapping logic minimal and explicit.

---

Build this as a production-quality Chicago sports intelligence dashboard in Next.js using Tailwind CSS, shadcn/ui, Recharts, and glassmorphism with premium motion.

Do not generate a marketing landing page or a Dribbble concept. Generate a real dashboard component/page that could ship in a professional sports analytics product.

Tech stack requirements

Use Next.js App Router

Use TypeScript

Use Tailwind CSS for styling

Use shadcn/ui components where appropriate:

Card

Button

Badge

Tabs

Table

Select

Tooltip

Separator

ScrollArea

Use Recharts for all charts

Use lucide-react and high-quality sports-appropriate icons

Use glassmorphism for major surfaces (subtle blur, refined transparency, not gimmicky)

Use restrained, physics-aware animations (Framer Motion or Tailwind transitions)

Make layout and components fully responsive

Keep code clean, modular, and easy to maintain

Prefer realistic reusable dashboard sections over one giant monolithic file

Page goal

Design a “State of Chicago Sports” dashboard that feels like a cross between a Bloomberg terminal, a pro scouting room wall, and Apple-level product polish.
​

This is not just a pretty scoreboard. The purpose is to communicate which Chicago team is in the best shape right now and why, with:

extreme clarity

low cognitive load

analyst-level credibility

screenshot-ready polish

The dashboard should immediately communicate, at a glance:

Overall “City Pulse” for Chicago sports

Which team is currently the top performer and why

Which team is struggling the most

How vibes, record, streak, and injuries differ by team

How each team’s situation changes when you filter to that team only

Team scope

The dashboard must support all 5 major Chicago teams:

Chicago Bears (NFL)

Chicago Bulls (NBA)

Chicago Cubs (MLB)

Chicago White Sox (MLB)

Chicago Blackhawks (NHL)
​

Default state: “All Teams” overview with a ranked city view.

When the user filters to a specific team (Bears, Bulls, Cubs, White Sox, Blackhawks), the entire board should context-switch to that team while preserving city context.

Design system direction

Visual tone

Create an interface that feels:

institutional

premium

cinematic

analytical

locker-room-war-room ready

credible enough for a front office or ownership review

Style rules

Use a dark, glassmorphic theme:

deep charcoal / navy base

translucent glass cards with subtle blur and borders

Avoid pure black backgrounds

Avoid rainbow gradients or gamer neon

Use soft, directional glows only where they add hierarchy

Use subtle borders, quiet shadows, and intentional spacing

Every panel should feel like a real piece of analysis, not decoration

Remove filler copy and unnecessary chrome

Color palette

Use restrained, sports-analytics UI colors:

Page background: deep charcoal/navy with subtle vignette

Card background: translucent slate/ink (glassmorphism)

Border: low-contrast blue-gray or graphite

Primary accent: electric cyan / icy blue (for interaction + highlights)

Secondary accent: team-specific colors per card edge/accents

Positive: refined green

Negative: refined red

Neutral / warning: muted amber

Color usage rules:

Each team keeps its identity through accent stripes, badges, and charts:

Bears: navy + orange

Bulls: red + black

Cubs: royal blue + red

White Sox: black + silver

Blackhawks: red + black

Avoid clashing by keeping base UI colors neutral; team colors are accents

The current “focus” team (filter) should be subtly elevated

For “All Teams” mode, maintain a balanced, cohesive palette

Typography

Use clean, premium, highly legible typography:

modern sans serif for labels/headers

tabular/mono-like numerics for records, streaks, and percentages

strong KPI hierarchy

muted secondary labels

generous whitespace

minimal body copy, no playful typography

Typography should feel like:

Apple product spacing discipline

pro sports analytics clarity

a high-end front office dashboard

Layout requirements

Use a top-down executive reading flow:

Executive city bar (Chicago sports recommendation strip)

City-wide KPI summary cards

Multi-team performance / vibes overview chart

Team ranking table

Team risk & context matrix

Team-specific intelligence panel (changes with filter)

News / injuries / narrative band

The layout should prioritize decision-making:

city-level conclusions high on the page

supporting team evidence below

deeper context (injuries, vibes, schedule) after performance

concise interpretation last

Required sections

Executive city recommendation bar

Place a premium recommendation strip at the very top.

It should contain city-wide conclusions such as:

City Pulse: “Chicago is trending up” / “Mixed signals” / “Cold streak”

Top Team Right Now: [Team Name] (e.g., “Bulls”)

Current Tiering: “1 contender, 2 middling, 2 struggling” (mock data is fine)

Last Updated timestamp (from backend / mock)

Style guidance:

strong but restrained emphasis

most important element on screen

use glassmorphic background with subtle border and gradient

premium typography with compact info density

should feel like an exec summary header, not a marketing banner

KPI cards (city summary)

Create a clean responsive KPI grid using shadcn/ui Card.

Cards needed (example labels; use realistic mock values):

City Pulse: aggregate W-L across all teams (e.g., “142–178”)
​

Hottest Team: team name + vibe label (e.g., “Bulls — SURGING”)
​

Coldest Team: team name + vibe label (e.g., “White Sox — PAIN”)
​

Teams In Season: X/5 in regular season or playoffs
​

Active Win Streaks: count of teams on W2+ streaks (optional)

Card behavior:

glassmorphic cards with subtle blur and border

slightly wider cards with clear number hierarchy

short labels only

optional small supporting delta or context row (e.g., “vs last week”)

use tabular figures for numeric alignment

Main performance / vibes chart

Use Recharts for a premium multi-series comparison chart.

In “All Teams” mode:

compare the 5 teams on a composite metric over time:

could be “vibe score”, “rolling win %”, or “momentum index” using mock data

each line is a team (with their team colors, but muted)

highlight the hottest team’s line slightly more

In “Team Focus” mode (when a team is selected):

show that team’s recent trend:

win probability, vibe score, or rolling Net Rating-style index

optionally overlay a city-average line for context

Requirements:

use ResponsiveContainer

thin, clean lines with soft grid lines

clean axes, minimal legend clutter

professional tooltip styling (team logo or color chip + metrics)

no loud shadows or glows

chart should feel like pro analytics software, not a fan graphic

Team ranking table

Build an institutional-style comparison table using shadcn/ui Table.

Columns can include (mock data is fine but realistic):

Team

Record

Win %

Streak

Vibe (ON FIRE / SURGING / MEH / PAIN / DUMPSTER FIRE, etc.)
​

Playoff Position / Seeding (or “Out of race”)

Season Phase (Regular Season / Playoffs / Offseason)
​

Requirements:

strong row separation and subtle hover state

crisp numeric alignment

compact but readable spacing

highlight the top-ranked team row with a subtle featured treatment

when a team is selected, its row should stand out but table remains intact

conditional formatting for positive/negative (e.g., streak, win %)

sticky header on scroll if practical

Risk & context matrix

Create a risk/context comparison section using cards or a structured grid.

Metrics per team (mock, but shaped like real data):

Win % (current season)

Streak (e.g., “W4”, “L3”)

Injury load (e.g., “3 key injuries”, “Fully healthy”)
​

Vibe label + emoji (per your vibe algorithm table)
​

Season phase (Regular, Playoffs, Offseason)
​

Goal:

help the viewer determine which situations feel sustainable or fragile

keep this highly scannable; no over-design

Possible layout:

a horizontal comparison matrix where each column is a team, or

compact team metric cards in a responsive grid

Use glass cards with subtle team-colored accents.

Team-specific intelligence panel

When a specific team is selected (Bears, Bulls, Cubs, White Sox, Blackhawks), the entire panel should reconfigure around that team while preserving context.

Content examples (using mock data, but shaped like the DashboardIntelligencePayload from DataLab):

Team header with logo, record, standing summary, and season phase
​

Last Result: formatted (e.g., “W 132–107 vs MEM”) with styled badge
​

Next Game: opponent, date/time (if available)
​

Vibe breakdown: short bullet/line like “SURGING: 8–2 in last 10, W3 streak”
​

High-level injury summary: number of key players out, small list of names with status badges (“Out”, “Questionable”, “Day-To-Day”)
​

Short “front office” style bullets about the current state (3–4 lines max)

Style:

premium glass card

subtle side accent in team color

small section title such as “Team Intelligence” or “Front Office View”

News / narrative band

Create a band or side panel for headlines and narrative context.

Content (mock structure, shaped like DataLab payload):

latest 3–5 headlines across all teams in “All Teams” mode
​

when in Team Focus, prioritize that team’s news with mini league context

each headline row: source, short headline, timestamp

Use compact, scrollable layout (shadcn/ui ScrollArea) to avoid clutter.

Interaction and controls

Include crisp, institutional controls using shadcn/ui:

Team filter:

All Teams (default)

Bears

Bulls

Cubs

White Sox

Blackhawks

View toggle:

Overview

Team Focus

Timeframe selector for charts (e.g., “Last 10 games”, “Season to date”)

Interaction rules:

minimal hover movement

smooth, fast transitions

no bouncy or playful animation

glass cards can have very subtle motion/opacity changes

when filtering to a team, all downstream sections (charts, tables, summary panel, news) should update contextually

preserve city context (City Pulse, top team) even in team view, but reduce visual weight

Default state:

All Teams visible

Hottest team subtly highlighted

City Pulse bar at top

Controls pre-selected to “All Teams” + a reasonable timeframe

Copy tone inside UI

All labels and helper text should sound like:

front office briefing

sports analytics control room

pro scouting / GM review screen

institutional sports strategy dashboard

Prefer labels such as:

City Pulse

Top Team Right Now

Vibe Index

Momentum Profile

Risk & Context

Team Intelligence

Narrative Lens

Season Phase

Injury Load

Supporting Signals

Avoid:

casual fan language

hype slogans

memes

verbose paragraphs

Code quality requirements

Generate code that feels production-ready:

use semantic sectioning

split repeated UI into reusable components where appropriate:

ExecutiveBar

KpiGrid

PerformanceChart

TeamRankingTable

RiskMatrix

TeamIntelPanel

NewsBand

TeamFilterControls

keep constants/data easy to edit

use realistic mock data arrays shaped like the DashboardIntelligencePayload from DataLab (cityOverview, teamMatrix, liveGames, trends, teamDrilldowns, leaderboards)
​

avoid inline styles unless truly necessary

use clean Tailwind utility composition

ensure dark-glass contrast is strong but refined

do not overcomplicate state management (local state + simple derived views is fine)

keep data structures easy to wire to a real backend later

Preferred structure:

page component under the Next.js App Router

separate components folder for sections

chart data arrays and team config in a dedicated constants file

typed strategy/team summary configuration

consistent spacing and sizing scale

Responsive behavior

Must work well on:

desktop widescreen

laptop

tablet

mobile

Responsive priorities:

top executive bar stacks cleanly

KPI cards wrap elegantly

chart remains readable with horizontal scroll or simplified legend on small screens

ranking table becomes horizontally scrollable if needed

team intel and news panels still feel premium on small screens (stacked layout)

controls remain accessible and not cramped

Important visual constraints

avoid pure black backgrounds

avoid rainbow, fan-site styling

avoid giant glowing gamer cards

avoid generic SaaS dashboard visuals

avoid cluttered legends and over-labeled charts

avoid lorem ipsum

avoid decorative widgets with no analytic value

Deliverable

Return a fully upgraded Next.js + Tailwind + shadcn/ui + Recharts Chicago sports intelligence dashboard implementation that is:

premium dark glassmorphic executive style

Apple-quality motion and iconography

institutional sports analytics quality

highly readable and decision-first

city-first, team-second, with full-board team filtering

presentation-ready for a GM, president of operations, or ownership review
