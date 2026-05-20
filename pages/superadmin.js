import { useState, useEffect } from 'react';
import { Shield, LogIn, KeyRound, StickyNote, Plus, Check, X, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus,textarea:focus{outline:none;border-color:#1d1d1f !important}@keyframes spin{to{transform:rotate(360deg)}}`;

function fmtDate(iso) {
  if (!iso) return 'Nie';
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />;
}

export default function SuperAdmin() {
  const [secret, setSecret] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedNotes, setExpandedNotes] = useState({});
  const [noteDraft, setNoteDraft] = useState({});
  const [savingNote, setSavingNote] = useState({});

  const [pwReset, setPwReset] = useState({});
  const [pwInput, setPwInput] = useState({});
  const [savingPw, setSavingPw] = useState({});

  const [savingDemo, setSavingDemo] = useState({});
  const [impersonating, setImpersonating] = useState({});

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', username: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  function headers() {
    return { 'Content-Type': 'application/json', 'x-superadmin-secret': secret };
  }

  async function authenticate() {
    setAuthError('');
    setLoading(true);
    const r = await fetch('/api/superadmin/restaurants', { headers: { 'x-superadmin-secret': secretInput } });
    if (r.ok) {
      const data = await r.json();
      setSecret(secretInput);
      setRestaurants(data);
    } else {
      setAuthError('Falsches Passwort.');
    }
    setLoading(false);
  }

  async function reload() {
    const r = await fetch('/api/superadmin/restaurants', { headers: { 'x-superadmin-secret': secret } });
    if (r.ok) setRestaurants(await r.json());
  }

  async function toggleDemo(restaurant) {
    setSavingDemo(s => ({ ...s, [restaurant.id]: true }));
    await fetch('/api/superadmin/restaurants', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id: restaurant.id, is_demo: !restaurant.is_demo }),
    });
    setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, is_demo: !r.is_demo } : r));
    setSavingDemo(s => ({ ...s, [restaurant.id]: false }));
  }

  async function saveNote(restaurant) {
    setSavingNote(s => ({ ...s, [restaurant.id]: true }));
    const note = noteDraft[restaurant.id] ?? restaurant.admin_notes ?? '';
    await fetch('/api/superadmin/restaurants', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id: restaurant.id, admin_notes: note }),
    });
    setRestaurants(prev => prev.map(r => r.id === restaurant.id ? { ...r, admin_notes: note } : r));
    setExpandedNotes(s => ({ ...s, [restaurant.id]: false }));
    setSavingNote(s => ({ ...s, [restaurant.id]: false }));
  }

  async function resetPassword(restaurant) {
    const pw = pwInput[restaurant.id] || '';
    if (!pw || pw.length < 6) return;
    setSavingPw(s => ({ ...s, [restaurant.id]: true }));
    await fetch('/api/superadmin/restaurants', {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ id: restaurant.id, new_password: pw }),
    });
    setPwReset(s => ({ ...s, [restaurant.id]: false }));
    setPwInput(s => ({ ...s, [restaurant.id]: '' }));
    setSavingPw(s => ({ ...s, [restaurant.id]: false }));
  }

  async function impersonate(restaurant) {
    setImpersonating(s => ({ ...s, [restaurant.id]: true }));
    const r = await fetch('/api/superadmin/impersonate', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ restaurantId: restaurant.id }),
    });
    if (r.ok) {
      window.open('/admin', '_blank');
    }
    setImpersonating(s => ({ ...s, [restaurant.id]: false }));
  }

  async function createRestaurant() {
    setCreateError('');
    const { name, username, password } = createForm;
    if (!name || !username || !password) { setCreateError('Alle Felder ausfüllen.'); return; }
    setCreating(true);
    const r = await fetch('/api/superadmin/restaurants', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name, username, password }),
    });
    if (r.ok) {
      await reload();
      setCreateForm({ name: '', username: '', password: '' });
      setShowCreateForm(false);
    } else {
      const err = await r.json();
      setCreateError(err.error || 'Fehler beim Anlegen.');
    }
    setCreating(false);
  }

  if (!secret) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Inter',-apple-system,sans-serif" }}>
        <style>{FONT}</style>
        <div style={{ background: '#fff', borderRadius: 20, padding: '44px 40px', width: '100%', maxWidth: 360, boxShadow: '0 8px 48px rgba(0,0,0,0.10)', border: '1px solid #e0e0e5' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: '#1d1d1f', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Shield size={22} color="#fff" strokeWidth={2} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>Super Admin</div>
            <div style={{ fontSize: 12, color: '#6e6e73' }}>RestaurantIQ</div>
          </div>
          <input
            type="password"
            placeholder="Admin-Passwort"
            value={secretInput}
            onChange={e => setSecretInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && authenticate()}
            style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0e5', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#1d1d1f', marginBottom: 12 }}
          />
          {authError && <div style={{ fontSize: 13, color: '#c0392b', background: '#fdf0ee', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>{authError}</div>}
          <button
            onClick={authenticate}
            disabled={loading || !secretInput}
            style={{ width: '100%', padding: '11px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', opacity: loading || !secretInput ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Spinner /> : 'Einloggen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <style>{FONT}</style>

      <div style={{ background: '#1d1d1f', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="#fff" strokeWidth={2} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Super Admin</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 999 }}>RestaurantIQ</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{restaurants.length} Restaurants</span>
          <button
            onClick={() => setShowCreateForm(s => !s)}
            style={{ fontSize: 12, fontWeight: 500, color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Plus size={13} /> Restaurant anlegen
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

        {showCreateForm && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e0e5', padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 14 }}>Neues Restaurant anlegen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
              {[
                { key: 'name', placeholder: 'Name (z.B. Bella Italia)', label: 'Name' },
                { key: 'username', placeholder: 'username (kleinbuchstaben)', label: 'Username' },
                { key: 'password', placeholder: 'Passwort', label: 'Passwort', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: '#6e6e73', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={createForm[f.key]}
                    onChange={e => setCreateForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e5', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#1d1d1f' }}
                  />
                </div>
              ))}
            </div>
            {createError && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{createError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={createRestaurant}
                disabled={creating}
                style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, opacity: creating ? 0.5 : 1 }}
              >
                {creating ? <Spinner /> : <Check size={14} />} Anlegen
              </button>
              <button
                onClick={() => { setShowCreateForm(false); setCreateError(''); }}
                style={{ fontSize: 13, padding: '8px 14px', background: '#fff', color: '#6e6e73', border: '1px solid #e0e0e5', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {restaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px', color: '#6e6e73', fontSize: 14 }}>Noch keine Restaurants.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {restaurants.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e0e5', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{r.name}</span>
                      {r.is_demo && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6e6e73', background: '#f0f0f5', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Demo</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#6e6e73' }}>@{r.username} · Letzter Login: {fmtDate(r.last_login_at)}</div>
                    {r.admin_notes && (
                      <div style={{ fontSize: 12, color: '#3d3d3f', marginTop: 4, fontStyle: 'italic' }}>{r.admin_notes}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>

                    <button
                      onClick={() => toggleDemo(r)}
                      disabled={!!savingDemo[r.id]}
                      title={r.is_demo ? 'Demo-Modus deaktivieren' : 'Demo-Modus aktivieren'}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 11px', border: '1px solid #e0e0e5', borderRadius: 8, background: '#fff', color: '#3d3d3f', cursor: 'pointer', fontFamily: 'inherit', opacity: savingDemo[r.id] ? 0.5 : 1 }}
                    >
                      {r.is_demo ? <ToggleRight size={14} color="#1d1d1f" /> : <ToggleLeft size={14} />}
                      Demo
                    </button>

                    <button
                      onClick={() => setExpandedNotes(s => ({ ...s, [r.id]: !s[r.id] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 11px', border: '1px solid #e0e0e5', borderRadius: 8, background: '#fff', color: '#3d3d3f', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <StickyNote size={13} />
                      Notiz
                      {expandedNotes[r.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <button
                      onClick={() => setPwReset(s => ({ ...s, [r.id]: !s[r.id] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 11px', border: '1px solid #e0e0e5', borderRadius: 8, background: '#fff', color: '#3d3d3f', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <KeyRound size={13} />
                      PW setzen
                    </button>

                    <button
                      onClick={() => impersonate(r)}
                      disabled={!!impersonating[r.id]}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '6px 12px', border: 'none', borderRadius: 8, background: '#1d1d1f', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, opacity: impersonating[r.id] ? 0.5 : 1 }}
                    >
                      {impersonating[r.id] ? <Spinner /> : <LogIn size={13} />}
                      Einloggen als
                    </button>

                  </div>
                </div>

                {expandedNotes[r.id] && (
                  <div style={{ borderTop: '1px solid #f0f0f5', padding: '12px 18px', background: '#fafafa' }}>
                    <textarea
                      value={noteDraft[r.id] !== undefined ? noteDraft[r.id] : (r.admin_notes || '')}
                      onChange={e => setNoteDraft(s => ({ ...s, [r.id]: e.target.value }))}
                      placeholder="Notizen zu diesem Restaurant..."
                      rows={3}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e0e5', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#1d1d1f', resize: 'vertical', background: '#fff' }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => saveNote(r)}
                        disabled={!!savingNote[r.id]}
                        style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, opacity: savingNote[r.id] ? 0.5 : 1 }}
                      >
                        {savingNote[r.id] ? <Spinner /> : <Check size={12} />} Speichern
                      </button>
                      <button
                        onClick={() => { setExpandedNotes(s => ({ ...s, [r.id]: false })); setNoteDraft(s => ({ ...s, [r.id]: undefined })); }}
                        style={{ fontSize: 12, padding: '6px 12px', background: '#fff', color: '#6e6e73', border: '1px solid #e0e0e5', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}

                {pwReset[r.id] && (
                  <div style={{ borderTop: '1px solid #f0f0f5', padding: '12px 18px', background: '#fafafa', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="password"
                      placeholder="Neues Passwort (min. 6 Zeichen)"
                      value={pwInput[r.id] || ''}
                      onChange={e => setPwInput(s => ({ ...s, [r.id]: e.target.value }))}
                      style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #e0e0e5', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#1d1d1f' }}
                    />
                    <button
                      onClick={() => resetPassword(r)}
                      disabled={!!savingPw[r.id] || !pwInput[r.id] || (pwInput[r.id] || '').length < 6}
                      style={{ fontSize: 12, fontWeight: 500, padding: '8px 14px', background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, opacity: savingPw[r.id] || !pwInput[r.id] || (pwInput[r.id] || '').length < 6 ? 0.4 : 1 }}
                    >
                      {savingPw[r.id] ? <Spinner /> : <Check size={12} />} Setzen
                    </button>
                    <button
                      onClick={() => { setPwReset(s => ({ ...s, [r.id]: false })); setPwInput(s => ({ ...s, [r.id]: '' })); }}
                      style={{ fontSize: 12, padding: '8px 12px', background: '#fff', color: '#6e6e73', border: '1px solid #e0e0e5', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
