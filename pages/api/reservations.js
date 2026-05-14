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
    // Include records without restaurant_id for backward compatibility (existing La Fontana data)
    const r = await db(`reservations?or=(restaurant_id.eq.${restaurantId},restaurant_id.is.null)&order=created_at.desc`);
    const data = await r.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const r = await db(`reservations?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const data = await r.json();
    return res.status(200).json(data);
  }

  res.status(405).end();
}
