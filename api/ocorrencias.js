import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { isolador_id, tipo, data_occ, quantidade } = req.body;
    if (!isolador_id || !tipo || !data_occ || !quantidade)
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    const { data: iso } = await supabase.from('v_isoladores').select('saldo').eq('id', isolador_id).single();
    if (!iso) return res.status(404).json({ error: 'Isolador não encontrado.' });
    if (iso.saldo < quantidade)
      return res.status(400).json({ error: `Quantidade excede o saldo disponível (${iso.saldo}).` });
    const { data, error } = await supabase.from('ocorrencias')
      .insert([{ isolador_id, tipo, data_occ, quantidade }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID da ocorrência obrigatório.' });
    const { error } = await supabase.from('ocorrencias').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}