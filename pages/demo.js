import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

function TicketCard({ reservation, restaurantName }) {
  const { name, datum, uhrzeit, personen, sonderwunsch } = reservation;
  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <div className="ticket-restaurant">{restaurantName}</div>
        <div className="ticket-title">Reservierungsanfrage</div>
      </div>
      <div className="ticket-divider" />
      <div className="ticket-rows">
        <div className="ticket-row"><span className="ticket-label">Name</span><span className="ticket-value">{name}</span></div>
        <div className="ticket-row"><span className="ticket-label">Datum</span><span className="ticket-value">{datum}</span></div>
        <div className="ticket-row"><span className="ticket-label">Uhrzeit</span><span className="ticket-value">{uhrzeit} Uhr</span></div>
        <div className="ticket-row"><span className="ticket-label">Personen</span><span className="ticket-value">{personen}</span></div>
        {sonderwunsch && <div className="ticket-row"><span className="ticket-label">Hinweis</span><span className="ticket-value">{sonderwunsch}</span></div>}
      </div>
      <div className="ticket-divider" />
      <div className="ticket-status">
        <span className="ticket-status-dot" />
        <span className="ticket-status-text">Demo-Buchung · Keine echten Daten gespeichert</span>
      </div>
    </div>
  );
}

export default function Demo() {
  const router = useRouter();
  const { restaurant } = router.query;
  const restaurantName = restaurant || 'RestaurantIQ Demo';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!router.isReady) return;
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: `Willkommen bei **${restaurantName}**.\n\nWie kann ich Ihnen helfen?`
      }]);
    }, 300);
  }, [router.isReady, restaurantName]);

  async function sendMessage(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode: 'demo', restaurant: restaurantName }),
      });
      const data = await res.json();
      const reply = data.reply || 'Ein Fehler ist aufgetreten.';

      let finalMessages = [...newMessages, { role: 'assistant', content: reply }];

      if (data.reservation) {
        finalMessages = [...finalMessages, {
          role: 'assistant',
          type: 'ticket',
          reservation: data.reservation,
          content: '',
        }];
      }

      setMessages(finalMessages);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Verbindungsfehler. Bitte versuchen Sie es erneut.' }]);
    }

    setLoading(false);
  }

  function formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
          --bg: #f9f9f9;
          --surface: #ffffff;
          --ink: #1d1d1f;
          --ink-2: #3d3d3f;
          --muted: #6e6e73;
          --line: #e5e5ea;
          --r: 12px;
        }
        html, body { height: 100%; background: var(--bg); }
        body { font-family: 'Inter', -apple-system, sans-serif; font-weight: 300; color: var(--ink); -webkit-font-smoothing: antialiased; }

        .shell {
          height: 100svh;
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          position: relative;
        }

        @media (min-width: 520px) {
          .shell { box-shadow: 0 0 0 1px var(--line), 0 8px 40px rgba(0,0,0,0.08); }
        }

        .header {
          flex-shrink: 0;
          padding: 16px 20px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .header-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 999px;
        }

        .badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34c759;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .badge-label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.04em;
        }

        .demo-banner {
          background: #f5f5f7;
          border-bottom: 1px solid var(--line);
          padding: 8px 20px;
          font-size: 11px;
          font-weight: 400;
          color: var(--muted);
          text-align: center;
          letter-spacing: 0.02em;
        }

        .chat {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px 8px;
          display: flex;
          flex-direction: column;
          scroll-behavior: smooth;
          scrollbar-width: none;
        }
        .chat::-webkit-scrollbar { display: none; }

        .row { display: flex; margin-bottom: 8px; }
        .row.bot  { justify-content: flex-start; }
        .row.user { justify-content: flex-end; }

        .bubble {
          max-width: 80%;
          padding: 11px 15px;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 300;
          animation: rise 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .row.bot .bubble {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 4px var(--r) var(--r) var(--r);
          color: var(--ink-2);
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .row.user .bubble {
          background: var(--ink);
          color: #fff;
          border-radius: var(--r) 4px var(--r) var(--r);
          font-weight: 400;
        }

        .ticket-row-wrap {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 8px;
          animation: rise 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .ticket-card {
          max-width: 80%;
          background: #fff;
          border: 1px solid var(--line);
          border-left: 3px solid #1d1d1f;
          border-radius: 4px var(--r) var(--r) var(--r);
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .ticket-header {
          padding: 10px 14px 8px;
          background: #f5f5f7;
        }

        .ticket-restaurant {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 2px;
        }

        .ticket-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .ticket-divider { height: 1px; background: var(--line); }
        .ticket-rows { padding: 8px 14px; }

        .ticket-row {
          display: flex;
          gap: 12px;
          padding: 4px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .ticket-row:last-child { border-bottom: none; }

        .ticket-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          width: 60px;
          flex-shrink: 0;
        }

        .ticket-value {
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-2);
        }

        .ticket-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #f9f9f9;
        }

        .ticket-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34c759;
          flex-shrink: 0;
          animation: pulse 2.5s ease-in-out infinite;
        }

        .ticket-status-text {
          font-size: 10px;
          font-weight: 400;
          color: var(--muted);
          letter-spacing: 0.04em;
        }

        .typing-row { display: flex; margin-bottom: 8px; animation: rise 0.3s ease both; }
        .typing-bubble {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 4px var(--r) var(--r) var(--r);
          padding: 12px 16px;
          display: flex; gap: 4px; align-items: center;
        }
        .typing-bubble span {
          width: 4px; height: 4px;
          background: var(--muted);
          border-radius: 50%;
          animation: blink 1.3s ease-in-out infinite;
        }
        .typing-bubble span:nth-child(2) { animation-delay: 0.18s; }
        .typing-bubble span:nth-child(3) { animation-delay: 0.36s; }
        @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }

        .input-area {
          flex-shrink: 0;
          padding: 10px 16px 14px;
          background: var(--bg);
          position: relative;
        }
        .input-area::before {
          content: '';
          position: absolute;
          top: -24px; left: 0; right: 0; height: 24px;
          background: linear-gradient(to bottom, transparent, var(--bg));
          pointer-events: none;
        }
        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--r);
          padding: 6px 6px 6px 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: border-color 0.15s;
        }
        .input-row:focus-within { border-color: #1d1d1f; }
        .input-field {
          flex: 1;
          background: transparent;
          border: none; outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 14px; font-weight: 300;
          color: var(--ink); padding: 5px 0;
        }
        .input-field::placeholder { color: var(--line); }
        .send-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          border: none;
          background: var(--ink);
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.8; }
        .send-btn:disabled { opacity: 0.25; cursor: default; }
        .send-btn svg { width: 13px; height: 13px; fill: currentColor; }

        .footer-note {
          text-align: center;
          margin-top: 8px;
          font-size: 10px;
          color: var(--muted);
          opacity: 0.6;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="shell">
        <header className="header">
          <div className="header-name">{restaurantName}</div>
          <div className="header-badge">
            <div className="badge-dot" />
            <span className="badge-label">Online</span>
          </div>
        </header>

        <div className="demo-banner">
          Demo-Modus · Keine Daten werden gespeichert
        </div>

        <div className="chat">
          {messages.map((m, i) => {
            if (m.type === 'ticket') {
              return (
                <div key={i} className="ticket-row-wrap">
                  <TicketCard reservation={m.reservation} restaurantName={restaurantName} />
                </div>
              );
            }
            return (
              <div key={i} className={`row ${m.role === 'user' ? 'user' : 'bot'}`}>
                <div className="bubble" dangerouslySetInnerHTML={{ __html: formatText(m.content) }} />
              </div>
            );
          })}

          {loading && (
            <div className="typing-row">
              <div className="typing-bubble">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-row">
            <input
              className="input-field"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Schreiben Sie hier…"
              autoComplete="off"
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading} aria-label="Senden">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div className="footer-note">Powered by RestaurantIQ</div>
        </div>
      </div>
    </>
  );
}