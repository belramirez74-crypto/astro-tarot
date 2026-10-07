// Punto de entrada único de la tienda (el plan gratis de Vercel limita la cantidad de funciones).
// vercel.json reescribe /api/store-<nombre> a /api/store?a=<nombre>, así las URLs públicas no cambian.
const handlers = {
  admin: require('./_lib/h/admin.js'),
  products: require('./_lib/h/products.js'),
  checkout: require('./_lib/h/checkout.js'),
  verify: require('./_lib/h/verify.js'),
  webhook: require('./_lib/h/webhook.js'),
  shipping: require('./_lib/h/shipping.js'),
  coupon: require('./_lib/h/coupon.js'),
  account: require('./_lib/h/account.js')
};

module.exports = async function handler(req, res) {
  const a = String((req.query || {}).a || '');
  const h = Object.prototype.hasOwnProperty.call(handlers, a) ? handlers[a] : null;
  if (!h) return res.status(404).json({ error: 'no encontrado' });
  return h(req, res);
};
