import { createToken, sessionCookie } from '../../../lib/session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPERADMIN_SECRET = process.env.SUPERADMIN_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!SUPERADMIN_SECRET || req.headers['x-superadmin-secret'] !== SUPERADMIN_SECRET) {
    return res.status(403).json({ error: 'Nicht autorisiert' });
  }

  const { restaurantId } = req.body || {};
  if (!restaurantId) return res.status(400).json({ error: 'restaurantId erforderlich' });

  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantId}&select=id,name,username`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await r.json();
  if (!Array.isArray(data) || data.length === 0) {
    return res.status(404).json({ error: 'Restaurant nicht gefunden' });
  }

  const restaurant = data[0];
  const token = createToken({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    username: restaurant.username,
    exp: Date.now() + 2 * 3600 * 1000,
  });

  res.setHeader('Set-Cookie', sessionCookie(token));
  return res.status(200).json({ ok: true });
}
