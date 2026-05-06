export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
     model: 'claude-haiku-4-5-20251001',

        max_tokens: 1000,
        system: `Du bist der freundliche digitale Assistent von La Fontana di Capri, einem Ristorante & Pizzeria in Neulußheim (Hockenheimer Str. 1, 68809 Neulußheim). Telefon: 06205 37008. Öffnungszeiten: Donnerstag bis Dienstag ab 11:30 Uhr, Mittwoch Ruhetag. Antworte stets auf Deutsch, freundlich und präzise. Bei Reservierungen bitte auf 06205 37008 verweisen.Antworte immer kurz und präzise — maximal 3 Sätze. Keine Emojis. Kein Fettdruck.
`,
        messages: messages
      })
    });

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? 'Keine Antwort erhalten.';
    res.status(200).json({ reply: text });

  } catch (err) {
    res.status(500).json({ reply: 'Serverfehler: ' + err.message });
  }
}
