// api/upload.js
import { put } from '@vercel/blob';

// Usa Edge Runtime (mais rápido e aceita arrayBuffer direto)
export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response('Use POST', { status: 405 });
    }

    // Pegamos o nome e o tipo vindos do header (enviado pelo front)
    const filename = req.headers.get('x-filename') || `upload-${Date.now()}`;
    const contentType = req.headers.get('content-type') || 'application/octet-stream';

    // Lemos os bytes do arquivo
    const arrayBuffer = await req.arrayBuffer();

    // Gravamos no Blob (pasta uploads/)
    const blob = await put(`uploads/${Date.now()}-${filename}`, arrayBuffer, {
      access: 'public',
      contentType
    });

    // Retornamos a URL pública do arquivo
    return new Response(JSON.stringify({ url: blob.url }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}
