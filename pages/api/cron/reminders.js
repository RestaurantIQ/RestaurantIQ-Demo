import nodemailer from 'nodemailer';
import { db } from '../../../lib/db';

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildReminderHtml({ name, datum, uhrzeit, personen, sonderwunsch, restaurantName, address, phone }) {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5f0ea;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:40px 32px;max-width:480px;margin:0 auto}
.logo{font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#a8864a;font-weight:600;margin-bottom:6px}
h1{font-size:22px;color:#1a1612;margin:0 0 6px;font-family:Georgia,serif}
.sub{font-size:14px;color:#9e8f7e;margin-bottom:28px;line-height:1.5}
.badge{display:inline-block;background:#edfbf2;border:1px solid #b8e8cb;border-radius:8px;padding:6px 14px;font-size:12px;color:#2a8a50;font-weight:600;letter-spacing:0.05em;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-bottom:28px;background:#fdfaf5;border-radius:8px;overflow:hidden}
td{padding:10px 14px;font-size:14px;color:#3a3530;border-bottom:1px solid #f0ebe3}
td:first-child{color:#9e8f7e;width:120px;font-size:13px}
tr:last-child td{border-bottom:none}
.note{background:#f5f0ea;border-radius:8px;padding:14px 16px;font-size:13px;color:#7a6e64;line-height:1.6;margin-bottom:24px}
.divider{border:none;border-top:1px solid #f0ebe3;margin:24px 0}
.contact{font-size:13px;color:#9e8f7e;line-height:1.8}
.contact strong{color:#3a3530}
.footer{margin-top:28px;font-size:11px;color:#c0b8ae;text-align:center;line-height:1.6}
.gold{color:#a8864a}
</style></head><body>
<div class="card">
  <div class="logo">${esc(restaurantName)}</div>
  <h1>Ihre Reservierung morgen</h1>
  <p class="sub">Wir freuen uns, ${esc(name)}, Sie morgen begrüßen zu dürfen.</p>
  <div class="badge">&#10003; Reservierung bestätigt</div>
  <table>
    <tr><td>Datum</td><td>${esc(datum)}</td></tr>
    <tr><td>Uhrzeit</td><td>${esc(uhrzeit)} Uhr</td></tr>
    <tr><td>Personen</td><td>${esc(personen)}</td></tr>
    ${sonderwunsch ? `<tr><td>Ihr Wunsch</td><td>${esc(sonderwunsch)}</td></tr>` : ''}
  </table>
  <div class="note">
    Falls Sie Ihre Reservierung absagen oder ändern müssen, kontaktieren Sie uns bitte so früh wie möglich.
  </div>
  <hr class="divider">
  <div class="contact">
    <strong>${esc(restaurantName)}</strong><br>
    ${address ? `${esc(address)}<br>` : ''}
    ${phone ? `Tel: <strong>${esc(phone)}</strong>` : ''}
  </div>
  <div class="footer">
    Diese Erinnerung wurde automatisch versendet &middot; <span class="gold">RestaurantIQ</span>
  </div>
</div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.GMAIL_USER) {
    return res.status(200).json({ skipped: true, reason: 'no GMAIL_USER configured' });
  }

  const tomorrow = tomorrowStr();

  const r = await db(
    `reservations?datum=eq.${encodeURIComponent(tomorrow)}&status=eq.bestätigt&email=not.is.null&select=id,name,datum,uhrzeit,personen,email,sonderwunsch,restaurant_id,restaurants(name,address,phone)`
  );
  const rows = await r.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(200).json({ sent: 0, tomorrow });
  }

  const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  let sent = 0;
  for (const row of rows) {
    if (!row.email) continue;
    const restaurantName = row.restaurants?.name || 'RestaurantIQ';
    const address = row.restaurants?.address || null;
    const phone   = row.restaurants?.phone || null;

    await mailer.sendMail({
      from: `"${restaurantName}" <${process.env.GMAIL_USER}>`,
      to: row.email,
      subject: `Erinnerung: Ihr Tisch morgen um ${row.uhrzeit} Uhr – ${restaurantName}`,
      html: buildReminderHtml({ ...row, restaurantName, address, phone }),
    }).catch(e => console.error(`Reminder mail error (${row.id}):`, e));

    sent++;
  }

  return res.status(200).json({ sent, tomorrow });
}
