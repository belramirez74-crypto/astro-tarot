// Netlify Function: crea una preferencia de pago en Mercado Pago para desbloquear
// la lectura de tarot completa o una lectura por categoría.
// MP_ACCESS_TOKEN vive solo como variable de entorno (Credenciales de producción o de prueba
// en https://www.mercadopago.com.ar/developers/panel/app).

const ITEMS = {
  full: { title: 'Lectura de Tarot completa (7 cartas)', envPrice: 'MP_PRICE_FULL', fallback: 1500 },
  amor: { title: 'Lectura de Tarot — Amor y relaciones', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 },
  finanzas: { title: 'Lectura de Tarot — Finanzas y dinero', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 },
  profesion: { title: 'Lectura de Tarot — Profesión y trabajo', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 },
  familia: { title: 'Lectura de Tarot — Familia y hogar', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 }
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
  return { headers: headers, ok: ok, origin: origin };
}

function reply(status, headers, obj) {
  return { statusCode: status, headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(obj) };
}

exports.handler = async (event) => {
  const c = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: c.headers, body: '' };
  if (!c.ok) return reply(403, c.headers, { error: 'origen no permitido' });
  if (event.httpMethod !== 'POST') return reply(405, c.headers, { error: 'método no permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return reply(500, c.headers, { error: 'Pagos no configurados' });

  let data;
  try { data = JSON.parse(event.body || '{}'); } catch (e) { return reply(400, c.headers, { error: 'JSON inválido' }); }
  const item = ITEMS[data.item];
  if (!item) return reply(400, c.headers, { error: 'ítem inválido' });

  const price = Number(process.env[item.envPrice]) || item.fallback;
  const site = c.origin || ('https://' + ((event.headers || {}).host || ''));

  try {
    // auto_return exige que back_urls.success sea una URL pública; en localhost, Mercado Pago
    // no puede validarla, así que se omite ahí (el usuario igual puede volver manualmente).
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(site);
    const body = {
      items: [{ title: item.title, quantity: 1, currency_id: 'ARS', unit_price: price }],
      back_urls: {
        success: site + '/?pago=exito&item=' + encodeURIComponent(data.item),
        failure: site + '/?pago=error',
        pending: site + '/?pago=pendiente'
      },
      external_reference: data.item,
      statement_descriptor: 'ASTRO TAROT'
    };
    if (!isLocal) body.auto_return = 'approved';
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + process.env.MP_ACCESS_TOKEN },
      body: JSON.stringify(body)
    });
    const out = await res.json();
    if (!res.ok) {
      console.error('MP error', res.status, JSON.stringify(out).slice(0, 300));
      return reply(502, c.headers, { error: 'No se pudo iniciar el pago' });
    }
    return reply(200, c.headers, { url: out.init_point || out.sandbox_init_point });
  } catch (err) {
    return reply(500, c.headers, { error: 'error interno' });
  }
};
