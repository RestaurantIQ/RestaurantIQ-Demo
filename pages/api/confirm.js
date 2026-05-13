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
  const { id, action, token } = req.query;

  if (token !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send('Nicht autorisiert.');
  }

  if (!['bestätigt', 'abgesagt'].includes(action)) {
    return res.status(400).send('Ungültige Aktion.');
  }

  const r = await db(`reservations?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: action }),
  });

  if (!r.ok) {
    return res.status(500).send('Datenbankfehler.');
  }

  const label = action === 'bestätigt' ? '✓ Bestätigt' : '✗ Abgesagt';
  const color = action === 'bestätigt' ? '#3a9e5f' : '#c0392b';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>RestaurantIQ</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f0ea; }
        .card { background: #fff; border-radius: 14px; padding: 40px 36px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 320px; }
        .icon { font-size: 40px; margin-bottom: 12px; }
        .label { font-size: 20px; font-weight: 600; color: ${color}; margin-bottom: 8px; }
        .sub { font-size: 14px; color: #9e8f7e; margin-bottom: 20px; }
        a { font-size: 13px; color: #b09050; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">${action === 'bestätigt' ? '✓' : '✗'}</div>
        <div class="label">${label}</div>
        <div class="sub">Die Reservierung wurde aktualisiert.</div>
        <a href="/admin">Zur Admin-Konsole →</a>
      </div>
    </body>
    </html>
  `);
}