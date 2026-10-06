// Confirma una suscripción (preapproval) de Mercado Pago y, si está autorizada Y pertenece al
// usuario logueado (external_reference = su id), activa el plan en su perfil con la service_role key.
// El navegador nunca escribe las columnas del plan: las protege un trigger en la base.
const { handlePreflight, reply, getAuthJwt } = require('./_lib/http.js');
const { authUser, adminPatchProfile } = require('./_lib/supa.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  if (!process.env.MP_ACCESS_TOKEN) return reply(res, 500, c.headers, { error: 'Pagos no configurados' });

  const user = await authUser(getAuthJwt(req));
  if (!user) return reply(res, 401, c.headers, { error: 'Iniciá sesión para confirmar tu suscripción.' });

  const id = (req.query || {}).preapproval_id;
  if (!id) return reply(res, 400, c.headers, { error: 'preapproval_id inválido' });

  try {
    const mpRes = await fetch('https://api.mercadopago.com/preapproval/' + encodeURIComponent(id), {
      headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    const out = await mpRes.json();
    if (!mpRes.ok) return reply(res, 502, c.headers, { error: 'No se pudo verificar la suscripción' });
    if (!process.env.MP_PLAN_ID || out.preapproval_plan_id !== process.env.MP_PLAN_ID) return reply(res, 403, c.headers, { error: 'Suscripción inválida.' });
    if (out.status !== 'authorized') return reply(res, 200, c.headers, { active: false, status: out.status });

    // Una suscripción solo puede estar asociada a una cuenta.
    const sUrl = process.env.SUPABASE_URL, sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const dup = await fetch(sUrl + '/rest/v1/profiles?select=id&plan_preapproval_id=eq.' + encodeURIComponent(id), {
      headers: { apikey: sk, authorization: 'Bearer ' + sk }
    });
    const rows = dup.ok ? await dup.json() : [];
    if (rows.some(function (r) { return r.id !== user.id; })) return reply(res, 403, c.headers, { error: 'Esa suscripción ya está en uso.' });

    const now = new Date().toISOString();
    await adminPatchProfile(user.id, {
      plan_active: true, plan_preapproval_id: id, plan_started_at: now, plan_period_start: now, plan_tiradas_used: 0
    });
    return reply(res, 200, c.headers, { active: true, status: out.status });
  } catch (err) {
    return reply(res, 500, c.headers, { error: 'error interno' });
  }
};
