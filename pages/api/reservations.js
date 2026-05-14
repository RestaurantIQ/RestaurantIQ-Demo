import { getSession } from '../../lib/session';
import nodemailer from 'nodemailer';

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

function getMailer() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

async function sendGuestEmail(reservation, status, restaurantName) {
  if (!process.env.GMAIL_USER || !reservation.email) return;
  const confirmed = status === 'bestätigt';

  const html = confirmed
    ? `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5f5f7;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:0 auto}
h2{font-size:20px;color:#1d1d1f;margin:0 0 4px}
.sub{font-size:13px;color:#6e6e73;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
td{padding:8px 0;font-size:14px;color:#3d3d3f;border-bottom:1px solid #f0f0f5}
td:first-child{color:#6e6e73;width:110px}
.badge{display:inline-block;background:#edfbf2;color:#3a9e5f;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:20px}
.footer{margin-top:24px;font-size:11px;color:#6e6e73;text-align:center}
</style></head><body><div class="card">
  <div class="badge">&#10003; Reservierung bestätigt</div>
  <h2>Wir freuen uns auf Sie!</h2>
  <div class="sub">${restaurantName}</div>
  <table>
    <tr><td>Name</td><td>${reservation.name}</td></tr>
    <tr><td>Datum</td><td>${reservation.datum}</td></tr>
    <tr><td>Uhrzeit</td><td>${reservation.uhrzeit} Uhr</td></tr>
    <tr><td>Personen</td><td>${reservation.personen}</td></tr>
  </table>
  <div class="footer">Powered by RestaurantIQ</div>
</div></body></html>`
    : `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5f5f7;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:0 auto}
h2{font-size:20px;color:#1d1d1f;margin:0 0 4px}
.sub{font-size:13px;color:#6e6e73;margin-bottom:24px}
.badge{display:inline-block;background:#fdf0ee;color:#c0392b;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:20px}
.footer{margin-top:24px;font-size:11px;color:#6e6e73;text-align:center}
</style></head><body><div class="card">
  <div class="badge">Reservierung nicht möglich</div>
  <h2>Leider kein Tisch verfügbar</h2>
  <div class="sub">${restaurantName}</div>
  <p style="font-size:14px;color:#3d3d3f">Für Ihren Termin am <strong>${reservation.datum} um ${reservation.uhrzeit} Uhr</strong> steht leider kein Tisch zur Verfügung. Bitte kontaktieren Sie uns direkt.</p>
  <div class="footer">Powered by RestaurantIQ</div>
</div></body></html>`;

  await getMailer().sendMail({
    from: `"${restaurantName}" <${process.env.GMAIL_USER}>`,
    to: reservation.email,
    subject: confirmed
      ? `Ihre Reservierung ist bestätigt – ${restaurantName}`
      : `Ihre Reservierungsanfrage – ${restaurantName}`,
    html,
  }).catch(e => console.error('Guest email error:', e));
}

export default async function handler(req, res) {
  const session = getSession(req.headers.cookie);
  if (!session) return res.status(401).json({ error: 'Nicht autorisiert' });

  const { restaurantId, restaurantName } = session;

  if (req.method === 'GET') {
    const r = await db(`reservations?or=(restaurant_id.eq.${restaurantId},restaurant_id.is.null)&order=created_at.desc`);
    const data = await r.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  }

  if (req.method === 'POST') {
    const { name, datum, uhrzeit, personen, telefon, email, sonderwunsch, status } = req.body;
    const r = await db('reservations', {
      method: 'POST',
      body: JSON.stringify({
        name, datum, uhrzeit, personen, telefon,
        email: email || '',
        sonderwunsch: sonderwunsch || '',
        status: status || 'bestätigt',
        restaurant_id: restaurantId,
      }),
    });
    const data = await r.json();
    if (r.ok && data[0] && (status === 'bestätigt') && email) {
      await sendGuestEmail(data[0], 'bestätigt', restaurantName);
    }
    return res.status(r.ok ? 201 : 500).json(Array.isArray(data) ? data[0] : data);
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const r = await db(`reservations?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const data = await r.json();

    // Send guest email if status is confirmed or cancelled
    if (['bestätigt', 'abgesagt'].includes(status)) {
      const getRes = await db(`reservations?id=eq.${id}&select=name,datum,uhrzeit,personen,email`);
      const [reservation] = await getRes.json();
      if (reservation) await sendGuestEmail(reservation, status, restaurantName);
    }

    return res.status(200).json(data);
  }

  res.status(405).end();
}
