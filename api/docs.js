// api/docs.js
import { kv } from '@vercel/kv';

export const config = { api: { bodyParser: true } };

const DOCS_KEY = 'pf:docs'; // lista de docs (array)

async function getDocs() {
  // mantemos ordem "mais novo primeiro"
  return (await kv.get(DOCS_KEY)) || [];
}
async function saveDocs(list) {
  await kv.set(DOCS_KEY, list);
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const list = await getDocs();
      return res.status(200).json(list);
    }
    if (req.method === 'POST') {
      const { proto, paciente, medico, hospital, convenio, status, url, createdAt } = req.body || {};
      if (!proto || !createdAt) {
        return res.status(400).json({ error: 'Campos obrigatórios: proto, createdAt' });
      }
      const list = await getDocs();
      const entry = { proto, paciente, medico, hospital, convenio, status, url: url || null, createdAt };
      // unshift (mais novo no topo)
      list.unshift(entry);
      await saveDocs(list);
      return res.status(201).json(entry);
    }
    if (req.method === 'PATCH') {
      const { proto, patch } = req.body || {};
      if (!proto || !patch) return res.status(400).json({ error: 'Informe proto e patch' });
      const list = await getDocs();
      const i = list.findIndex(x => x.proto === proto);
      if (i < 0) return res.status(404).json({ error: 'Documento não encontrado' });
      list[i] = { ...list[i], ...patch };
      await saveDocs(list);
      return res.status(200).json(list[i]);
    }
    return res.status(405).end('Method Not Allowed');
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
