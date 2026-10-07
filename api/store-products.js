// Catálogo público de la tienda: solo productos activos. Lee con la anon key (RLS filtra los activos).
const { handlePreflight, reply } = require('./_lib/http.js');

module.exports = async function handler(req, res) {
  const c = handlePreflight(req, res, 'GET, OPTIONS');
  if (!c) return;
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return reply(res, 500, c.headers, { error: 'Tienda no configurada' });
  try {
    const r = await fetch(url + '/rest/v1/products?select=id,name,description,category,price,compare_price,stock,image_url,featured&active=eq.true&order=featured.desc,created_at.desc',
      { headers: { apikey: key, authorization: 'Bearer ' + key } });
    if (!r.ok) return reply(res, 200, c.headers, { products: [] });
    return reply(res, 200, c.headers, { products: await r.json() });
  } catch (e) { return reply(res, 500, c.headers, { error: 'error interno' }); }
};
