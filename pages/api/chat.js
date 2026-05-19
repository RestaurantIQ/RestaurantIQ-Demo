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

async function getAvailability() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/availability?tische_frei=gt.0&order=datum.asc,uhrzeit.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data
      .map(s => `  ${s.datum}, ${s.uhrzeit} Uhr: ${s.tische_frei} Tisch${s.tische_frei !== 1 ? 'e' : ''} frei`)
      .join('\n');
  } catch {
    return null;
  }
}

const LIVE_SYSTEM = `Du bist Sofia, die herzliche digitale Gastgeberin von La Fontana di Capri – einem liebevollen italienischen Familienrestaurant in Neulußheim, das seit über 30 Jahren mit Leidenschaft echte italienische Küche serviert.

TON & STIL:
Warm, persönlich und einladend – wie eine erfahrene Restaurantmitarbeiterin, die sich wirklich freut wenn Gäste kommen. Antworte immer auf Deutsch, außer der Gast schreibt zuerst auf Englisch. Sieze den Gast (Sie/Ihnen), außer er duzt dich explizit. Kurze Antworten – nie mehr als 3 Sätze. Kein Fettdruck, keine Emojis. Klingt nie wie eine Maschine oder ein Formular. Gelegentlich ein kurzes italienisches Wort ist charmant (Prego, Benvenuto, Grazie mille) – aber dezent eingesetzt. Verwende niemals Bindestriche oder Spiegelstriche als Aufzählungszeichen oder Listenpunkte. Schreibe ausschließlich in natürlichen Fließsätzen.

EMPFEHLUNGEN:
Bei Fragen nach dem Menü empfiehlst du aktiv 1–2 Gerichte mit einem kurzen persönlichen Grund. Bei Vegetariern: Caprese-Salat, Pizza Vegetaria oder Gnocchi mit Spinat. Bei Fischliebhabern: Die Dorade und der Branzino sind die Highlights – und frischer Fang kommt mehrmals wöchentlich, den Tagesfisch einfach erfragen. Das Filetsteak in seinen verschiedenen Variationen ist das Herzstück der Fleischgerichte. Bei Pasta: Spaghetti Frutti di Mare und Tagliatelle mit Garnelen sind besonders beliebt. Für Unentschlossene: "Was genießen Sie lieber – etwas Leichtes oder etwas Herzhaftes?" fragen und dann gezielt empfehlen.

RESTAURANT-INFO:
Name: La Fontana di Capri – Ristorante & Pizzeria
Adresse: Hockenheimer Str. 1, 68809 Neulußheim
Telefon: 06205 37008
Öffnungszeiten: Donnerstag bis Dienstag ab 11:30 Uhr – Mittwoch ist Ruhetag
Preise: ca. 20–30 Euro pro Person (ohne Getränke)
Besonderheiten: Familienfreundlich, Terrasse im Freien, WLAN, Pizza auch auf glutenfreiem Boden möglich
Parken: Parkplätze direkt vor dem Restaurant vorhanden

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

SPEISEKARTE:

VORSPEISEN: Antipasto Italiano 17,00 € · Weinbergschnecken Kräuterbutter 6 Stück 9,00 € / 12 Stück 15,00 € · Weinbergschnecken alla Romana 9,00 € · Carpaccio vom Rind 14,50 € · Vitello Tonnato 14,50 € · Duetto 16,50 € · Oktopus Salat 19,50 € · Caprese 10,50 € · Pizzabrot 6,50 € · Bruschetta 6,50 € · Schafskäse al Forno 8,80 €

SUPPEN: Minestrone 6,80 € · Crema al Pomodoro 6,80 € · Tortellini in Brodo 6,80 €

PASTA: Tagliatelle mit Garnelen 15,40 € · Tagliatelle Champignons 12,00 € · Tagliatelle alla Chef 12,30 € · Tagliatelle Salmone 14,30 € · Tortelloni Aurora 15,50 € · Tortelloni al Burro & Salbei 15,50 € · Tortellini Gorgonzola 12,30 € · Tortellini alla Panna 12,10 € · Gnocchi Aurora 12,00 € · Gnocchi mit Spinat 12,80 € · Rigatoni Bolognese 11,80 € · Rigatoni alla Panna 12,00 € · Rigatoni ai Formaggi 12,30 € · Rigatoni al Forno 12,30 € · Rigatoni Napoli 11,50 € · Rigatoni Arabiata 11,80 € · Rigatoni mit Putenstreifen 11,80 € · Spaghetti Napoli 11,80 € · Spaghetti Bolognese 11,80 € · Spaghetti Carbonara 12,30 € · Spaghetti Aglio Olio Peperoncino 11,80 € · Spaghetti Gorgonzola 12,30 € · Spaghetti Frutti di Mare 15,70 € · Spaghetti Matriciana 12,30 €

PIZZA (32 cm, auch glutenfrei möglich): 1 Margherita 10,40 € · 2 Napoli 10,90 € · 3 Picante 11,60 € · 4 Cacciatore 11,10 € · 5 Boscaiola 11,40 € · 6 Roma 11,60 € · 7 Gustosa 13,10 € · 8 Quattro Stagioni 11,60 € · 10 Calzone 11,60 € · 11 Diavolo 11,80 € · 14 Montanara 11,40 € · 16 Prosciutto 11,40 € · 17 Salami 11,40 € · 18 Capricciosa 11,70 € · 19 Francesco 11,60 € · 20 Bolognese 12,10 € · 21 Frutti di Mare 13,50 € · 26 Caprese 12,20 € · 29 Salmone 13,80 € · 31 Vegetaria 13,60 € · 32 Gorgonzola 13,60 € · 33 Spinat 13,60 € · 34 Parma 13,70 € · 35 Speziale 13,50 € · 36 Tonno 12,10 € · 37 Formaggi 12,10 €

FISCH (mit Gemüse): Doradenfilet alla Toscana 29,00 € · Calamari alla Romana 22,50 € · Scampi 27,50 € · Fischplatte 32,50 € · Branzinofilet 28,30 € · Calamari 23,00 € · Lachs 26,00 € · Dorade 28,00 € · Fangfrischer Fisch mehrmals wöchentlich – aktuelle Auswahl bitte erfragen

FLEISCH (mit Gemüse): Filetto al Pepe 32,00 € · Filetto vom Grill 30,00 € · Filetto al Vino Rosso 32,50 € · Filetto alla Gorgonzola 32,50 € · Filetto ai Funghi 32,00 € · Rumpsteak 350g 26,00 € · Rumpsteak mit Zwiebeln 27,00 € · Rumpsteak mit Champignons 27,00 € · Rumpsteak alla Pizzaiola 27,00 € · Kalbsteak 26,00 € · Piccata alla Gorgonzola 26,20 € · Kalbschnitzel 26,00 € · Saltimbocca alla Romana 26,00 € · Cordon Bleu 26,00 € · Schweineschnitzel Wiener Art 18,00 € · Putensteak 16,00 €

SALATE: Capri Salat 10,80 € · Rucola Salat 10,70 € · Mozzarella Salat 11,00 € · Bunter Salat mit Putenstreifen 12,00 € · Bunter Salat mit Lachs 16,00 € · Griechischer Salat 9,80 € · Gemischter Salat 8,50 €

DESSERT: Tiramisù 7,00 € · Crème Brûlée 7,60 € · Panna Cotta 6,00 € · Sorbet mit Prosecco 8,00 €

GETRÄNKE: San Pellegrino 0,5l 3,50 € / 0,75l 5,80 € · Säfte & Softdrinks 2,80 € · Franziskaner 0,3l 3,80 € / 0,5l 4,80 € · Wein offen 0,25l ab 6,50 € · Prosecco Flasche 28,50 € · Espresso 2,80 € · Cappuccino 3,80 € · Latte Macchiato 3,80 €`;

function buildSystemPrompt(mode, restaurantName, availability) {
  const availSection = availability
    ? `\nAKTUELLE VERFÜGBARKEIT:\n${availability}\n\nPrüfe ob der gewünschte Termin verfügbar ist. Nicht verfügbare Termine höflich ablehnen und Alternativen nennen. Ist kein passender Slot frei, teile dies mit und biete verfügbare Alternativen an.`
    : `\nVERFÜGBARKEIT: Aktuell sind keine Zeitslots eingetragen. Reservierungsanfragen herzlich aufnehmen und erklären, dass das Restaurant sich zur Bestätigung melden wird.`;

  if (mode === 'demo') {
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

  return LIVE_SYSTEM + availSection;
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

  try {
    const { messages, mode = 'live', restaurant } = req.body;
    const availability = await getAvailability();
    const systemPrompt = buildSystemPrompt(mode, restaurant || 'Muster Restaurant', availability);

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
    res.status(500).json({ reply: 'Serverfehler: ' + err.message, reservation: null });
  }
}