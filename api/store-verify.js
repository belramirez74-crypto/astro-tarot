// Confirma el pago de un pedido de la tienda (al volver de Mercado Pago). Idempotente.
const { handlePreflight, reply } = require('./_lib/http.js');
const { finalizeOrder } = require('./_lib/store.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  const ref = (req.query || {}).ref;
  if (!ref || !/^order:[a-f0-9]{16}$/.test(ref)) return reply(res, 400, c.headers, { error: 'ref inválido' });
  if (!process.env.MP_ACCESS_TOKEN || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });
  try {
    const r = await finalizeOrder(ref);
    if (!r.found) return reply(res, 404, c.headers, { error: 'Pedido no encontrado' });
    return reply(res, 200, c.headers, { paid: r.status === 'paid' || r.status === 'shipped', status: r.status });
  } catch (e) { return reply(res, 500, c.headers, { error: 'error interno' }); }
};
