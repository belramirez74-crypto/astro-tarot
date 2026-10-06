// Acceso a Supabase desde el servidor.
// - authUser(jwt): valida el JWT de sesión contra Supabase y devuelve el usuario real (id, email).
// - adminPatchProfile(id, patch): actualiza el perfil con la service_role key. Es la ÚNICA vía por la
//   que se pueden cambiar las columnas del plan (el trigger de la base bloquea al navegador).
// SUPABASE_SERVICE_ROLE_KEY vive solo como variable de entorno del servidor; nunca llega al frontend.

async function authUser(jwt) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !jwt) return null;
  try {
    const res = await fetch(url + '/auth/v1/user', { headers: { apikey: key, authorization: 'Bearer ' + jwt } });
    if (!res.ok) return null;
    const u = await res.json();
    return u && u.id ? { id: u.id, email: u.email || '' } : null;
  } catch (e) { return null; }
}

async function adminPatchProfile(id, patch) {
  const url = process.env.SUPABASE_URL, sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sk) throw new Error('service role no configurada');
  const res = await fetch(url + '/rest/v1/profiles?id=eq.' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: { apikey: sk, authorization: 'Bearer ' + sk, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error('no se pudo actualizar el perfil');
}

module.exports = { authUser: authUser, adminPatchProfile: adminPatchProfile };
