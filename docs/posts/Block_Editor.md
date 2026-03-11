# SM Edge Article System — Internal Guide

> **Audience:** Writers, editors, product team, developers
> **Last Updated:** March 2026

---

## System Overview

SM Edge articles are built using a **block-based editor**.

Instead of writing formatted HTML or pasting from Word documents, writers assemble articles using **structured blocks** — self-contained content units that each serve a specific purpose.

Examples of block types:

- **Paragraph** — standard story text
- **Scout Insight** — AI-powered analysis and key takeaways
- **Chart** — visual data and analytics
- **Debate** — pro vs. con arguments
- **Rumor Confidence** — rumor meter with source context
- **Poll** — fan voting interaction
- **Trade Scenario** — roster move breakdowns
- **Reaction Stream** — social and fan reaction content

Every article is stored as a sequence of these blocks in structured JSON format. This means the platform always knows *what kind of content* is inside an article — not just the text itself. That distinction is what powers the entire SM Edge experience.

---

## Article Templates

When a writer starts a new article, they choose a **template**. Templates provide a recommended starting structure of blocks based on the type of story being written.

There are five templates:

### 1. Standard News

**Use for:** Fast breaking updates, injury news, team announcements, game recaps, roster transactions.

This is the default starting point. It opens with a paragraph block and provides a straightforward layout for news coverage. Most day-to-day articles will use this template.

### 2. Stats / Player Comparison

**Use for:** Data-driven analysis, player evaluations, stat breakdowns, performance comparisons.

This template includes chart blocks and insight blocks by default. Use it when the story is built around numbers — comparing two players, analyzing team trends, or breaking down advanced metrics.

### 3. Rumor / Trade Simulator

**Use for:** Trade speculation, roster move analysis, front office strategy, free agency rumors.

This template includes rumor confidence blocks and trade scenario blocks. Use it when covering unconfirmed information where source credibility and confidence level matter.

### 4. Trending Story

**Use for:** High-attention social topics, viral moments, fan reaction stories.

This template is designed for stories that are generating attention across social media. It emphasizes reaction content, visual blocks, and fast-paced narrative.

### 5. Fan Debate

**Use for:** Questions designed to spark strong fan participation and discussion.

This template includes debate blocks and poll blocks by default. Use it when the story is centered around a question fans will disagree on — "Should the Bears trade up?" or "Is this roster good enough?"

**Important:** Templates are starting points, not restrictions. Writers can add, remove, or reorder any blocks after selecting a template. The template simply saves time by pre-loading the blocks that make sense for that type of content.

---

## Block System

Blocks are the building pieces of every article. Each block has a specific type and serves a defined role in the story.

### Block Types

| Block | Purpose |
|-------|---------|
| **Paragraph** | Regular story content — the core narrative text of any article. |
| **Scout Insight** | AI-generated analysis or editorial key takeaways. Appears as a visually distinct card within the article. |
| **Chart** | Visual analytics — stat comparisons, trend lines, performance data rendered as interactive charts. |
| **Poll** | Fan voting interaction. Readers can vote directly within the article. |
| **Debate** | Pro vs. con arguments presented side by side. Designed to frame both sides of a question. |
| **Rumor Confidence** | A rumor meter showing confidence level (low, medium, high) along with source context and editorial notes. |
| **Trade Scenario** | Breakdown of a potential roster move — who is involved, what the trade looks like, and projected impact. |
| **Reaction Stream** | Curated social and fan reactions to a story or event. |

### How Blocks Work

- Blocks appear in the article **in the exact order the writer places them**.
- Each block is independent — it knows its own type and content.
- Writers can drag blocks to reorder them, add new blocks at any position, or remove blocks they don't need.
- There is no limit to how many blocks an article can contain.

Think of blocks like building with pieces that snap together. Each piece has a shape and function, and the writer decides the order and combination.

---

## Article Rendering

When a reader visits an article page on the website, the frontend reads the list of blocks and converts each one into its corresponding visual component.

The rendering flow is straightforward:

| Block Type | Renders As |
|------------|------------|
| Paragraph | Standard text section |
| Scout Insight | Scout insight card with distinct styling |
| Chart | Interactive analytics chart |
| Poll | Voting widget with results |
| Debate | Side-by-side debate module |
| Rumor Confidence | Rumor meter card with confidence indicator |
| Trade Scenario | Trade breakdown panel |
| Reaction Stream | Social reaction feed |

