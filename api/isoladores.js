import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { sala, linhagem, arquivado } = req.query;
    let query = supabase
      .from('v_isoladores')
      .select('*')
      .order('criado_em', { ascending: false });
    if (sala) query = query.eq('sala', sala);
    if (linhagem) query = query.eq('linhagem', linhagem);
    query = query.eq('arquivado', arquivado === 'true');
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    if (data && data.length > 0) {
      const ids = data.map(d => d.id);
      const { data: occs } = await supabase
        .from('ocorrencias')
        .select('*')
        .in('isolador_id', ids)
        .order('data_occ');
      const occMap = {};
      (occs || []).forEach(o => {
        if (!occMap[o.isolador_id]) occMap[o.isolador_id] = [];
        occMap[o.isolador_id].push(o);
      });
      data.forEach(d => { d.ocorrencias = occMap[d.id] || []; });
    }
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { numero, sala, linhagem, data_nasc, origem, quantidade, qtd_machos, qtd_femeas } = req.body;
    if (!numero || !sala || !linhagem || !data_nasc || !origem || !quantidade) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    const { data, error } = await supabase
      .from('isoladores')
      .insert([{ numero, sala, linhagem, data_nasc, origem, quantidade, qtd_machos: qtd_machos||0, qtd_femeas: qtd_femeas||0 }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Método não permitido.' });
}