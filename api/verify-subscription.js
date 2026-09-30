// Confirma el estado de una suscripción (preapproval) de Mercado Pago. El cliente, ya logueado,
// es quien actualiza su propio perfil (plan_active, etc.) usando esta respuesta; acá solo se
// consulta a Mercado Pago, nunca se toca la base de datos directamente.
const { handlePreflight, reply } = require('./_lib/http.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  if (!process.env.MP_ACCESS_TOKEN) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const id = (req.query || {}).preapproval_id;
  if (!id) return reply(res, 400, c.headers, { error: 'preapproval_id inválido' });

  try {
    const mpRes = await fetch('https://api.mercadopago.com/preapproval/' + encodeURIComponent(id), {
      headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    const out = await mpRes.json();
    if (!mpRes.ok) return reply(res, 502, c.headers, { error: 'No se pudo verificar la suscripción' });
    return reply(res, 200, c.headers, { active: out.status === 'authorized', status: out.status, preapprovalId: id });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
