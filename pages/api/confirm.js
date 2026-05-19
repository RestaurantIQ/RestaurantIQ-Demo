import nodemailer from 'nodemailer';
import { verifyConfirmToken } from '../../lib/session';

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
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendGuestEmail(reservation, restaurant, action) {
  if (!process.env.GMAIL_USER || !reservation.email) return;

  const confirmed = action === 'bestätigt';
  const rName    = restaurant?.name || 'Ihr Restaurant';
  const rAddress = restaurant?.address || '';
  const rPhone   = restaurant?.phone || '';

  const html = confirmed ? `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5f0ea;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:0 auto}
h2{font-size:20px;color:#1a1612;margin:0 0 4px}
.sub{font-size:13px;color:#9e8f7e;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
td{padding:8px 0;font-size:14px;color:#3a3530;border-bottom:1px solid #f0ebe3}
td:first-child{color:#9e8f7e;width:110px}
.badge{display:inline-block;background:#edfbf2;color:#3a9e5f;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:20px}
.footer{margin-top:24px;font-size:11px;color:#c0b8ae;text-align:center}
</style></head><body>
<div class="card">
  <div class="badge">&#10003; Reservierung bestaetigt</div>
  <h2>Wir freuen uns auf Sie!</h2>
  <div class="sub">${esc(rName)}</div>
  <table>
    <tr><td>Name</td><td>${esc(reservation.name)}</td></tr>
    <tr><td>Datum</td><td>${esc(reservation.datum)}</td></tr>
    <tr><td>Uhrzeit</td><td>${esc(reservation.uhrzeit)} Uhr</td></tr>
    <tr><td>Personen</td><td>${esc(reservation.personen)}</td></tr>
    ${rAddress ? `<tr><td>Adresse</td><td>${esc(rAddress)}</td></tr>` : ''}
  </table>
  ${rPhone ? `<p style="font-size:13px;color:#5a5245">Bei Rueckfragen erreichen Sie uns unter <strong>${esc(rPhone)}</strong>.</p>` : ''}
  <div class="footer">Powered by RestaurantIQ</div>
</div></body></html>`
  : `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5f0ea;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:0 auto}
h2{font-size:20px;color:#1a1612;margin:0 0 4px}
.sub{font-size:13px;color:#9e8f7e;margin-bottom:24px}
.badge{display:inline-block;background:#fdf0ee;color:#c0392b;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:20px}
.footer{margin-top:24px;font-size:11px;color:#c0b8ae;text-align:center}
</style></head><body>
<div class="card">
  <div class="badge">Reservierung nicht moeglich</div>
  <h2>Leider kein Tisch verfuegbar</h2>
  <div class="sub">${esc(rName)}</div>
  <p style="font-size:14px;color:#5a5245;margin-bottom:16px">Fuer Ihren gewuenschten Termin am <strong>${esc(reservation.datum)} um ${esc(reservation.uhrzeit)} Uhr</strong> steht leider kein Tisch zur Verfuegung.</p>
  ${rPhone ? `<p style="font-size:13px;color:#5a5245">Bitte rufen Sie uns an, wir finden gerne einen alternativen Termin: <strong>${esc(rPhone)}</strong></p>` : ''}
  <div class="footer">Powered by RestaurantIQ</div>
</div></body></html>`;

  const subject = confirmed
    ? `Ihre Reservierung ist bestaetigt - ${rName}`
    : `Ihre Reservierungsanfrage - ${rName}`;

  await getMailer().sendMail({
    from: `"${rName}" <${process.env.GMAIL_USER}>`,
    to: reservation.email,
    subject,
    html,
  }).catch(e => console.error('Guest email error:', e));
}

export default async function handler(req, res) {
  const { id, action, token } = req.query;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    return res.status(400).send('Ungueltige ID.');
  }

  if (!['bestätigt', 'abgesagt'].includes(action)) {
    return res.status(400).send('Ungueltige Aktion.');
  }

  if (!verifyConfirmToken(token, id, action)) {
    return res.status(401).send('Nicht autorisiert.');
  }

  const patchRes = await db(`reservations?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: action }),
  });

  if (!patchRes.ok) {
    return res.status(500).send('Datenbankfehler.');
  }

  const getRes = await db(`reservations?id=eq.${encodeURIComponent(id)}&select=name,datum,uhrzeit,personen,email,restaurant_id`);
  const [reservation] = await getRes.json();

  let restaurant = null;
  if (reservation?.restaurant_id) {
    const rRes = await db(`restaurants?id=eq.${reservation.restaurant_id}&select=name,address,phone`);
    const [r] = await rRes.json();
    restaurant = r || null;
  }

  if (reservation) await sendGuestEmail(reservation, restaurant, action);

  const confirmed = action === 'bestätigt';
  const color = confirmed ? '#3a9e5f' : '#c0392b';
  const guestNote = reservation?.email
    ? `<div class="note">Eine E-Mail wurde an den Gast gesendet.</div>`
    : `<div class="note">Kein E-Mail-Kontakt hinterlegt – bitte Gast direkt kontaktieren.</div>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RestaurantIQ</title>
<style>
body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f0ea}
.card{background:#fff;border-radius:14px;padding:40px 36px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:320px}
.icon{font-size:36px;margin-bottom:12px}
.label{font-size:20px;font-weight:600;color:${color};margin-bottom:12px}
.note{font-size:13px;color:#9e8f7e;margin-bottom:20px;background:#f5f0ea;padding:10px 14px;border-radius:8px}
a{font-size:13px;color:#b09050;text-decoration:none}
</style></head>
<body><div class="card">
  <div class="icon">${confirmed ? '&#10003;' : '&#10007;'}</div>
  <div class="label">${confirmed ? 'Bestaetigt' : 'Abgesagt'}</div>
  ${guestNote}
  <a href="/admin">Zur Admin-Konsole &rarr;</a>
</div></body></html>`);
}
