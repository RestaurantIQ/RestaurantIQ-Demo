import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'Entschuldigung, ein Fehler ist aufgetreten.';
    setMessages([...newMessages, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'Georgia, serif', background: '#1a1a1a', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', padding: '24px 0 16px', borderBottom: '1px solid #c9a84c' }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 6 }}>Ristorante & Pizzeria</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 2 }}>La Fontana di Capri</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4, letterSpacing: 2 }}>Neulußheim · Ihr digitaler Assistent</div>
      </div>

      <div style={{ minHeight: 420, padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 60, fontSize: 14, lineHeight: 1.8 }}>
            Willkommen bei La Fontana di Capri 🇮🇹<br/>
            Wie kann ich Ihnen helfen?
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 16px',
              borderRadius: 2,
              fontSize: 14,
              lineHeight: 1.7,
              background: m.role === 'user' ? '#c9a84c' : '#2a2a2a',
              color: m.role === 'user' ? '#1a1a1a' : '#e0d8c8',
              border: m.role === 'user' ? 'none' : '1px solid #333'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 16px', background: '#2a2a2a', border: '1px solid #333', color: '#c9a84c', fontSize: 14 }}>...</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #333', paddingTop: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ihre Frage..."
          style={{ flex: 1, padding: '10px 14px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', fontFamily: 'Georgia, serif', fontSize: 14, outline: 'none' }}
        />
        <button
          onClick={sendMessage}
          style={{ padding: '10px 20px', background: '#c9a84c', border: 'none', color: '#1a1a1a', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
        >
          Senden
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#555' }}>
        Dieser Chat wird von KI unterstützt · RestaurantIQ by Zielbauer & Winkler
      </div>
    </div>
  );
}
