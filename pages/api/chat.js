const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

const RESERVATION_TOOL = {
  name: 'make_reservation',
  description: 'Speichert eine Tischreservierung sobald alle Pflichtangaben vom Gast vorliegen.',
  input_schema: {
    type: 'object',
    properties: {
      name:         { type: 'string' },
      datum:        { type: 'string', description: 'Format: TT.MM.JJJJ' },
      uhrzeit:      { type: 'string', description: 'Format: HH:MM' },
      personen:     { type: 'integer' },
      telefon:      { type: 'string' },
      email:        { type: 'string', description: 'Leer lassen wenn nicht angegeben' },
      sonderwunsch: { type: 'string', description: 'Leer lassen wenn nicht angegeben' },
    },
    required: ['name', 'datum', 'uhrzeit', 'personen', 'telefon'],
  },
};

async function getRestaurant(username) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !username) return null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/restaurants?username=eq.${encodeURIComponent(username)}&select=id,name,address,phone,hours,menu,bot_name,bot_accent,description`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await r.json();
    return data?.[0] || null;
  } catch { return null; }
}

async function getAvailability(restaurantId) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const filter = restaurantId
      ? `restaurant_id=eq.${restaurantId}&tische_frei=gt.0`
      : `tische_frei=gt.0`;
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/availability?${filter}&order=datum.asc,uhrzeit.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data
      .map(s => `  ${s.datum}, ${s.uhrzeit} Uhr: ${s.tische_frei} Tisch${s.tische_frei !== 1 ? 'e' : ''} frei`)
      .join('\n');
  } catch { return null; }
}

function accentLine(accent) {
  switch (accent) {
    case 'italian':
      return 'Gelegentlich ein kurzes italienisches Wort ist charmant (Prego, Benvenuto, Grazie mille, Certo) – dezent eingesetzt.';
    case 'french':
      return 'Gelegentlich ein kurzes französisches Wort ist charmant (Merci, Bienvenue, Bonsoir, Bien sûr) – dezent eingesetzt.';
    case 'greek':
      return 'Gelegentlich ein kurzes griechisches Wort ist charmant (Kalimera, Efcharistó, Yamas) – dezent eingesetzt.';
    case 'modern':
      return 'Locker und enthusiastisch – wie ein junger, engagierter Mitarbeiter. Direkt, klar, herzlich.';
    case 'classic':
    default:
      return 'Professionell und zuvorkommend – klassischer Gastgeberstandard ohne regionale Färbung.';
  }
}

function buildLivePrompt(restaurant, availability) {
  const {
    name,
    address,
    phone,
    hours,
    menu,
    bot_name = 'Sofia',
    bot_accent = 'classic',
    description,
  } = restaurant;

  const availSection = availability
    ? `\nAKTUELLE VERFÜGBARKEIT:\n${availability}\n\nPrüfe ob der gewünschte Termin verfügbar ist. Nicht verfügbare Termine höflich ablehnen und Alternativen nennen. Ist kein passender Slot frei, teile dies mit und biete verfügbare Alternativen an.`
    : `\nVERFÜGBARKEIT: Aktuell sind keine Zeitslots eingetragen. Reservierungsanfragen herzlich aufnehmen und erklären, dass das Restaurant sich zur Bestätigung melden wird.`;

  return `Du bist ${bot_name}, die herzliche digitale Gastgeberin von ${name}${description ? ` – ${description}` : ''}.

TON & STIL:
Warm, persönlich und einladend – wie eine erfahrene Restaurantmitarbeiterin, die sich wirklich freut wenn Gäste kommen. Antworte immer auf Deutsch, außer der Gast schreibt zuerst auf Englisch. Sieze den Gast (Sie/Ihnen), außer er duzt dich explizit. Kurze Antworten – nie mehr als 3 Sätze. Kein Fettdruck, keine Emojis. Klingt nie wie eine Maschine oder ein Formular. ${accentLine(bot_accent)} Verwende niemals Bindestriche oder Spiegelstriche als Aufzählungszeichen oder Listenpunkte. Schreibe ausschließlich in natürlichen Fließsätzen.

EMPFEHLUNGEN:
Bei Fragen nach dem Menü empfiehlst du aktiv 1–2 Gerichte mit einem kurzen persönlichen Grund. Frage Unentschlossene: "Was genießen Sie lieber – etwas Leichtes oder etwas Herzhaftes?" und empfehle dann gezielt aus der Speisekarte.

RESTAURANT-INFO:
Name: ${name}${address ? `\nAdresse: ${address}` : ''}${phone ? `\nTelefon: ${phone}` : ''}${hours ? `\nÖffnungszeiten: ${hours}` : ''}

