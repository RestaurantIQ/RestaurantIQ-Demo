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
  if (req.method !== 'POST') return res.status(405).end();

  const { name, datum, uhrzeit, personen, telefon } = req.body;

  const dbRes = await db('reservations', {
    method: 'POST',
    body: JSON.stringify({ name, datum, uhrzeit, personen, telefon, status: 'neu' }),
  });

  if (!dbRes.ok) {
    const err = await dbRes.json();
    return res.status(500).json({ error: err.message || 'Datenbankfehler' });
  }

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

  if (process.env.RESEND_API_KEY) {
    const text = [
      'Neue Reservierung über RestaurantIQ',
      '',
      'Name:     ' + name,
      'Datum:    ' + datum,
      'Uhrzeit:  ' + uhrzeit,
      'Personen: ' + personen,
      'Telefon:  ' + telefon,
      '',
      'Verwalten: https://restaurant-iq-demo.vercel.app/admin',
    ].join('\n');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RestaurantIQ <onboarding@resend.dev>',
        to: 'team.restaurantiq@gmail.com',
        subject: `Neue Reservierung: ${name} – ${datum} um ${uhrzeit} (${personen} Pers.)`,
        text,
      }),
    }).catch(e => console.error('Email error:', e));
  }

  res.status(200).json({ success: true });
}