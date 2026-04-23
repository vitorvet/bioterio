import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { id } = req.query;

if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('v_isoladores')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Não encontrado.' });
    const { data: occs } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('isolador_id', id)
      .order('data_occ');
    data.ocorrencias = occs || [];
    return res.status(200).json(data);
  }


  if (req.method === 'PUT') {

    const { sala, linhagem, data_nasc, origem, quantidade, qtd_machos, qtd_femeas } = req.body;
    const { data, error } = await supabase
      .from('isoladores')
      .update({ sala, linhagem, data_nasc, origem, quantidade, qtd_machos: qtd_machos||0, qtd_femeas: qtd_femeas||0 })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH') {
    const { arquivado } = req.body;
    const { data, error } = await supabase
      .from('isoladores')
      .update({ arquivado })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('isoladores').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}