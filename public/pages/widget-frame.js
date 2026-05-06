import { useState, useRef, useEffect } from 'react';

export default function WidgetFrame() {
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
    "Öffnungszeiten?",
    "Reservierung?"
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }
        body { font-family: 'Inter', sans-serif; background: #FAFAF8; }
        .wrap { height: 100vh; display: flex; flex-direction: column; }
        .header {
          padding: 16px 16px 12px;
          background: #1C1712;
          text-align: center;
          flex-shrink: 0;
        }
        .header-label {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #C9A84C;
          margin-bottom: 4px;
        }
        .header-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: #F7F3EE;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-size: 9px;
          color: #7a6e60;
          letter-spacing: 1px;
        }
        .dot {
          width: 5px; height: 5px;
          background: #4caf73;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; } 50% { opacity:0.4; }
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .empty {
          text-align: center;
          margin-top: 20px;
        }
        .empty-text {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          color: #2C2416;
          margin-bottom: 4px;
        }
        .empty-sub {
          font-size: 12px;
          color: #9a8e7a;
          line-height: 1.6;
        }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 14px;
        }
        .suggestion {
          padding: 6px 12px;
          background: white;
          border: 1px solid #E8E0D0;
          border-radius: 16px;
          font-size: 11px;
          color: #5a4e3a;
          cursor: pointer;
          transition: all 0.2s;
        }
        .suggestion:hover { background: #C9A84C; color: white; border-color: #C9A84C; }
        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          animation: fadeUp 0.2s ease;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(5px); }
          to { opacity:1; transform:translateY(0); }
        }
        .msg-row.user { flex-direction: row-reverse; }
        .avatar {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: #1C1712;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 10px;
          color: #C9A84C;
          flex-shrink: 0;
        }
        .bubble {
          max-width: 80%;
          padding: 10px 13px;
          font-size: 13px;
          line-height: 1.6;
        }
        .bubble.bot {
          background: white;
          color: #2C2416;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
          border: 1px solid #F0EBE0;
        }
        .bubble.user {
          background: #1C1712;
          color: #F7F3EE;
          border-radius: 16px 16px 4px 16px;
        }
        .typing-bubble {
          background: white;
          border: 1px solid #F0EBE0;
          border-radius: 16px 16px 16px 4px;
          padding: 12px 14px;
          display: flex;
          gap: 4px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        }
        .typing-bubble span {
          width: 5px; height: 5px;
          background: #C9A84C;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing-bubble span:nth-child(2) { animation-delay: 0.15s; }
        .typing-bubble span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30% { transform:translateY(-4px); opacity:1; }
        }
        .input-area {
          padding: 10px 12px;
          background: white;
          border-top: 1px solid #EEE8DC;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .input-field {
          flex: 1;
          padding: 9px 14px;
          background: #F7F3EE;
          border: 1px solid #E8E0D0;
          border-radius: 20px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #2C2416;
          outline: none;
        }
        .input-field::placeholder { color: #b0a090; }
        .input-field:focus { border-color: #C9A84C; }
        .send-btn {
          width: 36px; height: 36px;
          background: #1C1712;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .send-btn:hover { background: #C9A84C; }
        .send-btn:disabled { opacity: 0.4; }
        .footer-note {
          text-align: center;
          padding: 6px;
          font-size: 9px;
          color: #c0b8a8;
          background: white;
          flex-shrink: 0;
        }
      `}</style>

      <div className="wrap">
        <div className="header">
          <div className="header-label">Ristorante & Pizzeria</div>
          <div className="header-name">La Fontana di Capri</div>
          <div className="status">
            <div className="dot"></div>
            Online
          </div>
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="empty">
              <div className="empty-text">Willkommen 🍽️</div>
              <div className="empty-sub">Wie kann ich Ihnen helfen?</div>
              <div className="suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : ''}`}>
              {m.role === 'assistant' && <div className="avatar">L</div>}
              <div className={`bubble ${m.role === 'assistant' ? 'bot' : 'user'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg-row">
              <div className="avatar">L</div>
              <div className="typing-bubble">
                <span/><span/><span/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F7F3EE">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div className="footer-note">KI-gestützt · RestaurantIQ</div>
      </div>
    </>
  );
}
