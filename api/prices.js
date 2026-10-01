// Devuelve los precios y la Public Key de Mercado Pago (ambos datos públicos, no sensibles)
// para mostrarlos y usarlos en la web. La Public Key está diseñada para exponerse en el frontend.
module.exports = async function handler(req, res) {
  res.status(200).json({
    full: Number(process.env.MP_PRICE_FULL) || 1500,
    category: Number(process.env.MP_PRICE_CATEGORY) || 1200,
    plan: Number(process.env.MP_PRICE_PLAN) || 7500,
    categoryDiscount: Number(process.env.MP_PRICE_CATEGORY_DISCOUNT) || 2500,
    oraculo: Number(process.env.MP_PRICE_ORACULO) || 1000,
    currency: 'ARS',
    mpPublicKey: process.env.MP_PUBLIC_KEY || null
  });
};
