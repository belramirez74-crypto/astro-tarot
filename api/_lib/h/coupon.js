// Valida un cupón y calcula el descuento (solo para mostrar en el carrito; store-checkout lo recalcula).
const { handlePreflight, reply } = require('../http.js');
const { findCoupon, couponDiscount } = require('../store.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  const q = req.query || {};
  try {
    const coupon = await findCoupon(q.code);
    if (!coupon) return reply(res, 200, c.headers, { ok: false, error: 'Cupón inválido o vencido.' });
    const discount = couponDiscount(coupon, Number(q.sub) || 0);
    return reply(res, 200, c.headers, { ok: true, code: coupon.code, discount: discount,
      label: coupon.kind === 'percent' ? coupon.value + '% de descuento' : '$' + Number(coupon.value).toLocaleString('es-AR') + ' de descuento' });
  } catch (e) { return reply(res, 500, c.headers, { error: 'error interno' }); }
};
