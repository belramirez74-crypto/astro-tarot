// Netlify Function: confirma el estado de una suscripción (preapproval) de Mercado Pago.
// El cliente, ya logueado, es quien actualiza su propio perfil (plan_active, etc.) usando esta
// respuesta; acá solo se consulta a Mercado Pago, nunca se toca la base de datos directamente.

function cors(event) {
  const h = event.headers || {};
  const origin = h.origin || h.Origin || '';
  const host = h.host || h.Host || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const ok = !origin || origin.replace(/^https?:\/\//, '') === host || allowed.indexOf(origin) !== -1 ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = { 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
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
  if (!process.env.MP_ACCESS_TOKEN) return reply(500, c.headers, { error: 'Pagos no configurados' });

  const id = (event.queryStringParameters || {}).preapproval_id;
  if (!id) return reply(400, c.headers, { error: 'preapproval_id inválido' });

  try {
    const res = await fetch('https://api.mercadopago.com/preapproval/' + encodeURIComponent(id), {
      headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    const out = await res.json();
    if (!res.ok) return reply(502, c.headers, { error: 'No se pudo verificar la suscripción' });
    return reply(200, c.headers, { active: out.status === 'authorized', status: out.status, preapprovalId: id });
  } catch (err) {
    return reply(500, c.headers, { error: 'error interno' });
  }
};
