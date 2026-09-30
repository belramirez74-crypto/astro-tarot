// Crea una suscripción mensual (preapproval) en Mercado Pago para el plan de Astro Tarot.
// Requiere que el usuario esté logueado (su email viaja en el body, validado contra Mercado Pago
// recién al completar el checkout; el estado real se confirma en verify-subscription.js).
const { handlePreflight, reply, parseBody } = require('./_lib/http.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const data = parseBody(req);
  if (!data) return reply(res, 400, c.headers, { error: 'JSON inválido' });
  const email = String(data.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(res, 400, c.headers, { error: 'email inválido' });

  const price = Number(process.env.MP_PRICE_PLAN) || 7500;
  const site = c.origin || ('https://' + ((req.headers || {}).host || ''));

  try {
    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
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
    const out = await mpRes.json();
    if (!mpRes.ok) {
      console.error('MP preapproval error', mpRes.status, JSON.stringify(out).slice(0, 300));
      return reply(res, 502, c.headers, { error: 'No se pudo iniciar la suscripción' });
    }
    return reply(res, 200, c.headers, { url: out.init_point || out.sandbox_init_point, preapprovalId: out.id });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
