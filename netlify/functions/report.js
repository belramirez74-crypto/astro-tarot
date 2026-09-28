// Netlify Function: genera el informe de carta natal con IA gratuita.
// Primero Google Gemini (GEMINI_API_KEY); si falla, Groq (GROQ_API_KEY) como respaldo.
// Las claves viven solo como variables de entorno.

const { generateText } = require('./_lib/ai.js');
const MAX_BODY = 16000;

const SYSTEM = 'Sos un astrólogo experimentado que escribe en español rioplatense, con calidez y claridad. ' +
  'Recibís los datos de una carta natal (posiciones y aspectos) y escribís un informe completo, coherente y personal. ' +
  'Usá SOLO los datos provistos; no inventes posiciones ni aspectos, y apoyate en la base interpretativa incluida sin contradecirla. Si un dato no está, no lo menciones. Estructura en markdown simple con estos títulos ## : ' +
  'Esencia (Sol, Luna, Ascendente), Mente y comunicación, Amor y vínculos, Energía y acción, Vocación y crecimiento, ' +
  'Aspectos clave (los 4-5 más relevantes y qué significan), Síntesis final. ' +
  'Tono inspirador pero realista, sin predicciones fatalistas ni afirmaciones médicas o financieras. ' +
  'Aclarás una sola vez, al final, que es una guía de autoconocimiento.';

function cors(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  const host = h.host || h.Host || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  const ok = !origin || origin.replace(/^https?:\/\//, '') === host || allowed.indexOf(origin) !== -1 ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
  if (origin && ok) headers['Access-Control-Allow-Origin'] = origin;
  return { headers: headers, ok: ok };
}

function reply(status, headers, obj) {
  return { statusCode: status, headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  const c = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: c.headers, body: '' };
  if (!c.ok) return reply(403, c.headers, { error: 'origen no permitido' });
  if (event.httpMethod !== 'POST') return reply(405, c.headers, { error: 'método no permitido' });
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) return reply(500, c.headers, { error: 'API de IA no configurada' });
  if (!event.body || event.body.length > MAX_BODY) return reply(400, c.headers, { error: 'datos inválidos' });

  let data;
  try { data = JSON.parse(event.body); } catch (e) { return reply(400, c.headers, { error: 'JSON inválido' }); }
  const planets = Array.isArray(data.planets) ? data.planets.slice(0, 20) : [];
  const aspects = Array.isArray(data.aspects) ? data.aspects.slice(0, 60) : [];
  if (!planets.length) return reply(400, c.headers, { error: 'faltan planetas' });

  const lines = planets.map(function(p) {
    return '- ' + String(p.name).slice(0, 20) + ' en ' + String(p.sign).slice(0, 20) + ' ' + String(p.degree).slice(0, 8) +
      ', casa ' + Number(p.house) + (p.retro ? ' (retrógrado)' : '');
  });
  const asp = aspects.map(function(a) {
    return '- ' + String(a.a).slice(0, 20) + ' ' + String(a.type).slice(0, 20) + ' ' + String(a.b).slice(0, 20) + ' (orbe ' + Number(a.orb).toFixed(1) + '°)';
  });
  const facts = Array.isArray(data.facts) ? data.facts.slice(0, 60).map(function(f) { return '- ' + String(f).slice(0, 400); }) : [];
  const prompt = 'Posiciones:\n' + lines.join('\n') + '\n\nAspectos:\n' + (asp.length ? asp.join('\n') : '- (sin aspectos mayores)') +
    (facts.length ? '\n\nBase interpretativa (guía verificada):\n' + facts.join('\n') : '') +(data.timeUnknown ? '\n\nNota: la hora de nacimiento es desconocida; las casas y el Ascendente son aproximados.' : '');

  try {
    const { text, limited, configured } = await generateText(SYSTEM, prompt);
    if (!configured) return reply(500, c.headers, { error: 'API de IA no configurada' });
    if (!text && limited) return reply(429, c.headers, { error: 'Se alcanzó el límite gratuito de la IA por ahora. Probá más tarde; la lectura por reglas sigue disponible.' });
    if (!text) return reply(502, c.headers, { error: 'La IA está saturada en este momento. Probá de nuevo en unos minutos; la lectura por reglas sigue disponible.' });
    return reply(200, c.headers, { report: text });
  } catch (err) {
    return reply(500, c.headers, { error: 'error interno' });
  }
};
