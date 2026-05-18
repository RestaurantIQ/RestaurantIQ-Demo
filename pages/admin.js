import { useState, useEffect, useMemo } from 'react';
import ResCard from '../components/admin/ResCard';
import Calendar from '../components/admin/Calendar';
import DayModal from '../components/admin/DayModal';
import NewResModal from '../components/admin/NewResModal';
import AvailabilityTab from '../components/admin/AvailabilityTab';

function parseDatum(datum) {
  if (!datum) return null;
  const p = datum.split('.');
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}
function fmtDate(d) { return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; }
function todayStr() { return fmtDate(new Date()); }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate()+1); return fmtDate(d); }
function weekRange() {
  const now = new Date(); const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(now); mon.setDate(now.getDate()+diff);
  const sun = new Date(mon); sun.setDate(mon.getDate()+6);
  return { from: mon, to: sun };
}

const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus{outline:none;border-color:#1d1d1f !important}@keyframes spin{to{transform:rotate(360deg)}}`;
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
  const [dayModal, setDayModal]         = useState(null);

  const [newResModal, setNewResModal]   = useState(false);
  const [newResForm, setNewResForm]     = useState(EMPTY_FORM);
  const [newResLoading, setNewResLoading] = useState(false);
  const [newResError, setNewResError]   = useState('');

  const [slots, setSlots] = useState([]);

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

  async function deleteSlot(id) {
    await fetch('/api/availability', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSlots(prev => prev.filter(s => s.id!==id));
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
    } else {
      setNewResError('Fehler beim Speichern.');
    }
    setNewResLoading(false);
  }

  const td = todayStr(); const tm = tomorrowStr(); const wr = weekRange();
  const todayRes     = reservations.filter(r => r.datum===td);
  const pendingCount = reservations.filter(r => r.status==='neu').length;

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
    return true;
  });

  if (!authChecked) return (
    <div style={{minHeight:'100vh',background:'#f5f5f7',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <style>{FONT}</style>
      <div style={{width:24,height:24,border:'2px solid #e0e0e5',borderTop:'2px solid #1d1d1f',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  );

  if (!session) return (
    <div style={{minHeight:'100vh',background:'#f5f5f7',display:'flex',alignItems:'center',justifyContent:'center',padding:16,fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <style>{FONT}</style>
      <div style={{background:'#fff',borderRadius:20,padding:'44px 40px',width:'100%',maxWidth:380,boxShadow:'0 8px 48px rgba(0,0,0,0.10)',border:'1px solid #e0e0e5'}}>
        <div style={{marginBottom:36,textAlign:'center'}}>
          <img src="/logo.png" alt="RestaurantIQ" style={{height:44,width:'auto',display:'block',margin:'0 auto 14px'}}/>
          <div style={{fontSize:20,fontWeight:700,color:'#1d1d1f',letterSpacing:'-0.02em',marginBottom:8}}>RestaurantIQ</div>
          <div style={{display:'inline-block',fontSize:11,fontWeight:500,color:'#6e6e73',background:'#f5f5f7',padding:'4px 12px',borderRadius:999,letterSpacing:'0.06em',textTransform:'uppercase'}}>Admin-Bereich</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[{state:loginUser,set:setLoginUser,label:'Benutzername',type:'text',auto:'username'},{state:loginPass,set:setLoginPass,label:'Passwort',type:'password',auto:'current-password'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:6}}>{f.label}</div>
              <input type={f.type} autoComplete={f.auto} value={f.state} onChange={e=>f.set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
                style={{width:'100%',padding:'11px 14px',border:'1px solid #e0e0e5',borderRadius:8,fontSize:14,fontWeight:300,fontFamily:'inherit',color:'#1d1d1f'}}/>
            </div>
          ))}
          {loginError && <div style={{fontSize:13,color:'#c0392b',padding:'8px 12px',background:'#fdf0ee',borderRadius:8}}>{loginError}</div>}
          <button onClick={login} disabled={loggingIn||!loginUser||!loginPass} style={{width:'100%',padding:'12px',marginTop:4,background:'#1d1d1f',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',opacity:loggingIn||!loginUser||!loginPass?0.4:1}}>
            {loggingIn ? 'Einloggen…' : 'Einloggen'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f5f5f7',fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <style>{FONT}</style>

      {dayModal && (
        <DayModal dateStr={dayModal} slots={slots} reservations={reservations}
          onDeleteSlot={deleteSlot}
          onViewReservations={day => { setCalDay(day); setDateFilter('tag'); setTab('reservations'); }}
          onClose={() => setDayModal(null)}/>
      )}

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

      <div style={{background:'#1d1d1f',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56,gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
          <img src="/logo.png" alt="RestaurantIQ" style={{height:22,width:'auto',filter:'brightness(0) invert(1)',flexShrink:0}}/>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.6)',background:'rgba(255,255,255,0.1)',padding:'3px 10px',borderRadius:999,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:200}}>
            {session.restaurantName}
          </span>
          {pendingCount>0 && <span style={{fontSize:11,background:'#c0392b',color:'#fff',borderRadius:999,padding:'2px 8px',fontWeight:600,flexShrink:0}}>{pendingCount} offen</span>}
        </div>
        <button onClick={logout} style={{fontSize:12,color:'rgba(255,255,255,0.65)',background:'transparent',border:'1px solid rgba(255,255,255,0.15)',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>Ausloggen</button>
      </div>

      <div style={{background:'#fff',borderBottom:'1px solid #e0e0e5',padding:'0 24px',display:'flex',overflowX:'auto'}}>
        {[
          {key:'overview',     label:'Übersicht'},
          {key:'reservations', label:`Reservierungen${pendingCount>0?` (${pendingCount})`:''}`},
          {key:'calendar',     label:'Kalender'},
          {key:'availability', label:'Verfügbarkeit'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:'14px 18px',fontSize:13,border:'none',background:'none',cursor:'pointer',whiteSpace:'nowrap',color:tab===t.key?'#1d1d1f':'#6e6e73',borderBottom:tab===t.key?'2px solid #1d1d1f':'2px solid transparent',fontWeight:tab===t.key?500:400,fontFamily:'inherit'}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 16px'}}>

        {tab==='overview' && <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
            {[{label:'Heute',value:todayRes.length,sub:'Reservierungen'},{label:'Offen',value:pendingCount,sub:'Warten auf Bestätigung'},{label:'Gesamt',value:reservations.length,sub:'Alle Buchungen'}].map(s=>(
              <div key={s.label} style={{background:'#fff',borderRadius:12,padding:'20px',border:'1px solid #e0e0e5'}}>
                <div style={{fontSize:30,fontWeight:700,color:'#1d1d1f',marginBottom:4,letterSpacing:'-0.02em'}}>{s.value}</div>
                <div style={{fontSize:13,fontWeight:500,color:'#1d1d1f',marginBottom:2}}>{s.label}</div>
                <div style={{fontSize:11,color:'#6e6e73'}}>{s.sub}</div>
              </div>
            ))}
          </div>
          {nextRes && (
            <div style={{background:'#fff',borderRadius:12,padding:'16px 20px',marginBottom:20,border:'1px solid #e0e0e5',borderLeft:'3px solid #1d1d1f'}}>
              <div style={{fontSize:11,color:'#6e6e73',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:500}}>Nächste Reservierung</div>
              <div style={{fontSize:15,fontWeight:600,color:'#1d1d1f'}}>{nextRes.name}</div>
              <div style={{fontSize:13,color:'#3d3d3f',marginTop:2}}>{nextRes.datum} · {nextRes.uhrzeit} Uhr · {nextRes.personen} Personen</div>
              {nextRes.sonderwunsch && <div style={{fontSize:12,color:'#6e6e73',marginTop:6}}>{nextRes.sonderwunsch}</div>}
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:600,color:'#1d1d1f'}}>Heute — {td}</div>
            <button onClick={()=>setNewResModal(true)} style={{fontSize:13,fontWeight:500,padding:'7px 16px',background:'#1d1d1f',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit'}}>+ Neue Reservierung</button>
          </div>
          {todayRes.length===0 ? <p style={{color:'#6e6e73',fontSize:14}}>Keine Reservierungen heute.</p> : todayRes.map(r=><ResCard key={r.id} r={r} onUpdateStatus={updateStatus}/>)}
        </>}

        {tab==='reservations' && <>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <button onClick={()=>setNewResModal(true)} style={{fontSize:13,fontWeight:500,padding:'7px 16px',background:'#1d1d1f',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit'}}>+ Neue Reservierung</button>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
            {[{key:'alle',label:'Alle'},{key:'heute',label:'Heute'},{key:'morgen',label:'Morgen'},{key:'woche',label:'Diese Woche'}].map(f=>(
              <button key={f.key} onClick={()=>setDateFilter(f.key)} style={{padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontFamily:'inherit',border:'1px solid '+(dateFilter===f.key?'#1d1d1f':'#e0e0e5'),background:dateFilter===f.key?'#1d1d1f':'#fff',color:dateFilter===f.key?'#fff':'#3d3d3f'}}>{f.label}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            {['alle','neu','bestätigt','abgesagt','no-show'].map(f=>(
              <button key={f} onClick={()=>setStatusFilter(f)} style={{padding:'5px 12px',fontSize:12,borderRadius:20,cursor:'pointer',fontFamily:'inherit',border:'1px solid '+(statusFilter===f?'#1d1d1f':'#e0e0e5'),background:statusFilter===f?'#1d1d1f':'#fff',color:statusFilter===f?'#fff':'#3d3d3f'}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
            <button onClick={loadReservations} style={{marginLeft:'auto',padding:'5px 12px',fontSize:12,borderRadius:20,cursor:'pointer',border:'1px solid #e0e0e5',background:'#fff',color:'#3d3d3f',fontFamily:'inherit'}}>↻ Aktualisieren</button>
          </div>
          {loadingRes ? <p style={{color:'#6e6e73',fontSize:14}}>Lädt...</p>
            : filtered.length===0 ? <p style={{color:'#6e6e73',fontSize:14}}>Keine Einträge.</p>
            : filtered.map(r=><ResCard key={r.id} r={r} onUpdateStatus={updateStatus}/>)}
        </>}

        {tab==='calendar' && <Calendar reservations={reservations} slots={slots} onSelectDay={day=>setDayModal(day)}/>}

        {tab==='availability' && <AvailabilityTab slots={slots} onDeleteSlot={deleteSlot} onSlotsGenerated={loadSlots}/>}

      </div>
    </div>
  );
}