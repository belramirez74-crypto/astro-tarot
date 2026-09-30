// Verifica un token firmado por verify-payment.js. Devuelve el payload si es válido, o null.
const crypto = require('crypto');

function verifyToken(token, expectedItem) {
  if (!token || typeof token !== 'string' || !process.env.PAYMENT_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = crypto.createHmac('sha256', process.env.PAYMENT_SECRET).update(body).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch (e) { return null; }
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString()); } catch (e) { return null; }
  if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
  if (expectedItem && payload.item !== expectedItem) return null;
  return payload;
}

module.exports = { verifyToken: verifyToken };
