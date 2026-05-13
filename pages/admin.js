import { useState, useEffect } from 'react';

const STATUS_COLOR = { neu: '#d4860a', bestätigt: '#3a9e5f', abgesagt: '#c0392b' };
const STATUS_BG    = { neu: '#fff8ed', bestätigt: '#edfbf2', abgesagt: '#fdf0ee' };

export default function Admin() {
  const [authInput, setAuthInput]     = useState('');
  const [authError, setAuthError]     = useState('');
  const [password, setPassword]       = useState('');
  const [authed, setAuthed]           = useState(false);
  const [tab, setTab]                 = useState('reservations');

  const [reservations, setReservations] = useState([]);
  const [filter, setFilter]             = useState('alle');
  const [loadingRes, setLoadingRes]     = useState(false);

  const [slots, setSlots]       = useState([]);
  const [newDatum, setNewDatum] = useState('');
  const [newTime, setNewTime]   = useState('');
  const [newCount, setNewCount] = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('riq_pw');
    if (saved) { setPassword(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (authed && password) { loadReservations(password); loadSlots(); }
  }, [authed, password]);

  function login() {
    fetch(`/api/reservations?password=${encodeURIComponent(authInput)}`)
      .then(r => {
        if (r.ok) {
          localStorage.setItem('riq_pw', authInput);
          setPassword(authInput);
          setAuthed(true);
        } else {
          setAuthError('Falsches Passwort.');
        }
      })
      .catch(() => setAuthError('Verbindungsfehler.'));
  }

  function logout() {
    localStorage.removeItem('riq_pw');
    setAuthed(false);
    setPassword('');
  }

  async function loadReservations(pw) {
    setLoadingRes(true);
    const r = await fetch(`/api/reservations?password=${encodeURIComponent(pw || password)}`);
    const data = await r.json();
    setReservations(Array.isArray(data) ? data : []);
    setLoadingRes(false);
  }

  async function loadSlots() {
    const r = await fetch('/api/availability');
    const data = await r.json();
    setSlots(Array.isArray(data) ? data : []);
  }

  async function updateStatus(id, status) {
    await fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, password }),
    });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  async function saveSlot() {
    if (!newDatum || !newTime || !newCount) return;
    setSaving(true);
    const parts = newDatum.split('-');
    const datum = `${parts[2]}.${parts[1]}.${parts[0]}`;
    await fetch('/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datum, uhrzeit: newTime, tische_frei: parseInt(newCount), password }),
    });
    await loadSlots();
    setNewDatum(''); setNewTime(''); setNewCount('');
    setSaving(false);
  }

  async function deleteSlot(id) {
    await fetch('/api/availability', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });
    setSlots(prev => prev.filter(s => s.id !== id));
  }

  const filtered = filter === 'alle' ? reservations : reservations.filter(r => r.status === filter);
  const neuCount = reservations.filter(r => r.status === 'neu').length;

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');`}</style>
      <div style={{ background: '#fff', borderRadius: 14, padding: '40px 36px', width: 340, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: '#1a1612', marginBottom: 4 }}>RestaurantIQ</div>
        <div style={{ fontSize: 13, color: '#9e8f7e', marginBottom: 28 }}>Admin · La Fontana di Capri</div>
        <input
          type="password" placeholder="Passwort" value={authInput}
          onChange={e => setAuthInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #e4ddd4', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
        />
        {authError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 10 }}>{authError}</div>}
        <button onClick={login} style={{ width: '100%', padding: 11, background: '#b09050', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Einloggen
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0ea', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; }`}</style>

      <div style={{ background: '#fff', borderBottom: '1px solid #ece6dd', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1612' }}>RestaurantIQ</span>
          <span style={{ fontSize: 12, color: '#b09050', background: '#fdf6e8', padding: '2px 10px', borderRadius: 20, border: '1px solid #e8d9a8' }}>La Fontana di Capri</span>
        </div>
        <button onClick={logout} style={{ fontSize: 12, color: '#9e8f7e', background: 'none', border: '1px solid #e4ddd4', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>Ausloggen</button>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #ece6dd', padding: '0 24px', display: 'flex' }}>
        {[
          { key: 'reservations', label: `Reservierungen${neuCount > 0 ? ` (${neuCount} neu)` : ''}` },
          { key: 'availability', label: 'Verfügbarkeit' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '14px 18px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer',
            color: tab === t.key ? '#b09050' : '#9e8f7e',
            borderBottom: tab === t.key ? '2px solid #b09050' : '2px solid transparent',
            fontWeight: tab === t.key ? 500 : 400, fontFamily: 'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>

        {tab === 'reservations' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              {['alle', 'neu', 'bestätigt', 'abgesagt'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                  border: '1px solid ' + (filter === f ? '#b09050' : '#e4ddd4'),
                  background: filter === f ? '#b09050' : '#fff',
                  color: filter === f ? '#fff' : '#5a5245',
                }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
              <button onClick={() => loadReservations(password)} style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 12, borderRadius: 20, cursor: 'pointer', border: '1px solid #e4ddd4', background: '#fff', color: '#5a5245', fontFamily: 'inherit' }}>
                Aktualisieren
              </button>
            </div>

            {loadingRes ? (
              <p style={{ color: '#9e8f7e', fontSize: 14 }}>Lädt...</p>
            ) : filtered.length === 0 ? (
              <p style={{ color: '#9e8f7e', fontSize: 14 }}>Keine Einträge.</p>
            ) : filtered.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', borderLeft: `3px solid ${STATUS_COLOR[r.status] || '#ccc'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1612', marginBottom: 4 }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: '#5a5245' }}>{r.datum} · {r.uhrzeit} Uhr · {r.personen} {r.personen === 1 ? 'Person' : 'Personen'}</div>
                    <div style={{ fontSize: 13, color: '#9e8f7e', marginTop: 2 }}>{r.telefon}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: STATUS_BG[r.status] || '#f5f5f5', color: STATUS_COLOR[r.status] || '#999', fontWeight: 500 }}>
                      {r.status}
                    </span>
                    {r.status !== 'bestätigt' && (
                      <button onClick={() => updateStatus(r.id, 'bestätigt')} style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #3a9e5f', borderRadius: 6, background: '#fff', color: '#3a9e5f', cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✓ Bestätigen
                      </button>
                    )}
                    {r.status !== 'abgesagt' && (
                      <button onClick={() => updateStatus(r.id, 'abgesagt')} style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #c0392b', borderRadius: 6, background: '#fff', color: '#c0392b', cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✗ Absagen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'availability' && (
          <>
            <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1612', marginBottom: 16 }}>Zeitslot hinzufügen</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#9e8f7e', marginBottom: 4 }}>Datum</div>
                  <input type="date" value={newDatum} onChange={e => setNewDatum(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #e4ddd4', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9e8f7e', marginBottom: 4 }}>Uhrzeit</div>
                  <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #e4ddd4', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9e8f7e', marginBottom: 4 }}>Freie Tische</div>
                  <input type="number" min="0" max="99" value={newCount} onChange={e => setNewCount(e.target.value)} placeholder="z.B. 4"
                    style={{ padding: '8px 12px', border: '1px solid #e4ddd4', borderRadius: 8, fontSize: 13, width: 90, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <button onClick={saveSlot} disabled={saving || !newDatum || !newTime || !newCount}
                  style={{ padding: '8px 22px', background: '#b09050', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: (!newDatum || !newTime || !newCount) ? 0.5 : 1, fontFamily: 'inherit' }}>
                  {saving ? 'Speichern…' : 'Speichern'}
                </button>
              </div>
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1612', marginBottom: 12 }}>Aktuelle Zeitslots</div>
            {slots.length === 0 ? (
              <p style={{ color: '#9e8f7e', fontSize: 14 }}>Noch keine Zeitslots eingetragen.</p>
            ) : slots.map(s => (
              <div key={s.id} style={{ background: '#fff', borderRadius: 10, padding: '13px 20px', marginBottom: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1612' }}>{s.datum}</span>
                  <span style={{ fontSize: 13, color: '#9e8f7e' }}>·</span>
                  <span style={{ fontSize: 14, color: '#5a5245' }}>{s.uhrzeit} Uhr</span>
                  <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12, background: s.tische_frei > 0 ? '#edfbf2' : '#fdf0ee', color: s.tische_frei > 0 ? '#3a9e5f' : '#c0392b' }}>
                    {s.tische_frei} {s.tische_frei === 1 ? 'Tisch frei' : 'Tische frei'}
                  </span>
                </div>
                <button onClick={() => deleteSlot(s.id)} style={{ fontSize: 12, color: '#9e8f7e', background: 'none', border: '1px solid #e4ddd4', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Löschen
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}