Because every article uses the same block system, **all articles are visually consistent** across the platform. A chart block always looks like a chart block, whether it appears in a stats article or a trade rumor. Writers focus on content. The platform handles presentation.

---

## Homepage Feed System

This is the most important concept in the SM Edge content model:

**The homepage feed is generated directly from article blocks.**

The feed does not contain separate, independently created content. Instead, the system scans the blocks inside published articles and **promotes certain block types into feed cards** on the homepage.

### How It Works

When an article is published, the feed engine examines its blocks. Blocks that qualify as high-value content are extracted and displayed as individual cards in the homepage feed.

| Article Block | Feed Card |
|---------------|-----------|
| Chart block | Analytics card |
| Debate block | Edge Debate card |
| Rumor Confidence block | Rumor Meter card |
| Poll block | Fan Vote card |
| Paragraph block | Article Preview card |

### One Article, Multiple Feed Items

A single article can generate **multiple feed cards**. For example, an article about a potential Bears trade might contain:

- A rumor confidence block → appears as a **Rumor Meter** card in the feed
- A chart block comparing player stats → appears as an **Analytics** card in the feed
- A poll block asking fans if they'd make the trade → appears as a **Fan Vote** card in the feed
- The article itself → appears as an **Article Preview** card in the feed

This means one piece of editorial work can surface across the feed in multiple ways, reaching fans through different entry points.

### Feed Intelligence Scoring

Not every block becomes a feed card. The system uses an intelligence scoring model to determine which blocks are promoted based on factors like recency, content type, engagement potential, and editorial priority.

---

## Why This System Exists

The block-based article system is a strategic architecture decision. Here is what it enables:

### Articles Power the Entire Platform

Writers create content once. The platform automatically generates feed experiences, discovery cards, and interactive moments from that single piece of work. There is no need to separately create social posts, feed items, or homepage features — the blocks do it.

### One Workflow, Many Outputs

A writer assembling an article with charts, debates, and rumor blocks is simultaneously creating:

- A full-length article page
- Multiple homepage feed cards
- Interactive fan engagement moments (polls, debates)
- Data visualizations (charts)
- AI-enhanced analysis (Scout insights)

### The SM Edge Content Model

This system allows SM Edge to combine three experiences that are usually separate:

- **Twitter-style discovery** — fast, scrollable feed cards with individual insights
- **Instagram-style visuals** — rich analytics charts and visual content cards
- **Editorial depth** — full-length articles with structured narrative

All three come from the same source: the article block editor.

---

## Editorial Best Practices

### Charts

Use chart blocks to visualize key stats whenever numbers are central to the story. A chart communicates data faster than a paragraph of statistics. If you're comparing two players or showing a trend, a chart block is almost always the right choice.

### Debates

Use debate blocks when fans will strongly disagree. Frame the question clearly and present both sides with real arguments. Weak debate blocks — where one side is obviously right — don't generate engagement. The best debates are genuine 50/50 splits.

### Rumor Blocks

Use rumor confidence blocks only when the confidence level is meaningful. Setting a confidence meter on every minor transaction rumor dilutes the feature. Reserve it for stories where readers genuinely want to know how likely something is to happen.

### Scout Insights

Place insight blocks after important sections to summarize key takeaways. They work best as punctuation — after a dense paragraph or complex chart, an insight block gives readers a clear bottom line.

### Paragraphs

Keep paragraph blocks concise and readable. Each paragraph block should make one clear point. Long, dense text blocks discourage readers from scrolling. Break up long narratives with other block types to maintain rhythm.

### General Guidance

- **Lead with your strongest block.** The first block sets the tone for both the article and any feed cards it generates.
- **Mix block types.** Articles with only paragraph blocks miss the opportunity to generate rich feed content.
- **Think about the feed.** When you add a chart or debate block, you're also creating a standalone feed card. Make sure it works on its own, outside the article context.

---

## Platform Architecture Summary

The full content flow from creation to display:

```
Writer creates article in block editor
          ↓
Article is saved as structured blocks (JSON)
          ↓
Article page renders each block as a visual component
          ↓
Feed engine scans published article blocks
          ↓
High-value blocks are promoted as feed cards on the homepage
```

**One input. Multiple outputs. One system.**

Writers focus on storytelling. The platform handles distribution.
