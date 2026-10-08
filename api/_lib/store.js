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

// Categorías editables desde el panel (tabla store_categories). Si la tabla todavía no existe, se usan las de siempre.
const DEFAULT_CATS = [
  { slug: 'mazos-tarot', name: 'Mazos de tarot' }, { slug: 'mazos-oraculo', name: 'Mazos oráculo' }, { slug: 'accesorios', name: 'Accesorios' },
  { slug: 'velas-inciensos', name: 'Velas e inciensos' }, { slug: 'cristales', name: 'Cristales y piedras' }, { slug: 'libros', name: 'Libros y guías' }
].map(function (c, i) { return { slug: c.slug, name: c.name, position: i, active: true }; });

// { cats, fromDb }: fromDb=false si la tabla no existe (no se pueden editar categorías hasta crearla)
async function getCategories(headers, onlyActive) {
  try {
    const r = await fetch(base() + '/store_categories?select=slug,name,position,active&order=position.asc' + (onlyActive ? '&active=eq.true' : ''), { headers: headers });
    if (r.ok) {
      const rows = await r.json();
      if (rows.length || onlyActive === false) return { cats: rows, fromDb: true };
      // tabla creada pero vacía: se muestran las de siempre
      return { cats: DEFAULT_CATS, fromDb: true };
    }
  } catch (e) {}
  return { cats: DEFAULT_CATS, fromDb: false };
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

// ---- Cotización automática con MiCorreo (Correo Argentino) ----
// Variables: MICORREO_USER_TOKEN, MICORREO_PASSWORD_TOKEN, MICORREO_EMAIL, MICORREO_PASSWORD, MICORREO_ORIGIN_CP
// (opcionales: MICORREO_ENV=test|prod, MICORREO_CUSTOMER_ID, MICORREO_MARKUP_PCT, MICORREO_HANDLING,
//  DEFAULT_WEIGHT_G, DEFAULT_LENGTH_CM, DEFAULT_WIDTH_CM, DEFAULT_HEIGHT_CM). Si faltan o falla, se usa la tabla por zona.
let mcAuth = { jwt: null, exp: 0, customerId: null };
function mcBase() { return process.env.MICORREO_ENV === 'test' ? 'https://apitest.correoargentino.com.ar/micorreo/v1' : 'https://api.correoargentino.com.ar/micorreo/v1'; }
function mcConfigured() {
  const e = process.env;
  return !!(e.MICORREO_USER_TOKEN && e.MICORREO_PASSWORD_TOKEN && e.MICORREO_ORIGIN_CP && (e.MICORREO_CUSTOMER_ID || (e.MICORREO_EMAIL && e.MICORREO_PASSWORD)));
}
async function mcLogin() {
  if (mcAuth.jwt && Date.now() < mcAuth.exp) return mcAuth;
  const basic = Buffer.from(process.env.MICORREO_USER_TOKEN + ':' + process.env.MICORREO_PASSWORD_TOKEN).toString('base64');
  const t = await fetch(mcBase() + '/token', { method: 'POST', headers: { authorization: 'Basic ' + basic } });
  if (!t.ok) throw new Error('micorreo token ' + t.status);
  const tj = await t.json();
  mcAuth.jwt = tj.token;
  const exp = Date.parse(tj.expires);
  mcAuth.exp = isFinite(exp) ? exp - 60000 : Date.now() + 10 * 60000;
  if (process.env.MICORREO_CUSTOMER_ID) mcAuth.customerId = process.env.MICORREO_CUSTOMER_ID;
  if (!mcAuth.customerId) {
    const v = await fetch(mcBase() + '/users/validate', {
      method: 'POST', headers: { authorization: 'Bearer ' + mcAuth.jwt, 'content-type': 'application/json' },
      body: JSON.stringify({ email: process.env.MICORREO_EMAIL, password: process.env.MICORREO_PASSWORD })
    });
    if (!v.ok) throw new Error('micorreo validate ' + v.status);
    mcAuth.customerId = (await v.json()).customerId;
  }
  return mcAuth;
}

// Junta todos los productos del carrito en un solo bulto: pesos sumados, apilados en altura.
function packageFor(items) {
  const d = process.env;
  const defW = Number(d.DEFAULT_WEIGHT_G) || 500, defL = Number(d.DEFAULT_LENGTH_CM) || 20, defA = Number(d.DEFAULT_WIDTH_CM) || 15, defH = Number(d.DEFAULT_HEIGHT_CM) || 8;
  let w = 0, l = 0, a = 0, h = 0;
  items.forEach(function (it) {
    const q = it.qty || 1;
    w += (it.weight_g || defW) * q; l = Math.max(l, it.length_cm || defL); a = Math.max(a, it.width_cm || defA); h += (it.height_cm || defH) * q;
  });
  return { weight: Math.min(25000, Math.max(1, Math.round(w))), length: Math.min(150, l), width: Math.min(150, a), height: Math.min(150, Math.max(1, h)) };
}

async function micorreoRates(zip, items) {
  const dest = (/(\d{4})/.exec(String(zip || '')) || [])[1];
  if (!dest) return null;
  const auth = await mcLogin();
  const pkg = packageFor(items);
  const r = await fetch(mcBase() + '/rates', {
    method: 'POST', headers: { authorization: 'Bearer ' + auth.jwt, 'content-type': 'application/json' },
    body: JSON.stringify({ customerId: auth.customerId, postalCodeOrigin: process.env.MICORREO_ORIGIN_CP, postalCodeDestination: dest, dimensions: [Object.assign({ quantity: 1 }, pkg)] })
  });
  if (r.status === 401) { mcAuth.jwt = null; }
  if (!r.ok) throw new Error('micorreo rates ' + r.status);
  const out = await r.json();
  const markup = 1 + (Number(process.env.MICORREO_MARKUP_PCT) || 0) / 100, handling = Number(process.env.MICORREO_HANDLING) || 0;
  // Se ofrece el servicio más barato de cada modalidad (D = a domicilio, S = a sucursal).
  const best = {};
  (out.rates || []).forEach(function (x) {
    if (typeof x.price !== 'number' || (x.deliveredType !== 'D' && x.deliveredType !== 'S')) return;
    if (!best[x.deliveredType] || x.price < best[x.deliveredType].price) best[x.deliveredType] = x;
  });
  return ['D', 'S'].filter(function (t) { return best[t]; }).map(function (t) {
    const x = best[t], days = x.deliveryTimeMin && x.deliveryTimeMax ? ' (' + x.deliveryTimeMin + ' a ' + x.deliveryTimeMax + ' días)' : '';
    return { type: t, label: (t === 'D' ? 'Envío a domicilio' : 'Envío a sucursal de Correo Argentino') + days, price: Math.round(x.price * markup + handling) };
  });
}

// Opciones de envío para un código postal: cotización real si está configurada; si no, tabla por zona.
async function quoteOptions(zip, items, subtotal) {
  const free = Number(process.env.STORE_FREE_SHIPPING_OVER) || 0;
  const isFree = free > 0 && Number(subtotal) >= free;
  let opts = null, source = 'zonas';
  if (mcConfigured()) {
    try { opts = await micorreoRates(zip, items); if (opts && opts.length) source = 'micorreo'; else opts = null; }
    catch (e) { console.error('MiCorreo', e.message); opts = null; }
  }
  if (!opts) {
    const p = quoteShipping(zip, subtotal);
    if (p === null) return { ok: false };
    opts = [{ type: 'D', label: 'Envío a domicilio', price: p }];
  }
  if (isFree) opts = opts.map(function (o) { return Object.assign({}, o, { price: 0 }); });
  return { ok: true, source: source, options: opts };
}

// Productos con sus medidas; si las columnas todavía no existen en la base, se piden sin ellas.
async function fetchProducts(ids) {
  const cols = 'id,name,price,stock,active';
  const dims = ',weight_g,length_cm,width_cm,height_cm';
  let r = await fetch(base() + '/products?select=' + cols + dims + '&id=in.(' + ids.join(',') + ')', { headers: sbHeaders() });
  if (!r.ok) r = await fetch(base() + '/products?select=' + cols + '&id=in.(' + ids.join(',') + ')', { headers: sbHeaders() });
  return r.ok ? await r.json() : [];
}

module.exports = { quoteOptions: quoteOptions, fetchProducts: fetchProducts, getCategories: getCategories, DEFAULT_CATS: DEFAULT_CATS, findCoupon: findCoupon, couponDiscount: couponDiscount, quoteShipping: quoteShipping, sbHeaders: sbHeaders, base: base, getOrder: getOrder, finalizeOrder: finalizeOrder };
