// Netlify Function: crea una suscripción mensual (preapproval) en Mercado Pago para el plan de Astro Tarot.
// Requiere que el usuario esté logueado (su email viaja en el body, validado contra Mercado Pago
// recién al completar el checkout; el estado real se confirma en verify-subscription.js).

function cors(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  const host = h.host || h.Host || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
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
  const email = String(data.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, c.headers, { error: 'email inválido' });

  const price = Number(process.env.MP_PRICE_PLAN) || 7500;
  const site = c.origin || ('https://' + ((event.headers || {}).host || ''));

  try {
    const res = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN },
      body: JSON.stringify({
        reason: 'Plan Astro Tarot (informe natal completo + 4 tiradas por mes + señales ilimitadas)',
        payer_email: email,
        back_url: site + '/?plan=exito',
        auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: price, currency_id: 'ARS' },
        status: 'pending'
      })
    });
    const out = await res.json();
    if (!res.ok) {
      console.error('MP preapproval error', res.status, JSON.stringify(out).slice(0, 300));
      return reply(502, c.headers, { error: 'No se pudo iniciar la suscripción' });
    }
    return reply(200, c.headers, { url: out.init_point || out.sandbox_init_point, preapprovalId: out.id });
  } catch (err) {
    return reply(500, c.headers, { error: 'error interno' });
  }
};
