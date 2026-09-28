// Llama a Gemini y, si falla, a Groq como respaldo. Compartido por report.js y tarot-report.js.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'];
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

// Devuelve { text, limited }. text === '' si ningún proveedor respondió.
async function generateText(system, prompt) {
  const start = Date.now();
  const hasGroq = !!process.env.GROQ_API_KEY;
  let limited = false;
  let text = '';

  if (process.env.GEMINI_API_KEY) {
    const gBody = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 2500 }
    });
    const models = [MODEL].concat(FALLBACK_MODELS.filter(function(m) { return m !== MODEL; }));
    const gDeadline = start + (hasGroq ? 11000 : 21000);
    for (let i = 0; i < models.length && !text; i++) {
      if (Date.now() > gDeadline) break;
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + models[i] + ':generateContent', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: gBody,
        signal: AbortSignal.timeout(Math.max(2500, Math.min(6000, gDeadline - Date.now())))
      }).catch(function() { return null; });
      if (!res) continue;
      const out = await res.json().catch(function() { return {}; });
      if (res.ok) {
        const cand = (out.candidates || [])[0];
        text = cand && cand.content && cand.content.parts ? cand.content.parts.map(function(q) { return q.text || ''; }).join('\n') : '';
        continue;
      }
      console.error('Gemini error', models[i], res.status, JSON.stringify(out).slice(0, 200));
      if (res.status === 429) limited = true;
      if ([404, 429, 500, 503].indexOf(res.status) === -1) break;
    }
  }

  if (!text && hasGroq) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({
        model: GROQ_MODEL, temperature: 0.5, max_tokens: 2500,
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(Math.max(4000, 24000 - (Date.now() - start)))
    }).catch(function() { return null; });
    if (res) {
      const out = await res.json().catch(function() { return {}; });
      if (res.ok) {
        text = (out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content) || '';
      } else {
        console.error('Groq error', res.status, JSON.stringify(out).slice(0, 200));
        if (res.status === 429) limited = true;
      }
    }
  }

  return { text: text, limited: limited, configured: !!process.env.GEMINI_API_KEY || hasGroq };
}

module.exports = { generateText: generateText };
