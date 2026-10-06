// Crea una suscripción mensual (preapproval) en Mercado Pago para el plan de Astro Tarot.
// Requiere sesión: el email y el id salen del JWT verificado por Supabase (no del body), y la
// suscripción queda atada a ese usuario con external_reference = id de usuario.
const { handlePreflight, reply, getAuthJwt } = require('./_lib/http.js');
const { authUser } = require('./_lib/supa.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  if (req.method !== 'POST') return reply(res, 405, c.headers, { error: 'método no permitido' });
  if (!process.env.MP_ACCESS_TOKEN) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const user = await authUser(getAuthJwt(req));
  if (!user || !user.email) return reply(res, 401, c.headers, { error: 'Iniciá sesión para suscribirte.' });

  const planId = process.env.MP_PLAN_ID;
  if (!planId) return reply(res, 500, c.headers, { error: 'Suscripción no configurada' });
  // Plan fijo de Mercado Pago: cualquier persona puede suscribirse con su propia cuenta de MP.
  return reply(res, 200, c.headers, { url: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=' + encodeURIComponent(planId) });
};
