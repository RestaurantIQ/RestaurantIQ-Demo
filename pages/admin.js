import { useState, useEffect, useMemo } from 'react';
import ResCard from '../components/admin/ResCard';
import Calendar from '../components/admin/Calendar';
import NewResModal from '../components/admin/NewResModal';
import AvailabilityTab from '../components/admin/AvailabilityTab';
import ProfileTab from '../components/admin/ProfileTab';
import ServiceMode from '../components/admin/ServiceMode';
import {
  LayoutDashboard, CalendarCheck, Calendar as CalendarIcon,
  Clock, SlidersHorizontal, Utensils, LogOut, ClipboardList, X,
} from 'lucide-react';

function parseDatum(datum) {
  if (!datum) return null;
  const p = datum.split('.');
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}
function fmtDate(d) { return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; }
function fmtDayFull(dayStr) {
  const d = parseDatum(dayStr);
  if (!d) return dayStr;
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}
function todayStr() { return fmtDate(new Date()); }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate()+1); return fmtDate(d); }
function weekRange() {
  const now = new Date(); const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate()+diff);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6);
  return { from: mon, to: sun };
}

const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --riq-bg:      #f7f5f0;
    --riq-surface: #ffffff;
    --riq-nav:     #0d0c0b;
    --riq-gold:    #a8864a;
    --riq-gold-lt: rgba(168,134,74,0.12);
    --riq-text:    #1a1714;
    --riq-text2:   #4a4540;
    --riq-muted:   #8c867e;
    --riq-border:  #e8e3da;
    --riq-border2: #f0ece4;
    --font: 'Outfit', -apple-system, sans-serif;
  }
  body { font-family: var(--font); background: var(--riq-bg); color: var(--riq-text); }
  input, textarea, select, button { font-family: var(--font); }
  input:focus, textarea:focus, select:focus { outline: none; border-color: var(--riq-gold); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

  .riq-sidebar {
    width: 220px; background: var(--riq-nav);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 50;
  }
  .riq-main {
    margin-left: 220px;
    min-height: 100dvh;
    display: flex; flex-direction: column;
  }
  .riq-content {
    flex: 1;
    max-width: 820px;
    padding: 28px 32px;
  }
  .riq-mobile-bar { display: none; }

  @media (max-width: 768px) {
    .riq-sidebar { display: none !important; }
    .riq-main { margin-left: 0 !important; }
    .riq-content { padding: 20px 16px 88px !important; max-width: 100% !important; }
    .riq-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .riq-mobile-bar {
      display: flex !important;
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--riq-nav);
      border-top: 1px solid rgba(255,255,255,0.07);
      z-index: 50;
      padding: 0 4px;
    }
    .riq-mobile-tab {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 3px; padding: 10px 4px 12px;
      background: none; border: none; cursor: pointer;
      font-size: 10px; font-family: var(--font);
      color: rgba(255,255,255,0.45);
    }
    .riq-mobile-tab.active { color: var(--riq-gold); }
  }
  @media (min-width: 769px) {
    .riq-mobile-bar { display: none !important; }
  }

  .riq-nav-item {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border: none; cursor: pointer; text-align: left;
    font-size: 13.5px; font-family: var(--font); font-weight: 400;
    background: transparent; color: rgba(255,255,255,0.5);
    border-left: 2px solid transparent;
    transition: color 0.15s, background 0.15s;
  }
  .riq-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
  .riq-nav-item.active {
    color: var(--riq-gold); font-weight: 500;
    background: var(--riq-gold-lt); border-left-color: var(--riq-gold);
  }

  .riq-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }

  .riq-stat {
    background: var(--riq-surface); border: 1px solid var(--riq-border);
    border-radius: 14px; padding: 20px;
    animation: fadeIn 0.3s ease both;
  }
  .riq-stat-value { font-size: 32px; font-weight: 700; line-height: 1; margin-bottom: 5px; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
  .riq-stat-label { font-size: 12px; color: var(--riq-muted); font-weight: 400; letter-spacing: 0.02em; }

  .riq-pill {
    padding: 5px 13px; border-radius: 20px; font-size: 12px; font-weight: 400;
    cursor: pointer; border: 1px solid var(--riq-border); background: var(--riq-surface);
    color: var(--riq-text2); font-family: var(--font); transition: all 0.12s;
  }
  .riq-pill.active {
    background: var(--riq-text); color: #fff; border-color: var(--riq-text);
  }
  .riq-pill:hover:not(.active) { border-color: #b8b4ac; }

  .riq-btn-primary {
    padding: 9px 18px; background: var(--riq-text); color: #fff;
    border: none; border-radius: 8px; font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: var(--font); transition: opacity 0.15s;
    display: inline-flex; align-items: center; gap: 6px;
    white-space: nowrap;
  }
  .riq-btn-primary:hover { opacity: 0.88; }
  .riq-btn-primary:active { transform: translateY(1px); opacity: 1; }
  .riq-btn-primary:disabled { opacity: 0.4; cursor: default; }

  .riq-input {
    width: 100%; padding: 9px 13px;
    border: 1px solid var(--riq-border); border-radius: 8px;
    font-size: 13.5px; font-family: var(--font); font-weight: 300;
    color: var(--riq-text); background: var(--riq-surface);
    transition: border-color 0.15s;
  }
  .riq-input:focus { border-color: var(--riq-gold); }

  .riq-next-card {
    background: var(--riq-nav); border-radius: 14px; padding: 18px 22px;
    margin-bottom: 22px; animation: fadeIn 0.4s ease both;
  }

  .riq-section-title {
    font-size: 13px; font-weight: 500; color: var(--riq-muted);
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px;
  }

  .riq-slot-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 12px; background: var(--riq-bg);
    border-radius: 8px; margin-bottom: 6px; border: 1px solid var(--riq-border2);
    font-size: 13px; color: var(--riq-text);
  }

  .riq-search {
    flex: 1; padding: 9px 13px;
    border: 1px solid var(--riq-border); border-radius: 8px;
    font-size: 13.5px; font-family: var(--font); font-weight: 300;
    color: var(--riq-text); background: var(--riq-surface); max-width: 300px;
  }
  .riq-search:focus { outline: none; border-color: var(--riq-gold); }
`;

const EMPTY_FORM = { name:'', datum:'', uhrzeit:'', personen:'2', telefon:'', email:'', sonderwunsch:'' };

export default function Admin() {
  const [session, setSession]         = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginUser, setLoginUser]     = useState('');
  const [loginPass, setLoginPass]     = useState('');
  const [loginError, setLoginError]   = useState('');
  const [loggingIn, setLoggingIn]     = useState(false);

  const [tab, setTab]                   = useState('overview');
  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes]     = useState(false);
  const [statusFilter, setStatusFilter] = useState('alle');
  const [dateFilter, setDateFilter]     = useState('alle');
  const [calDay, setCalDay]             = useState(null);
  const [search, setSearch]             = useState('');

  const [newResModal, setNewResModal]   = useState(false);
  const [newResForm, setNewResForm]     = useState(EMPTY_FORM);
  const [newResLoading, setNewResLoading] = useState(false);
  const [newResError, setNewResError]   = useState('');

  const [slots, setSlots]               = useState([]);
  const [addingSlot, setAddingSlot]     = useState(false);
  const [newSlotTime, setNewSlotTime]   = useState('');
  const [newSlotTische, setNewSlotTische] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSession(data); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (session) { loadReservations(); loadSlots(); }
  }, [session]);

  async function login() {
    setLoggingIn(true); setLoginError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      if (r.ok) { setSession(await r.json()); }
      else { const err = await r.json(); setLoginError(err.error || 'Ungültige Zugangsdaten.'); }
    } catch { setLoginError('Verbindungsfehler.'); }
    setLoggingIn(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null); setReservations([]); setSlots([]);
  }

  async function loadReservations() {
    setLoadingRes(true);
    const r = await fetch('/api/reservations');
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setReservations(prev => prev.map(r => r.id===id ? {...r, status} : r));
  }

  async function checkIn(id) {
    const checked_in_at = new Date().toISOString();
    await fetch('/api/reservations', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, checked_in_at }),
    });
    setReservations(prev => prev.map(r => r.id===id ? {...r, checked_in_at} : r));
  }

  async function deleteSlot(id) {
    await fetch('/api/availability', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSlots(prev => prev.filter(s => s.id!==id));
  }

  async function addSlot() {
    if (!newSlotTime || !newSlotTische || !calDay) return;
    const r = await fetch('/api/availability', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datum: calDay, uhrzeit: newSlotTime, tische_frei: parseInt(newSlotTische) }),
    });
    if (r.ok) { await loadSlots(); setNewSlotTime(''); setNewSlotTische(''); setAddingSlot(false); }
  }

  async function createReservation() {
    setNewResLoading(true); setNewResError('');
    const { name, datum, uhrzeit, personen, telefon } = newResForm;
    if (!name || !datum || !uhrzeit || !personen || !telefon) {
      setNewResError('Bitte alle Pflichtfelder ausfüllen.'); setNewResLoading(false); return;
    }
    const r = await fetch('/api/reservations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newResForm, personen: parseInt(newResForm.personen), status: 'bestätigt' }),
    });
    if (r.ok) {
      const saved = await r.json(); setReservations(prev => [saved, ...prev]);
      setNewResModal(false); setNewResForm(EMPTY_FORM);
    } else { setNewResError('Fehler beim Speichern.'); }
    setNewResLoading(false);
  }

  const td = todayStr(); const tm = tomorrowStr(); const wr = weekRange();
  const todayRes     = reservations.filter(r => r.datum===td);
  const pendingCount = reservations.filter(r => r.status==='neu').length;
  const weekRes      = reservations.filter(r => { const d=parseDatum(r.datum); return d&&d>=wr.from&&d<=wr.to; });

  const nextRes = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    return [...reservations]
      .filter(r => r.status!=='abgesagt' && r.status!=='no-show')
      .sort((a,b) => { const da=parseDatum(a.datum), db=parseDatum(b.datum); if(!da||!db) return 0; return da-db||a.uhrzeit.localeCompare(b.uhrzeit); })
      .find(r => { const d=parseDatum(r.datum); return d&&d>=now; });
  }, [reservations]);

  const filtered = reservations.filter(r => {
    if (statusFilter!=='alle' && r.status!==statusFilter) return false;
    if (dateFilter==='heute') return r.datum===td;
    if (dateFilter==='morgen') return r.datum===tm;
    if (dateFilter==='woche') { const d=parseDatum(r.datum); return d&&d>=wr.from&&d<=wr.to; }
    if (dateFilter==='tag'&&calDay) return r.datum===calDay;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return r.name?.toLowerCase().includes(q) || r.telefon?.includes(q) || r.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const NAV_TABS = [
    { key:'overview',     label:'Übersicht',       Icon:LayoutDashboard },
    { key:'reservations', label:`Reservierungen`,   Icon:CalendarCheck   },
    { key:'calendar',     label:'Kalender',         Icon:CalendarIcon    },
    { key:'service',      label:'Service',          Icon:Utensils        },
    { key:'availability', label:'Verfügbarkeit',    Icon:Clock           },
    { key:'profil',       label:'Profil & Widget',  Icon:SlidersHorizontal },
  ];

  if (!authChecked) return (
    <div style={{ minHeight:'100vh', background:'#f7f5f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{GLOBAL}</style>
      <div style={{ width:24, height:24, border:'2px solid #e8e3da', borderTop:'2px solid #a8864a', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!session) return (
    <div style={{ minHeight:'100vh', background:'#f7f5f0', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <style>{GLOBAL}</style>
      <div style={{ background:'#fff', borderRadius:20, padding:'44px 40px', width:'100%', maxWidth:380, border:'1px solid #e8e3da', boxShadow:'0 8px 48px rgba(26,21,16,0.10)' }}>

        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:52, height:52, background:'#0d0c0b', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <img src="/logo.png" alt="RestaurantIQ" style={{ height:26, filter:'brightness(0) invert(1)' }} />
          </div>
          <div style={{ fontSize:20, fontWeight:600, color:'#1a1714', letterSpacing:'-0.01em', marginBottom:6 }}>RestaurantIQ</div>
          <div style={{ display:'inline-block', fontSize:11, fontWeight:500, color:'#8c867e', background:'#f7f5f0', padding:'4px 12px', borderRadius:999, letterSpacing:'0.06em', textTransform:'uppercase' }}>Admin-Bereich</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { state:loginUser, set:setLoginUser, label:'Benutzername', type:'text',     auto:'username'         },
            { state:loginPass, set:setLoginPass, label:'Passwort',     type:'password', auto:'current-password' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize:11, fontWeight:500, color:'#8c867e', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
              <input className="riq-input" type={f.type} autoComplete={f.auto}
                value={f.state} onChange={e=>f.set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
              />
            </div>
          ))}
          {loginError && (
            <div style={{ fontSize:13, color:'#991b1b', padding:'9px 12px', background:'#fee2e2', borderRadius:8, border:'1px solid #fca5a5' }}>{loginError}</div>
          )}
          <button onClick={login} disabled={loggingIn||!loginUser||!loginPass} className="riq-btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
            {loggingIn ? 'Einloggen...' : 'Einloggen'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font)', background:'var(--riq-bg)', minHeight:'100vh' }}>
      <style>{GLOBAL}</style>

      {newResModal && (
        <NewResModal
          form={newResForm}
          onChange={(key, val) => setNewResForm(f => ({...f, [key]: val}))}
          onSave={createReservation}
          onClose={() => { setNewResModal(false); setNewResError(''); }}
          loading={newResLoading}
          error={newResError}
        />
      )}

      {/* Sidebar */}
      <nav className="riq-sidebar">
        <div style={{ padding:'22px 18px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <img src="/logo.png" alt="RestaurantIQ" style={{ height:22, filter:'brightness(0) invert(1)', marginBottom:10 }} />
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.4, wordBreak:'break-word' }}>{session.restaurantName}</div>
          {pendingCount > 0 && (
            <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'#fbbf24', background:'rgba(251,191,36,0.12)', padding:'3px 9px', borderRadius:999 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#fbbf24' }} />
              {pendingCount} offen
            </div>
          )}
        </div>

        <div style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
          {NAV_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`riq-nav-item${tab===t.key?' active':''}`}>
              <t.Icon size={15} strokeWidth={tab===t.key ? 2 : 1.5} />
              {t.label}
              {t.key==='reservations' && pendingCount>0 && (
                <span style={{ marginLeft:'auto', fontSize:10, background:'#dc2626', color:'#fff', borderRadius:999, padding:'1px 6px', fontWeight:600 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={logout} style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'rgba(255,255,255,0.45)', fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all 0.15s' }}>
            <LogOut size={13} strokeWidth={1.5} /> Ausloggen
          </button>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="riq-mobile-bar">
        {NAV_TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`riq-mobile-tab${tab===t.key?' active':''}`}>
            <t.Icon size={18} strokeWidth={tab===t.key ? 2 : 1.5} />
            {t.key==='reservations' && pendingCount>0 ? `Res. (${pendingCount})` : t.label.split(' ')[0]}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <div className="riq-main">
        <div className="riq-content">

          {/* OVERVIEW */}
          {tab==='overview' && <>
            <div style={{ marginBottom:24 }}>
              <h1 style={{ fontSize:22, fontWeight:600, color:'#1a1714', letterSpacing:'-0.01em' }}>Übersicht</h1>
              <p style={{ fontSize:13, color:'#8c867e', marginTop:3 }}>{td}</p>
            </div>

            {pendingCount>0 && (
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'13px 18px', marginBottom:22, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ fontSize:13, color:'#92400e', fontWeight:500 }}>
                  {pendingCount} {pendingCount===1?'Reservierung wartet':'Reservierungen warten'} auf Bestätigung
                </div>
                <button onClick={()=>{setTab('reservations');setStatusFilter('neu');}} style={{ fontSize:12, fontWeight:500, color:'#92400e', background:'rgba(0,0,0,0.06)', border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                  Ansehen
                </button>
              </div>
            )}

            <div className="riq-stat-grid">
              {[
                { label:'Heute',        value:todayRes.length,    accent:false             },
                { label:'Ausstehend',   value:pendingCount,        accent:pendingCount>0    },
                { label:'Diese Woche',  value:weekRes.length,      accent:false             },
                { label:'Gesamt',       value:reservations.length, accent:false             },
              ].map((k,i) => (
                <div key={k.label} className="riq-stat" style={{ animationDelay:`${i*0.06}s` }}>
                  <div className="riq-stat-value" style={{ color: k.accent ? '#b45309' : '#1a1714' }}>{k.value}</div>
                  <div className="riq-stat-label">{k.label}</div>
                </div>
              ))}
            </div>

            {nextRes && (
              <div className="riq-next-card">
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500, marginBottom:10 }}>Nächste Reservierung</div>
                <div style={{ fontSize:22, fontWeight:600, color:'#fff', marginBottom:4 }}>{nextRes.name}</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>{nextRes.datum} · {nextRes.uhrzeit} Uhr · {nextRes.personen} Personen</div>
                {nextRes.sonderwunsch && <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:6, fontStyle:'italic' }}>{nextRes.sonderwunsch}</div>}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div className="riq-section-title" style={{ margin:0 }}>Heute</div>
              <button onClick={()=>setNewResModal(true)} className="riq-btn-primary" style={{ fontSize:12, padding:'7px 14px' }}>+ Neu</button>
            </div>
            {todayRes.length===0
              ? <div style={{ textAlign:'center', padding:'40px 16px', color:'#8c867e', fontSize:13 }}>
                  <ClipboardList size={28} strokeWidth={1.2} style={{ margin:'0 auto 10px', color:'#d4cfc6', display:'block' }} />
                  Keine Reservierungen heute.
                </div>
              : todayRes.map(r => <ResCard key={r.id} r={r} onUpdateStatus={updateStatus} />)
            }
          </>}

          {/* RESERVATIONS */}
          {tab==='reservations' && <>
            <div style={{ marginBottom:20 }}>
              <h1 style={{ fontSize:22, fontWeight:600, color:'#1a1714', letterSpacing:'-0.01em', marginBottom:14 }}>Reservierungen</h1>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, marginBottom:10 }}>
                <input
                  className="riq-search"
                  type="text"
                  placeholder="Name, Telefon oder E-Mail..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setDateFilter('alle'); setStatusFilter('alle'); }}
                />
                <button onClick={()=>setNewResModal(true)} className="riq-btn-primary" style={{ fontSize:12, padding:'9px 14px' }}>+ Neu</button>
              </div>
              <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
                {[{key:'alle',label:'Alle'},{key:'heute',label:'Heute'},{key:'morgen',label:'Morgen'},{key:'woche',label:'Diese Woche'}].map(f => (
                  <button key={f.key} onClick={()=>setDateFilter(f.key)} className={`riq-pill${dateFilter===f.key?' active':''}`}>{f.label}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                {['alle','neu','bestätigt','abgesagt','no-show'].map(f => (
                  <button key={f} onClick={()=>setStatusFilter(f)} className={`riq-pill${statusFilter===f?' active':''}`}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
                <button onClick={loadReservations} className="riq-pill" style={{ marginLeft:'auto' }}>Reload</button>
              </div>
            </div>
            {loadingRes
              ? <p style={{ color:'#8c867e', fontSize:13 }}>Laden...</p>
              : filtered.length===0
                ? <div style={{ textAlign:'center', padding:'40px 16px', color:'#8c867e', fontSize:13 }}>Keine Einträge für diesen Filter.</div>
                : filtered.map(r => <ResCard key={r.id} r={r} onUpdateStatus={updateStatus} />)
            }
          </>}

          {/* CALENDAR */}
          {tab==='calendar' && <>
            <h1 style={{ fontSize:22, fontWeight:600, color:'#1a1714', letterSpacing:'-0.01em', marginBottom:20 }}>Kalender</h1>
            <Calendar reservations={reservations} slots={slots} onSelectDay={day => setCalDay(calDay===day ? null : day)} selectedDay={calDay} />
            {calDay && (() => {
              const dayResItems = reservations.filter(r => r.datum===calDay).sort((a,b) => a.uhrzeit.localeCompare(b.uhrzeit));
              const daySlots    = slots.filter(s => s.datum===calDay);
              return (
                <div style={{ marginTop:16, background:'#fff', borderRadius:14, border:'1px solid #e8e3da', padding:'22px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:'#1a1714' }}>{fmtDayFull(calDay)}</div>
                    <button onClick={()=>{setCalDay(null);setAddingSlot(false);setNewSlotTime('');setNewSlotTische('');}}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#8c867e', display:'flex', alignItems:'center', padding:4 }}>
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div style={{ marginBottom:22 }}>
                    <div className="riq-section-title">Reservierungen</div>
                    {dayResItems.length===0
                      ? <div style={{ fontSize:13, color:'#8c867e' }}>Keine Reservierungen an diesem Tag.</div>
                      : dayResItems.map(r => <ResCard key={r.id} r={r} onUpdateStatus={updateStatus} />)
                    }
                  </div>
                  <div>
                    <div className="riq-section-title">Zeitfenster</div>
                    {daySlots.map(s => (
                      <div key={s.id} className="riq-slot-row">
                        <span>{s.uhrzeit} Uhr · {s.tische_frei} {s.tische_frei===1?'Tisch':'Tische'} frei</span>
                        <button onClick={()=>deleteSlot(s.id)} style={{ fontSize:12, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Entfernen</button>
                      </div>
                    ))}
                    {daySlots.length===0 && !addingSlot && (
                      <div style={{ fontSize:13, color:'#8c867e', marginBottom:10 }}>Keine Zeitfenster.</div>
                    )}
                    {addingSlot ? (
                      <div style={{ display:'flex', gap:8, marginTop:8, alignItems:'center', flexWrap:'wrap' }}>
                        <input type="time" value={newSlotTime} onChange={e=>setNewSlotTime(e.target.value)} className="riq-input" style={{ width:'auto', flex:'none' }} />
                        <input type="number" min="1" max="30" placeholder="Tische" value={newSlotTische} onChange={e=>setNewSlotTische(e.target.value)} className="riq-input" style={{ width:80, flex:'none' }} />
                        <button onClick={addSlot} className="riq-btn-primary" style={{ padding:'8px 14px', fontSize:13 }}>Hinzufügen</button>
                        <button onClick={()=>{setAddingSlot(false);setNewSlotTime('');setNewSlotTische('');}}
                          style={{ padding:'8px 14px', fontSize:13, background:'#fff', color:'#8c867e', border:'1px solid #e8e3da', borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button onClick={()=>setAddingSlot(true)}
                        style={{ marginTop:8, fontSize:13, color:'#4a4540', background:'none', border:'1px dashed #c8c2b8', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontFamily:'inherit' }}>
                        + Zeitfenster
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </>}

          {/* SERVICE */}
          {tab==='service' && <>
            <h1 style={{ fontSize:22, fontWeight:600, color:'#1a1714', letterSpacing:'-0.01em', marginBottom:20 }}>Service-Modus</h1>
            <ServiceMode reservations={reservations} todayStr={td} tomorrowStr={tm} onCheckIn={checkIn} onUpdateStatus={updateStatus} />
          </>}

          {/* AVAILABILITY */}
          {tab==='availability' && <>
            <h1 style={{ fontSize:22, fontWeight:600, color:'#1a1714', letterSpacing:'-0.01em', marginBottom:20 }}>Verfügbarkeit</h1>
            <AvailabilityTab slots={slots} onDeleteSlot={deleteSlot} onSlotsGenerated={loadSlots} />
          </>}

          {/* PROFIL */}
          {tab==='profil' && <>
            <ProfileTab />
          </>}

        </div>
      </div>
    </div>
  );
}
