// Panel de administración de la tienda. Solo el admin (email verificado por Supabase) puede usarlo.
// Todas las escrituras usan la service_role key; el navegador nunca escribe en la tabla products.
const { handlePreflight, reply, parseBody, getAuthJwt } = require('../http.js');
const { authUser } = require('../supa.js');

const CATEGORIES = ['mazos-tarot', 'mazos-oraculo', 'accesorios', 'velas-inciensos', 'cristales', 'libros'];

function adminEmail() { return (process.env.STORE_ADMIN_EMAIL || 'belramirez74@gmail.com').trim().toLowerCase(); }

function sbHeaders(extra) {
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Object.assign({ apikey: sk, authorization: 'Bearer ' + sk, 'content-type': 'application/json' }, extra || {});
}
function num(v, min, max) {
  const n = Number(v);
  return isFinite(n) && n >= min && n <= max ? n : null;
}

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });

  const user = await authUser(getAuthJwt(req));
  if (!user || !user.email || user.email.toLowerCase() !== adminEmail()) return reply(res, 403, c.headers, { error: 'Acceso solo para el administrador.' });
  const url = process.env.SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(res, 500, c.headers, { error: 'Base no configurada' });

  const data = parseBody(req);
  if (!data) return reply(res, 400, c.headers, { error: 'JSON inválido' });

  try {
    if (data.action === 'list') {
      const r = await fetch(url + '/rest/v1/products?select=*&order=created_at.desc', { headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo leer. ¿Creaste la tabla products en Supabase?' });
      return reply(res, 200, c.headers, { products: await r.json(), categories: CATEGORIES });
    }

    if (data.action === 'orders') {
      const r = await fetch(url + '/rest/v1/orders?select=*&order=created_at.desc&limit=200', { headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo leer los pedidos. ¿Creaste la tabla orders en Supabase?' });
      return reply(res, 200, c.headers, { orders: await r.json() });
    }

    if (data.action === 'order_status') {
      if (!data.id || ['paid', 'shipped', 'cancelled'].indexOf(data.status) === -1) return reply(res, 400, c.headers, { error: 'datos inválidos' });
      const r = await fetch(url + '/rest/v1/orders?id=eq.' + encodeURIComponent(data.id), {
        method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }), body: JSON.stringify({ status: data.status })
      });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo actualizar el pedido.' });
      return reply(res, 200, c.headers, { order: (await r.json())[0] });
    }

    if (data.action === 'save') {
      const p = data.product || {};
      const name = String(p.name || '').trim().slice(0, 120);
      const price = num(p.price, 0, 100000000), stock = num(p.stock, 0, 1000000), low = num(p.low_stock_threshold, 0, 100000);
      if (!name) return reply(res, 400, c.headers, { error: 'El nombre es obligatorio.' });
      if (price === null || stock === null || low === null) return reply(res, 400, c.headers, { error: 'Precio, stock y alerta deben ser números válidos.' });
      const hasCmp = p.compare_price !== '' && p.compare_price != null;
      const cmp = hasCmp ? num(p.compare_price, 0, 100000000) : null;
      if (hasCmp && cmp === null) return reply(res, 400, c.headers, { error: 'Precio anterior inválido.' });
      const row = {
        name: name,
        description: String(p.description || '').slice(0, 4000),
        category: CATEGORIES.indexOf(p.category) !== -1 ? p.category : 'accesorios',
        price: price, compare_price: cmp, stock: Math.floor(stock), low_stock_threshold: Math.floor(low),
        sku: String(p.sku || '').trim().slice(0, 60) || null,
        image_url: /^https:\/\//.test(p.image_url || '') ? p.image_url : null,
        active: !!p.active, featured: !!p.featured,
        updated_at: new Date().toISOString()
      };
      const isNew = !p.id;
      const r = await fetch(url + '/rest/v1/products' + (isNew ? '' : '?id=eq.' + encodeURIComponent(p.id)), {
        method: isNew ? 'POST' : 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }), body: JSON.stringify(row)
      });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo guardar el producto.' });
      const out = await r.json();
      return reply(res, 200, c.headers, { product: out[0] });
    }

    if (data.action === 'stock') {
      // delta (+1, -1, +10) sobre el valor actual, sin bajar de 0
      const delta = num(data.delta, -1000000, 1000000);
      if (!data.id || delta === null) return reply(res, 400, c.headers, { error: 'datos inválidos' });
      const g = await fetch(url + '/rest/v1/products?select=stock&id=eq.' + encodeURIComponent(data.id), { headers: sbHeaders() });
      const rows = g.ok ? await g.json() : [];
      if (!rows.length) return reply(res, 404, c.headers, { error: 'Producto no encontrado' });
      const next = Math.max(0, rows[0].stock + Math.floor(delta));
      const r = await fetch(url + '/rest/v1/products?id=eq.' + encodeURIComponent(data.id), {
        method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }), body: JSON.stringify({ stock: next, updated_at: new Date().toISOString() })
      });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo actualizar el stock.' });
      return reply(res, 200, c.headers, { product: (await r.json())[0] });
    }

    if (data.action === 'delete') {
      if (!data.id) return reply(res, 400, c.headers, { error: 'id inválido' });
      const r = await fetch(url + '/rest/v1/products?id=eq.' + encodeURIComponent(data.id), { method: 'DELETE', headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo eliminar.' });
      return reply(res, 200, c.headers, { ok: true });
    }

    if (data.action === 'upload') {
      // La imagen llega ya achicada desde el navegador, como data URL base64.
      const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(data.dataUrl || '');
      if (!m) return reply(res, 400, c.headers, { error: 'Imagen inválida (JPG, PNG o WebP).' });
      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > 1.5 * 1024 * 1024) return reply(res, 400, c.headers, { error: 'La imagen es muy pesada (máx. 1,5 MB).' });
      const ext = m[1] === 'image/png' ? 'png' : m[1] === 'image/webp' ? 'webp' : 'jpg';
      const path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const r = await fetch(url + '/storage/v1/object/products/' + path, {
        method: 'POST', headers: { apikey: sk, authorization: 'Bearer ' + sk, 'content-type': m[1] }, body: buf
      });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo subir la imagen.' });
      return reply(res, 200, c.headers, { url: url + '/storage/v1/object/public/products/' + path });
    }

    return reply(res, 400, c.headers, { error: 'acción inválida' });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
