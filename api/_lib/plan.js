// Verifica el plan mensual de un usuario a partir de su JWT de sesión de Supabase.
// - La LECTURA del perfil usa el propio JWT (RLS: solo ve su fila).
// - Las columnas del plan NO las puede tocar el navegador (trigger en la base); se escriben acá,
//   con la service_role key, después de verificar el pago contra Mercado Pago.
// - Si el perfil tiene una suscripción asociada, se re-verifica en Mercado Pago que siga
//   autorizada (si se canceló, el plan deja de valer).
const { authUser, adminPatchProfile } = require('./supa.js');

function monthKey(d) { return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1); }

// Cuentas de desarrollo: acceso completo sin pagar. Se compara el email que Supabase confirma
// para ese JWT contra ADMIN_EMAILS (lista separada por coma en las variables de entorno).
async function isAdminJwt(jwt) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  if (!admins.length) return false;
  const u = await authUser(jwt);
  return !!(u && u.email && admins.indexOf(u.email.toLowerCase()) !== -1);
}

async function getProfileForJwt(jwt) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !jwt) return null;
  const base = 'id,plan_active,plan_preapproval_id,plan_tiradas_used,plan_period_start,senal_count';
  // plan_expires_at puede no existir todavía en la base: si falla, se pide sin esa columna.
  let res = await fetch(url + '/rest/v1/profiles?select=' + base + ',plan_expires_at', { headers: { apikey: key, authorization: 'Bearer ' + jwt } });
  if (!res.ok) res = await fetch(url + '/rest/v1/profiles?select=' + base, { headers: { apikey: key, authorization: 'Bearer ' + jwt } });
  if (!res.ok) return null;
  const rows = await res.json().catch(function () { return []; });
  return rows[0] || null;
}

// ¿El plan sigue vigente? Sin suscripción asociada (otorgado a mano) vale mientras plan_active sea true.
async function planStillValid(prof) {
  if (!prof || !prof.plan_active) return false;
  if (prof.plan_expires_at && new Date(prof.plan_expires_at).getTime() < Date.now()) return false;
  if (!prof.plan_preapproval_id) return true;
  if (!process.env.MP_ACCESS_TOKEN) return false;
  try {
    const res = await fetch('https://api.mercadopago.com/preapproval/' + encodeURIComponent(prof.plan_preapproval_id), {
      headers: { authorization: 'Bearer ' + process.env.MP_ACCESS_TOKEN }
    });
    if (!res.ok) return false;
    const out = await res.json();
    return out.status === 'authorized';
  } catch (e) { return false; }
}

// Verifica que el usuario tenga el plan activo. No consume cupo.
async function requirePlan(jwt) {
  if (await isAdminJwt(jwt)) return { admin: true, plan_active: true };
  const prof = await getProfileForJwt(jwt);
  if (!(await planStillValid(prof))) return null;
  return prof;
}

// Verifica plan activo Y cupo de tiradas del mes (4). Si hay cupo, lo descuenta y devuelve el perfil.
async function consumeTiradaQuota(jwt) {
  if (await isAdminJwt(jwt)) return { prof: { admin: true }, quotaLeft: true };
  const prof = await getProfileForJwt(jwt);
  if (!(await planStillValid(prof))) return null;
  const now = new Date();
  const sameMonth = prof.plan_period_start && monthKey(new Date(prof.plan_period_start)) === monthKey(now);
  const used = sameMonth ? (prof.plan_tiradas_used || 0) : 0;
  if (used >= 4) return { prof: prof, quotaLeft: false };
  await adminPatchProfile(prof.id, sameMonth
    ? { plan_tiradas_used: used + 1 }
    : { plan_tiradas_used: 1, plan_period_start: now.toISOString() });
  return { prof: prof, quotaLeft: true };
}

module.exports = { requirePlan: requirePlan, consumeTiradaQuota: consumeTiradaQuota, getProfileForJwt: getProfileForJwt };
