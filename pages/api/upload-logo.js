import { getSession } from '../../lib/session';

export const config = {
  api: { bodyParser: false },
};

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = getSession(req.headers.cookie);
  if (!session) return res.status(401).json({ error: 'Nicht autorisiert' });

  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('image/')) {
    return res.status(400).json({ error: 'Nur Bilder erlaubt.' });
  }

  const body = await readBody(req);
  if (body.length > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Logo darf max. 2 MB groß sein.' });
  }

  const ext = contentType.includes('png') ? 'png'
    : contentType.includes('gif') ? 'gif'
    : contentType.includes('webp') ? 'webp'
    : 'jpg';

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
  const path = `${session.restaurantId}/${Date.now()}.${ext}`;

  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/logos/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    return res.status(500).json({ error: err.error || 'Upload fehlgeschlagen' });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/logos/${path}`;

  await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${session.restaurantId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ logo_url: publicUrl }),
  });

  return res.status(200).json({ url: publicUrl });
}
