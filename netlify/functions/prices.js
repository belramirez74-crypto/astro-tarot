// Devuelve los precios configurados (públicos, no sensibles) para mostrarlos en la web.
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full: Number(process.env.MP_PRICE_FULL) || 1500,
      category: Number(process.env.MP_PRICE_CATEGORY) || 1200,
      currency: 'ARS'
    })
  };
};
