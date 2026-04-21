import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { sala_id } = req.query;
    if (sala_id) {
      const { data, error } = await supabase
        .from('sala_linhagens')
        .select('linhagem_codigo, linhagens(codigo, nome)')
        .eq('sala_id', sala_id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data.map(d => d.linhagens));
    }
    const { data, error } = await supabase.from('linhagens').select('*').order('codigo');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { sala_id, linhagem_codigo } = req.body;
    const { data, error } = await supabase
      .from('sala_linhagens')
      .insert([{ sala_id, linhagem_codigo }])
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { sala_id, linhagem_codigo } = req.body;
    const { error } = await supabase
      .from('sala_linhagens')
      .delete()
      .eq('sala_id', sala_id)
      .eq('linhagem_codigo', linhagem_codigo);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}