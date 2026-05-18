import { useState } from 'react';

function fmtDayLong(dateStr) {
  if (!dateStr) return dateStr;
  const p = dateStr.split('.');
  if (p.length !== 3) return dateStr;
  const d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
  const weekdays = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
  const months   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DayModal({ dateStr, slots, reservations, onDeleteSlot, onViewReservations, onClose }) {
  const daySlots = slots.filter(s => s.datum === dateStr);
  const dayRes   = reservations.filter(r => r.datum === dateStr);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAll() {
    setDeleting(true);
    for (const s of daySlots) await onDeleteSlot(s.id);
    setDeleting(false);
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',overflow:'hidden'}}>
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #e0e0e5'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontSize:11,color:'#6e6e73',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4,fontWeight:500}}>Tagesübersicht</div>
              <div style={{fontSize:16,fontWeight:600,color:'#1d1d1f'}}>{fmtDayLong(dateStr)}</div>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#6e6e73',padding:'0 0 0 8px',lineHeight:1}}>✕</button>
          </div>
        </div>

        <div style={{padding:'16px 24px',borderBottom:'1px solid #e0e0e5'}}>
          <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Verfügbarkeit</div>
          {daySlots.length === 0 ? (
            <div style={{fontSize:13,color:'#6e6e73',fontStyle:'italic'}}>Keine Zeitslots — Tag ist gesperrt</div>
          ) : (
            <>
              {daySlots.map(s => (
                <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f7'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:14,fontWeight:500,color:'#1d1d1f',minWidth:52}}>{s.uhrzeit} Uhr</span>
                    <span style={{fontSize:12,padding:'2px 9px',borderRadius:10,background:s.tische_frei>0?'#edfbf2':'#fdf0ee',color:s.tische_frei>0?'#3a9e5f':'#c0392b'}}>
                      {s.tische_frei} {s.tische_frei===1?'Tisch':'Tische'} frei
                    </span>
                  </div>
                  <button onClick={()=>onDeleteSlot(s.id)} style={{fontSize:11,color:'#c0392b',background:'none',border:'1px solid #f0d0cc',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}>Sperren</button>
                </div>
              ))}
              <button onClick={handleDeleteAll} disabled={deleting} style={{marginTop:12,width:'100%',padding:'9px 0',background:'#fdf0ee',border:'1px solid #f0d0cc',borderRadius:8,fontSize:13,color:'#c0392b',cursor:'pointer',fontFamily:'inherit',fontWeight:500,opacity:deleting?0.6:1}}>
                {deleting ? 'Wird gesperrt…' : 'Ganzen Tag sperren'}
              </button>
            </>
          )}
        </div>

        <div style={{padding:'16px 24px'}}>
          <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10}}>Reservierungen</div>
          {dayRes.length === 0 ? (
            <div style={{fontSize:13,color:'#6e6e73',fontStyle:'italic'}}>Keine Reservierungen an diesem Tag</div>
          ) : (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:14,color:'#1d1d1f'}}>
                {dayRes.length} {dayRes.length===1?'Reservierung':'Reservierungen'}
                {' · '}{dayRes.filter(r=>r.status==='neu').length} offen
              </span>
              <button onClick={()=>{ onViewReservations(dateStr); onClose(); }} style={{fontSize:12,color:'#1d1d1f',background:'none',border:'1px solid #e0e0e5',borderRadius:6,padding:'5px 12px',cursor:'pointer',fontFamily:'inherit'}}>Anzeigen</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}