import { getSession } from '../../lib/session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

function db(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });
}

export default async function handler(req, res) {
  const session = getSession(req.headers.cookie);
  if (!session) return res.status(401).json({ error: 'Nicht autorisiert' });

  const { restaurantId } = session;

  if (req.method === 'GET') {
    const r = await db(`restaurants?id=eq.${restaurantId}&select=template`);
    const data = await r.json();
    return res.status(200).json(data[0]?.template || { times: ['12:00', '18:00'], cells: {} });
  }

  if (req.method === 'PATCH') {
    const { template } = req.body;
    if (!template) return res.status(400).json({ error: 'template fehlt' });
    const r = await db(`restaurants?id=eq.${restaurantId}`, {
      method: 'PATCH',
      body: JSON.stringify({ template }),
    });
    return res.status(r.ok ? 200 : 500).json({ success: r.ok });
  }

  res.status(405).end();
}