RESERVIERUNGSABLAUF:
Führe das Gespräch natürlich und herzlich – immer nur eine Frage auf einmal, in dieser Reihenfolge:
1. Datum
2. Uhrzeit
3. Personenzahl
4. Name
5. Telefonnummer
6. Sonderwünsche (freiwillig)
7. E-Mail (freiwillig)

Wenn alle Pflichtangaben (1–5) vorliegen und du 6 und 7 angeboten hast, ruf das Tool make_reservation auf. Bestätige danach herzlich in 1–2 Sätzen.
${menu ? `\nSPEISEKARTE:\n${menu}` : ''}${availSection}`;
}

function buildDemoPrompt(restaurantName, availability) {
  const availSection = availability
    ? `\nAKTUELLE VERFÜGBARKEIT:\n${availability}\n\nPrüfe ob der gewünschte Termin verfügbar ist. Nicht verfügbare Termine höflich ablehnen und Alternativen nennen.`
    : `\nVERFÜGBARKEIT: Aktuell sind keine Zeitslots eingetragen. Reservierungsanfragen herzlich aufnehmen und erklären, dass das Restaurant sich zur Bestätigung melden wird.`;

  return `Du bist Lena, eine freundliche digitale Gastgeberin des Restaurants "${restaurantName}".

TON & STIL:
Herzlich, klar und professionell. Antworte auf Deutsch. Sieze den Gast. Kurze Antworten (max. 3 Sätze). Keine Emojis, kein Fettdruck. Natürliche Fließsätze, keine Aufzählungszeichen.

Weise den Gast einmal zu Beginn darauf hin dass dies eine Demo ist und keine echten Daten gespeichert werden.

RESERVIERUNGSABLAUF (immer nur eine Frage auf einmal):
1. Datum
2. Uhrzeit
3. Personenzahl
4. Name
5. Telefonnummer
6. Sonderwünsche (freiwillig)
7. E-Mail (freiwillig)

Wenn alle Pflichtangaben (1-5) vorliegen und du 6 und 7 angeboten hast, ruf das Tool make_reservation auf und bestätige freundlich in 1-2 Sätzen.${availSection}`;
}

async function callClaude(systemPrompt, messages) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      tools: [RESERVATION_TOOL],
      system: systemPrompt,
      messages,
    }),
  });
  return r.json();
}

const chatRateLimit = new Map();
function isChatRateLimited(ip) {
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const entry = chatRateLimit.get(ip);
  if (!entry || now - entry.start > window) { chatRateLimit.set(ip, { count: 1, start: now }); return false; }
  if (entry.count >= 30) return true;
  entry.count++;
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (isChatRateLimited(ip)) return res.status(429).json({ error: 'Zu viele Anfragen. Bitte warten.' });

  if (!Array.isArray(req.body?.messages) || req.body.messages.length > 20) {
    return res.status(400).json({ error: 'Ungültige Anfrage.' });
  }
  const totalChars = req.body.messages.reduce((s, m) => s + String(m?.content || '').length, 0);
  if (totalChars > 8000) {
    return res.status(429).json({ error: 'Nachricht zu lang.' });
  }

  try {
    const { messages, mode = 'live', username, restaurant: demoName } = req.body;

    let systemPrompt;

    if (mode === 'demo') {
      const availability = await getAvailability(null);
      systemPrompt = buildDemoPrompt(demoName || 'Muster Restaurant', availability);
    } else {
      const restaurant = await getRestaurant(username);
      const availability = await getAvailability(restaurant?.id || null);
      systemPrompt = restaurant
        ? buildLivePrompt(restaurant, availability)
        : buildDemoPrompt('Restaurant', availability);
    }

    let data = await callClaude(systemPrompt, messages);
    let reservation = null;

    if (data.stop_reason === 'tool_use') {
      const toolBlock = data.content.find(b => b.type === 'tool_use');
      if (toolBlock?.name === 'make_reservation') {
        reservation = {
          ...toolBlock.input,
          email: toolBlock.input.email || '',
          sonderwunsch: toolBlock.input.sonderwunsch || '',
        };
        data = await callClaude(systemPrompt, [
          ...messages,
          { role: 'assistant', content: data.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolBlock.id, content: 'Reservierung erfolgreich gespeichert.' }] },
        ]);
      }
    }

    const reply = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    res.status(200).json({ reply: reply || 'Keine Antwort erhalten.', reservation });
  } catch (err) {
    console.error('chat error:', err);
    res.status(500).json({ reply: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.', reservation: null });
  }
}
