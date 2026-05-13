export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, datum, uhrzeit, personen, telefon } = req.body;

  const emailText = [
    'Neue Tischreservierung über den RestaurantIQ-Chatbot',
    '',
    'Name:     ' + name,
    'Datum:    ' + datum,
    'Uhrzeit:  ' + uhrzeit,
    'Personen: ' + personen,
    'Telefon:  ' + telefon,
    '',
    'Diese Reservierung wurde automatisch über den Chatbot auf der Website aufgenommen.',
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RestaurantIQ <onboarding@resend.dev>',
        to: 'team.restaurantiq@gmail.com',
        subject: `Neue Reservierung: ${name} – ${datum} um ${uhrzeit} (${personen} Pers.)`,
        text: emailText,
      }),
    });

    if (!r.ok) {
      const err = await r.json();
      throw new Error(err.message || 'Resend-Fehler');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ error: err.message });
  }
}