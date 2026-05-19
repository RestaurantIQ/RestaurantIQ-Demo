import { hashPassword } from '../../../lib/session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const SETUP_SECRET = process.env.SETUP_SECRET;

const createAttempts = new Map();
function checkCreateLimit(ip) {
  const now = Date.now();
  const entry = createAttempts.get(ip);
  if (!entry || now - entry.start > 60 * 60 * 1000) { createAttempts.set(ip, { count: 1, start: now }); return true; }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkCreateLimit(ip)) return res.status(429).json({ error: 'Zu viele Anfragen.' });

  const { secret, name, username, password } = req.body || {};

  if (!SETUP_SECRET || secret !== SETUP_SECRET) {
    return res.status(403).json({ error: 'Nicht autorisiert' });
  }

  if (!name || !username || !password) {
    return res.status(400).json({ error: 'name, username und password sind erforderlich' });
  }

  const password_hash = await hashPassword(password);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/restaurants`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ name, username, password_hash }),
  });

  const data = await r.json();
  if (!r.ok) return res.status(500).json({ error: data });

  return res.status(201).json({ id: data[0]?.id, name, username });
}
