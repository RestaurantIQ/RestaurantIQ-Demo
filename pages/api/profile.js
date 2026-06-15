import { getSession } from '../../lib/session';
import { db } from '../../lib/db';

const PUBLIC_SELECT = 'name,address,phone,hours,bot_name,bot_accent,description,chat_theme,logo_url';
const PRIVATE_SELECT = `${PUBLIC_SELECT},menu,notification_email,username`;
const ALLOWED_PATCH = ['address', 'phone', 'hours', 'menu', 'bot_name', 'bot_accent', 'description', 'notification_email', 'chat_theme', 'logo_url'];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { username } = req.query;

    if (username) {
      if (!/^[a-z0-9_-]{1,64}$/.test(username)) {
        return res.status(400).json({ error: 'Ungültiger Username' });
      }
      const r = await db(`restaurants?username=eq.${encodeURIComponent(username)}&select=${PUBLIC_SELECT}`);
      const [restaurant] = await r.json();
      if (!restaurant) return res.status(404).json({ error: 'Restaurant nicht gefunden' });
      return res.status(200).json(restaurant);
    }

    const session = getSession(req.headers.cookie);
    if (!session) return res.status(401).json({ error: 'Nicht autorisiert' });

    const r = await db(`restaurants?id=eq.${session.restaurantId}&select=${PRIVATE_SELECT}`);
    const [restaurant] = await r.json();
    return res.status(200).json(restaurant || {});
  }

  if (req.method === 'PATCH') {
    const session = getSession(req.headers.cookie);
    if (!session) return res.status(401).json({ error: 'Nicht autorisiert' });

    const updates = {};
    for (const key of ALLOWED_PATCH) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Keine gültigen Felder' });
    }

    const r = await db(`restaurants?id=eq.${session.restaurantId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!r.ok) return res.status(500).json({ error: 'Datenbankfehler' });
    const [updated] = await r.json();
    return res.status(200).json(updated || {});
  }

  res.status(405).end();
}
