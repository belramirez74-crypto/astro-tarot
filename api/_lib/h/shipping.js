// Cotiza el envío por código postal y carrito (solo para mostrar; el cobro lo recalcula store-checkout).
const { handlePreflight, reply } = require('../http.js');
const { quoteOptions, fetchProducts } = require('../store.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  const q = req.query || {};
  try {
    // cart = "id:cantidad,id:cantidad"
    const cart = String(q.cart || '').split(',').map(function (x) { const p = x.split(':'); return { id: p[0], qty: Math.max(1, Math.min(20, Math.floor(Number(p[1])) || 1)) }; })
      .filter(function (x) { return /^[0-9a-f-]{36}$/.test(x.id); }).slice(0, 20);
    const rows = cart.length ? await fetchProducts(cart.map(function (x) { return x.id; })) : [];
    const items = cart.map(function (x) { const p = rows.filter(function (r) { return r.id === x.id; })[0] || {}; return Object.assign({}, p, { qty: x.qty }); });
    const out = await quoteOptions(q.zip, items, Number(q.sub) || 0);
    if (!out.ok) return reply(res, 200, c.headers, { ok: false });
    return reply(res, 200, c.headers, { ok: true, options: out.options, price: out.options[0].price });
  } catch (e) { return reply(res, 500, c.headers, { error: 'error interno' }); }
};
