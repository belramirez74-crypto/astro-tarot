// Netlify Function: informe extenso de compatibilidad (sinastría), que analiza cómo se
// conjugan dos cartas natales completas. Parte del plan mensual: requiere el JWT de sesión
// de Supabase y que esa cuenta tenga plan_active=true (ver _lib/plan.js).
const { generateText } = require('./_lib/ai.js');
const { requirePlan } = require('./_lib/plan.js');

const MAX_BODY = 20000;

const SYSTEM = 'Sos un astrólogo especializado en sinastría (compatibilidad entre dos cartas natales) que escribe en ' +
  'español rioplatense, con calidez, honestidad y precisión simbólica. Vas a recibir las posiciones completas de dos ' +
  'cartas natales (Persona 1 y Persona 2) y los aspectos reales entre ambas. Tu trabajo es explicar CÓMO SE CONJUGAN ' +
  'esas dos cartas entre sí, no describir a cada persona por separado. Usá SOLO los datos provistos; no inventes ' +
  'posiciones ni aspectos que no estén en la lista. Estructura la respuesta en markdown con estos títulos ## : ' +
  'Primera impresión (Sol, Luna y Ascendente cruzados), Comunicación y forma de pensar juntos (Mercurio), ' +
  'Atracción y forma de amar (Venus y Marte cruzados), Estabilidad y compromiso (Saturno cruzado con Sol/Luna si aparece), ' +
  'Los aspectos más fuertes de esta relación (elegí los 5-6 de menor orbe y explicá qué generan entre los dos), ' +
  'Desafíos a trabajar, Síntesis final con un consejo concreto para la pareja. ' +
  'Tono cálido y realista, nunca fatalista, sin garantizar el futuro de la relación ni dar diagnósticos. ' +
  'Aclarás una sola vez, al final, que es una guía de autoconocimiento, no una certeza.';

function cors(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  const host = h.host || h.Host || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const ok = !origin || origin.replace(/^https?:\/\//, '') === host || allowed.indexOf(origin) !== -1 ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Vary': 'Origin' };
  if (origin && ok) headers['Access-Control-Allow-Origin'] = origin;
  return { headers: headers, ok: ok };
}

function reply(status, headers, obj) {
  return { statusCode: status, headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(obj) };
}

function planetLines(label, planets) {
  return planets.slice(0, 13).map(function (p) {
    return '- ' + label + ' ' + String(p.name).slice(0, 20) + ' en ' + String(p.sign).slice(0, 20) +
      ', casa ' + Number(p.house) + (p.retro ? ' (retrógrado)' : '');
  }).join('\n');
}

exports.handler = async (event) => {
  const c = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: c.headers, body: '' };
  if (!c.ok) return reply(403, c.headers, { error: 'origen no permitido' });
  if (event.httpMethod !== 'POST') return reply(405, c.headers, { error: 'método no permitido' });
  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) return reply(500, c.headers, { error: 'API de IA no configurada' });
  if (!event.body || event.body.length > MAX_BODY) return reply(400, c.headers, { error: 'datos inválidos' });

  const authHeader = (event.headers || {}).authorization || (event.headers || {}).Authorization || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  const plan = jwt ? await requirePlan(jwt).catch(function () { return null; }) : null;
  if (!plan) return reply(402, c.headers, { error: 'El informe extenso de compatibilidad es parte del plan mensual. Suscribite para acceder.' });

  let data;
  try { data = JSON.parse(event.body); } catch (e) { return reply(400, c.headers, { error: 'JSON inválido' }); }
  const p1 = Array.isArray(data.p1) ? data.p1 : [];
  const p2 = Array.isArray(data.p2) ? data.p2 : [];
  const aspects = Array.isArray(data.aspects) ? data.aspects.slice(0, 80) : [];
  if (!p1.length || !p2.length) return reply(400, c.headers, { error: 'faltan las cartas natales' });

  const asp = aspects.map(function (a) {
    return '- Persona 1: ' + String(a.a).slice(0, 20) + ' ' + String(a.type).slice(0, 20) + ' Persona 2: ' + String(a.b).slice(0, 20) +
      ' (orbe ' + Number(a.orb).toFixed(1) + '°)';
  });

  const prompt = 'Carta de Persona 1:\n' + planetLines('P1', p1) + '\n\nCarta de Persona 2:\n' + planetLines('P2', p2) +
    '\n\nAspectos entre ambas cartas (Persona 1 con Persona 2):\n' + (asp.length ? asp.join('\n') : '- (sin aspectos mayores)');

  try {
    const { text, limited, configured } = await generateText(SYSTEM, prompt);
    if (!configured) return reply(500, c.headers, { error: 'API de IA no configurada' });
    if (!text && limited) return reply(429, c.headers, { error: 'Se alcanzó el límite gratuito de la IA por ahora. Probá de nuevo en unos minutos.' });
    if (!text) return reply(502, c.headers, { error: 'La IA está saturada en este momento. Probá de nuevo en unos minutos.' });
    return reply(200, c.headers, { report: text });
  } catch (err) {
    return reply(500, c.headers, { error: 'error interno' });
  }
};
