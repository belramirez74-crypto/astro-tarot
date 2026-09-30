// Informe extenso de compatibilidad (sinastría), que analiza cómo se conjugan dos cartas
// natales completas. Parte del plan mensual: requiere el JWT de sesión de Supabase y que esa
// cuenta tenga plan_active=true (ver _lib/plan.js).
const { generateText } = require('./_lib/ai.js');
const { requirePlan } = require('./_lib/plan.js');
const { handlePreflight, reply, parseBody, getAuthJwt } = require('./_lib/http.js');

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

function planetLines(label, planets) {
  return planets.slice(0, 13).map(function (p) {
    return '- ' + label + ' ' + String(p.name).slice(0, 20) + ' en ' + String(p.sign).slice(0, 20) +
      ', casa ' + Number(p.house) + (p.retro ? ' (retrógrado)' : '');
  }).join('\n');
}

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
  if (!plan) return reply(res, 402, c.headers, { error: 'El informe extenso de compatibilidad es parte del plan mensual. Suscribite para acceder.' });

  const p1 = Array.isArray(data.p1) ? data.p1 : [];
  const p2 = Array.isArray(data.p2) ? data.p2 : [];
  const aspects = Array.isArray(data.aspects) ? data.aspects.slice(0, 80) : [];
  if (!p1.length || !p2.length) return reply(res, 400, c.headers, { error: 'faltan las cartas natales' });

  const asp = aspects.map(function (a) {
    return '- Persona 1: ' + String(a.a).slice(0, 20) + ' ' + String(a.type).slice(0, 20) + ' Persona 2: ' + String(a.b).slice(0, 20) +
      ' (orbe ' + Number(a.orb).toFixed(1) + '°)';
  });

  const prompt = 'Carta de Persona 1:\n' + planetLines('P1', p1) + '\n\nCarta de Persona 2:\n' + planetLines('P2', p2) +
    '\n\nAspectos entre ambas cartas (Persona 1 con Persona 2):\n' + (asp.length ? asp.join('\n') : '- (sin aspectos mayores)');

  try {
    const { text, limited, configured } = await generateText(SYSTEM, prompt);
    if (!configured) return reply(res, 500, c.headers, { error: 'API de IA no configurada' });
    if (!text && limited) return reply(res, 429, c.headers, { error: 'Se alcanzó el límite gratuito de la IA por ahora. Probá de nuevo en unos minutos.' });
    if (!text) return reply(res, 502, c.headers, { error: 'La IA está saturada en este momento. Probá de nuevo en unos minutos.' });
    return reply(res, 200, c.headers, { report: text });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
