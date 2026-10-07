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
  }
  return { found: true, status: 'paid', order: won[0] || order };
}

module.exports = { sbHeaders: sbHeaders, base: base, getOrder: getOrder, finalizeOrder: finalizeOrder };
