// src/scraper.js
// Responsible for: orchestrating the fetch → parse → LLM pipeline
// for each configured source.

const { fetchHtml } = require('./fetcher');
const { extractBonusText } = require('./parser');
const { structureBonusTerms } = require('./llm');
const config = require('./config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Scrape one source end-to-end.
 * Returns a structured record, or null if it failed.
 */
async function scrapeSource(source) {
  console.log(`\n🔍 Scraping ${source.name}...`);

  try {
    const html = await fetchHtml(source.url);
    console.log(`   ✓ Fetched HTML (${html.length} chars)`);

    const rawText = extractBonusText(html, source.selector);
    console.log(`   ✓ Extracted text (${rawText.length} chars)`);

    if (rawText.length < 50) {
      console.warn(`   ⚠️  Very little text extracted — page may be JS-rendered.`);
    }

    const structured = await structureBonusTerms(source.name, rawText);
    console.log(`   ✓ Structured: ${JSON.stringify(structured)}`);

    return {
      name: source.name,
      welcome_bonus: structured.welcome_bonus,
      wagering_requirement: structured.wagering_requirement,
      minimum_deposit: structured.minimum_deposit,
      source_url: source.url,
    };
  } catch (err) {
    console.error(`   ✗ Failed: ${err.message}`);
    return null;
  }
}

/**
 * Run the full scrape for all configured sources.
 * Returns an array of successful records.
 */
async function scrapeAll() {
  const results = [];

  for (const source of config.sources) {
    const result = await scrapeSource(source);
    if (result) results.push(result);

    // Be polite between requests
    await sleep(config.requestDelayMs);
  }

  return results;
}

module.exports = { scrapeAll };