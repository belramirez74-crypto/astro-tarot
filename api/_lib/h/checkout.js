// Crea el pedido de la tienda y la preferencia de pago de Mercado Pago.
// Los precios y el stock se leen de la base: del navegador solo llegan ids y cantidades.
const crypto = require('crypto');
const { handlePreflight, reply, parseBody } = require('../http.js');
const { sbHeaders, base, quoteShipping } = require('../store.js');

function clean(v, max) { return String(v == null ? '' : v).trim().slice(0, max); }

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });
  if (!process.env.MP_ACCESS_TOKEN || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const data = parseBody(req);
  if (!data || !Array.isArray(data.items) || !data.items.length || data.items.length > 20) return reply(res, 400, c.headers, { error: 'Carrito inválido' });

  const b = data.buyer || {};
  const buyer = {
    name: clean(b.name, 100), email: clean(b.email, 120).toLowerCase(), phone: clean(b.phone, 40),
    address: clean(b.address, 160), city: clean(b.city, 80), province: clean(b.province, 60), zip: clean(b.zip, 12), notes: clean(b.notes, 300)
  };
  const pickup = data.delivery === 'pickup';
  buyer.delivery = pickup ? 'pickup' : 'shipping';
  if (!buyer.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(buyer.email) || !buyer.phone) {
    return reply(res, 400, c.headers, { error: 'Completá tu nombre, email y teléfono.' });
  }
  if (!pickup && (!buyer.address || !buyer.city || !buyer.province || !buyer.zip)) {
    return reply(res, 400, c.headers, { error: 'Completá tu dirección de envío.' });
  }

  // Cantidades por producto (se juntan repetidos)
  const qtys = {};
  for (const it of data.items) {
    const q = Math.floor(Number(it.qty));
    if (!/^[0-9a-f-]{36}$/.test(String(it.id)) || !(q >= 1 && q <= 20)) return reply(res, 400, c.headers, { error: 'Carrito inválido' });
    qtys[it.id] = Math.min(20, (qtys[it.id] || 0) + q);
  }
  const ids = Object.keys(qtys);

  try {
    const r = await fetch(base() + '/products?select=id,name,price,stock,active&id=in.(' + ids.join(',') + ')', { headers: sbHeaders() });
    const rows = r.ok ? await r.json() : [];
    const items = [];
    for (const id of ids) {
      const p = rows.filter(function (x) { return x.id === id; })[0];
      if (!p || !p.active) return reply(res, 409, c.headers, { error: 'Un producto del carrito ya no está disponible. Actualizá el carrito.' });
      if (p.stock < qtys[id]) return reply(res, 409, c.headers, { error: 'No hay stock suficiente de "' + p.name + '" (quedan ' + p.stock + ').' });
      items.push({ id: id, name: p.name, qty: qtys[id], price: Number(p.price) });
    }
    const subtotal = items.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    let shipping = 0;
    if (!pickup) {
      shipping = quoteShipping(buyer.zip, subtotal);
      if (shipping === null) return reply(res, 400, c.headers, { error: 'No pudimos calcular el envío para ese código postal. Revisalo o elegí retiro.' });
    }
    const total = subtotal + shipping;
    if (!(total > 0)) return reply(res, 400, c.headers, { error: 'Carrito inválido' });

    const ref = 'order:' + crypto.randomBytes(8).toString('hex');
    const ins = await fetch(base() + '/orders', {
      method: 'POST', headers: sbHeaders({ prefer: 'return=minimal' }),
      body: JSON.stringify({ ref: ref, items: items, subtotal: subtotal, shipping: shipping, total: total, buyer: buyer, status: 'pending' })
    });
    if (!ins.ok) return reply(res, 502, c.headers, { error: 'No se pudo crear el pedido. Intentá de nuevo.' });

    const site = c.origin || ('https://' + ((req.headers || {}).host || ''));
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(site);
    const mpItems = items.map(function (i) { return { title: i.name.slice(0, 120), quantity: i.qty, currency_id: 'ARS', unit_price: i.price }; });
    if (shipping > 0) mpItems.push({ title: 'Envío', quantity: 1, currency_id: 'ARS', unit_price: shipping });
    const body = {
      items: mpItems,
      payer: { name: buyer.name, email: buyer.email },
      back_urls: {
        success: site + '/tienda/?pago=exito&ref=' + ref,
        failure: site + '/tienda/?pago=error',
        pending: site + '/tienda/?pago=pendiente&ref=' + ref
      },
      external_reference: ref
    };
    if (!isLocal) { body.auto_return = 'approved'; body.notification_url = site + '/api/store-webhook'; }
    const mp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }, body: JSON.stringify(body)
    });
    const out = await mp.json();
    if (!mp.ok) { console.error('MP store error', mp.status, JSON.stringify(out).slice(0, 300)); return reply(res, 502, c.headers, { error: 'No se pudo iniciar el pago' }); }
    return reply(res, 200, c.headers, { url: out.init_point, ref: ref });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
