# Figma Sync Pipeline

Extract structure, design tokens, and assets from the SM Edge Figma file into the codebase.

## Setup

### 1. Get a Figma Personal Access Token

1. Go to [Figma Settings → Account](https://www.figma.com/settings) (or click your avatar → Settings)
2. Scroll to **Personal access tokens**
3. Click **Generate new token**, give it a name like "SM Sync"
4. Copy the token

### 2. Get the Figma File Key

From your Figma file URL:
```
https://www.figma.com/design/ABC123xyz/My-File-Name
                              ^^^^^^^^^
                              This is the file key
```

### 3. Set Environment Variables

Add to your `.env.local`:
```
FIGMA_TOKEN=figd_xxxxxxxxxxxx
FIGMA_FILE_KEY=ABC123xyz
```

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run figma:fetch` | Downloads the full Figma file JSON to `figma/file.json` |
| `npm run figma:pages` | Extracts page and frame structure to `figma/pages.json` |
| `npm run figma:tokens` | Extracts colors, text styles, effects to `figma/tokens.json` |
| `npm run figma:export` | Exports specific nodes as SVG/PNG to `public/design/` |
| `npm run figma:summary` | Generates a human-readable sync summary to `figma/sync-summary.json` |
| `npm run figma:sync` | Runs fetch → pages → tokens → summary in sequence |

### Exporting Images

The export script requires node IDs (found in `figma/pages.json` or the Figma URL):

```bash
# Export as SVG (default)
npm run figma:export -- 123:456 789:012

# Export as PNG at 2x
npm run figma:export -- --format png --scale 2 123:456

# Export from a list file
npm run figma:export -- --ids-from figma/export-list.txt
```

Create `figma/export-list.txt` with one node ID per line (lines starting with `#` are ignored).

## Output Files

| File | Committed | Description |
|------|-----------|-------------|
| `figma/file.json` | No (gitignored) | Raw Figma API response — large, regenerated on demand |
| `figma/pages.json` | Yes | Page/frame structure map |
| `figma/tokens.json` | Yes | Extracted design tokens + Tailwind map |
| `figma/sync-summary.json` | Yes | Human-readable summary of the file |
| `figma/export-manifest.json` | Yes | Record of exported assets |
| `public/design/*` | Yes | Exported image assets |

## Using Tokens in Tailwind

After running `figma:tokens`, open `figma/tokens.json` and copy the `tailwind` section into your `tailwind.config.ts`:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Paste from tokens.json → tailwind.colors
      },
      fontSize: {
        // Paste from tokens.json → tailwind.fontSize
      },
    },
  },
}
```

## How This Helps

This pipeline turns your Figma organization into a development blueprint:

1. **`pages.json`** — Maps Figma pages/frames to site sections, giving developers a route-to-design lookup
2. **`tokens.json`** — Converts Figma styles into code-ready values, keeping design and implementation in sync
3. **`export-manifest.json`** — Tracks which assets were pulled and where they live in `public/`
4. **`sync-summary.json`** — Gives a quick overview of the design system scope (components, styles, pages)

Re-run `figma:sync` anytime the Figma file changes to keep the codebase aligned.

## Architecture

```
scripts/figma/
  client.ts          — Shared Figma API client + path constants
  types.ts           — TypeScript types for Figma API and output formats
  fetch-file.ts      — Downloads the full file JSON
  extract-pages.ts   — Parses page/frame structure
  extract-tokens.ts  — Extracts color, text, effect tokens
  export-node-images.ts — Exports specific nodes as images
  sync-summary.ts    — Generates the summary report

figma/               — Output directory for JSON artifacts
public/design/       — Output directory for exported images
```
