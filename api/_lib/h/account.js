// Pedidos del cliente logueado (se buscan por el email verificado por Supabase). Solo lectura.
const { handlePreflight, reply, getAuthJwt } = require('../http.js');
const { authUser } = require('../supa.js');
const { sbHeaders, base } = require('../store.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  const user = await authUser(getAuthJwt(req));
  if (!user || !user.email) return reply(res, 401, c.headers, { error: 'Iniciá sesión.' });
  try {
    const r = await fetch(base() + '/orders?select=created_at,status,total,items,tracking,buyer&buyer->>email=eq.' + encodeURIComponent(user.email.toLowerCase()) + '&status=neq.pending&order=created_at.desc&limit=30', { headers: sbHeaders() });
    const rows = r.ok ? await r.json() : [];
    return reply(res, 200, c.headers, { orders: rows.map(function (o) { return { created_at: o.created_at, status: o.status, total: o.total, items: o.items, tracking: o.tracking, delivery: (o.buyer || {}).delivery }; }) });
  } catch (e) { return reply(res, 500, c.headers, { error: 'error interno' }); }
};
