// Crea una preferencia de pago en Mercado Pago para desbloquear la lectura de tarot completa
// o una lectura por categoría. MP_ACCESS_TOKEN vive solo como variable de entorno.
const { handlePreflight, reply, parseBody } = require('./_lib/http.js');

const ITEMS = {
  full: { title: 'Lectura de Tarot completa (7 cartas)', envPrice: 'MP_PRICE_FULL', fallback: 1500 },
  amor: { title: 'Lectura de Tarot — Amor y relaciones', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 },
  finanzas: { title: 'Lectura de Tarot — Finanzas y dinero', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 },
  profesion: { title: 'Lectura de Tarot — Profesión y trabajo', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 },
  familia: { title: 'Lectura de Tarot — Familia y hogar', envPrice: 'MP_PRICE_CATEGORY', fallback: 1200 }
};

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const data = parseBody(req);
  if (!data) return reply(res, 400, c.headers, { error: 'JSON inválido' });
  const item = ITEMS[data.item];
  if (!item) return reply(res, 400, c.headers, { error: 'ítem inválido' });

  // Promo puntual: lectura por categoría con descuento real. El monto lo define el servidor
  // (nunca el cliente), así que lo peor que puede pasar es que alguien pida el precio promo
  // sin haber visto el cartel — no hay forma de fijar un monto arbitrario desde el navegador.
  const useDiscount = !!data.discount && item.envPrice === 'MP_PRICE_CATEGORY';
  const price = useDiscount
    ? (Number(process.env.MP_PRICE_CATEGORY_DISCOUNT) || 2500)
    : (Number(process.env[item.envPrice]) || item.fallback);
  const site = c.origin || ('https://' + ((req.headers || {}).host || ''));

  try {
    // auto_return exige que back_urls.success sea una URL pública; en localhost, Mercado Pago
    // no puede validarla, así que se omite ahí (el usuario igual puede volver manualmente).
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(site);
    // ref único: cuando el pago se completa DENTRO de la app de Mercado Pago (deep link), el
    // navegador no vuelve solo a back_urls; el frontend usa este ref para preguntar "¿ya se aprobó?"
    // al volver a la pestaña, en vez de depender solo de la redirección.
    const ref = data.item + ':' + require('crypto').randomBytes(8).toString('hex');
    const body = {
      items: [{ title: item.title + (useDiscount ? ' (Promo)' : ''), quantity: 1, currency_id: 'ARS', unit_price: price }],
      back_urls: {
        success: site + '/?pago=exito&item=' + encodeURIComponent(data.item),
        failure: site + '/?pago=error',
        pending: site + '/?pago=pendiente'
      },
      external_reference: ref,
      statement_descriptor: 'ASTRO TAROT'
    };
    if (!isLocal) body.auto_return = 'approved';
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN },
      body: JSON.stringify(body)
    });
    const out = await mpRes.json();
    if (!mpRes.ok) {
      console.error('MP error', mpRes.status, JSON.stringify(out).slice(0, 300));
      return reply(res, 502, c.headers, { error: 'No se pudo iniciar el pago' });
    }
    return reply(res, 200, c.headers, { url: out.init_point || out.sandbox_init_point, preferenceId: out.id, ref: ref });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
