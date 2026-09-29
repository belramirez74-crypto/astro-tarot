// Netlify Function: genera la lectura de tarot paga (completa o por categoría).
// Requiere un token de pago válido emitido por verify-payment.js tras aprobar el pago en Mercado Pago.
const { generateText } = require('./_lib/ai.js');
const { verifyToken } = require('./_lib/paytoken.js');
const { consumeTiradaQuota } = require('./_lib/plan.js');

const MAX_BODY = 6000;
const MAX_CARDS = 10;

const CATEGORY_FOCUS = {
  full: 'una lectura general y completa de su momento de vida, integrando todas las cartas en un relato coherente',
  amor: 'el amor, sus vínculos y su vida afectiva; enfocate solo en eso, sin desviarte a trabajo o dinero salvo que una carta lo pida explícitamente',
  finanzas: 'el dinero, el trabajo material y la prosperidad; enfocate solo en eso',
  profesion: 'la vocación, la carrera y los proyectos profesionales; enfocate solo en eso',
  familia: 'la familia, el hogar y los vínculos cercanos; enfocate solo en eso'
};

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
  if (!event.body || event.body.length > MAX_BODY) return reply(400, c.headers, { error: 'datos inválidos' });

  let data;
  try { data = JSON.parse(event.body); } catch (e) { return reply(400, c.headers, { error: 'JSON inválido' }); }
  const item = CATEGORY_FOCUS[data.item] ? data.item : null;
  if (!item) return reply(400, c.headers, { error: 'ítem inválido' });

  // Se acepta un pago único ya confirmado (token) o, si el usuario está logueado y suscripto,
  // un cupo de su plan mensual (4 tiradas pagas por mes, se descuenta acá mismo).
  var payload = verifyToken(data.token, item);
  if (!payload) {
    var authHeader = (event.headers || {}).authorization || (event.headers || {}).Authorization || '';
    var jwt = authHeader.replace(/^Bearer\s+/i, '');
    var plan = jwt ? await consumeTiradaQuota(jwt).catch(function () { return null; }) : null;
    if (!plan) return reply(402, c.headers, { error: 'Esta lectura requiere un pago válido o el plan mensual.' });
    if (!plan.quotaLeft) return reply(402, c.headers, { error: 'Ya usaste tus 4 tiradas del plan este mes. Podés pagar esta lectura por separado.' });
  }

  const cards = Array.isArray(data.cards) ? data.cards.slice(0, MAX_CARDS) : [];
  if (!cards.length) return reply(400, c.headers, { error: 'faltan cartas' });

  const lines = cards.map(function(cd, i) {
    return (i + 1) + '. ' + String(cd.position).slice(0, 40) + ': ' + String(cd.name).slice(0, 40) +
      (cd.reversed ? ' (invertida)' : ' (al derecho)') + ' — significado de referencia: ' + String(cd.meaning || '').slice(0, 400);
  });

  const SYSTEM = 'Sos un tarotista profesional que lee el mazo Rider-Waite-Smith y escribe en español rioplatense, con calidez y precisión simbólica. ' +
    'Vas a recibir una tirada real ya hecha (no inventes cartas nuevas ni cambies el orden al derecho/invertido) y tenés que escribir una lectura profunda, ' +
    'conectando las cartas entre sí como un relato con sentido, no como una lista de significados sueltos. ' +
    'El foco de esta lectura es ' + CATEGORY_FOCUS[item] + '. ' +
    'Usá subtítulos ## por carta y cerrá con ## Mensaje central, una síntesis breve y un consejo concreto y accionable. ' +
    'Tono cálido, honesto y empoderador; nunca fatalista, y sin dar diagnósticos médicos, legales o financieros concretos. ' +
    'Aclarás una sola vez, al final, que es una guía de autoconocimiento y no una certeza sobre el futuro.';

  const prompt = 'Tirada (' + cards.length + ' cartas):\n' + lines.join('\n');

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
