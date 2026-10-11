const fs = require('fs');
const key = (fs.readFileSync('.env.local', 'utf8').match(/AI_API_KEY=(.+)/) || [])[1];
const models = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite'
];

(async () => {
  for (const model of models) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello in one sentence.' }] }] })
        }
      );
      const text = await r.text();
      console.log(model, 'status', r.status);
      console.log(text.slice(0, 400));
      if (r.ok) break;
    } catch (e) {
      console.log(model, 'ERROR', e.message);
    }
  }
})();
