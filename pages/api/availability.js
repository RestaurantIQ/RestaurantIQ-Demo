import { getSession } from '../../lib/session';
import { db } from '../../lib/db';

export default async function handler(req, res) {
  const session = getSession(req.headers.cookie);
  if (!session) return res.status(401).json({ error: 'Nicht autorisiert' });

  const { restaurantId } = session;

  if (req.method === 'GET') {
    const r = await db(`availability?or=(restaurant_id.eq.${restaurantId},restaurant_id.is.null)&order=datum.asc,uhrzeit.asc`);
    const data = await r.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  }

  if (req.method === 'POST') {
    const { datum, uhrzeit, tische_frei } = req.body;
    const r = await db('availability', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ datum, uhrzeit, tische_frei, restaurant_id: restaurantId }),
    });
    const data = await r.json();
    return res.status(r.ok ? 200 : 500).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await db(`availability?id=eq.${encodeURIComponent(id)}&restaurant_id=eq.${restaurantId}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
