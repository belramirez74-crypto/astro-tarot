// El cliente de LUBE llama acá al iniciar sesión: si le regalaron un acceso, se aplica a su cuenta.
const { handlePreflight, reply, getAuthJwt } = require('../http.js');
const { authUser } = require('../supa.js');
const { claimForUser } = require('../grants.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'POST, OPTIONS');
  if (!c) return;
  const user = await authUser(getAuthJwt(req));
  if (!user || !user.email) return reply(res, 401, c.headers, { error: 'Iniciá sesión.' });
  try {
    const applied = await claimForUser(user);
    return reply(res, 200, c.headers, { applied: !!applied });
  } catch (e) { return reply(res, 200, c.headers, { applied: false }); }
};
