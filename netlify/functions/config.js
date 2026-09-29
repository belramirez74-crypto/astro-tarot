// Devuelve la configuración pública de Supabase (URL + anon key). La anon key está
// diseñada para vivir en el frontend: la seguridad real la dan las políticas RLS de la base.
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL || null,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null
    })
  };
};
