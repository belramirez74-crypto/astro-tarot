// Panel de administración de la tienda. Solo el admin (email verificado por Supabase) puede usarlo.
// Todas las escrituras usan la service_role key; el navegador nunca escribe en la tabla products.
const { handlePreflight, reply, parseBody, getAuthJwt } = require('../http.js');
const { authUser } = require('../supa.js');
const { getCategories, fetchProducts, packageFor } = require('../store.js');
const paqar = require('../paqar.js');

function slugify(t) {
  return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

function adminEmail() { return (process.env.STORE_ADMIN_EMAIL || 'belramirez74@gmail.com').trim().toLowerCase(); }

function sbHeaders(extra) {
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Object.assign({ apikey: sk, authorization: 'Bearer ' + sk, 'content-type': 'application/json' }, extra || {});
}
function optInt(v, min, max) {
  if (v === '' || v == null) return null;
  const n = Math.floor(Number(v));
  return isFinite(n) && n >= min && n <= max ? n : null;
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
      const cats = await getCategories(sbHeaders(), false);
      return reply(res, 200, c.headers, { products: await r.json(), categories: cats.cats, categoriesEditable: cats.fromDb });
    }

    if (data.action === 'orders') {
      const r = await fetch(url + '/rest/v1/orders?select=*&order=created_at.desc&limit=200', { headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo leer los pedidos. ¿Creaste la tabla orders en Supabase?' });
      return reply(res, 200, c.headers, { orders: await r.json() });
    }

    if (['paqar_prepare', 'paqar_create', 'paqar_label', 'paqar_cancel'].indexOf(data.action) !== -1) {
      if (!paqar.configured()) return reply(res, 400, c.headers, { error: 'Correo Argentino todavía no está configurado (faltan PAQAR_AGREEMENT y PAQAR_APIKEY en Vercel).' });
      const og = await fetch(url + '/rest/v1/orders?select=*&id=eq.' + encodeURIComponent(String(data.id || '')), { headers: sbHeaders() });
      const order = (og.ok ? await og.json() : [])[0];
      if (!order) return reply(res, 404, c.headers, { error: 'Pedido no encontrado' });
      const patchOrder = async function (patch) {
        const r = await fetch(url + '/rest/v1/orders?id=eq.' + encodeURIComponent(order.id), { method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }), body: JSON.stringify(patch) });
        return r.ok ? (await r.json())[0] : null;
      };

      if (data.action === 'paqar_prepare') {
        const b = order.buyer || {};
        const rows = await fetchProducts(order.items.map(function (i) { return i.id; }));
        const pk = packageFor(order.items.map(function (i) { const p = rows.filter(function (x) { return x.id === i.id; })[0] || {}; return Object.assign({}, p, { qty: i.qty }); }));
        const sp = paqar.splitAddress(b.address);
        return reply(res, 200, c.headers, {
          missingSender: paqar.senderMissing(), provinces: paqar.PROVINCES,
          recipient: { name: b.name || '', phone: b.phone || '', email: b.email || '', street: sp.street, number: sp.number, floor: '', department: sp.rest, city: b.city || '', state: paqar.provinceCode(b.province), zip: b.zip || '', observation: b.notes || '' },
          parcel: { height: pk.height, width: pk.length, depth: pk.width, weight: pk.weight, declaredValue: Number(order.subtotal) }
        });
      }

      if (data.action === 'paqar_create') {
        if (order.status !== 'paid' || order.tracking) return reply(res, 409, c.headers, { error: 'Este pedido no está pendiente de envío.' });
        const miss = paqar.senderMissing();
        if (miss.length) return reply(res, 400, c.headers, { error: 'Faltan datos del remitente en Vercel: ' + miss.join(', ') });
        const rc = data.recipient || {}, pc = data.parcel || {};
        const need = ['name', 'street', 'number', 'city', 'state', 'zip'].filter(function (k) { return !String(rc[k] || '').trim(); });
        if (need.length) return reply(res, 400, c.headers, { error: 'Completá los datos del destinatario (' + need.join(', ') + ').' });
        const nums = ['height', 'width', 'depth', 'weight', 'declaredValue'].filter(function (k) { return !(Number(pc[k]) > 0); });
        if (nums.length) return reply(res, 400, c.headers, { error: 'Completá el peso, las medidas y el valor declarado del paquete.' });
        const out = await paqar.createOrder(order, rc, pc);
        if (!out.ok) return reply(res, 502, c.headers, { error: 'Correo Argentino rechazó el envío: ' + out.message });
        const saved = await patchOrder({ tracking: out.trackingNumber, status: 'shipped' });
        return reply(res, 200, c.headers, { order: saved, trackingNumber: out.trackingNumber });
      }

      if (!order.tracking) return reply(res, 409, c.headers, { error: 'Este pedido no tiene envío creado.' });
      if (data.action === 'paqar_label') {
        const lb = await paqar.getLabel(order.tracking);
        if (!lb.ok) return reply(res, 502, c.headers, { error: lb.message });
        return reply(res, 200, c.headers, { fileBase64: lb.fileBase64, fileName: lb.fileName });
      }
      if (data.action === 'paqar_cancel') {
        const cn = await paqar.cancelOrder(order.tracking);
        if (!cn.ok) return reply(res, 502, c.headers, { error: 'No se pudo cancelar en Correo: ' + cn.message });
        return reply(res, 200, c.headers, { order: await patchOrder({ tracking: null, status: 'paid' }) });
      }
    }

    if (data.action === 'order_status') {
      if (!data.id || ['paid', 'shipped', 'cancelled'].indexOf(data.status) === -1) return reply(res, 400, c.headers, { error: 'datos inválidos' });
      const patch = { status: data.status };
      if (data.tracking != null) patch.tracking = String(data.tracking).trim().slice(0, 60) || null;
      const r = await fetch(url + '/rest/v1/orders?id=eq.' + encodeURIComponent(data.id), {
        method: 'PATCH', headers: sbHeaders({ prefer: 'return=representation' }), body: JSON.stringify(patch)
      });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo actualizar el pedido.' });
      return reply(res, 200, c.headers, { order: (await r.json())[0] });
    }

    if (data.action === 'category_save') {
      const name = String(data.name || '').trim().slice(0, 40);
      if (!name) return reply(res, 400, c.headers, { error: 'El nombre es obligatorio.' });
      const cur = await getCategories(sbHeaders(), false);
      if (!cur.fromDb) return reply(res, 502, c.headers, { error: 'Falta crear la tabla de categorías: ejecutá supabase-categories.sql en Supabase.' });
      let row;
      if (data.slug) {
        row = { slug: String(data.slug), name: name, active: data.active !== false };
      } else {
        let slug = slugify(name) || 'categoria', n = 2;
        const taken = cur.cats.map(function (x) { return x.slug; });
        while (taken.indexOf(slug) !== -1) slug = slugify(name) + '-' + (n++);
        row = { slug: slug, name: name, active: true, position: cur.cats.reduce(function (m, x) { return Math.max(m, x.position); }, -1) + 1 };
      }
      const r = await fetch(url + '/rest/v1/store_categories', { method: 'POST', headers: sbHeaders({ prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(row) });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo guardar la categoría.' });
      return reply(res, 200, c.headers, { ok: true });
    }

    if (data.action === 'category_move') {
      const cur = (await getCategories(sbHeaders(), false)).cats.slice().sort(function (a, b) { return a.position - b.position; });
      const i = cur.findIndex(function (x) { return x.slug === data.slug; });
      const j = i + (data.dir === 'up' ? -1 : 1);
      if (i < 0 || j < 0 || j >= cur.length) return reply(res, 200, c.headers, { ok: true });
      const tmp = cur[i]; cur[i] = cur[j]; cur[j] = tmp;
      const rows = cur.map(function (x, k) { return { slug: x.slug, name: x.name, active: x.active, position: k }; });
      const r = await fetch(url + '/rest/v1/store_categories', { method: 'POST', headers: sbHeaders({ prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(rows) });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo reordenar.' });
      return reply(res, 200, c.headers, { ok: true });
    }

    if (data.action === 'category_delete') {
      const slug = String(data.slug || '');
      const g = await fetch(url + '/rest/v1/products?select=id&limit=1&category=eq.' + encodeURIComponent(slug), { headers: sbHeaders() });
      const used = g.ok ? await g.json() : [];
      if (used.length) return reply(res, 409, c.headers, { error: 'Esa categoría tiene productos. Movelos a otra categoría antes de eliminarla.' });
      const r = await fetch(url + '/rest/v1/store_categories?slug=eq.' + encodeURIComponent(slug), { method: 'DELETE', headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo eliminar.' });
      return reply(res, 200, c.headers, { ok: true });
    }

    if (data.action === 'coupons') {
      const r = await fetch(url + '/rest/v1/coupons?select=*&order=created_at.desc', { headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo leer los cupones. ¿Ejecutaste supabase-coupons.sql?' });
      return reply(res, 200, c.headers, { coupons: await r.json() });
    }

    if (data.action === 'coupon_save') {
      const k = data.coupon || {};
      const code = String(k.code || '').trim().toUpperCase();
      const kind = k.kind === 'fixed' ? 'fixed' : 'percent';
      const value = num(k.value, 1, kind === 'percent' ? 100 : 100000000);
      if (!/^[A-Z0-9_-]{2,30}$/.test(code)) return reply(res, 400, c.headers, { error: 'El código debe tener 2 a 30 letras, números, guion o guion bajo.' });
      if (value === null) return reply(res, 400, c.headers, { error: kind === 'percent' ? 'El porcentaje debe estar entre 1 y 100.' : 'El monto es inválido.' });
      const maxUses = k.max_uses === '' || k.max_uses == null ? null : Math.floor(num(k.max_uses, 1, 1000000) || 0) || null;
      let exp = null;
      if (k.expires_at) { const d = new Date(k.expires_at + 'T23:59:59'); if (isNaN(d.getTime())) return reply(res, 400, c.headers, { error: 'Fecha inválida.' }); exp = d.toISOString(); }
      const row = { code: code, kind: kind, value: value, active: k.active !== false, expires_at: exp, max_uses: maxUses, note: String(k.note || '').slice(0, 120) || null };
      const r = await fetch(url + '/rest/v1/coupons', { method: 'POST', headers: sbHeaders({ prefer: 'resolution=merge-duplicates,return=representation' }), body: JSON.stringify(row) });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo guardar el cupón.' });
      return reply(res, 200, c.headers, { coupon: (await r.json())[0] });
    }

    if (data.action === 'coupon_delete') {
      const code = String(data.code || '').toUpperCase();
      if (!/^[A-Z0-9_-]{2,30}$/.test(code)) return reply(res, 400, c.headers, { error: 'código inválido' });
      const r = await fetch(url + '/rest/v1/coupons?code=eq.' + encodeURIComponent(code), { method: 'DELETE', headers: sbHeaders() });
      if (!r.ok) return reply(res, 502, c.headers, { error: 'No se pudo eliminar.' });
      return reply(res, 200, c.headers, { ok: true });
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
      const validSlugs = (await getCategories(sbHeaders(), false)).cats.map(function (x) { return x.slug; });
      const row = {
        name: name,
        description: String(p.description || '').slice(0, 4000),
        category: validSlugs.indexOf(p.category) !== -1 ? p.category : validSlugs[0],
        price: price, compare_price: cmp, stock: Math.floor(stock), low_stock_threshold: Math.floor(low),
        sku: String(p.sku || '').trim().slice(0, 60) || null,
        image_url: /^https:\/\//.test(p.image_url || '') ? p.image_url : null,
        active: !!p.active, featured: !!p.featured,
        updated_at: new Date().toISOString()
      };
      // Medidas: solo se envían si se cargaron (así guardar productos no depende de haber creado las columnas).
      const dims = { weight_g: optInt(p.weight_g, 1, 25000), length_cm: optInt(p.length_cm, 1, 150), width_cm: optInt(p.width_cm, 1, 150), height_cm: optInt(p.height_cm, 1, 150) };
      const hasDims = Object.keys(dims).some(function (k) { return dims[k] !== null; });
      if (hasDims || p.id) Object.assign(row, hasDims ? dims : {});
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
