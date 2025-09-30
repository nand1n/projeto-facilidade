// api/upload.js (Node.js Serverless Function)
import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: false } // precisamos dos bytes crus
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Use POST');
      return;
    }

    // nome e tipo do arquivo vindos do header
    const filenameHeader = req.headers['x-filename'] || `upload-${Date.now()}`;
    const filename = decodeURIComponent(Array.isArray(filenameHeader) ? filenameHeader[0] : filenameHeader);
    const contentTypeHeader = req.headers['content-type'] || 'application/octet-stream';
    const contentType = Array.isArray(contentTypeHeader) ? contentTypeHeader[0] : contentTypeHeader;

    // ler o corpo como Buffer (bytes)
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', (c) => chunks.push(c));
      req.on('end', resolve);
      req.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);

    // salvar no Blob (público)
    const blob = await put(`uploads/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
