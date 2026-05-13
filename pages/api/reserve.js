import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const BASE_URL     = process.env.NEXT_PUBLIC_BASE_URL || 'https://restaurant-iq-demo.vercel.app';

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

function waLink(phone, name, datum, uhrzeit) {
  const cleaned = phone.replace(/\D/g, '').replace(/^0/, '49');
  const msg = encodeURIComponent(
    `Hallo ${name}, wir freuen uns Sie am ${datum} um ${uhrzeit} Uhr bei La Fontana di Capri begrüßen zu dürfen. Bis bald!`
  );
  return `https://wa.me/${cleaned}?text=${msg}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, datum, uhrzeit, personen, telefon, email, sonderwunsch } = req.body;

  const dbRes = await db('reservations', {
    method: 'POST',
    body: JSON.stringify({ name, datum, uhrzeit, personen, telefon, email: email || null, sonderwunsch: sonderwunsch || null, status: 'neu' }),
  });

  if (!dbRes.ok) {
    const err = await dbRes.json();
    return res.status(500).json({ error: err.message || 'Datenbankfehler' });
  }

  const [saved] = await dbRes.json();
  const id = saved?.id;

  const availRes = await db(
    `availability?datum=eq.${encodeURIComponent(datum)}&uhrzeit=eq.${encodeURIComponent(uhrzeit)}&select=id,tische_frei`
  );
  const availData = await availRes.json();
  if (availData?.[0]?.tische_frei > 0) {
    await db(`availability?id=eq.${availData[0].id}`, {
      method: 'PATCH',
      body: JSON.stringify({ tische_frei: availData[0].tische_frei - 1 }),
    });
  }

  if (process.env.GMAIL_USER && id) {
    const adminToken    = encodeURIComponent(process.env.ADMIN_PASSWORD);
    const confirmUrl    = `${BASE_URL}/api/confirm?id=${id}&action=best%C3%A4tigt&token=${adminToken}`;
    const declineUrl    = `${BASE_URL}/api/confirm?id=${id}&action=abgesagt&token=${adminToken}`;
    const whatsappUrl   = waLink(telefon, name, datum, uhrzeit);
    const emailRow      = email ? `<tr><td>E-Mail</td><td>${email}</td></tr>` : '';
    const sonderwunschRow = sonderwunsch ? `<tr><td>Sonderwunsch</td><td>${sonderwunsch}</td></tr>` : '';
    const guestNote     = email
      ? `<p style="font-size:12px;color:#9e8f7e;margin-top:8px">&#10003; Gast erhält automatisch eine Bestätigungsmail.</p>`
      : `<p style="font-size:12px;color:#9e8f7e;margin-top:8px">Kein E-Mail-Kontakt – Gast per WhatsApp benachrichtigen.</p>`;

    const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><style>
body{font-family:sans-serif;background:#f5f0ea;margin:0;padding:24px}
.card{background:#fff;border-radius:12px;padding:32px;max-width:480px;margin:0 auto}
h2{font-size:18px;color:#1a1612;margin:0 0 4px}
.sub{font-size:13px;color:#9e8f7e;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
td{padding:8px 0;font-size:14px;color:#3a3530;border-bottom:1px solid #f0ebe3}
td:first-child{color:#9e8f7e;width:110px}
.btn{display:inline-block;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none}
.confirm{background:#3a9e5f;color:#fff;margin-right:8px}
.decline{background:#fff;color:#c0392b;border:1px solid #c0392b}
.wa{display:block;margin-top:16px;font-size:13px;color:#25D366;text-decoration:none}
.footer{margin-top:24px;font-size:11px;color:#c0b8ae;text-align:center}
</style></head><body>
<div class="card">
  <h2>Neue Reservierungsanfrage</h2>
  <div class="sub">La Fontana di Capri &middot; RestaurantIQ</div>
  <table>
    <tr><td>Name</td><td>${name}</td></tr>
    <tr><td>Datum</td><td>${datum}</td></tr>
    <tr><td>Uhrzeit</td><td>${uhrzeit} Uhr</td></tr>
    <tr><td>Personen</td><td>${personen}</td></tr>
    <tr><td>Telefon</td><td>${telefon}</td></tr>
    ${emailRow}
    ${sonderwunschRow}
  </table>
  <a href="${confirmUrl}" class="btn confirm">&#10003; Bestätigen</a>
  <a href="${declineUrl}" class="btn decline">&#10007; Absagen</a>
  ${guestNote}
  <a href="${whatsappUrl}" class="wa">&#128172; Gast per WhatsApp benachrichtigen</a>
  <div class="footer">Powered by RestaurantIQ</div>
</div></body></html>`;

    await getMailer().sendMail({
      from: `"RestaurantIQ" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Neue Anfrage: ${name} - ${datum} um ${uhrzeit} (${personen} Pers.)`,
      html,
    }).catch(e => console.error('Email error:', e));
  }

  res.status(200).json({ success: true });
}
