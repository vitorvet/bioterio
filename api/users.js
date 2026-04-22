import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ptpcpazpxwsoquottfkk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY_CLIMA
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('criado_em', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, role } = req.body;
    const { data, error } = await supabase
      .from('perfis')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}