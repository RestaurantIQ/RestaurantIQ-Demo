import { useState, useRef, useEffect } from ‘react’;

const suggestions = [
“Was empfehlt ihr heute?”,
“Gibt es vegetarische Gerichte?”,
“Welche Pizzen habt ihr?”,
“Ich möchte reservieren”,
“Wann habt ihr geöffnet?”
];

export default function Home() {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState(’’);
const [loading, setLoading] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(false);
const bottomRef = useRef(null);

useEffect(() => {
bottomRef.current?.scrollIntoView({ behavior: ‘smooth’ });
}, [messages, loading]);

useEffect(() => {
setTimeout(() => {
setMessages([{
role: ‘assistant’,
content: ‘Willkommen bei **La Fontana di Capri**.\n\nWie kann ich Ihnen helfen?’
}]);
setTimeout(() => setShowSuggestions(true), 280);
}, 300);
}, []);

async function sendMessage(text) {
const msg = text || input;
if (!msg.trim() || loading) return;

```
setShowSuggestions(false);
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
```

}

function formatText(text) {
return text
.replace(/**(.*?)**/g, ‘<strong>$1</strong>’)
.replace(/\n/g, ‘<br>’);
}

return (
<>
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Outfit:wght@300;400;500&display=swap’);

```
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg:      #f7f3ed;
      --surface: #ffffff;
      --ink:     #18150f;
      --ink-2:   #302c24;
      --ink-3:   #5a5449;
      --muted:   #9e978c;
      --gold:    #b09050;
      --line:    rgba(24,21,15,0.08);
      --r:       10px;
    }

    html, body { height: 100%; background: var(--bg); }

    body {
      font-family: 'Outfit', sans-serif;
      font-weight: 300;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ─── Shell ─── */
    .shell {
      height: 100svh;
      max-width: 480px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      overflow: hidden;
    }

    /* ─── Header ─── */
    .header {
      flex-shrink: 0;
      padding: 18px 22px 16px;
      display: flex;
      align-items: center;
      gap: 13px;
      position: relative;
      z-index: 10;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: 0; left: 22px; right: 22px;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold) 40%, var(--gold) 60%, transparent);
      opacity: 0.3;
    }

    .mark {
      width: 40px; height: 40px;
      border: 1px solid rgba(176,144,80,0.5);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; position: relative;
    }

    /* corner accents */
    .mark::before, .mark::after {
      content: '';
      position: absolute;
      width: 5px; height: 5px;
      border-color: var(--gold); border-style: solid; opacity: 0.6;
    }
    .mark::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    .mark::after  { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

    .mark-inner {
      font-family: 'Cormorant', serif;
      font-weight: 400; font-size: 19px;
      color: var(--gold); letter-spacing: -0.02em; line-height: 1;
    }

    .header-meta { flex: 1; min-width: 0; }

    .header-name {
      font-family: 'Cormorant', serif;
      font-weight: 300; font-size: 17px;
      color: var(--ink); letter-spacing: 0.08em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .header-sub {
      font-size: 10px; font-weight: 400;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--muted); margin-top: 2px;
    }

    .badge {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 10px;
      border: 1px solid var(--line); border-radius: 999px; flex-shrink: 0;
    }

    .badge-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #6db57e;
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .badge-label {
      font-size: 9.5px; font-weight: 400;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);
    }

    /* ─── Chat ─── */
    .chat {
      flex: 1;
      overflow-y: auto;
      padding: 20px 18px 8px;
      display: flex;
      flex-direction: column;
      /* FIX 1: content starts at top, not middle */
      justify-content: flex-start;
      gap: 0;
      scroll-behavior: smooth;
      scrollbar-width: none;
    }
    .chat::-webkit-scrollbar { display: none; }

    /* ─── Messages ─── */
    .row { display: flex; margin-bottom: 12px; }
    .row.bot  { justify-content: flex-start; }
    .row.user { justify-content: flex-end; }

    .bubble {
      max-width: 82%;
      padding: 12px 16px;
      font-size: 13.5px;
      line-height: 1.7;
      font-weight: 300;
      letter-spacing: 0.01em;
      animation: rise 0.4s cubic-bezier(0.16,1,0.3,1) both;
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(10px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .row.bot .bubble {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 2px var(--r) var(--r) var(--r);
      color: var(--ink-2);
      box-shadow: 0 1px 8px rgba(24,21,15,0.05), 0 4px 20px rgba(24,21,15,0.04);
    }

    .row.user .bubble {
      background: var(--ink-2);
      color: #f0ece4;
      border-radius: var(--r) 2px var(--r) var(--r);
      font-weight: 400;
    }

    /* ─── Typing ─── */
    .typing-row {
      display: flex;
      margin-bottom: 12px;
      animation: rise 0.3s ease both;
    }

    .typing-bubble {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 2px var(--r) var(--r) var(--r);
      padding: 14px 18px;
      display: flex; gap: 5px; align-items: center;
      box-shadow: 0 1px 8px rgba(24,21,15,0.05);
    }

    .typing-bubble span {
      width: 4px; height: 4px;
      background: var(--gold);
      border-radius: 50%; opacity: 0.25;
      animation: blink 1.3s ease-in-out infinite;
    }
    .typing-bubble span:nth-child(2) { animation-delay: 0.18s; }
    .typing-bubble span:nth-child(3) { animation-delay: 0.36s; }

    @keyframes blink {
      0%,80%,100% { opacity: 0.25; transform: scaleY(1); }
      40%          { opacity: 1;    transform: scaleY(1.4); }
    }

    /* ─── Suggestions ─── */
    /* FIX 2: vertical list with gold left-border — no pills, no border-radius */
    .suggestions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
      animation: rise 0.5s 0.08s cubic-bezier(0.16,1,0.3,1) both;
    }

    .suggestion {
      /* ghost button with decisive sharp left accent */
      background: transparent;
      border: 1px solid var(--line);
      border-left: 2px solid rgba(176,144,80,0.45);
      border-radius: 0 6px 6px 0;   /* sharp left, soft right */
      color: var(--ink-3);
      font-family: 'Outfit', sans-serif;
      font-size: 12.5px;
      font-weight: 400;
      letter-spacing: 0.025em;
      padding: 9px 14px;
      cursor: pointer;
      text-align: left;
      width: fit-content;
      max-width: 88%;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      /* no outline junk */
      outline: none;
    }

    .suggestion:hover, .suggestion:focus-visible {
      background: var(--ink-2);
      color: #f0ece4;
      border-color: var(--ink-2);
      border-left-color: var(--gold);
    }

    /* ─── Input area ─── */
    .input-area {
      flex-shrink: 0;
      background: var(--bg);
      padding: 10px 18px 16px;
      position: relative;
    }

    /* soft fade from chat into input */
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
      padding: 6px 6px 6px 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-row:focus-within {
      border-color: rgba(176,144,80,0.5);
      box-shadow: 0 0 0 3px rgba(176,144,80,0.08);
    }

    .input-field {
      flex: 1;
      background: transparent;
      border: none; outline: none;
      font-family: 'Outfit', sans-serif;
      font-size: 13.5px; font-weight: 300;
      color: var(--ink); padding: 5px 0;
      letter-spacing: 0.01em;
    }

    .input-field::placeholder { color: var(--muted); }

    /* ghost send — gold on hover, no harsh dark block */
    .send-btn {
      width: 36px; height: 36px;
      border-radius: 7px;
      border: 1px solid var(--line);
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.18s, border-color 0.18s, color 0.18s;
      outline: none;
    }

    .send-btn:hover:not(:disabled), .send-btn:focus-visible:not(:disabled) {
      background: var(--gold);
      border-color: var(--gold);
      color: #fff;
    }

    .send-btn:disabled { opacity: 0.3; cursor: default; }
    .send-btn svg { width: 15px; height: 15px; fill: currentColor; }

    /* branding line */
    .powered {
      text-align: center;
      font-size: 9.5px; font-weight: 400;
      letter-spacing: 0.13em; text-transform: uppercase;
      color: var(--muted); opacity: 0.5;
      margin-top: 8px;
    }
    .powered span { color: var(--gold); opacity: 1; }
  `}</style>

  <div className="shell">

    <header className="header">
      <div className="mark">
        <div className="mark-inner">LF</div>
      </div>
      <div className="header-meta">
        <div className="header-name">La Fontana di Capri</div>
        <div className="header-sub">Ristorante &amp; Pizzeria · Neulußheim</div>
      </div>
      <div className="badge">
        <div className="badge-dot"></div>
        <span className="badge-label">Online</span>
      </div>
    </header>

    <div className="chat">
      {messages.map((m, i) => (
        <div key={i} className={`row ${m.role === 'user' ? 'user' : 'bot'}`}>
          <div
            className="bubble"
            dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
          />
        </div>
      ))}

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
          placeholder="Ihre Frage..."
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
      <div className="powered">Unterstützt durch <span>RestaurantIQ</span></div>
    </div>

  </div>
</>
```

);
}
