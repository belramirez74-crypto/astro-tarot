// Lógica compartida de pedidos de la tienda: acceso a la base con la service_role key y
// confirmación de pago (idempotente) con descuento de stock.

function sbHeaders(extra) {
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Object.assign({ apikey: sk, authorization: 'Bearer ' + sk, 'content-type': 'application/json' }, extra || {});
}
function base() { return process.env.SUPABASE_URL + '/rest/v1'; }

async function getOrder(ref) {
  const r = await fetch(base() + '/orders?select=*&ref=eq.' + encodeURIComponent(ref), { headers: sbHeaders() });
  const rows = r.ok ? await r.json() : [];
  return rows[0] || null;
}

// Descuenta stock con control optimista (reintenta si otro pedido lo cambió al mismo tiempo).
async function decrementStock(productId, qty) {
  for (let i = 0; i < 4; i++) {
    const g = await fetch(base() + '/products?select=stock&id=eq.' + encodeURIComponent(productId), { headers: sbHeaders() });
    const rows = g.ok ? await g.json() : [];
    if (!rows.length) return;
    const old = rows[0].stock;
    const p = await fetch(base() + '/products?id=eq.' + encodeURIComponent(productId) + '&stock=eq.' + old, {
      method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }),
      body: JSON.stringify({ stock: Math.max(0, old - qty), updated_at: new Date().toISOString() })
    });
    const out = p.ok ? await p.json() : [];
    if (out.length) return;
  }
}

// Consulta Mercado Pago por el pago de un pedido. Devuelve el pago aprobado o null.
async function findApprovedPayment(ref) {
  const r = await fetch('https://api.mercadopago.com/v1/payments/search?external_reference=' + encodeURIComponent(ref) + '&sort=date_created&criteria=desc&limit=5',
    { headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
  if (!r.ok) return { error: true };
  const out = await r.json();
  const list = out.results || [];
  const ok = list.filter(function (p) { return p.status === 'approved'; })[0];
  return { payment: ok || null, status: list[0] ? list[0].status : 'pending' };
}

// Cupones: devuelve el cupón si existe, está activo, no venció y no agotó sus usos.
async function findCoupon(code) {
  const c = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{2,30}$/.test(c)) return null;
  const r = await fetch(base() + '/coupons?select=*&code=eq.' + encodeURIComponent(c), { headers: sbHeaders() });
  const rows = r.ok ? await r.json() : [];
  const cp = rows[0];
  if (!cp || !cp.active) return null;
  if (cp.expires_at && new Date(cp.expires_at).getTime() < Date.now()) return null;
  if (cp.max_uses != null && cp.used_count >= cp.max_uses) return null;
  return cp;
}
function couponDiscount(cp, subtotal) {
  const raw = cp.kind === 'percent' ? subtotal * Number(cp.value) / 100 : Number(cp.value);
  return Math.max(0, Math.min(Math.round(raw), subtotal));
}
async function bumpCoupon(code) {
  for (let i = 0; i < 4; i++) {
    const g = await fetch(base() + '/coupons?select=used_count&code=eq.' + encodeURIComponent(code), { headers: sbHeaders() });
    const rows = g.ok ? await g.json() : [];
    if (!rows.length) return;
    const p = await fetch(base() + '/coupons?code=eq.' + encodeURIComponent(code) + '&used_count=eq.' + rows[0].used_count, {
      method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }), body: JSON.stringify({ used_count: rows[0].used_count + 1 })
    });
    const out = p.ok ? await p.json() : [];
    if (out.length) return;
  }
}

// Marca el pedido como pagado y descuenta el stock UNA sola vez (el que gana el PATCH condicional).
async function finalizeOrder(ref) {
  const order = await getOrder(ref);
  if (!order) return { found: false };
  if (order.status !== 'pending') return { found: true, status: order.status, order: order };
  const found = await findApprovedPayment(ref);
  if (found.error) return { found: true, status: 'pending', error: true };
  if (!found.payment) return { found: true, status: 'pending', mpStatus: found.status };
  if (Number(found.payment.transaction_amount) + 0.01 < Number(order.total)) return { found: true, status: 'pending', mpStatus: 'amount_mismatch' };

  const claim = await fetch(base() + '/orders?ref=eq.' + encodeURIComponent(ref) + '&status=eq.pending', {
    method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }),
    body: JSON.stringify({ status: 'paid', payment_id: String(found.payment.id), paid_at: new Date().toISOString() })
  });
  const won = claim.ok ? await claim.json() : [];
  if (won.length) {
    for (const it of order.items) await decrementStock(it.id, it.qty);
    if (order.coupon_code) await bumpCoupon(order.coupon_code);
  }
  return { found: true, status: 'paid', order: won[0] || order };
}

// Costo de envío por zona según el código postal (los 4 dígitos numéricos, también dentro de un CPA tipo C1425ABC).
// Zonas y precios editables con la variable STORE_ZONES (JSON: [{"max":1999,"price":5500}, ...], ordenado por "max").
// STORE_FREE_SHIPPING_OVER: subtotal desde el cual el envío es gratis (0 = nunca).
const DEFAULT_ZONES = [{ max: 1999, price: 5500 }, { max: 5999, price: 7000 }, { max: 9999, price: 9000 }];
function quoteShipping(zip, subtotal) {
  const m = /(\d{4})/.exec(String(zip || ''));
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1000) return null;
  let zones = DEFAULT_ZONES;
  try { if (process.env.STORE_ZONES) zones = JSON.parse(process.env.STORE_ZONES); } catch (e) {}
  const z = zones.filter(function (x) { return n <= x.max; })[0];
  if (!z) return null;
  const free = Number(process.env.STORE_FREE_SHIPPING_OVER) || 0;
  if (free > 0 && Number(subtotal) >= free) return 0;
  return Number(z.price);
}

module.exports = { findCoupon: findCoupon, couponDiscount: couponDiscount, quoteShipping: quoteShipping, sbHeaders: sbHeaders, base: base, getOrder: getOrder, finalizeOrder: finalizeOrder };
