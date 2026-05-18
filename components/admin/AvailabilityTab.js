import { useState } from 'react';

const DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];

function parseDatum(datum) {
  if (!datum) return null;
  const p = datum.split('.');
  if (p.length !== 3) return null;
  return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
}

function fmtDate(d) {
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

export default function AvailabilityTab({ slots, onDeleteSlot, onSlotsGenerated }) {
  const DEFAULT_TEMPLATE = { times: ['12:00', '18:00'], cells: {} };
  const [template, setTemplate]       = useState(() => { try { const t=localStorage.getItem('riq_template'); return t?JSON.parse(t):DEFAULT_TEMPLATE; } catch{return DEFAULT_TEMPLATE;} });
  const [weeksAhead, setWeeksAhead]   = useState(4);
  const [generating, setGenerating]   = useState(false);
  const [genResult, setGenResult]     = useState(null);
  const [newTimeInput, setNewTimeInput] = useState('');

  function saveTemplate(t) {
    setTemplate(t);
    try { localStorage.setItem('riq_template', JSON.stringify(t)); } catch {}
  }

  function toggleCell(day, time) {
    const key = `${day}-${time}`;
    const cells = {...template.cells};
    if (cells[key]!==undefined) { delete cells[key]; } else { cells[key] = 4; }
    saveTemplate({...template, cells});
  }

  function setCellCount(day, time, val) {
    const key = `${day}-${time}`;
    saveTemplate({...template, cells:{...template.cells, [key]: parseInt(val)||0}});
  }

  function addTime() {
    if (!newTimeInput || template.times.includes(newTimeInput)) return;
    saveTemplate({...template, times:[...template.times, newTimeInput].sort()});
    setNewTimeInput('');
  }

  function removeTime(time) {
    const cells = {...template.cells};
    DAYS.forEach(d => delete cells[`${d}-${time}`]);
    saveTemplate({times: template.times.filter(t=>t!==time), cells});
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
    await onSlotsGenerated();
    setGenerating(false); setGenResult(count);
  }

  const today0 = new Date(); today0.setHours(0,0,0,0);
  const futureSlots = slots.filter(s => { const d=parseDatum(s.datum); return d&&d>=today0; });
  const pastSlots   = slots.filter(s => { const d=parseDatum(s.datum); return d&&d<today0; });

  return (
    <>
      <div style={{background:'#fff',borderRadius:12,padding:'20px 24px',marginBottom:16,border:'1px solid #e0e0e5'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <div style={{fontSize:14,fontWeight:600,color:'#1d1d1f'}}>Wochenplan</div>
          <button onClick={()=>saveTemplate(DEFAULT_TEMPLATE)} style={{fontSize:11,color:'#6e6e73',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit'}}>Zurücksetzen</button>
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
                  const key = `${day}-${time}`; const count = template.cells[key]; const isOpen = count!==undefined;
                  return (
                    <div key={day} onClick={()=>!isOpen&&toggleCell(day,time)}
                      style={{position:'relative',borderRadius:8,padding:'8px 4px',textAlign:'center',cursor:isOpen?'default':'pointer',background:isOpen?'#edfbf2':'#f5f5f7',border:`1px solid ${isOpen?'#3a9e5f':'#e0e0e5'}`,minHeight:52,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {isOpen ? (
                        <>
                          <button onClick={e=>{e.stopPropagation();toggleCell(day,time);}} style={{position:'absolute',top:2,right:3,background:'none',border:'none',cursor:'pointer',fontSize:10,color:'#6e6e73',padding:'1px 3px',lineHeight:1,fontFamily:'inherit'}}>✕</button>
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
              <button onClick={addTime} disabled={!newTimeInput} style={{padding:'6px 16px',background:'#f5f5f7',border:'1px solid #e0e0e5',borderRadius:8,fontSize:13,cursor:'pointer',color:'#3d3d3f',fontFamily:'inherit',opacity:!newTimeInput?0.5:1}}>
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
            style={{marginLeft:'auto',padding:'9px 28px',background:'#1d1d1f',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',opacity:generating||Object.keys(template.cells).length===0?0.4:1}}>
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
              <button onClick={()=>onDeleteSlot(s.id)} style={{fontSize:11,color:'#6e6e73',background:'none',border:'1px solid #e0e0e5',borderRadius:6,padding:'3px 10px',cursor:'pointer',fontFamily:'inherit'}}>Löschen</button>
            </div>
          ))
        }
      </div>
    </>
  );
}