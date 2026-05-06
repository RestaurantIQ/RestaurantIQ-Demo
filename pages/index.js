import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg = { role: 'user', content: msg };
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
    const reply = data.reply || 'Ein Fehler ist aufgetreten.';
    setMessages([...newMessages, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  const suggestions = [
    "Was empfehlt ihr?",
    "Gibt es vegetarische Gerichte?",
    "Wann habt ihr geöffnet?",
    "Ich möchte reservieren"
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F7F3EE; font-family: 'Inter', sans-serif; }
        .chat-wrap {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #FAFAF8;
        }
        .header {
          padding: 28px 24px 20px;
          background: #1C1712;
          text-align: center;
          border-bottom: 1px solid #2e2820;
        }
        .header-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 8px;
        }
        .header-name {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #F7F3EE;
          letter-spacing: 0.5px;
        }
        .header-sub {
          font-size: 11px;
          color: #7a6e60;
          margin-top: 6px;
          letter-spacing: 1px;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          font-size: 10px;
          color: #7a6e60;
          letter-spacing: 1px;
        }
        .status-dot {
          width: 6px; height: 6px;
          background: #4caf73;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .messages {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow-y: auto;
        }
        .empty {
          text-align: center;
          margin-top: 40px;
        }
        .empty-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .empty-text {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #2C2416;
          margin-bottom: 6px;
        }
        .empty-sub {
          font-size: 13px;
          color: #9a8e7a;
          line-height: 1.6;
        }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 20px;
        }
        .suggestion {
          padding: 8px 14px;
          background: white;
          border: 1px solid #E8E0D0;
          border-radius: 20px;
          font-size: 12px;
          color: #5a4e3a;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .suggestion:hover {
          background: #C9A84C;
          color: white;
          border-color: #C9A84C;
        }
        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: fadeUp 0.25s ease;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-row.user { flex-direction: row-reverse; }
        .avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #1C1712;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 12px;
          color: #C9A84C;
          flex-shrink: 0;
        }
        .bubble {
          max-width: 78%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.65;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
        }
        .bubble.bot {
          background: white;
          color: #2C2416;
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
          border: 1px solid #F0EBE0;
        }
        .bubble.user {
          background: #1C1712;
          color: #F7F3EE;
          border-radius: 18px 18px 4px 18px;
        }
        .typing {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .typing-bubble {
          background: white;
          border: 1px solid #F0EBE0;
          border-radius: 18px 18px 18px 4px;
          padding: 14px 18px;
          display: flex;
          gap: 4px;
          align-items: center;
          box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        }
        .typing-bubble span {
          width: 6px; height: 6px;
          background: #C9A84C;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing-bubble span:nth-child(2) { animation-delay: 0.15s; }
        .typing-bubble span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .input-area {
          padding: 14px 16px;
          background: white;
          border-top: 1px solid #EEE8DC;
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .input-field {
          flex: 1;
          padding: 11px 16px;
          background: #F7F3EE;
          border: 1px solid #E8E0D0;
          border-radius: 24px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #2C2416;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field::placeholder { color: #b0a090; }
        .input-field:focus { border-color: #C9A84C; }
        .send-btn {
          width: 42px; height: 42px;
          background: #1C1712;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .send-btn:hover { background: #C9A84C; }
        .send-btn:disabled { opacity: 0.4; }
        .footer-note {
          text-align: center;
          padding: 8px;
          font-size: 10px;
          color: #c0b8a8;
          letter-spacing: 0.5px;
          background: white;
        }
      `}</style>

      <div className="chat-wrap">
        <div className="header">
          <div className="header-label">Ristorante & Pizzeria</div>
          <div className="header-name">La Fontana di Capri</div>
          <div className="header-sub">Neulußheim</div>
          <div className="status">
            <div className="status-dot"></div>
            Assistent verfügbar
          </div>
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🍽️</div>
              <div className="empty-text">Willkommen</div>
              <div className="empty-sub">
                Wie kann ich Ihnen helfen?<br/>
                Speisekarte, Öffnungszeiten, Reservierungen.
              </div>
              <div className="suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
              {m.role === 'assistant' && (
                <div className="avatar">L</div>
              )}
              <div className={`bubble ${m.role === 'assistant' ? 'bot' : 'user'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing">
              <div className="avatar">L</div>
              <div className="typing-bubble">
                <span/><span/><span/>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <input
            className="input-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ihre Frage..."
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#F7F3EE">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div className="footer-note">
          Dieser Chat wird von KI unterstützt · RestaurantIQ
        </div>
      </div>
    </>
  );
}

