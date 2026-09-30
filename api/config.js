// Devuelve la configuración pública de Supabase (URL + anon key). La anon key está
// diseñada para vivir en el frontend: la seguridad real la dan las políticas RLS de la base.
module.exports = async function handler(req, res) {
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null
  });
};
