import { useState, useEffect, useMemo } from 'react';

const STATUS_COLOR = { neu: '#d4860a', bestätigt: '#3a9e5f', abgesagt: '#c0392b', 'no-show': '#7f8c8d' };
const STATUS_BG    = { neu: '#fff8ed', bestätigt: '#edfbf2', abgesagt: '#fdf0ee', 'no-show': '#f5f5f5' };

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

function Calendar({ reservations, onSelectDay }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];

  const countMap = useMemo(() => {
    const map = {};
    reservations.forEach(r => {
      if (!map[r.datum]) map[r.datum] = { neu: 0, bestätigt: 0 };
      if (r.status === 'neu') map[r.datum].neu++;
      if (r.status === 'bestätigt') map[r.datum].bestätigt++;
    });
    return map;
  }, [reservations]);

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month+1, 0);
  const offset   = firstDay.getDay() === 0 ? 6 : firstDay.getDay()-1;
  const cells    = [...Array(offset).fill(null), ...Array.from({length: lastDay.getDate()}, (_,i) => i+1)];

  function dayLabel(d) { return `${String(d).padStart(2,'0')}.${String(month+1).padStart(2,'0')}.${year}`; }
  function prev() { month===0 ? (setMonth(11),setYear(y=>y-1)) : setMonth(m=>m-1); }
  function next() { month===11 ? (setMonth(0),setYear(y=>y+1)) : setMonth(m=>m+1); }
  const td = todayStr();

  return (
    <div style={{background:'#fff',borderRadius:10,padding:20,boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <button onClick={prev} style={{background:'none',border:'1px solid #e4ddd4',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:14}}>←</button>
        <span style={{fontSize:15,fontWeight:600,color:'#1a1612'}}>{MONTHS[month]} {year}</span>
        <button onClick={next} style={{background:'none',border:'1px solid #e4ddd4',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontSize:14}}>→</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:6}}>
        {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:11,color:'#9e8f7e',fontWeight:500,padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {cells.map((d,i) => {
          if (!d) return <div key={i}/>;
          const label = dayLabel(d);
          const info  = countMap[label];
          const isToday = label === td;
          return (
            <div key={i} onClick={() => info && onSelectDay(label)}
              style={{padding:'6px 2px',borderRadius:8,textAlign:'center',cursor:info?'pointer':'default',
                background:isToday?'#fdf6e8':'transparent',border:isToday?'1px solid #e8d9a8':'1px solid transparent'}}>
              <div style={{fontSize:13,color:info?'#1a1612':'#c0b8ae',fontWeight:info?500:400}}>{d}</div>
              {info && <div style={{display:'flex',justifyContent:'center',gap:2,marginTop:2}}>
                {info.neu>0 && <div style={{width:5,height:5,borderRadius:'50%',background:'#d4860a'}}/>}
                {info.bestätigt>0 && <div style={{width:5,height:5,borderRadius:'50%',background:'#3a9e5f'}}/>}
              </div>}
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:16,marginTop:12,fontSize:11,color:'#9e8f7e'}}>
        <span><span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#d4860a',marginRight:4}}/>Neu</span>
        <span><span style={{display:'inline-block',width:6,height:6,borderRadius:'50%',background:'#3a9e5f',marginRight:4}}/>Bestätigt</span>
        <span style={{marginLeft:'auto',fontSize:11,color:'#c0b8ae'}}>Auf Tag klicken zum Filtern</span>
      </div>
    </div>
  );
}

export default function Admin() {
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [password, setPassword]   = useState('');
  const [authed, setAuthed]       = useState(false);
  const [tab, setTab]             = useState('overview');

  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes]     = useState(false);
  const [statusFilter, setStatusFilter] = useState('alle');
  const [dateFilter, setDateFilter]     = useState('alle');
  const [calDay, setCalDay]             = useState(null);

  const [slots, setSlots]         = useState([]);
  const [newDatum, setNewDatum]   = useState('');
  const [newTime, setNewTime]     = useState('');
  const [newCount, setNewCount]   = useState('');
  const [recurring, setRecurring] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState('4');
  const [saving, setSaving]       = useState(false);

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
        if (r.ok) { localStorage.setItem('riq_pw', authInput); setPassword(authInput); setAuthed(true); }
        else setAuthError('Falsches Passwort.');
      }).catch(() => setAuthError('Verbindungsfehler.'));
  }

  function logout() { localStorage.removeItem('riq_pw'); setAuthed(false); setPassword(''); }

  async function loadReservations(pw) {
    setLoadingRes(true);
    const r = await fetch(`/api/reservations?password=${encodeURIComponent(pw||password)}`);
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
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id, status, password}),
    });
    setReservations(prev => prev.map(r => r.id===id ? {...r, status} : r));
  }

  async function saveSlot() {
    if (!newDatum||!newTime||!newCount) return;
    setSaving(true);
    const weeks = recurring ? (parseInt(repeatWeeks)||1) : 1;
    const base  = new Date(newDatum+'T00:00:00');
    for (let i=0; i<weeks; i++) {
      const d = new Date(base); d.setDate(d.getDate()+i*7);
      const datum = fmtDate(d);
      await fetch('/api/availability', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({datum, uhrzeit:newTime, tische_frei:parseInt(newCount), password}),
      });
    }
    await loadSlots();
    setNewDatum(''); setNewTime(''); setNewCount(''); setRecurring(false); setRepeatWeeks('4');
    setSaving(false);
  }

  async function deleteSlot(id) {
    await fetch('/api/availability', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,password}) });
    setSlots(prev => prev.filter(s => s.id!==id));
  }

  const td = todayStr(); const tm = tomorrowStr(); const wr = weekRange();
  const todayRes    = reservations.filter(r => r.datum===td);
  const pendingCount = reservations.filter(r => r.status==='neu').length;
  const neuCount     = pendingCount;

  const nextRes = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    return [...reservations]
      .filter(r => r.status!=='abgesagt' && r.status!=='no-show')
      .sort((a,b) => {
        const da=parseDatum(a.datum), db=parseDatum(b.datum);
        if (!da||!db) return 0;
        return da-db || a.uhrzeit.localeCompare(b.uhrzeit);
      })
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

  function ResCard({r}) {
    return (
      <div style={{background:'#fff',borderRadius:10,padding:'16px 20px',marginBottom:10,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',borderLeft:`3px solid ${STATUS_COLOR[r.status]||'#ccc'}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:600,color:'#1a1612',marginBottom:3}}>{r.name}</div>
            <div style={{fontSize:13,color:'#5a5245'}}>{r.datum} · {r.uhrzeit} Uhr · {r.personen} {r.personen===1?'Person':'Personen'}</div>
            <div style={{fontSize:13,color:'#9e8f7e',marginTop:2}}>{r.telefon}{r.email?` · ${r.email}`:''}</div>
            {r.sonderwunsch && <div style={{fontSize:12,color:'#b09050',marginTop:5,background:'#fdf6e8',padding:'3px 8px',borderRadius:6,display:'inline-block'}}>✦ {r.sonderwunsch}</div>}
          </div>
          <div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:12,background:STATUS_BG[r.status]||'#f5f5f5',color:STATUS_COLOR[r.status]||'#999',fontWeight:500}}>{r.status}</span>
            {r.status!=='bestätigt' && <button onClick={()=>updateStatus(r.id,'bestätigt')} style={{fontSize:12,padding:'4px 10px',border:'1px solid #3a9e5f',borderRadius:6,background:'#fff',color:'#3a9e5f',cursor:'pointer',fontFamily:'inherit'}}>✓</button>}
            {r.status!=='abgesagt' && <button onClick={()=>updateStatus(r.id,'abgesagt')} style={{fontSize:12,padding:'4px 10px',border:'1px solid #c0392b',borderRadius:6,background:'#fff',color:'#c0392b',cursor:'pointer',fontFamily:'inherit'}}>✗</button>}
            {r.status!=='no-show' && <button onClick={()=>updateStatus(r.id,'no-show')} title="No-Show" style={{fontSize:12,padding:'4px 10px',border:'1px solid #9e8f7e',borderRadius:6,background:'#fff',color:'#9e8f7e',cursor:'pointer',fontFamily:'inherit'}}>–</button>}
          </div>
        </div>
      </div>
    );
  }

  if (!authed) return (
    <div style={{minHeight:'100vh',background:'#f5f0ea',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');`}</style>
      <div style={{background:'#fff',borderRadius:14,padding:'40px 36px',width:340,boxShadow:'0 4px 32px rgba(0,0,0,0.08)'}}>
        <div style={{fontSize:22,fontWeight:600,color:'#1a1612',marginBottom:4}}>RestaurantIQ</div>
        <div style={{fontSize:13,color:'#9e8f7e',marginBottom:28}}>Admin · La Fontana di Capri</div>
        <input type="password" placeholder="Passwort" value={authInput}
          onChange={e=>setAuthInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
          style={{width:'100%',padding:'10px 14px',border:'1px solid #e4ddd4',borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'inherit'}}/>
        {authError && <div style={{color:'#c0392b',fontSize:13,marginBottom:10}}>{authError}</div>}
        <button onClick={login} style={{width:'100%',padding:11,background:'#b09050',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>Einloggen</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f5f0ea',fontFamily:"'Outfit',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap');*{box-sizing:border-box}`}</style>

      <div style={{background:'#fff',borderBottom:'1px solid #ece6dd',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:15,fontWeight:600,color:'#1a1612'}}>RestaurantIQ</span>
          <span style={{fontSize:12,color:'#b09050',background:'#fdf6e8',padding:'2px 10px',borderRadius:20,border:'1px solid #e8d9a8'}}>La Fontana di Capri</span>
          {pendingCount>0 && <span style={{fontSize:11,background:'#c0392b',color:'#fff',borderRadius:20,padding:'2px 8px',fontWeight:600}}>{pendingCount} offen</span>}
        </div>
        <button onClick={logout} style={{fontSize:12,color:'#9e8f7e',background:'none',border:'1px solid #e4ddd4',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'inherit'}}>Ausloggen</button>
      </div>

      <div style={{background:'#fff',borderBottom:'1px solid #ece6dd',padding:'0 24px',display:'flex',overflowX:'auto'}}>
        {[
          {key:'overview',  label:'Übersicht'},
          {key:'reservations', label:`Reservierungen${neuCount>0?` (${neuCount})`:''}`},
          {key:'calendar',  label:'Kalender'},
          {key:'availability', label:'Verfügbarkeit'},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            padding:'14px 18px',fontSize:13,border:'none',background:'none',cursor:'pointer',whiteSpace:'nowrap',
            color:tab===t.key?'#b09050':'#9e8f7e',
            borderBottom:tab===t.key?'2px solid #b09050':'2px solid transparent',
            fontWeight:tab===t.key?500:400,fontFamily:'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 16px'}}>

        {tab==='overview' && <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
            {[
              {label:'Heute',   value:todayRes.length,  sub:'Reservierungen',          color:'#b09050'},
              {label:'Offen',   value:pendingCount,      sub:'Warten auf Bestätigung', color:'#d4860a'},
              {label:'Gesamt',  value:reservations.length, sub:'Alle Buchungen',       color:'#3a9e5f'},
            ].map(s=>(
              <div key={s.label} style={{background:'#fff',borderRadius:10,padding:'16px 20px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
                <div style={{fontSize:28,fontWeight:700,color:s.color,marginBottom:2}}>{s.value}</div>
                <div style={{fontSize:13,fontWeight:500,color:'#1a1612'}}>{s.label}</div>
                <div style={{fontSize:11,color:'#9e8f7e'}}>{s.sub}</div>
              </div>
            ))}
          </div>

          {nextRes && (
            <div style={{background:'#fff',borderRadius:10,padding:'16px 20px',marginBottom:20,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',borderLeft:'3px solid #b09050'}}>
              <div style={{fontSize:11,color:'#9e8f7e',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.1em'}}>Nächste Reservierung</div>
              <div style={{fontSize:15,fontWeight:600,color:'#1a1612'}}>{nextRes.name}</div>
              <div style={{fontSize:13,color:'#5a5245',marginTop:2}}>{nextRes.datum} · {nextRes.uhrzeit} Uhr · {nextRes.personen} Personen</div>
              {nextRes.sonderwunsch && <div style={{fontSize:12,color:'#b09050',marginTop:6}}>✦ {nextRes.sonderwunsch}</div>}
            </div>
          )}

          <div style={{fontSize:14,fontWeight:600,color:'#1a1612',marginBottom:12}}>Heute — {td}</div>
          {todayRes.length===0
            ? <p style={{color:'#9e8f7e',fontSize:14}}>Keine Reservierungen heute.</p>
            : todayRes.map(r=><ResCard key={r.id} r={r}/>)}
        </>}

        {tab==='reservations' && <>
          <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
            {[{key:'alle',label:'Alle'},{key:'heute',label:'Heute'},{key:'morgen',label:'Morgen'},{key:'woche',label:'Diese Woche'}].map(f=>(
              <button key={f.key} onClick={()=>setDateFilter(f.key)} style={{
                padding:'6px 14px',fontSize:12,borderRadius:20,cursor:'pointer',fontFamily:'inherit',
                border:'1px solid '+(dateFilter===f.key?'#b09050':'#e4ddd4'),
                background:dateFilter===f.key?'#b09050':'#fff',
                color:dateFilter===f.key?'#fff':'#5a5245',
              }}>{f.label}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            {['alle','neu','bestätigt','abgesagt','no-show'].map(f=>(
              <button key={f} onClick={()=>setStatusFilter(f)} style={{
                padding:'5px 12px',fontSize:12,borderRadius:20,cursor:'pointer',fontFamily:'inherit',
                border:'1px solid '+(statusFilter===f?'#5a5245':'#e4ddd4'),
                background:statusFilter===f?'#5a5245':'#fff',
                color:statusFilter===f?'#fff':'#5a5245',
              }}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
            <button onClick={()=>loadReservations(password)} style={{marginLeft:'auto',padding:'5px 12px',fontSize:12,borderRadius:20,cursor:'pointer',border:'1px solid #e4ddd4',background:'#fff',color:'#5a5245',fontFamily:'inherit'}}>↻</button>
          </div>
          {loadingRes ? <p style={{color:'#9e8f7e',fontSize:14}}>Lädt...</p>
            : filtered.length===0 ? <p style={{color:'#9e8f7e',fontSize:14}}>Keine Einträge.</p>
            : filtered.map(r=><ResCard key={r.id} r={r}/>)}
        </>}

        {tab==='calendar' && (
          <Calendar reservations={reservations} onSelectDay={day=>{
            setCalDay(day); setDateFilter('tag'); setTab('reservations');
          }}/>
        )}

        {tab==='availability' && <>
          <div style={{background:'#fff',borderRadius:10,padding:'20px 24px',marginBottom:20,boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize:14,fontWeight:600,color:'#1a1612',marginBottom:16}}>Zeitslot hinzufügen</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'flex-end'}}>
              <div>
                <div style={{fontSize:11,color:'#9e8f7e',marginBottom:4}}>Datum</div>
                <input type="date" value={newDatum} onChange={e=>setNewDatum(e.target.value)}
                  style={{padding:'8px 12px',border:'1px solid #e4ddd4',borderRadius:8,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:'#9e8f7e',marginBottom:4}}>Uhrzeit</div>
                <input type="time" value={newTime} onChange={e=>setNewTime(e.target.value)}
                  style={{padding:'8px 12px',border:'1px solid #e4ddd4',borderRadius:8,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:'#9e8f7e',marginBottom:4}}>Freie Tische</div>
                <input type="number" min="0" max="99" value={newCount} onChange={e=>setNewCount(e.target.value)} placeholder="z.B. 4"
                  style={{padding:'8px 12px',border:'1px solid #e4ddd4',borderRadius:8,fontSize:13,width:80,outline:'none',fontFamily:'inherit'}}/>
              </div>
              <button onClick={saveSlot} disabled={saving||!newDatum||!newTime||!newCount}
                style={{padding:'8px 22px',background:'#b09050',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',opacity:(!newDatum||!newTime||!newCount)?0.5:1,fontFamily:'inherit'}}>
                {saving?'Speichern…':'Speichern'}
              </button>
            </div>
            <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>
              <label style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'#5a5245',cursor:'pointer'}}>
                <input type="checkbox" checked={recurring} onChange={e=>setRecurring(e.target.checked)} style={{cursor:'pointer'}}/>
                Wöchentlich wiederholen für
              </label>
              {recurring && <>
                <input type="number" min="1" max="52" value={repeatWeeks} onChange={e=>setRepeatWeeks(e.target.value)}
                  style={{width:55,padding:'4px 8px',border:'1px solid #e4ddd4',borderRadius:6,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                <span style={{fontSize:13,color:'#5a5245'}}>Wochen</span>
              </>}
            </div>
          </div>

          <div style={{fontSize:14,fontWeight:600,color:'#1a1612',marginBottom:12}}>Aktuelle Zeitslots</div>
          {slots.length===0 ? <p style={{color:'#9e8f7e',fontSize:14}}>Noch keine Zeitslots eingetragen.</p>
            : slots.map(s=>(
              <div key={s.id} style={{background:'#fff',borderRadius:10,padding:'13px 20px',marginBottom:8,boxShadow:'0 1px 6px rgba(0,0,0,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <span style={{fontSize:14,fontWeight:500,color:'#1a1612'}}>{s.datum}</span>
                  <span style={{fontSize:13,color:'#9e8f7e'}}>·</span>
                  <span style={{fontSize:14,color:'#5a5245'}}>{s.uhrzeit} Uhr</span>
                  <span style={{fontSize:12,padding:'2px 10px',borderRadius:12,background:s.tische_frei>0?'#edfbf2':'#fdf0ee',color:s.tische_frei>0?'#3a9e5f':'#c0392b'}}>
                    {s.tische_frei} {s.tische_frei===1?'Tisch frei':'Tische frei'}
                  </span>
                </div>
                <button onClick={()=>deleteSlot(s.id)} style={{fontSize:12,color:'#9e8f7e',background:'none',border:'1px solid #e4ddd4',borderRadius:6,padding:'4px 12px',cursor:'pointer',fontFamily:'inherit'}}>Löschen</button>
              </div>
            ))}
        </>}

      </div>
    </div>
  );
}