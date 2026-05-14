import { useState, useEffect, useMemo } from 'react';

const STATUS_COLOR = { neu: '#d4860a', bestätigt: '#3a9e5f', abgesagt: '#c0392b', 'no-show': '#6e6e73' };
const STATUS_BG    = { neu: '#fff8ed', bestätigt: '#edfbf2', abgesagt: '#fdf0ee', 'no-show': '#f5f5f7' };
const DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];
const DEFAULT_TEMPLATE = { times: ['12:00', '18:00'], cells: {} };

function parseDatum(datum) {
  if (!datum) return null;
  const p = datum.split('.');
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}
function fmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
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
function fmtDayLong(dateStr) {
  const d = parseDatum(dateStr);
  if (!d) return dateStr;
  const weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const months   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function DayModal({ dateStr, slots, reservations, onDeleteSlot, onViewReservations, onClose }) {
  const daySlots = slots.filter(s => s.datum === dateStr);
  const dayRes   = reservations.filter(r => r.datum === dateStr);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAll() {
    setDeleting(true);
    for (const s of daySlots) await onDeleteSlot(s.id);
    setDeleting(false);
  }

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff', borderRadius:16, width:'100%', maxWidth:400,
        boxShadow:'0 20px 60px rgba(0,0,0,0.15)', overflow:'hidden',
      }}>
        <div style={{padding:'20px 24px 16px', borderBottom:'1px solid #e0e0e5'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:11, color:'#6e6e73', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4, fontWeight:500}}>Tagesübersicht</div>
              <div style={{fontSize:16, fontWeight:600, color:'#1d1d1f'}}>{fmtDayLong(dateStr)}</div>
            </div>
            <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#6e6e73', padding:'0 0 0 8px', lineHeight:1}}>✕</button>
          </div>
        </div>

        <div style={{padding:'16px 24px', borderBottom:'1px solid #e0e0e5'}}>
          <div style={{fontSize:11, fontWeight:500, color:'#6e6e73', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>Verfügbarkeit</div>
          {daySlots.length === 0 ? (
            <div style={{fontSize:13, color:'#6e6e73', fontStyle:'italic'}}>Keine Zeitslots — Tag ist gesperrt</div>
          ) : (
            <>
              {daySlots.map(s => (
                <div key={s.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5f5f7'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span style={{fontSize:14, fontWeight:500, color:'#1d1d1f', minWidth:52}}>{s.uhrzeit} Uhr</span>
                    <span style={{fontSize:12, padding:'2px 9px', borderRadius:10, background:s.tische_frei>0?'#edfbf2':'#fdf0ee', color:s.tische_frei>0?'#3a9e5f':'#c0392b'}}>
                      {s.tische_frei} {s.tische_frei===1?'Tisch':'Tische'} frei
                    </span>
                  </div>
                  <button onClick={()=>onDeleteSlot(s.id)} style={{
                    fontSize:11, color:'#c0392b', background:'none',
                    border:'1px solid #f0d0cc', borderRadius:6, padding:'4px 10px',
                    cursor:'pointer', fontFamily:'inherit',
                  }}>Sperren</button>
                </div>
              ))}
              <button onClick={handleDeleteAll} disabled={deleting} style={{
                marginTop:12, width:'100%', padding:'9px 0',
                background:'#fdf0ee', border:'1px solid #f0d0cc',
                borderRadius:8, fontSize:13, color:'#c0392b',
                cursor:'pointer', fontFamily:'inherit', fontWeight:500,
                opacity: deleting ? 0.6 : 1,
              }}>
                {deleting ? 'Wird gesperrt…' : 'Ganzen Tag sperren'}
              </button>
            </>
          )}
        </div>

        <div style={{padding:'16px 24px'}}>
          <div style={{fontSize:11, fontWeight:500, color:'#6e6e73', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>Reservierungen</div>
          {dayRes.length === 0 ? (
            <div style={{fontSize:13, color:'#6e6e73', fontStyle:'italic'}}>Keine Reservierungen an diesem Tag</div>
          ) : (
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:14, color:'#1d1d1f'}}>
                {dayRes.length} {dayRes.length===1?'Reservierung':'Reservierungen'}
                {' · '}{dayRes.filter(r=>r.status==='neu').length} offen
              </span>
              <button onClick={()=>{ onViewReservations(dateStr); onClose(); }} style={{
                fontSize:12, color:'#1d1d1f', background:'none',
                border:'1px solid #e0e0e5', borderRadius:6, padding:'5px 12px',
                cursor:'pointer', fontFamily:'inherit',
              }}>Anzeigen</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Calendar({ reservations, slots, onSelectDay }) {
  const [year, setYear]   = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

  const countMap = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!map[r.datum]) map[r.datum] = { neu: 0, bestätigt: 0 };
      if (r.status === 'neu') map[r.datum].neu++;
      if (r.status === 'bestätigt') map[r.datum].bestätigt++;
    });
    return map;
  }, [reservations]);

  const slotMap = useMemo(() => {
    const map = {};
    slots.forEach(s => { map[s.datum] = (map[s.datum] || 0) + 1; });
    return map;
  }, [slots]);

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month+1, 0);
  const offset   = firstDay.getDay() === 0 ? 6 : firstDay.getDay()-1;
  const cells    = [...Array(offset).fill(null), ...Array.from({length: lastDay.getDate()}, (_,i) => i+1)];

  function dayLabel(d) { return `${String(d).padStart(2,'0')}.${String(month+1).padStart(2,'0')}.${year}`; }
  function prev() { month===0 ? (setMonth(11),setYear(y=>y-1)) : setMonth(m=>m-1); }
  function next() { month===11 ? (setMonth(0),setYear(y=>y+1)) : setMonth(m=>m+1); }
  const td = todayStr();

  return (
    <div style={{background:'#fff',borderRadius:12,padding:20,border:'1px solid #e0e0e5'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <button onClick={prev} style={{background:'none',border:'1px solid #e0e0e5',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:14,color:'#1d1d1f'}}>←</button>
        <span style={{fontSize:15,fontWeight:600,color:'#1d1d1f'}}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={{background:'none',border:'1px solid #e0e0e5',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:14,color:'#1d1d1f'}}>→</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:6}}>
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=><div key={d} style={{textAlign:'center',fontSize:11,color:'#6e6e73',fontWeight:500,padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {cells.map((d,i) => {
          if (!d) return <div key={i}/>;
          const label   = dayLabel(d);
          const info    = countMap[label];
          const hasSlot = slotMap[label] > 0;
          const isToday = label === td;
          return (
            <div key={i} onClick={() => onSelectDay(label)}
              style={{
                padding:'6px 2px', borderRadius:8, textAlign:'center', cursor:'pointer',
                background: isToday ? '#f5f5f7' : 'transparent',
                border: isToday ? '1px solid #e0e0e5' : '1px solid transparent',
                transition:'background 0.12s',
              }}
              onMouseEnter={e=>{ if(!isToday) e.currentTarget.style.background='#f5f5f7'; }}
              onMouseLeave={e=>{ if(!isToday) e.currentTarget.style.background='transparent'; }}
            >
              <div style={{fontSize:13,color:info?'#1d1d1f':hasSlot?'#3d3d3f':'#c7c7cc',fontWeight:info?500:400}}>{d}</div>
              <div style={{display:'flex',justifyContent:'center',gap:2,marginTop:2,minHeight:7}}>
                {info?.neu>0       && <div style={{width:5,height:5,borderRadius:'50%',background:'#d4860a'}}/>}
                {info?.bestätigt>0 && <div style={{width:5,height:5,borderRadius:'50%',background:'#3a9e5f'}}/>}
                {hasSlot && !info  && <div style={{width:5,height:5,borderRadius:'50%',background:'#e0e0e5'}}/>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:16,marginTop:12,fontSize:11,color:'#6e6e73',flexWrap:'wrap'}}>
        <span><span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#d4860a',marginRight:4,verticalAlign:'middle'}}/>Neu</span>
        <span><span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#3a9e5f',marginRight:4,verticalAlign:'middle'}}/>Bestätigt</span>
        <span><span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#e0e0e5',marginRight:4,verticalAlign:'middle'}}/>Verfügbar</span>
        <span style={{marginLeft:'auto',fontSize:11,color:'#6e6e73'}}>Auf Tag klicken zum Verwalten</span>
      </div>
    </div>
  );
}

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
  const [newResForm, setNewResForm]     = useState({ name:'', datum:'', uhrzeit:'', personen:'2', telefon:'', email:'', sonderwunsch:'' });
  const [newResLoading, setNewResLoading] = useState(false);
  const [newResError, setNewResError]   = useState('');

  const [slots, setSlots]               = useState([]);
  const [template, setTemplate]         = useState(DEFAULT_TEMPLATE);
  const [weeksAhead, setWeeksAhead]     = useState(4);
  const [generating, setGenerating]     = useState(false);
  const [genResult, setGenResult]       = useState(null);
  const [newTimeInput, setNewTimeInput] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSession(data); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (session) { loadReservations(); loadSlots(); }
  }, [session]);

  useEffect(() => {
    try { const t = localStorage.getItem('riq_template'); if (t) setTemplate(JSON.parse(t)); } catch(e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('riq_template', JSON.stringify(template));
  }, [template]);

  async function login() {
    setLoggingIn(true); setLoginError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      if (r.ok) { const data = await r.json(); setSession(data); }
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
      const data = await r.json();
      setReservations(prev => [data, ...prev]);
      setNewResModal(false);
      setNewResForm({ name:'', datum:'', uhrzeit:'', personen:'2', telefon:'', email:'', sonderwunsch:'' });
    } else {
      setNewResError('Fehler beim Speichern.');
    }
    setNewResLoading(false);
  }

  function toggleCell(day, time) {
    const key = `${day}-${time}`;
    setTemplate(prev => {
      const cells = {...prev.cells};
      if (cells[key]!==undefined) { delete cells[key]; } else { cells[key] = 4; }
      return {...prev, cells};
    });
  }

  function setCellCount(day, time, val) {
    const key = `${day}-${time}`;
    setTemplate(prev => ({ ...prev, cells: {...prev.cells, [key]: parseInt(val)||0} }));
  }

  function addTime() {
    if (!newTimeInput || template.times.includes(newTimeInput)) return;
    setTemplate(prev => ({ ...prev, times: [...prev.times, newTimeInput].sort() }));
    setNewTimeInput('');
  }

  function removeTime(time) {
    setTemplate(prev => {
      const cells = {...prev.cells};
      DAYS.forEach(d => delete cells[`${d}-${time}`]);
      return { times: prev.times.filter(t => t!==time), cells };
    });
  }

  async function generateSlots() {
    setGenerating(true); setGenResult(null);
    const today = new Date(); today.setHours(0,0,0,0);
    const dow = today.getDay();
    const mon = new Date(today); mon.setDate(today.getDate()+(dow===0?-6:1-dow));
    let count = 0;
    for (let w=0; w<weeksAhead; w++) {
      for (let d=0; d<7; d++) {
        const date = new Date(mon); date.setDate(mon.getDate()+w*7+d);
        if (date<today) continue;
        for (const time of template.times) {
          const key = `${DAYS[d]}-${time}`;
          if (template.cells[key]!==undefined) {
            await fetch('/api/availability', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({datum:fmtDate(date), uhrzeit:time, tische_frei:template.cells[key]}),
            });
            count++;
          }
        }
      }
    }
    await loadSlots(); setGenerating(false); setGenResult(count);
  }

  const td = todayStr(); const tm = tomorrowStr(); const wr = weekRange();
  const todayRes     = reservations.filter(r => r.datum===td);
  const pendingCount = reservations.filter(r => r.status==='neu').length;

  const nextRes = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    return [...reservations]
      .filter(r => r.status!=='abgesagt' && r.status!=='no-show')
      .sort((a,b) => { const da=parseDatum(a.datum), db=parseDatum(b.datum); if (!da||!db) return 0; return da-db || a.uhrzeit.localeCompare(b.uhrzeit); })
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

  const today0 = new Date(); today0.setHours(0,0,0,0);
  const futureSlots = slots.filter(s => { const d=parseDatum(s.datum); return d&&d>=today0; });
  const pastSlots   = slots.filter(s => { const d=parseDatum(s.datum); return d&&d<today0; });

  function ResCard({r}) {
    return (
      <div style={{background:'#fff',borderRadius:10,padding:'16px 20px',marginBottom:8,border:'1px solid #e0e0e5',borderLeft:`3px solid ${STATUS_COLOR[r.status]||'#e0e0e5'}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:600,color:'#1d1d1f',marginBottom:3}}>{r.name}</div>
            <div style={{fontSize:13,color:'#3d3d3f'}}>{r.datum} · {r.uhrzeit} Uhr · {r.personen} {r.personen===1?'Person':'Personen'}</div>
            <div style={{fontSize:13,color:'#6e6e73',marginTop:2}}>{r.telefon}{r.email?` · ${r.email}`:''}</div>
            {r.sonderwunsch && <div style={{fontSize:12,color:'#3d3d3f',marginTop:5,background:'#f5f5f7',padding:'3px 8px',borderRadius:6,display:'inline-block'}}>{r.sonderwunsch}</div>}
          </div>
          <div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:12,background:STATUS_BG[r.status]||'#f5f5f7',color:STATUS_COLOR[r.status]||'#6e6e73',fontWeight:500}}>{r.status}</span>
            {r.status!=='bestätigt' && <button onClick={()=>updateStatus(r.id,'bestätigt')} style={{fontSize:12,padding:'4px 10px',border:'1px solid #3a9e5f',borderRadius:6,background:'#fff',color:'#3a9e5f',cursor:'pointer',fontFamily:'inherit'}}>✓</button>}
            {r.status!=='abgesagt'  && <button onClick={()=>updateStatus(r.id,'abgesagt')}  style={{fontSize:12,padding:'4px 10px',border:'1px solid #c0392b',borderRadius:6,background:'#fff',color:'#c0392b',cursor:'pointer',fontFamily:'inherit'}}>✗</button>}
            {r.status!=='no-show'   && <button onClick={()=>updateStatus(r.id,'no-show')} style={{fontSize:12,padding:'4px 10px',border:'1px solid #e0e0e5',borderRadius:6,background:'#fff',color:'#6e6e73',cursor:'pointer',fontFamily:'inherit'}}>–</button>}
          </div>
        </div>
      </div>
    );
  }

  const FONT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus{outline:none;border-color:#1d1d1f !important}@keyframes spin{to{transform:rotate(360deg)}}`;

  // LOADING
  if (!authChecked) return (
    <div style={{minHeight:'100vh',background:'#f5f5f7',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',-apple-system,sans-serif"}}>
      <style>{FONT}</style>
      <div style={{width:24,height:24,border:'2px solid #e0e0e5',borderTop:'2px solid #1d1d1f',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  );

  // LOGIN
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
          <div>
            <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:6}}>Benutzername</div>
            <input type="text" autoComplete="username" value={loginUser}
              onChange={e=>setLoginUser(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
              style={{width:'100%',padding:'11px 14px',border:'1px solid #e0e0e5',borderRadius:8,fontSize:14,fontWeight:300,fontFamily:'inherit',color:'#1d1d1f',transition:'border-color 0.15s'}}/>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:6}}>Passwort</div>
            <input type="password" autoComplete="current-password" value={loginPass}
              onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
              style={{width:'100%',padding:'11px 14px',border:'1px solid #e0e0e5',borderRadius:8,fontSize:14,fontWeight:300,fontFamily:'inherit',color:'#1d1d1f',transition:'border-color 0.15s'}}/>
          </div>
          {loginError && <div style={{fontSize:13,color:'#c0392b',padding:'8px 12px',background:'#fdf0ee',borderRadius:8}}>{loginError}</div>}
          <button onClick={login} disabled={loggingIn||!loginUser||!loginPass} style={{
            width:'100%',padding:'12px',marginTop:4,background:'#1d1d1f',color:'#fff',
            border:'none',borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',
            opacity:loggingIn||!loginUser||!loginPass?0.4:1,transition:'opacity 0.15s',
          }}>{loggingIn ? 'Einloggen…' : 'Einloggen'}</button>
        </div>
        <div style={{marginTop:28,paddingTop:24,borderTop:'1px solid #f0f0f5',textAlign:'center'}}>
          <img src="/logo.png" alt="RestaurantIQ" style={{height:20,width:'auto',opacity:0.25}}/>
          <div style={{fontSize:10,color:'#c7c7cc',marginTop:6,letterSpacing:'0.04em'}}>Restaurant Management System</div>
        </div>
      </div>
    </div>
  );

  // DASHBOARD
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
        <div onClick={()=>setNewResModal(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',overflow:'hidden'}}>
            <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #e0e0e5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:11,color:'#6e6e73',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:500,marginBottom:2}}>Manuell anlegen</div>
                <div style={{fontSize:16,fontWeight:600,color:'#1d1d1f'}}>Neue Reservierung</div>
              </div>
              <button onClick={()=>setNewResModal(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#6e6e73'}}>✕</button>
            </div>
            <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:12}}>
              {[
                {key:'name',      label:'Name *',        type:'text',   placeholder:'Max Mustermann'},
                {key:'datum',     label:'Datum *',       type:'text',   placeholder:'31.12.2026'},
                {key:'uhrzeit',   label:'Uhrzeit *',     type:'time',   placeholder:'19:00'},
                {key:'personen',  label:'Personen *',    type:'number', placeholder:'2'},
                {key:'telefon',   label:'Telefon *',     type:'text',   placeholder:'+49 123 456789'},
                {key:'email',     label:'E-Mail',        type:'email',  placeholder:'gast@beispiel.de'},
                {key:'sonderwunsch', label:'Hinweis',   type:'text',   placeholder:'Fensterplatz, Allergie...'},
              ].map(({key, label, type, placeholder}) => (
                <div key={key}>
                  <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:5}}>{label}</div>
                  <input type={type} placeholder={placeholder} value={newResForm[key]}
                    onChange={e => setNewResForm(f => ({...f, [key]: e.target.value}))}
                    style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e5',borderRadius:8,fontSize:14,fontFamily:'inherit',color:'#1d1d1f',outline:'none'}}/>
                </div>
              ))}
              {newResError && <div style={{fontSize:13,color:'#c0392b',background:'#fdf0ee',padding:'8px 12px',borderRadius:8}}>{newResError}</div>}
              <button onClick={createReservation} disabled={newResLoading} style={{
                marginTop:4,padding:'12px',background:'#1d1d1f',color:'#fff',border:'none',
                borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',
                opacity:newResLoading?0.5:1,
              }}>{newResLoading ? 'Wird gespeichert…' : 'Reservierung speichern'}</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
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

      {/* TABS */}
      <div style={{background:'#fff',borderBottom:'1px solid #e0e0e5',padding:'0 24px',display:'flex',overflowX:'auto'}}>
        {[
          {key:'overview',     label:'Übersicht'},
          {key:'reservations', label:`Reservierungen${pendingCount>0?` (${pendingCount})`:''}`},
          {key:'calendar',     label:'Kalender'},
          {key:'availability', label:'Verfügbarkeit'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            padding:'14px 18px',fontSize:13,border:'none',background:'none',cursor:'pointer',whiteSpace:'nowrap',
            color:tab===t.key?'#1d1d1f':'#6e6e73',
            borderBottom:tab===t.key?'2px solid #1d1d1f':'2px solid transparent',
            fontWeight:tab===t.key?500:400,fontFamily:'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 16px'}}>

        {/* OVERVIEW */}
        {tab==='overview' && <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
            {[
              {label:'Heute',  value:todayRes.length,    sub:'Reservierungen'},
              {label:'Offen',  value:pendingCount,        sub:'Warten auf Bestätigung'},
              {label:'Gesamt', value:reservations.length, sub:'Alle Buchungen'},
            ].map(s=>(
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
          {todayRes.length===0 ? <p style={{color:'#6e6e73',fontSize:14}}>Keine Reservierungen heute.</p> : todayRes.map(r=><ResCard key={r.id} r={r}/>)}
        </>}

        {/* RESERVATIONS */}
        {tab==='reservations' && <>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <button onClick={()=>setNewResModal(true)} style={{fontSize:13,fontWeight:500,padding:'7px 16px',background:'#1d1d1f',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontFamily:'inherit'}}>+ Neue Reservierung</button>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
            {[{key:'alle',label:'Alle'},{key:'heute',label:'Heute'},{key:'morgen',label:'Morgen'},{key:'woche',label:'Diese Woche'}].map(f=>(
              <button key={f.key} onClick={()=>setDateFilter(f.key)} style={{
                padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontFamily:'inherit',
                border:'1px solid '+(dateFilter===f.key?'#1d1d1f':'#e0e0e5'),
                background:dateFilter===f.key?'#1d1d1f':'#fff',
                color:dateFilter===f.key?'#fff':'#3d3d3f',
              }}>{f.label}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            {['alle','neu','bestätigt','abgesagt','no-show'].map(f=>(
              <button key={f} onClick={()=>setStatusFilter(f)} style={{
                padding:'5px 12px',fontSize:12,borderRadius:20,cursor:'pointer',fontFamily:'inherit',
                border:'1px solid '+(statusFilter===f?'#1d1d1f':'#e0e0e5'),
                background:statusFilter===f?'#1d1d1f':'#fff',
                color:statusFilter===f?'#fff':'#3d3d3f',
              }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
            <button onClick={loadReservations} style={{marginLeft:'auto',padding:'5px 12px',fontSize:12,borderRadius:20,cursor:'pointer',border:'1px solid #e0e0e5',background:'#fff',color:'#3d3d3f',fontFamily:'inherit'}}>↻ Aktualisieren</button>
          </div>
          {loadingRes ? <p style={{color:'#6e6e73',fontSize:14}}>Lädt...</p>
            : filtered.length===0 ? <p style={{color:'#6e6e73',fontSize:14}}>Keine Einträge.</p>
            : filtered.map(r=><ResCard key={r.id} r={r}/>)}
        </>}

        {/* CALENDAR */}
        {tab==='calendar' && <Calendar reservations={reservations} slots={slots} onSelectDay={day=>setDayModal(day)}/>}

        {/* AVAILABILITY */}
        {tab==='availability' && <>
          <div style={{background:'#fff',borderRadius:12,padding:'20px 24px',marginBottom:16,border:'1px solid #e0e0e5'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <div style={{fontSize:14,fontWeight:600,color:'#1d1d1f'}}>Wochenplan</div>
              <button onClick={()=>setTemplate(DEFAULT_TEMPLATE)} style={{fontSize:11,color:'#6e6e73',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit'}}>Zurücksetzen</button>
            </div>
            <div style={{fontSize:12,color:'#6e6e73',marginBottom:16}}>Zelle anklicken zum Öffnen · Zahl direkt bearbeiten · Wird automatisch gespeichert</div>
            <div style={{overflowX:'auto'}}>
              <div style={{minWidth:500}}>
                <div style={{display:'grid',gridTemplateColumns:'60px repeat(7, 1fr)',gap:4,marginBottom:4}}>
                  <div/>
                  {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:12,fontWeight:500,color:'#6e6e73',padding:'4px 0'}}>{d}</div>)}
                </div>
                {template.times.map(time => (
                  <div key={time} style={{display:'grid',gridTemplateColumns:'60px repeat(7, 1fr)',gap:4,marginBottom:4}}>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:13,fontWeight:500,color:'#3d3d3f'}}>{time}</span>
                      <button onClick={()=>removeTime(time)} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#6e6e73',padding:'0 2px',fontFamily:'inherit',lineHeight:1}}>✕</button>
                    </div>
                    {DAYS.map(day => {
                      const key = `${day}-${time}`; const count = template.cells[key]; const isOpen = count !== undefined;
                      return (
                        <div key={day} onClick={() => !isOpen && toggleCell(day, time)}
                          style={{position:'relative',borderRadius:8,padding:'8px 4px',textAlign:'center',cursor:isOpen?'default':'pointer',
                            background:isOpen?'#edfbf2':'#f5f5f7',border:`1px solid ${isOpen?'#3a9e5f':'#e0e0e5'}`,
                            minHeight:52,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {isOpen ? (
                            <>
                              <button onClick={e=>{e.stopPropagation();toggleCell(day,time);}}
                                style={{position:'absolute',top:2,right:3,background:'none',border:'none',cursor:'pointer',fontSize:10,color:'#6e6e73',padding:'1px 3px',lineHeight:1,fontFamily:'inherit'}}>✕</button>
                              <div>
                                <input type="number" value={count} min={0} max={99}
                                  onClick={e=>e.stopPropagation()} onChange={e=>setCellCount(day,time,e.target.value)}
                                  style={{width:32,textAlign:'center',border:'none',background:'transparent',fontSize:16,fontWeight:700,color:'#3a9e5f',outline:'none',fontFamily:'inherit'}}/>
                                <div style={{fontSize:9,color:'#6e6e73',marginTop:1,lineHeight:1}}>Tische</div>
                              </div>
                            </>
                          ) : <span style={{color:'#c7c7cc',fontSize:20,lineHeight:1}}>+</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10}}>
                  <input type="time" value={newTimeInput} onChange={e=>setNewTimeInput(e.target.value)}
                    style={{padding:'6px 10px',border:'1px solid #e0e0e5',borderRadius:8,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                  <button onClick={addTime} disabled={!newTimeInput}
                    style={{padding:'6px 16px',background:'#f5f5f7',border:'1px solid #e0e0e5',borderRadius:8,fontSize:13,cursor:'pointer',color:'#3d3d3f',fontFamily:'inherit',opacity:!newTimeInput?0.5:1}}>
                    Uhrzeit hinzufügen
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:12,padding:'20px 24px',marginBottom:16,border:'1px solid #e0e0e5'}}>
            <div style={{fontSize:14,fontWeight:600,color:'#1d1d1f',marginBottom:12}}>Zeitslots generieren</div>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              <span style={{fontSize:13,color:'#3d3d3f'}}>Für die nächsten</span>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <button onClick={()=>setWeeksAhead(w=>Math.max(1,w-1))} style={{width:28,height:28,borderRadius:6,border:'1px solid #e0e0e5',background:'#f5f5f7',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit',color:'#1d1d1f'}}>−</button>
                <span style={{fontSize:18,fontWeight:600,color:'#1d1d1f',minWidth:28,textAlign:'center'}}>{weeksAhead}</span>
                <button onClick={()=>setWeeksAhead(w=>Math.min(52,w+1))} style={{width:28,height:28,borderRadius:6,border:'1px solid #e0e0e5',background:'#f5f5f7',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit',color:'#1d1d1f'}}>+</button>
              </div>
              <span style={{fontSize:13,color:'#3d3d3f'}}>Wochen generieren</span>
              <button onClick={generateSlots} disabled={generating||Object.keys(template.cells).length===0}
                style={{marginLeft:'auto',padding:'9px 28px',background:'#1d1d1f',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',
                  opacity:generating||Object.keys(template.cells).length===0?0.4:1}}>
                {generating?'Läuft…':'Generieren'}
              </button>
            </div>
            {genResult!==null && <div style={{marginTop:12,fontSize:13,color:'#3a9e5f',background:'#edfbf2',padding:'8px 14px',borderRadius:8}}>{genResult} Zeitslots erstellt.</div>}
            {Object.keys(template.cells).length===0 && <div style={{marginTop:10,fontSize:12,color:'#6e6e73'}}>Zuerst Wochenplan ausfüllen.</div>}
          </div>

          <div style={{background:'#fff',borderRadius:12,padding:'20px 24px',border:'1px solid #e0e0e5'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:600,color:'#1d1d1f'}}>Kommende Slots <span style={{fontSize:12,fontWeight:400,color:'#6e6e73',marginLeft:8}}>{futureSlots.length} Einträge</span></div>
              {pastSlots.length>0 && <span style={{fontSize:12,color:'#6e6e73'}}>{pastSlots.length} vergangene ausgeblendet</span>}
            </div>
            {futureSlots.length===0
              ? <p style={{color:'#6e6e73',fontSize:14,margin:0}}>Noch keine zukünftigen Zeitslots.</p>
              : futureSlots.map(s=>(
                <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f5f5f7'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    <span style={{fontSize:13,fontWeight:500,color:'#1d1d1f',minWidth:90}}>{s.datum}</span>
                    <span style={{fontSize:13,color:'#3d3d3f'}}>{s.uhrzeit} Uhr</span>
                    <span style={{fontSize:12,padding:'2px 10px',borderRadius:12,background:s.tische_frei>0?'#edfbf2':'#fdf0ee',color:s.tische_frei>0?'#3a9e5f':'#c0392b'}}>
                      {s.tische_frei} {s.tische_frei===1?'Tisch':'Tische'} frei
                    </span>
                  </div>
                  <button onClick={()=>deleteSlot(s.id)} style={{fontSize:11,color:'#6e6e73',background:'none',border:'1px solid #e0e0e5',borderRadius:6,padding:'3px 10px',cursor:'pointer',fontFamily:'inherit'}}>Löschen</button>
                </div>
              ))
            }
          </div>
        </>}

      </div>
    </div>
  );
}
