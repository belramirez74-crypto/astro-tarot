// Accesos regalados al plan de LUBE: se guardan por email y se aplican al perfil de la persona.
// Todo con la service_role key; el navegador no puede crear ni modificar accesos.
const { adminPatchProfile } = require('./supa.js');

function sb(extra) {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Object.assign({ apikey: k, authorization: 'Bearer ' + k, 'content-type': 'application/json' }, extra || {});
}
function rest() { return process.env.SUPABASE_URL + '/rest/v1'; }

async function profileByEmail(email) {
  const r = await fetch(rest() + '/profiles?select=id,email,plan_active,plan_preapproval_id&email=eq.' + encodeURIComponent(email), { headers: sb() });
  const rows = r.ok ? await r.json() : [];
  return rows[0] || null;
}

// Activa el plan en el perfil. Si ya tiene una suscripción paga vigente, no se toca.
async function applyToProfile(profile, days) {
  if (profile.plan_active && profile.plan_preapproval_id) return false;
  const now = new Date();
  await adminPatchProfile(profile.id, {
    plan_active: true, plan_preapproval_id: null, plan_started_at: now.toISOString(), plan_period_start: now.toISOString(), plan_tiradas_used: 0,
    plan_expires_at: days ? new Date(now.getTime() + days * 86400000).toISOString() : null
  });
  return true;
}

// La persona entra a su cuenta: se aplican los accesos que le regalaron y todavía no se usaron.
async function claimForUser(user) {
  const email = String(user.email || '').toLowerCase();
  const r = await fetch(rest() + '/access_grants?select=*&service=eq.plan&claimed_at=is.null&email=eq.' + encodeURIComponent(email) + '&order=created_at.desc', { headers: sb() });
  const rows = r.ok ? await r.json() : [];
  if (!rows.length) return false;
  const g = rows[0];
  const profile = await profileByEmail(email);
  if (!profile) return false;
  const applied = await applyToProfile(profile, g.days);
  const claimedAt = new Date();
  await fetch(rest() + '/access_grants?email=eq.' + encodeURIComponent(email) + '&claimed_at=is.null', {
    method: 'PATCH', headers: sb(), body: JSON.stringify({ claimed_at: claimedAt.toISOString(), expires_at: g.days ? new Date(claimedAt.getTime() + g.days * 86400000).toISOString() : null })
  });
  return applied;
}

module.exports = { sb: sb, rest: rest, profileByEmail: profileByEmail, applyToProfile: applyToProfile, claimForUser: claimForUser };
