// Genera la lectura de tarot paga (completa o por categoría). Acepta un token de pago único
// (verify-payment.js) o, si el usuario está logueado y suscripto, un cupo de su plan mensual.
const { generateText } = require('./_lib/ai.js');
const { verifyToken } = require('./_lib/paytoken.js');
const { consumeTiradaQuota } = require('./_lib/plan.js');
const { handlePreflight, reply, parseBody, getAuthJwt } = require('./_lib/http.js');

const MAX_BODY = 6000;
const MAX_CARDS = 10;

const CATEGORY_FOCUS = {
  full: 'una lectura general y completa de su momento de vida, integrando todas las cartas en un relato coherente',
  amor: 'el amor, sus vínculos y su vida afectiva; enfocate solo en eso, sin desviarte a trabajo o dinero salvo que una carta lo pida explícitamente',
  finanzas: 'el dinero, el trabajo material y la prosperidad; enfocate solo en eso',
  profesion: 'la vocación, la carrera y los proyectos profesionales; enfocate solo en eso',
  familia: 'la familia, el hogar y los vínculos cercanos; enfocate solo en eso'
};

// Registra el pago como usado (tabla used_payments). Devuelve 'ok', 'used' o 'error' (si la tabla
// no existe o falla, no se bloquea al cliente que pagó).
async function claimPayment(ref) {
  const url = process.env.SUPABASE_URL, sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sk) return 'error';
  try {
    const r = await fetch(url + '/rest/v1/used_payments', {
      method: 'POST',
      headers: { apikey: sk, authorization: 'Bearer ' + sk, 'content-type': 'application/json', prefer: 'return=minimal' },
      body: JSON.stringify({ ref: ref })
    });
    if (r.ok) return 'ok';
    return r.status === 409 ? 'used' : 'error';
  } catch (e) { return 'error'; }
}
async function releasePayment(ref) {
  const url = process.env.SUPABASE_URL, sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try { await fetch(url + '/rest/v1/used_payments?ref=eq.' + encodeURIComponent(ref), { method: 'DELETE', headers: { apikey: sk, authorization: 'Bearer ' + sk } }); } catch (e) {}
}

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });

  const data = parseBody(req);
  if (!data) return reply(res, 400, c.headers, { error: 'JSON inválido' });
  if (JSON.stringify(data).length > MAX_BODY) return reply(res, 400, c.headers, { error: 'datos inválidos' });
  const item = CATEGORY_FOCUS[data.item] ? data.item : null;
  if (!item) return reply(res, 400, c.headers, { error: 'ítem inválido' });

  // Se acepta un pago único ya confirmado (token) o, si el usuario está logueado y suscripto,
  // un cupo de su plan mensual (4 tiradas pagas por mes, se descuenta acá mismo).
  const payload = verifyToken(data.token, item);
  let usedRef = null;
  if (payload && payload.ref) {
    // Un pago, una lectura: se anota el pago como usado; si ya estaba anotado, se rechaza.
    const claim = await claimPayment(payload.ref);
    if (claim === 'used') return reply(res, 402, c.headers, { error: 'Este pago ya se usó para una lectura. Para otra tirada hay que pagar de nuevo.' });
    if (claim === 'ok') usedRef = payload.ref;
  }
  if (!payload) {
    const jwt = getAuthJwt(req);
    // El cupo del plan cubre solo la tirada general; las categorías se pagan aparte.
    const plan = (jwt && item === 'full') ? await consumeTiradaQuota(jwt).catch(function () { return null; }) : null;
    if (!plan) return reply(res, 402, c.headers, { error: 'Esta lectura requiere un pago.' });
    if (!plan.quotaLeft) return reply(res, 402, c.headers, { error: 'Ya usaste tus 4 tiradas generales de este mes. Se renuevan el mes próximo; mientras tanto podés pagar una lectura por categoría.' });
  }

  const cards = Array.isArray(data.cards) ? data.cards.slice(0, MAX_CARDS) : [];
  if (!cards.length) return reply(res, 400, c.headers, { error: 'faltan cartas' });

  const lines = cards.map(function (cd, i) {
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
    if (!configured) { if (usedRef) await releasePayment(usedRef); return reply(res, 500, c.headers, { error: 'API de IA no configurada' }); }
    if (!text && usedRef) await releasePayment(usedRef);
    if (!text && limited) return reply(res, 429, c.headers, { error: 'Se alcanzó el límite gratuito de la IA por ahora. Probá de nuevo en unos minutos.' });
    if (!text) return reply(res, 502, c.headers, { error: 'La IA está saturada en este momento. Probá de nuevo en unos minutos.' });
    return reply(res, 200, c.headers, { report: text });
  } catch (err) {
    if (usedRef) await releasePayment(usedRef);
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
