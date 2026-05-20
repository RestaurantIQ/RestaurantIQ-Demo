import { hashPassword } from '../../../lib/session';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const SUPERADMIN_SECRET = process.env.SUPERADMIN_SECRET;

function checkAuth(req) {
  return SUPERADMIN_SECRET && req.headers['x-superadmin-secret'] === SUPERADMIN_SECRET;
}

export default async function handler(req, res) {
  if (!checkAuth(req)) return res.status(403).json({ error: 'Nicht autorisiert' });

  if (req.method === 'GET') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/restaurants?select=id,name,username,is_demo,admin_notes,last_login_at&order=name.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await r.json();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, username, password } = req.body || {};
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
    return res.status(201).json(data[0]);
  }

  if (req.method === 'PATCH') {
    const { id, admin_notes, is_demo, new_password } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id erforderlich' });

    const updates = {};
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    if (is_demo !== undefined) updates.is_demo = is_demo;
    if (new_password) updates.password_hash = await hashPassword(new_password);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nichts zu aktualisieren' });
    }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!r.ok) return res.status(500).json({ error: 'Update fehlgeschlagen' });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
