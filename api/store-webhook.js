// Aviso (webhook) de Mercado Pago: cubre el caso de que el cliente pague y cierre la pestaña
// antes de volver al sitio. No se confía en el contenido del aviso: se consulta el pago a Mercado Pago.
const { finalizeOrder } = require('./_lib/store.js');

module.exports = async function handler(req, res) {
  try {
    const q = req.query || {};
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const id = (body.data && body.data.id) || q['data.id'] || q.id;
    const type = body.type || q.type || q.topic;
    if (id && /^\d+$/.test(String(id)) && (!type || type === 'payment') && process.env.MP_ACCESS_TOKEN) {
      const r = await fetch('https://api.mercadopago.com/v1/payments/' + id, { headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN } });
      if (r.ok) {
        const p = await r.json();
        if (p.external_reference && /^order:[a-f0-9]{16}$/.test(p.external_reference)) await finalizeOrder(p.external_reference);
      }
    }
  } catch (e) { /* siempre se responde 200 para que Mercado Pago no reintente sin fin */ }
  res.status(200).json({ ok: true });
};
