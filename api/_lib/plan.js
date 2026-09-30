// Verifica el plan mensual de un usuario a partir de su JWT de sesión de Supabase (enviado por el
// cliente en el header Authorization). No usa la service_role key: todo pasa por PostgREST con
// el propio JWT del usuario, así que las políticas RLS ("solo puede ver/tocar su propia fila")
// siguen aplicando igual que si lo hiciera el navegador. No hay forma de leer o tocar el perfil
// de otra persona con esto.

function monthKey(d) { return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1); }

// Cuentas de desarrollo: acceso completo sin pasar por ningún pago ni límite. Se verifica
// contra el email real que Supabase confirma para ese JWT (no algo que el cliente pueda falsear),
// y se compara contra ADMIN_EMAILS (lista separada por coma en las variables de entorno).
async function isAdminJwt(jwt) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
  if (!url || !key || !jwt || !admins.length) return false;
  try {
    const res = await fetch(url + '/auth/v1/user', { headers: { apikey: key, authorization: 'Bearer ' + jwt } });
    if (!res.ok) return false;
    const user = await res.json();
    return !!(user && user.email && admins.indexOf(String(user.email).toLowerCase()) !== -1);
  } catch (e) { return false; }
}

async function getProfileForJwt(jwt) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !jwt) return null;
  const res = await fetch(url + '/rest/v1/profiles?select=id,plan_active,plan_tiradas_used,plan_period_start,senal_count', {
    headers: { apikey: key, authorization: 'Bearer ' + jwt }
  });
  if (!res.ok) return null;
  const rows = await res.json().catch(function () { return []; });
  return rows[0] || null;
}

async function patchProfile(jwt, id, patch) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  await fetch(url + '/rest/v1/profiles?id=eq.' + id, {
    method: 'PATCH',
    headers: { apikey: key, authorization: 'Bearer ' + jwt, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(patch)
  }).catch(function () {});
}

// Verifica que el usuario tenga el plan activo. No consume cupo (se usa para el informe natal,
// que es ilimitado dentro del plan).
async function requirePlan(jwt) {
  if (await isAdminJwt(jwt)) return { admin: true, plan_active: true };
  const prof = await getProfileForJwt(jwt);
  if (!prof || !prof.plan_active) return null;
  return prof;
}

// Verifica plan activo Y cupo de tiradas del mes (4). Si hay cupo, lo descuenta y devuelve el perfil.
async function consumeTiradaQuota(jwt) {
  if (await isAdminJwt(jwt)) return { prof: { admin: true }, quotaLeft: true };
  const prof = await getProfileForJwt(jwt);
  if (!prof || !prof.plan_active) return null;
  const now = new Date();
  const sameMonth = prof.plan_period_start && monthKey(new Date(prof.plan_period_start)) === monthKey(now);
  const used = sameMonth ? (prof.plan_tiradas_used || 0) : 0;
  if (used >= 4) return { prof: prof, quotaLeft: false };
  await patchProfile(jwt, prof.id, sameMonth
    ? { plan_tiradas_used: used + 1 }
    : { plan_tiradas_used: 1, plan_period_start: now.toISOString() });
  return { prof: prof, quotaLeft: true };
}

module.exports = { requirePlan: requirePlan, consumeTiradaQuota: consumeTiradaQuota, getProfileForJwt: getProfileForJwt };
