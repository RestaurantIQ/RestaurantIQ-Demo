import { useState, useEffect } from 'react';
import { Shield, LogIn, KeyRound, StickyNote, Plus, Check, X, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';

const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --riq-bg:      #f7f5f0;
    --riq-surface: #ffffff;
    --riq-nav:     #0d0c0b;
    --riq-gold:    #a8864a;
    --riq-text:    #1a1714;
    --riq-text2:   #4a4540;
    --riq-muted:   #8c867e;
    --riq-border:  #e8e3da;
    --font: 'Outfit', -apple-system, sans-serif;
  }
  body { font-family: var(--font); background: var(--riq-bg); color: var(--riq-text); }
  input, textarea, select, button { font-family: var(--font); }
  input:focus, textarea:focus { outline: none; border-color: var(--riq-gold) !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  .sa-input {
    width: 100%; padding: 9px 13px; border: 1px solid var(--riq-border); border-radius: 8px;
    font-size: 13.5px; font-family: var(--font); color: var(--riq-text);
    background: var(--riq-surface); transition: border-color 0.15s;
  }
  .sa-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 13px; border-radius: 7px; font-size: 12px; font-weight: 500;
    cursor: pointer; font-family: var(--font); transition: opacity 0.15s;
  }
  .sa-btn-primary { background: var(--riq-nav); color: #fff; border: none; }
  .sa-btn-primary:hover { opacity: 0.85; }
  .sa-btn-primary:disabled { opacity: 0.4; cursor: default; }
  .sa-btn-ghost { background: var(--riq-surface); color: var(--riq-muted); border: 1px solid var(--riq-border); }
  .sa-btn-ghost:hover { border-color: #b8b4ac; }
  .sa-card {
    background: var(--riq-surface); border: 1px solid var(--riq-border);
    border-radius: 12px; overflow: hidden;
    animation: fadeIn 0.25s ease both;
  }
  .sa-tag {
    font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
`;

function fmtDate(iso) {
  if (!iso) return 'Nie';
  return new Date(iso).toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function Spinner({ light }) {
  return <div style={{ width:14, height:14, border:`2px solid ${light?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.1)'}`, borderTop:`2px solid ${light?'#fff':'#1a1714'}`, borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />;
}

export default function SuperAdmin() {
  const [secret, setSecret]           = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [authError, setAuthError]     = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(false);

  const [expandedNotes, setExpandedNotes] = useState({});
  const [noteDraft, setNoteDraft]         = useState({});
  const [savingNote, setSavingNote]       = useState({});

  const [pwReset, setPwReset]   = useState({});
  const [pwInput, setPwInput]   = useState({});
  const [savingPw, setSavingPw] = useState({});

  const [savingDemo, setSavingDemo]       = useState({});
  const [impersonating, setImpersonating] = useState({});

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm]         = useState({ name:'', username:'', password:'' });
  const [creating, setCreating]             = useState(false);
  const [createError, setCreateError]       = useState('');

  const [health, setHealth] = useState(null);

  useEffect(() => {
    if (!secret) return;
    async function checkHealth() {
      try { const r = await fetch('/api/health'); setHealth(await r.json()); }
      catch { setHealth({ ok:false }); }
    }
    checkHealth();
    const iv = setInterval(checkHealth, 30000);
    return () => clearInterval(iv);
  }, [secret]);

  function headers() { return { 'Content-Type':'application/json', 'x-superadmin-secret':secret }; }

  async function authenticate() {
    setAuthError(''); setLoading(true);
    const r = await fetch('/api/superadmin/restaurants', { headers:{ 'x-superadmin-secret':secretInput } });
    if (r.ok) { setSecret(secretInput); setRestaurants(await r.json()); }
    else setAuthError('Falsches Passwort.');
    setLoading(false);
  }

  async function reload() {
    const r = await fetch('/api/superadmin/restaurants', { headers:{ 'x-superadmin-secret':secret } });
    if (r.ok) setRestaurants(await r.json());
  }

  async function toggleDemo(restaurant) {
    setSavingDemo(s => ({...s,[restaurant.id]:true}));
    await fetch('/api/superadmin/restaurants', { method:'PATCH', headers:headers(), body:JSON.stringify({ id:restaurant.id, is_demo:!restaurant.is_demo }) });
    setRestaurants(prev => prev.map(r => r.id===restaurant.id ? {...r, is_demo:!r.is_demo} : r));
    setSavingDemo(s => ({...s,[restaurant.id]:false}));
  }

  async function saveNote(restaurant) {
    setSavingNote(s => ({...s,[restaurant.id]:true}));
    const note = noteDraft[restaurant.id] ?? restaurant.admin_notes ?? '';
    await fetch('/api/superadmin/restaurants', { method:'PATCH', headers:headers(), body:JSON.stringify({ id:restaurant.id, admin_notes:note }) });
    setRestaurants(prev => prev.map(r => r.id===restaurant.id ? {...r, admin_notes:note} : r));
    setExpandedNotes(s => ({...s,[restaurant.id]:false}));
    setSavingNote(s => ({...s,[restaurant.id]:false}));
  }

  async function resetPassword(restaurant) {
    const pw = pwInput[restaurant.id] || '';
    if (!pw || pw.length < 6) return;
    setSavingPw(s => ({...s,[restaurant.id]:true}));
    await fetch('/api/superadmin/restaurants', { method:'PATCH', headers:headers(), body:JSON.stringify({ id:restaurant.id, new_password:pw }) });
    setPwReset(s => ({...s,[restaurant.id]:false}));
    setPwInput(s => ({...s,[restaurant.id]:''}));
    setSavingPw(s => ({...s,[restaurant.id]:false}));
  }

  async function impersonate(restaurant) {
    setImpersonating(s => ({...s,[restaurant.id]:true}));
    const r = await fetch('/api/superadmin/impersonate', { method:'POST', headers:headers(), body:JSON.stringify({ restaurantId:restaurant.id }) });
    if (r.ok) window.open('/admin', '_blank');
    setImpersonating(s => ({...s,[restaurant.id]:false}));
  }

  async function createRestaurant() {
    setCreateError('');
    const { name, username, password } = createForm;
    if (!name || !username || !password) { setCreateError('Alle Felder ausfullen.'); return; }
    setCreating(true);
    const r = await fetch('/api/superadmin/restaurants', { method:'POST', headers:headers(), body:JSON.stringify({ name, username, password }) });
    if (r.ok) { await reload(); setCreateForm({ name:'', username:'', password:'' }); setShowCreateForm(false); }
    else { const err = await r.json(); setCreateError(err.error || 'Fehler beim Anlegen.'); }
    setCreating(false);
  }

  if (!secret) {
    return (
      <div style={{ minHeight:'100vh', background:'#f7f5f0', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
        <style>{GLOBAL}</style>
        <div style={{ background:'#fff', borderRadius:20, padding:'44px 40px', width:'100%', maxWidth:360, border:'1px solid #e8e3da', boxShadow:'0 8px 48px rgba(26,21,16,0.10)' }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ width:52, height:52, background:'#0d0c0b', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Shield size={22} color="#fff" strokeWidth={1.8} />
            </div>
            <div style={{ fontSize:20, fontWeight:600, color:'#1a1714', marginBottom:4 }}>Super Admin</div>
            <div style={{ fontSize:12, color:'#8c867e' }}>RestaurantIQ</div>
          </div>
          <input
            className="sa-input"
            type="password"
            placeholder="Admin-Passwort"
            value={secretInput}
            onChange={e=>setSecretInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&authenticate()}
            style={{ marginBottom:12 }}
          />
          {authError && (
            <div style={{ fontSize:13, color:'#991b1b', background:'#fee2e2', border:'1px solid #fca5a5', padding:'9px 12px', borderRadius:8, marginBottom:12 }}>{authError}</div>
          )}
          <button
            onClick={authenticate}
            disabled={loading||!secretInput}
            className="sa-btn sa-btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:'11px', fontSize:14 }}
          >
            {loading ? <Spinner light /> : 'Einloggen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f7f5f0', fontFamily:'var(--font)' }}>
      <style>{GLOBAL}</style>

      {/* Top bar */}
      <div style={{ background:'#0d0c0b', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:54 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Shield size={16} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
          <span style={{ fontSize:13, fontWeight:500, color:'#fff' }}>Super Admin</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.07)', padding:'2px 8px', borderRadius:999 }}>RestaurantIQ</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {health !== null && (
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color: health.ok ? '#4ade80' : '#f87171' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: health.ok ? '#4ade80' : '#f87171' }} />
              {health.ok ? `DB ${health.supabase?.latency ?? ''}ms` : 'DB-Fehler'}
            </span>
          )}
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{restaurants.length} Restaurants</span>
          <button
            onClick={()=>setShowCreateForm(s=>!s)}
            style={{ fontSize:12, fontWeight:500, color:'#fff', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:7, padding:'6px 12px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}
          >
            <Plus size={13} /> Restaurant anlegen
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 16px' }}>

        {/* Create form */}
        {showCreateForm && (
          <div className="sa-card" style={{ marginBottom:20, padding:'20px' }}>
            <div style={{ fontSize:14, fontWeight:600, color:'#1a1714', marginBottom:14 }}>Neues Restaurant</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
              {[
                { key:'name',     placeholder:'Name',                label:'Name'     },
                { key:'username', placeholder:'username',            label:'Username' },
                { key:'password', placeholder:'Passwort',            label:'Passwort', type:'password' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize:11, color:'#8c867e', marginBottom:5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em' }}>{f.label}</div>
                  <input
                    type={f.type||'text'}
                    placeholder={f.placeholder}
                    value={createForm[f.key]}
                    onChange={e=>setCreateForm(prev=>({...prev,[f.key]:e.target.value}))}
                    className="sa-input"
                  />
                </div>
              ))}
            </div>
            {createError && <div style={{ fontSize:12, color:'#dc2626', marginBottom:10 }}>{createError}</div>}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={createRestaurant} disabled={creating} className="sa-btn sa-btn-primary">
                {creating ? <Spinner light /> : <Check size={13} />} Anlegen
              </button>
              <button onClick={()=>{setShowCreateForm(false);setCreateError('');}} className="sa-btn sa-btn-ghost">Abbrechen</button>
            </div>
          </div>
        )}

        {/* Restaurant list */}
        {restaurants.length===0 ? (
          <div style={{ textAlign:'center', padding:'60px 16px', color:'#8c867e', fontSize:14 }}>Noch keine Restaurants.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {restaurants.map((r,i) => (
              <div key={r.id} className="sa-card" style={{ animationDelay:`${i*0.04}s` }}>
                {/* Main row */}
                <div style={{ padding:'15px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:'#1a1714' }}>{r.name}</span>
                      {r.is_demo && (
                        <span className="sa-tag" style={{ color:'#4b5563', background:'#f3f4f6' }}>Demo</span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:'#8c867e' }}>
                      @{r.username} &middot; Login: {fmtDate(r.last_login_at)}
                    </div>
                    {r.admin_notes && (
                      <div style={{ fontSize:12, color:'#4a4540', marginTop:4, fontStyle:'italic' }}>{r.admin_notes}</div>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                    <button onClick={()=>toggleDemo(r)} disabled={!!savingDemo[r.id]} className="sa-btn sa-btn-ghost" style={{ opacity:savingDemo[r.id]?0.5:1 }}>
                      {r.is_demo ? <ToggleRight size={13} color="#a8864a" /> : <ToggleLeft size={13} />}
                      Demo
                    </button>
                    <button onClick={()=>setExpandedNotes(s=>({...s,[r.id]:!s[r.id]}))} className="sa-btn sa-btn-ghost">
                      <StickyNote size={13} />
                      Notiz
                      {expandedNotes[r.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    <button onClick={()=>setPwReset(s=>({...s,[r.id]:!s[r.id]}))} className="sa-btn sa-btn-ghost">
                      <KeyRound size={13} />
                      PW
                    </button>
                    <button onClick={()=>impersonate(r)} disabled={!!impersonating[r.id]} className="sa-btn sa-btn-primary" style={{ opacity:impersonating[r.id]?0.5:1 }}>
                      {impersonating[r.id] ? <Spinner light /> : <LogIn size={13} />}
                      Einloggen als
                    </button>
                  </div>
                </div>

                {/* Notes panel */}
                {expandedNotes[r.id] && (
                  <div style={{ borderTop:'1px solid #f0ece4', padding:'14px 18px', background:'#faf9f7' }}>
                    <textarea
                      value={noteDraft[r.id]!==undefined ? noteDraft[r.id] : (r.admin_notes||'')}
                      onChange={e=>setNoteDraft(s=>({...s,[r.id]:e.target.value}))}
                      placeholder="Notizen zu diesem Restaurant..."
                      rows={3}
                      style={{ width:'100%', padding:'9px 12px', border:'1px solid #e8e3da', borderRadius:8, fontSize:13, fontFamily:'inherit', color:'#1a1714', resize:'vertical', background:'#fff' }}
                    />
                    <div style={{ display:'flex', gap:6, marginTop:8 }}>
                      <button onClick={()=>saveNote(r)} disabled={!!savingNote[r.id]} className="sa-btn sa-btn-primary" style={{ opacity:savingNote[r.id]?0.5:1 }}>
                        {savingNote[r.id] ? <Spinner light /> : <Check size={12} />} Speichern
                      </button>
                      <button onClick={()=>{setExpandedNotes(s=>({...s,[r.id]:false}));setNoteDraft(s=>({...s,[r.id]:undefined}));}} className="sa-btn sa-btn-ghost">
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}

                {/* Password panel */}
                {pwReset[r.id] && (
                  <div style={{ borderTop:'1px solid #f0ece4', padding:'12px 18px', background:'#faf9f7', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <input
                      type="password"
                      placeholder="Neues Passwort (min. 6 Zeichen)"
                      value={pwInput[r.id]||''}
                      onChange={e=>setPwInput(s=>({...s,[r.id]:e.target.value}))}
                      className="sa-input"
                      style={{ flex:1, minWidth:200 }}
                    />
                    <button onClick={()=>resetPassword(r)} disabled={!!savingPw[r.id]||!pwInput[r.id]||(pwInput[r.id]||'').length<6} className="sa-btn sa-btn-primary" style={{ opacity:(savingPw[r.id]||!pwInput[r.id]||(pwInput[r.id]||'').length<6)?0.4:1 }}>
                      {savingPw[r.id] ? <Spinner light /> : <Check size={12} />} Setzen
                    </button>
                    <button onClick={()=>{setPwReset(s=>({...s,[r.id]:false}));setPwInput(s=>({...s,[r.id]:''}));}} className="sa-btn sa-btn-ghost">
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
