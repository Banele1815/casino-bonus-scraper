const Groq = require('groq-sdk');
const config = require('./config');
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function structureBonusTerms(sourceName, rawText) {
    const prompt = `You are extracting structured welcome-bonus data from a betting operator's promotions page.

Operator: ${sourceName}

Raw text:
"""
${rawText}
"""

Search the ENTIRE text above for the welcome/first-deposit bonus. It may appear anywhere on the page, not just at the top.

Extract exactly these three fields:
1. welcome_bonus - the headline welcome offer. Look for phrases like "Welcome Bonus", "First Deposit Match", "100% match on your 1st deposit". Example output: "100% match up to R20,000".
2. wagering_requirement - the multiplier as a number only (e.g. 3 for "3x"). If not stated anywhere, use null.
3. minimum_deposit - minimum qualifying deposit, e.g. "R10". If not stated, use null.

Rules:
- Only use info present in the text. Do not invent.
- If you find a "First Deposit Match" or "Welcome Bonus" line, that IS the welcome_bonus.
- Return valid JSON only.`;

  const response = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return valid JSON with keys welcome_bonus, wagering_requirement, minimum_deposit.' },
      { role: 'user', content: prompt },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  return {
    welcome_bonus: typeof parsed.welcome_bonus === 'string' ? parsed.welcome_bonus : null,
    wagering_requirement: typeof parsed.wagering_requirement === 'number' ? parsed.wagering_requirement : null,
    minimum_deposit: typeof parsed.minimum_deposit === 'string' ? parsed.minimum_deposit : null,
  };
}

module.exports = { structureBonusTerms };
