// Netlify Function: confirma un pago de Mercado Pago y, si está aprobado,
// entrega un token firmado (HMAC) que desbloquea esa lectura en el navegador.
// PAYMENT_SECRET y MP_ACCESS_TOKEN viven solo como variables de entorno.

const crypto = require('crypto');

function cors(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  const host = h.host || h.Host || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  const ok = !origin || origin.replace(/^https?:\/\//, '') === host || allowed.indexOf(origin) !== -1 ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = { 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
  if (origin && ok) headers['Access-Control-Allow-Origin'] = origin;
  return { headers: headers, ok: ok };
}

function reply(status, headers, obj) {
  return { statusCode: status, headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: JSON.stringify(obj) };
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', process.env.PAYMENT_SECRET).update(body).digest('base64url');
  return body + '.' + mac;
}

exports.handler = async (event) => {
  const c = cors(event);
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: c.headers, body: '' };
  if (!c.ok) return reply(403, c.headers, { error: 'origen no permitido' });
  if (!process.env.MP_ACCESS_TOKEN || !process.env.PAYMENT_SECRET) return reply(500, c.headers, { error: 'Pagos no configurados' });

  const q = event.queryStringParameters || {};
  const paymentId = q.payment_id;
  const ref = q.ref;
  if ((!paymentId || !/^\d+$/.test(paymentId)) && !ref) return reply(400, c.headers, { error: 'payment_id o ref inválido' });
  if (ref && !/^[a-z]+:[a-f0-9]{16}$/.test(ref)) return reply(400, c.headers, { error: 'ref inválido' });

  function ok(externalRef) {
    // external_reference tiene forma "item:nonce"; el token solo guarda el item.
    const item = String(externalRef || '').split(':')[0];
    if (!item) return reply(502, c.headers, { error: 'Pago sin referencia de ítem' });
    const token = sign({ item: item, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 });
    return reply(200, c.headers, { approved: true, item: item, token: token });
  }

  try {
    if (ref) {
      // Vuelta desde la app de Mercado Pago: no hay payment_id en la URL, se busca por referencia.
      const res = await fetch('https://api.mercadopago.com/v1/payments/search?external_reference=' + encodeURIComponent(ref) +
        '&sort=date_created&criteria=desc&limit=1', { headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
      const out = await res.json();
      if (!res.ok) return reply(502, c.headers, { error: 'No se pudo verificar el pago' });
      const p = (out.results || [])[0];
      if (!p) return reply(200, c.headers, { approved: false, status: 'pending' });
      if (p.status !== 'approved') return reply(200, c.headers, { approved: false, status: p.status });
      return ok(p.external_reference);
    }
    const res = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
      headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    const out = await res.json();
    if (!res.ok) return reply(502, c.headers, { error: 'No se pudo verificar el pago' });
    if (out.status !== 'approved') return reply(200, c.headers, { approved: false, status: out.status });
    return ok(out.external_reference);
  } catch (err) {
    return reply(500, c.headers, { error: 'error interno' });
  }
};
