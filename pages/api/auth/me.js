import { getSession } from '../../../lib/session';

export default function handler(req, res) {
  const session = getSession(req.headers.cookie);
  if (!session) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.status(200).json({ restaurantId: session.restaurantId, restaurantName: session.restaurantName });
}
