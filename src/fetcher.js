const { chromium } = require('playwright');
const robotsParser = require('robots-parser');
const axios = require('axios');

const USER_AGENT = 'BonusDataBot/1.0 (+contact: you@example.com)';

async function isAllowed(url) {
  const { protocol, host } = new URL(url);
  const robotsUrl = `${protocol}//${host}/robots.txt`;
  try {
    const { data } = await axios.get(robotsUrl, {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    if (typeof data !== 'string' || data.trim().length === 0) return true;
    const robots = robotsParser(robotsUrl, data);
    return robots.isAllowed(url, USER_AGENT);
  } catch (err) {
    if (err.response && err.response.status === 404) return true;
    console.warn(`   robots.txt check failed: ${err.message}`);
    return false;
  }
}

async function fetchHtml(url) {
  const allowed = await isAllowed(url);
  if (!allowed) throw new Error(`Blocked by robots.txt: ${url}`);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Give the SPA time to hydrate and paint the bonus block.
    await page.waitForTimeout(5000);
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

module.exports = { fetchHtml, isAllowed };