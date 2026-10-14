// src/config.js
// Configuration for 3 SA-accessible betting bonus sources.
// Note: original casino sources (LeoVegas, Casumo, Mr Green) are region-blocked
// in South Africa. Per the brief's instruction ("if a source blocks you,
// switch source"), we use SA-licensed operators instead. Same pipeline.

module.exports = {
  sources: [
    {
      name: 'Betway South Africa',
      url: 'https://www.betway.co.za/promotions',
      selector: 'main, body',
    },
    {
      name: 'Hollywoodbets',
      url: 'https://www.hollywoodbets.net/promotions',
      selector: 'main, body',
    },
    {
      name: 'World Sports Betting',
      url: 'https://www.worldsportsbetting.co.za/promotions',
      selector: 'main, body',
    },
  ],

  outputPath: './output/bonuses.json',
  requestDelayMs: 2000,
};