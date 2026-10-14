const cheerio = require('cheerio');

function extractBonusText(html, selector) {
  const $ = cheerio.load(html);

  // Remove obvious noise
  $('script, style, noscript, nav, footer, header, iframe, svg, form, button').remove();

  // Strategy 1: look for elements whose class/id/text mentions "bonus" or "welcome"
  const bonusKeywords = /bonus|welcome|promo|offer|deposit/i;
  let bonusText = '';

  $('[class*="bonus"], [class*="welcome"], [class*="promo"], [id*="bonus"], [id*="welcome"]').each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > 30) bonusText += ' ' + t;
  });

  // Strategy 2: fall back to main/article content
  if (bonusText.trim().length < 100) {
    bonusText = $('main, article, [role="main"]').text();
  }

  // Strategy 3: last resort — full body
  if (bonusText.trim().length < 100) {
    bonusText = $('body').text();
  }

  // Clean and cap. Raise cap to 8000 so we don't cut off real terms.
  return bonusText
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
    .slice(0, 8000);
}

module.exports = { extractBonusText };