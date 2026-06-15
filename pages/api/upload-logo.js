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

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    console.error('upload-logo readBody error:', err);
    return res.status(500).json({ error: 'Fehler beim Lesen der Datei.' });
  }

  if (body.length > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Logo darf max. 2 MB groß sein.' });
  }

  const ext = contentType.includes('png') ? 'png'
    : contentType.includes('gif') ? 'gif'
    : contentType.includes('webp') ? 'webp'
    : 'jpg';

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('upload-logo: missing env vars');
    return res.status(500).json({ error: 'Server-Konfigurationsfehler.' });
  }

  const storagePath = `${session.restaurantId}/${Date.now()}.${ext}`;

  let uploadRes;
  try {
    uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/logos/${storagePath}`, {
      method: 'PUT',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
      },
      body,
    });
  } catch (err) {
    console.error('upload-logo fetch error:', err);
    return res.status(500).json({ error: 'Upload fehlgeschlagen.' });
  }

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => '');
    console.error('upload-logo supabase error:', uploadRes.status, errText);
    return res.status(500).json({ error: `Upload fehlgeschlagen (${uploadRes.status}): ${errText}` });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/logos/${storagePath}`;

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
