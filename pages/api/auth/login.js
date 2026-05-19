import { verifyPassword, hashPassword, createToken, sessionCookie } from '../../../lib/session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  if (loginAttempts.size > 5000) {
    for (const [k, times] of loginAttempts) {
      if (times.every(t => now - t >= 15 * 60 * 1000)) loginAttempts.delete(k);
    }
  }
  const recent = (loginAttempts.get(ip) || []).filter(t => now - t < 15 * 60 * 1000);
  if (recent.length >= 5) return false;
  recent.push(now);
  loginAttempts.set(ip, recent);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Zu viele Versuche. Bitte warte 15 Minuten.' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Fehlende Felder' });

  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/restaurants?username=eq.${encodeURIComponent(username)}&select=id,name,username,password_hash`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await r.json();

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(401).json({ error: 'Benutzername oder Passwort falsch.' });
  }

  const restaurant = data[0];
  const result = await verifyPassword(password, restaurant.password_hash);

  if (!result) {
    return res.status(401).json({ error: 'Benutzername oder Passwort falsch.' });
  }

  // Alten SHA256-Hash automatisch auf bcrypt upgraden
  if (result === 'legacy') {
    const newHash = await hashPassword(password);
    await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurant.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password_hash: newHash }),
    });
  }

  const token = createToken({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    username: restaurant.username,
    exp: Date.now() + 7 * 24 * 3600 * 1000,
  });

  res.setHeader('Set-Cookie', sessionCookie(token));
  res.status(200).json({ restaurantId: restaurant.id, restaurantName: restaurant.name });
}
