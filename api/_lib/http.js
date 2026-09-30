// Helpers compartidos para las funciones serverless de Vercel (equivalente al cors()/reply()
// que usaban las Netlify Functions, adaptado a la firma (req, res) de Vercel).

function cors(req, methods) {
  const h = req.headers || {};
  const origin = h.origin || h.Origin || '';
  const host = h.host || h.Host || '';
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  const ok = !origin || origin.replace(/^https?:\/\//, '') === host || allowed.indexOf(origin) !== -1 ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = {
    'Access-Control-Allow-Methods': methods || 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
  if (origin && ok) headers['Access-Control-Allow-Origin'] = origin;
  return { headers: headers, ok: ok, origin: origin };
}

function applyHeaders(res, headers) {
  Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });
}

function reply(res, status, headers, obj) {
  applyHeaders(res, headers);
  res.status(status).json(obj);
}

// Maneja OPTIONS y el chequeo de origen; devuelve true si la función debe seguir procesando,
// false si ya respondió (preflight u origen no permitido) y el handler debe hacer return.
function handlePreflight(req, res, methods) {
  const c = cors(req, methods);
  if (req.method === 'OPTIONS') { applyHeaders(res, c.headers); res.status(204).end(); return null; }
  if (!c.ok) { reply(res, 403, c.headers, { error: 'origen no permitido' }); return null; }
  return c;
}

// Vercel ya parsea el body JSON en req.body cuando el Content-Type es application/json,
// pero por las dudas soporta también el caso de que llegue como string.
function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  return req.body;
}

function getAuthJwt(req) {
  const h = req.headers || {};
  const authHeader = h.authorization || h.Authorization || '';
  return authHeader.replace(/^Bearer\s+/i, '');
}

module.exports = { cors: cors, reply: reply, handlePreflight: handlePreflight, parseBody: parseBody, getAuthJwt: getAuthJwt };
