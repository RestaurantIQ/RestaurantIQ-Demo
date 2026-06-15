import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CHAT_THEMES } from '../components/admin/ChatThemePicker';

const suggestions = [
  "Ich möchte einen Tisch reservieren",
  "Was empfehlt ihr heute?",
  "Wann habt ihr geöffnet?",
  "Gibt es vegetarische Optionen?",
  "Wie kann ich euch erreichen?"
];

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
        <div className="ticket-row">
          <span className="ticket-label">Name</span>
          <span className="ticket-value">{name}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Datum</span>
          <span className="ticket-value">{datum}</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Uhrzeit</span>
          <span className="ticket-value">{uhrzeit} Uhr</span>
        </div>
        <div className="ticket-row">
          <span className="ticket-label">Personen</span>
          <span className="ticket-value">{personen}</span>
        </div>
        {sonderwunsch && (
          <div className="ticket-row">
            <span className="ticket-label">Hinweis</span>
            <span className="ticket-value">{sonderwunsch}</span>
          </div>
        )}
      </div>
      <div className="ticket-divider" />
      <div className="ticket-status">
        <span className="ticket-status-dot" />
        <span className="ticket-status-text">Anfrage eingegangen</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const bottomRef = useRef(null);
  const router = useRouter();
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const username = router.isReady ? (router.query.username || null) : undefined;

  useEffect(() => {
    if (!username) return;
    fetch('/api/profile?username=' + encodeURIComponent(username))
      .then(r => r.json())
      .then(d => { if (d.name) setRestaurantInfo(d); })
      .catch(() => {});
  }, [username]);

  const restaurantName = restaurantInfo?.name || 'RestaurantIQ';
  const restaurantPhone = restaurantInfo?.phone || '06205 37008';
  const restaurantSub = restaurantInfo?.address || '';
  const initials = restaurantName.split(/\s+/).map(w => w[0].toUpperCase()).join('').slice(0, 2) || 'RQ';

  const themeKey = restaurantInfo?.chat_theme || 'elegant';
  const theme = CHAT_THEMES[themeKey] || CHAT_THEMES.elegant;
  const v = theme.vars;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const welcomeShown = useRef(false);
  useEffect(() => {
    if (welcomeShown.current) return;
    if (username === undefined) return;
    if (username && !restaurantInfo) return;
    welcomeShown.current = true;
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: `Willkommen bei **${restaurantName}**.\n\nWie kann ich Ihnen helfen?`
      }]);
      setTimeout(() => setShowSuggestions(true), 280);
    }, 300);
  }, [username, restaurantInfo, restaurantName]);

  async function sendMessage(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    setShowSuggestions(false);
    const userMsg = { role: 'user', content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode: 'live', username }),
      });
      const data = await res.json();
      const reply = data.reply || 'Ein Fehler ist aufgetreten.';

      let finalMessages = [...newMessages, { role: 'assistant', content: reply }];

      if (data.reservation) {
        const reserveRes = await fetch('/api/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data.reservation, username }),
        });
        if (reserveRes.ok) {
          finalMessages = [...finalMessages, {
            role: 'assistant',
            type: 'ticket',
            reservation: data.reservation,
            content: '',
          }];
        } else {
          finalMessages = [...finalMessages, {
            role: 'assistant',
            content: `Die Anfrage konnte leider nicht übermittelt werden. Bitte rufen Sie uns direkt an: ${restaurantPhone}.`,
          }];
        }
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
        @import url('${theme.fontUrl}');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg:      ${v.bg};
          --surface: ${v.surface};
          --ink:     ${v.ink};
          --ink-2:   ${v.ink2};
          --ink-3:   ${v.ink3};
          --muted:   ${v.muted};
          --gold:    ${v.gold};
          --gold-lt: ${v.goldLt};
          --line:    ${v.line};
          --r:       ${v.r};
        }

        html, body { height: 100%; background: var(--bg); }

        body {
          font-family: ${theme.fontBody};
          font-weight: 300;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23f5f0e8'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23ede8df' opacity='0.4'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%23ede8df' opacity='0.4'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .shell {
          position: relative;
          z-index: 1;
          height: 100svh;
          max-width: 480px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          overflow: hidden;
        }

        @media (min-width: 520px) {
          .shell {
            height: 100svh;
            box-shadow: 0 0 0 1px rgba(168,134,74,0.15), 0 8px 60px rgba(26,21,16,0.12);
          }
        }

        .header {
          flex-shrink: 0;
          padding: 20px 22px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg);
          position: relative;
          z-index: 10;
        }

        .header-divider {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(168,134,74,0.2) 20%,
            rgba(168,134,74,0.5) 50%,
            rgba(168,134,74,0.2) 80%,
            transparent 100%);
        }

        .mark {
          width: 44px; height: 44px;
          border: 1px solid rgba(168,134,74,0.45);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative;
          background: rgba(168,134,74,0.04);
        }

        .mark::before {
          content: '';
          position: absolute;
          inset: 3px;
          border: 1px solid rgba(168,134,74,0.15);
        }

        .mark::after {
          content: '';
          position: absolute;
          width: 6px; height: 6px;
          bottom: -1px; right: -1px;
          border-bottom: 1px solid var(--gold);
          border-right: 1px solid var(--gold);
        }

        .mark-corner-tl {
          position: absolute;
          width: 6px; height: 6px;
          top: -1px; left: -1px;
          border-top: 1px solid var(--gold);
          border-left: 1px solid var(--gold);
        }

        .mark-inner {
          font-family: ${theme.fontDisplay};
          font-weight: 400; font-size: 18px;
          color: var(--gold); letter-spacing: 0.02em; line-height: 1;
          font-style: italic;
        }

        .header-meta { flex: 1; min-width: 0; }

        .header-name {
          font-family: ${theme.fontDisplay};
          font-weight: 400; font-size: 19px;
          color: var(--ink); letter-spacing: 0.06em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .header-sub {
          font-size: 9.5px; font-weight: 400;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--muted); margin-top: 3px;
        }

        .badge {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px;
          border: 1px solid rgba(168,134,74,0.25);
          border-radius: 999px; flex-shrink: 0;
          background: rgba(168,134,74,0.05);
        }

        .badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #6db57e;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }

        .badge-label {
          font-size: 9.5px; font-weight: 400;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted);
        }

        .chat {
          flex: 1;
          overflow-y: auto;
          padding: 22px 18px 8px;
          display: flex;
          flex-direction: column;
          scroll-behavior: smooth;
          scrollbar-width: none;
        }
        .chat::-webkit-scrollbar { display: none; }

        .row { display: flex; margin-bottom: 10px; }
        .row.bot  { justify-content: flex-start; }
        .row.user { justify-content: flex-end; }

        .bubble {
          max-width: 82%;
          padding: 12px 16px;
          font-size: 13.5px;
          line-height: 1.75;
          font-weight: 300;
          letter-spacing: 0.01em;
          animation: rise 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .row.bot .bubble {
          background: var(--surface);
          border: 1px solid var(--line);
          border-top: 1px solid rgba(168,134,74,0.12);
          border-radius: 2px var(--r) var(--r) var(--r);
          color: var(--ink-2);
          box-shadow: 0 2px 12px rgba(26,21,16,0.06), 0 1px 3px rgba(26,21,16,0.04);
        }

        .row.user .bubble {
          background: var(--ink-2);
          color: #f0ebe0;
          border-radius: var(--r) 2px var(--r) var(--r);
          font-weight: 400;
          letter-spacing: 0.015em;
        }

        .ticket-row-wrap {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 10px;
          animation: rise 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        .ticket-card {
          max-width: 82%;
          background: #fff;
          border: 1px solid rgba(168,134,74,0.3);
          border-top: 2px solid var(--gold);
          border-radius: var(--r);
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(26,21,16,0.07), 0 1px 4px rgba(26,21,16,0.04);
        }

        .ticket-header {
          padding: 11px 16px 9px;
          background: rgba(168,134,74,0.04);
        }

        .ticket-restaurant {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 3px;
        }

        .ticket-title {
          font-family: ${theme.fontDisplay};
          font-size: 16px;
          font-weight: 400;
          color: var(--ink);
          letter-spacing: 0.03em;
        }

        .ticket-divider {
          height: 1px;
          background: rgba(168,134,74,0.15);
        }

        .ticket-rows { padding: 8px 16px; }

        .ticket-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 5px 0;
          border-bottom: 1px solid rgba(26,21,16,0.05);
        }

        .ticket-row:last-child { border-bottom: none; }

        .ticket-label {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          width: 60px;
          flex-shrink: 0;
        }

        .ticket-value {
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-2);
          letter-spacing: 0.01em;
        }

        .ticket-status {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          background: rgba(168,134,74,0.03);
        }

        .ticket-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6db57e;
          flex-shrink: 0;
          animation: pulse 2.5s ease-in-out infinite;
        }

        .ticket-status-text {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .typing-row {
          display: flex;
          margin-bottom: 10px;
          animation: rise 0.3s ease both;
        }

        .typing-bubble {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 2px var(--r) var(--r) var(--r);
          padding: 14px 18px;
          display: flex; gap: 5px; align-items: center;
          box-shadow: 0 2px 12px rgba(26,21,16,0.06);
        }

        .typing-bubble span {
          width: 4px; height: 4px;
          background: var(--gold);
          border-radius: 50%; opacity: 0.3;
          animation: blink 1.3s ease-in-out infinite;
        }
        .typing-bubble span:nth-child(2) { animation-delay: 0.18s; }
        .typing-bubble span:nth-child(3) { animation-delay: 0.36s; }

        @keyframes blink {
          0%,80%,100% { opacity: 0.3; transform: scaleY(1); }
          40%          { opacity: 1;  transform: scaleY(1.35); }
        }

        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 10px;
          animation: rise 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both;
        }

        .suggestion {
          background: transparent;
          border: 1px solid rgba(168,134,74,0.28);
          border-radius: 20px;
          color: var(--ink-3);
          font-family: ${theme.fontBody};
          font-size: 12.5px;
          font-weight: 400;
          letter-spacing: 0.025em;
          padding: 9px 14px;
          cursor: pointer;
          text-align: left;
          width: fit-content;
          max-width: 88%;
          transition: all 0.15s;
          outline: none;
        }

        .suggestion:hover {
          background: var(--ink-2);
          color: #f0ebe0;
          border-color: var(--ink-2);
          border-left-color: var(--gold-lt);
        }

        .input-area {
          flex-shrink: 0;
          background: var(--bg);
          padding: 10px 18px 12px;
          position: relative;
        }

        .input-area::before {
          content: '';
          position: absolute;
          top: -28px; left: 0; right: 0; height: 28px;
          background: linear-gradient(to bottom, transparent, var(--bg));
          pointer-events: none;
        }

        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid rgba(168,134,74,0.2);
          border-radius: var(--r);
          padding: 6px 6px 6px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 4px rgba(26,21,16,0.05);
        }

        .input-row:focus-within {
          border-color: rgba(168,134,74,0.5);
          box-shadow: 0 0 0 3px rgba(168,134,74,0.08), 0 1px 4px rgba(26,21,16,0.05);
        }

        .input-field {
          flex: 1;
          background: transparent;
          border: none; outline: none;
          font-family: ${theme.fontBody};
          font-size: 13.5px; font-weight: 300;
          color: var(--ink); padding: 5px 0;
          letter-spacing: 0.01em;
        }

        .input-field::placeholder { color: var(--muted); font-style: italic; }

        .send-btn {
          width: 36px; height: 36px;
          border-radius: 7px;
          border: 1px solid rgba(168,134,74,0.25);
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.18s;
          outline: none;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--gold);
          border-color: var(--gold);
          color: #fff;
        }

        .send-btn:disabled { opacity: 0.3; cursor: default; }
        .send-btn svg { width: 14px; height: 14px; fill: currentColor; }

        .footer-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 8px;
        }

        .ki-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          opacity: 0.6;
        }

        .ki-hint-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--gold); opacity: 0.7;
        }

        .footer-sep { font-size: 9px; color: var(--muted); opacity: 0.35; }

        .footer-link {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          opacity: 0.5;
          text-decoration: none;
          transition: opacity 0.15s;
        }

        .footer-link:hover { opacity: 0.9; }
      `}</style>

      <div className="shell">
        <header className="header">
          <div className="mark">
            <div className="mark-corner-tl" />
            {restaurantInfo?.logo_url
              ? <img src={restaurantInfo.logo_url} alt={restaurantName} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 2 }} />
              : <div className="mark-inner">{initials}</div>
            }
          </div>
          <div className="header-meta">
            <div className="header-name">{restaurantName}</div>
            <div className="header-sub">{restaurantSub}</div>
          </div>
          <div className="badge">
            <div className="badge-dot"></div>
            <span className="badge-label">Online</span>
          </div>
          <div className="header-divider" />
        </header>

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
                <div
                  className="bubble"
                  dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                />
              </div>
            );
          })}

          {showSuggestions && (
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="suggestion"
                  onClick={() => {
                    setShowSuggestions(false);
                    sendMessage(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

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
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ihre Frage…"
              autoComplete="off"
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading}
              aria-label="Senden"
            >
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>

          <div className="footer-bar">
            <span className="ki-hint">
              <span className="ki-hint-dot" />
              KI-gestützter Assistent
            </span>
            <span className="footer-sep">·</span>
            <a href="/impressum" className="footer-link">Impressum</a>
            <span className="footer-sep">·</span>
            <a href="/datenschutz" className="footer-link">Datenschutz</a>
          </div>
        </div>
      </div>
    </>
  );
}