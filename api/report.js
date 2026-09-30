// Genera el informe de carta natal con IA. Primero Google Gemini (GEMINI_API_KEY); si falla,
// Groq (GROQ_API_KEY) como respaldo. Requiere el plan mensual (JWT de sesión de Supabase).
const { generateText } = require('./_lib/ai.js');
const { requirePlan } = require('./_lib/plan.js');
const { handlePreflight, reply, parseBody, getAuthJwt } = require('./_lib/http.js');

const MAX_BODY = 16000;

const SYSTEM = 'Sos un astrólogo experimentado que escribe en español rioplatense, con calidez y claridad. ' +
  'Recibís los datos de una carta natal (posiciones y aspectos) y escribís un informe completo, coherente y personal. ' +
  'Usá SOLO los datos provistos; no inventes posiciones ni aspectos, y apoyate en la base interpretativa incluida sin contradecirla. Si un dato no está, no lo menciones. Estructura en markdown simple con estos títulos ## : ' +
  'Esencia (Sol, Luna, Ascendente), Mente y comunicación, Amor y vínculos, Energía y acción, Vocación y crecimiento, ' +
  'Aspectos clave (los 4-5 más relevantes y qué significan), Síntesis final. ' +
  'Tono inspirador pero realista, sin predicciones fatalistas ni afirmaciones médicas o financieras. ' +
  'Aclarás una sola vez, al final, que es una guía de autoconocimiento.';

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) return reply(res, 500, c.headers, { error: 'API de IA no configurada' });

  const data = parseBody(req);
  if (!data) return reply(res, 400, c.headers, { error: 'JSON inválido' });
  if (JSON.stringify(data).length > MAX_BODY) return reply(res, 400, c.headers, { error: 'datos inválidos' });

  const jwt = getAuthJwt(req);
  const plan = jwt ? await requirePlan(jwt).catch(function () { return null; }) : null;
  if (!plan) return reply(res, 402, c.headers, { error: 'El informe completo de carta natal es parte del plan mensual. Suscribite para acceder.' });

  const planets = Array.isArray(data.planets) ? data.planets.slice(0, 20) : [];
  const aspects = Array.isArray(data.aspects) ? data.aspects.slice(0, 60) : [];
  if (!planets.length) return reply(res, 400, c.headers, { error: 'faltan planetas' });

  const lines = planets.map(function (p) {
    return '- ' + String(p.name).slice(0, 20) + ' en ' + String(p.sign).slice(0, 20) + ' ' + String(p.degree).slice(0, 8) +
      ', casa ' + Number(p.house) + (p.retro ? ' (retrógrado)' : '');
  });
  const asp = aspects.map(function (a) {
    return '- ' + String(a.a).slice(0, 20) + ' ' + String(a.type).slice(0, 20) + ' ' + String(a.b).slice(0, 20) + ' (orbe ' + Number(a.orb).toFixed(1) + '°)';
  });
  const facts = Array.isArray(data.facts) ? data.facts.slice(0, 60).map(function (f) { return '- ' + String(f).slice(0, 400); }) : [];
  const prompt = 'Posiciones:\n' + lines.join('\n') + '\n\nAspectos:\n' + (asp.length ? asp.join('\n') : '- (sin aspectos mayores)') +
    (facts.length ? '\n\nBase interpretativa (guía verificada):\n' + facts.join('\n') : '') + (data.timeUnknown ? '\n\nNota: la hora de nacimiento es desconocida; las casas y el Ascendente son aproximados.' : '');

  try {
    const { text, limited, configured } = await generateText(SYSTEM, prompt);
    if (!configured) return reply(res, 500, c.headers, { error: 'API de IA no configurada' });
    if (!text && limited) return reply(res, 429, c.headers, { error: 'Se alcanzó el límite gratuito de la IA por ahora. Probá más tarde; la lectura por reglas sigue disponible.' });
    if (!text) return reply(res, 502, c.headers, { error: 'La IA está saturada en este momento. Probá de nuevo en unos minutos; la lectura por reglas sigue disponible.' });
    return reply(res, 200, c.headers, { report: text });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
