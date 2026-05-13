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
  if (req.method === 'GET') {
    const { password } = req.query;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Nicht autorisiert' });
    }
    const r = await db('reservations?order=created_at.desc');
    const data = await r.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  }

  if (req.method === 'PATCH') {
    const { id, status, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Nicht autorisiert' });
    }
    const r = await db(`reservations?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const data = await r.json();
    return res.status(200).json(data);
  }

  res.status(405).end();
}