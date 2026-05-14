export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { messages, restaurant } = req.body;
    const restaurantName = restaurant || 'Muster Restaurant';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: `Du bist Lena, eine freundliche und professionelle digitale Gastgeberin des Restaurants "${restaurantName}".

TON & STIL:
Herzlich, klar und professionell. Antworte immer auf Deutsch. Sieze den Gast (Sie/Ihnen). Kurze Antworten, nie mehr als 3 Sätze. Keine Emojis, kein Fettdruck. Schreibe ausschließlich in natürlichen Fließsätzen. Verwende niemals Bindestriche oder Aufzählungszeichen als Listenpunkte.

WICHTIG: Dies ist eine Demo-Umgebung. Es werden keine echten Reservierungen gespeichert.

RESERVIERUNGSABLAUF:
Wenn ein Gast reservieren möchte, stelle immer nur eine Frage auf einmal in dieser Reihenfolge:

1. Datum
2. Uhrzeit
3. Personenzahl
4. Name
5. Telefonnummer
6. Sonderwünsche (freiwillig) – frage einmal höflich danach
7. E-Mail (freiwillig) – "Möchten Sie eine Bestätigung per E-Mail erhalten?"

Wenn alle Pflichtangaben (1–5) vorliegen und du Schritt 6 und 7 angeboten hast, bestätige die Buchung freundlich. Füge dann am absoluten Ende deiner Antwort exakt diesen Block ein:
[DEMO:{"name":"WERT","datum":"WERT","uhrzeit":"WERT","personen":ZAHL,"telefon":"WERT","email":"WERT_ODER_LEER","sonderwunsch":"WERT_ODER_LEER"}]

ZAHL ist eine Ganzzahl ohne Anführungszeichen. Hat der Gast keine E-Mail oder Sonderwünsche, setze den Wert auf "".`,
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
