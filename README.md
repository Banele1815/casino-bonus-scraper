# Casino Bonus Scraper

Pulls welcome-bonus data from 3 betting operators, uses a language model to turn the
free-text terms into structured fields, writes them to a JSON file, and displays them
on a single web page.

## Source choice

Three South African betting operators, scraped from their own promotions pages:

- Betway South Africa — https://www.betway.co.za/promotions
- Hollywoodbets — https://www.hollywoodbets.net/promotions
- World Sports Betting — https://www.worldsportsbetting.co.za/promotions

I chose operator-owned promotions pages because they are the primary source for
welcome-bonus terms (comparison sites copy from them). All three are accessible from
South Africa without a VPN or login.

## What it extracts

Four fields per source, matching the brief:

| Field | Example |
|---|---|
| welcome_bonus | 100% match up to R20,000 |
| wagering_requirement | 3 (multiplier only, null if not stated) |
| minimum_deposit | R10 (null if not stated) |
| source_url | link to the page it was pulled from |

## How it works

1. `src/fetcher.js` — checks `robots.txt` first, then loads each page with Playwright
   (headless Chromium). Playwright is required because all three promotions pages are
   JavaScript-rendered; plain HTTP requests return an empty HTML shell.
2. `src/parser.js` — strips scripts, styles, nav, footer, header. Prioritises elements
   whose class or id contains "bonus", "welcome", or "promo". Falls back to `main`,
   then `body`. Caps the text at 8000 chars to keep LLM costs low.
3. `src/llm.js` — sends the cleaned text to Groq (Llama 3.3 70B) with JSON mode on,
   asking for exactly three fields. Instructed never to invent values.
4. `src/index.js` — writes `output/bonuses.json` and copies it to `public/bonuses.json`.
5. `public/index.html` — reads the JSON and renders a mobile-first table (collapses to
   stacked cards under 640px).

## Install

```bash
npm install
npx playwright install chromium
