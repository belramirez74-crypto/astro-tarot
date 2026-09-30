// Confirma un pago de Mercado Pago y, si está aprobado, entrega un token firmado (HMAC) que
// desbloquea esa lectura en el navegador. PAYMENT_SECRET y MP_ACCESS_TOKEN son variables de entorno.
const crypto = require('crypto');
const { handlePreflight, reply } = require('./_lib/http.js');

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', process.env.PAYMENT_SECRET).update(body).digest('base64url');
  return body + '.' + mac;
}

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  if (!process.env.MP_ACCESS_TOKEN || !process.env.PAYMENT_SECRET) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const q = req.query || {};
  const paymentId = q.payment_id;
  const ref = q.ref;
  if ((!paymentId || !/^\d+$/.test(paymentId)) && !ref) return reply(res, 400, c.headers, { error: 'payment_id o ref inválido' });
  if (ref && !/^[a-z]+:[a-f0-9]{16}$/.test(ref)) return reply(res, 400, c.headers, { error: 'ref inválido' });

  function ok(externalRef) {
    const item = String(externalRef || '').split(':')[0];
    if (!item) return reply(res, 502, c.headers, { error: 'Pago sin referencia de ítem' });
    const token = sign({ item: item, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 });
    return reply(res, 200, c.headers, { approved: true, item: item, token: token });
  }

  try {
    if (ref) {
      const mpRes = await fetch('https://api.mercadopago.com/v1/payments/search?external_reference=' + encodeURIComponent(ref) +
        '&sort=date_created&criteria=desc&limit=1', { headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
      const out = await mpRes.json();
      if (!mpRes.ok) return reply(res, 502, c.headers, { error: 'No se pudo verificar el pago' });
      const p = (out.results || [])[0];
      if (!p) return reply(res, 200, c.headers, { approved: false, status: 'pending' });
      if (p.status !== 'approved') return reply(res, 200, c.headers, { approved: false, status: p.status });
      return ok(p.external_reference);
    }
    const mpRes2 = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
      headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    const out2 = await mpRes2.json();
    if (!mpRes2.ok) return reply(res, 502, c.headers, { error: 'No se pudo verificar el pago' });
    if (out2.status !== 'approved') return reply(res, 200, c.headers, { approved: false, status: out2.status });
    return ok(out2.external_reference);
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
