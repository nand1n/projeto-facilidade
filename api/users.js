// api/users.js
import { kv } from '@vercel/kv';

export const config = { api: { bodyParser: true } };

const USERS_KEY = 'pf:users'; // lista de usuários (array)

async function getUsers() {
  return (await kv.get(USERS_KEY)) || [];
}
async function saveUsers(list) {
  await kv.set(USERS_KEY, list);
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const list = await getUsers();
      return res.status(200).json(list);
    }
    if (req.method === 'POST') {
      const { nome, email, senha, role, ativo = true } = req.body || {};
      if (!nome || !email || !senha || !role) {
        return res.status(400).json({ error: 'Campos obrigatórios: nome, email, senha, role' });
      }
      const list = await getUsers();
      if (list.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ error: 'E-mail já cadastrado' });
      }
      const user = { nome, email, senha, role, ativo, created_at: new Date().toISOString() };
      list.push(user);
      await saveUsers(list);
      return res.status(201).json(user);
    }
    if (req.method === 'PUT') {
      const { email, patch } = req.body || {};
      if (!email || !patch) return res.status(400).json({ error: 'Informe email e patch' });
      const list = await getUsers();
      const i = list.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (i < 0) return res.status(404).json({ error: 'Usuário não encontrado' });
      list[i] = { ...list[i], ...patch };
      await saveUsers(list);
      return res.status(200).json(list[i]);
    }
    return res.status(405).end('Method Not Allowed');
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
