// src/index.js
// Entry point. Orchestrates the scrape and writes JSON output.
// Run with: `npm start`

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { scrapeAll } = require('./scraper');
const config = require('./config');

async function main() {
  console.log('🎰 Betting Bonus Scraper starting...\n');

  const results = await scrapeAll();

  if (results.length === 0) {
    console.error('\n❌ No results. Check source URLs and robots.txt.');
    process.exit(1);
  }

  // Ensure output directory exists
  const outDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Write JSON to output/
  fs.writeFileSync(config.outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Wrote ${results.length} sources to ${config.outputPath}`);

  // Also copy to public/ so the web page can read it
  const publicPath = path.join(__dirname, '..', 'public', 'bonuses.json');
  const publicDir = path.dirname(publicPath);
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(publicPath, JSON.stringify(results, null, 2));
  console.log(`✅ Copied to ${publicPath} for the web page`);

  // Friendly summary
  console.log('\n📋 Summary:');
  for (const r of results) {
    console.log(`   • ${r.name}: ${r.welcome_bonus ?? '—'} | ${r.wagering_requirement ?? '—'}x | ${r.minimum_deposit ?? '—'}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});