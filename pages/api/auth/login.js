import { hashPassword, createToken, sessionCookie } from '../../../lib/session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Fehlende Felder' });

  const hash = hashPassword(password);

  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/restaurants?username=eq.${encodeURIComponent(username)}&select=id,name,username,password_hash`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await r.json();

  if (!Array.isArray(data) || data.length === 0 || data[0].password_hash !== hash) {
    return res.status(401).json({ error: 'Benutzername oder Passwort falsch.' });
  }

  const restaurant = data[0];
  const token = createToken({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    username: restaurant.username,
    exp: Date.now() + 7 * 24 * 3600 * 1000,
  });

  res.setHeader('Set-Cookie', sessionCookie(token));
  res.status(200).json({ restaurantId: restaurant.id, restaurantName: restaurant.name });
}
