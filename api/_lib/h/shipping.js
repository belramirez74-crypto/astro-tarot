// Cotiza el envío por código postal (solo para mostrar en el carrito; el cobro lo recalcula store-checkout).
const { handlePreflight, reply } = require('../http.js');
const { quoteShipping } = require('../store.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  const q = req.query || {};
  const price = quoteShipping(q.zip, Number(q.sub) || 0);
  if (price === null) return reply(res, 200, c.headers, { ok: false });
  return reply(res, 200, c.headers, { ok: true, price: price });
};
