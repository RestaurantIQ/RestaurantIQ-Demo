import { useState, useMemo } from 'react';

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

const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const DAYS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];

export default function Calendar({ reservations, slots, onSelectDay }) {
  const [year, setYear]   = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

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
        {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:11,color:'#6e6e73',fontWeight:500,padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {cells.map((d,i) => {
          if (!d) return <div key={i}/>;
          const label   = dayLabel(d);
          const info    = countMap[label];
          const hasSlot = slotMap[label] > 0;
          const isToday = label === td;
          const total   = (info?.neu || 0) + (info?.bestätigt || 0);
          const hasNew  = info?.neu > 0;

          let bg = 'transparent', border = '1px solid transparent', dayColor = '#c7c7cc', badge = null;

          if (isToday && !info) { bg = '#f5f5f7'; border = '1px solid #e0e0e5'; dayColor = '#1d1d1f'; }
          if (info) {
            if (hasNew) { bg='#fff8ed'; border='1px solid #f0d080'; dayColor='#1d1d1f'; badge={color:'#d4860a',bg:'#fef3d0',label:total}; }
            else        { bg='#edfbf2'; border='1px solid #a8e6c0'; dayColor='#1d1d1f'; badge={color:'#3a9e5f',bg:'#c8f0d8',label:total}; }
            if (isToday) border=`2px solid ${hasNew?'#d4860a':'#3a9e5f'}`;
          }

          return (
            <div key={i} onClick={() => onSelectDay(label)}
              style={{borderRadius:8,textAlign:'center',cursor:'pointer',background:bg,border,transition:'opacity 0.12s',minHeight:52,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'6px 2px'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='0.8'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}
            >
              <div style={{fontSize:13,color:dayColor,fontWeight:info||isToday?600:400,lineHeight:1}}>{d}</div>
              {badge && <div style={{fontSize:11,fontWeight:700,color:badge.color,background:badge.bg,borderRadius:999,padding:'1px 7px',lineHeight:1.6,minWidth:20}}>{badge.label}</div>}
              {hasSlot && !info && <div style={{width:4,height:4,borderRadius:'50%',background:'#d0d0d5'}}/>}
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