# Casino Bonus Scraper

Pulls welcome-bonus data from 3 South African betting operators, uses a language model
to turn the free-text terms into structured fields, writes them to a JSON file, and
displays them on a single web page.

**Live page:** <your-project>.vercel.app

## Source choice

Three operators, scraped from their own promotions pages:

- Betway South Africa: https://www.betway.co.za/promotions
- Hollywoodbets: https://www.hollywoodbets.net/promotions
- World Sports Betting: https://www.worldsportsbetting.co.za/promotions

The brief asks for casinos. My first choices (LeoVegas, Casumo, Mr Green) are
region-blocked in South Africa, and the brief says to switch source if blocked, so I
used SA-licensed operators instead. The pipeline is the same. I chose operator-owned
pages because they are the primary source for bonus terms (comparison sites copy from
them).

## What it extracts

| Field | Example |
|---|---|
| welcome_bonus | 100% match up to R20,000 |
| wagering_requirement | 3 (multiplier only, null if not stated) |
| minimum_deposit | R10 (null if not stated) |
| source_url | link to the page it was pulled from |

## How it works

1. `src/fetcher.js`: checks `robots.txt` first (if it can't be read, the page is
   skipped), then loads the page with Playwright (headless Chromium). Playwright is
   needed because the promotions pages are JavaScript-rendered. It does not bypass
   logins, CAPTCHAs or blocks.
2. `src/parser.js`: strips scripts, styles, nav, footer and header. Prefers elements
   whose class or id contains "bonus", "welcome" or "promo", then falls back to
   `main`/`article`, then `body`. Text is capped at 8000 characters.
3. `src/llm.js`: sends the cleaned text to Groq (`openai/gpt-oss-120b`, temperature 0,
   JSON mode) and asks for exactly three fields. The model is told never to invent
   values, and the output is type-checked, so anything malformed becomes `null`.
4. `src/scraper.js`: runs fetch, parse and LLM for each source, with a 2 second delay
   between sources. A failed source is skipped and logged.
5. `src/index.js`: writes `output/bonuses.json` and copies it to `public/bonuses.json`.
6. `public/index.html`: reads the JSON and renders a mobile-first table (it collapses
   to stacked cards under 640px).

## Requirements

- Node.js 18 or newer
- A free Groq API key: https://console.groq.com/keys

## Install

```bash
npm install
npx playwright install chromium
```

Create a `.env` file in the project root:

```
GROQ_API_KEY=your_key_here
```

## Run

```bash
npm start
```

This scrapes all three sources and writes `output/bonuses.json` and
`public/bonuses.json`. To view the page locally:

```bash
npx serve public
```

## Deploy

The page is static. On Vercel, import the repo and set Framework Preset to "Other",
leave Build Command empty, and set Output Directory to `public`. The scraper does not
run on Vercel. To refresh the data, run `npm start` locally, commit the updated
`public/bonuses.json`, and push. Vercel redeploys automatically.

## Known limitations

- <Betway returned no bonus text on the last run, so its fields are null.>
- Wagering requirement and minimum deposit are often not on the promotions listing
  pages (they sit in the full T&Cs), so they come back null rather than guessed.
- Selectors are generic (`main, body`), so a site redesign can degrade results.
  Nothing is typed in by hand.

## Production notes

See the written section submitted with this task (hosting, database, scheduling,
monitoring and cost for 200 casinos updated daily).
