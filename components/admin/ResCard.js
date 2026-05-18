export const STATUS_COLOR = { neu: '#d4860a', bestätigt: '#3a9e5f', abgesagt: '#c0392b', 'no-show': '#6e6e73' };
export const STATUS_BG    = { neu: '#fff8ed', bestätigt: '#edfbf2', abgesagt: '#fdf0ee', 'no-show': '#f5f5f7' };

export default function ResCard({ r, onUpdateStatus }) {
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
          {r.status!=='bestätigt' && <button onClick={()=>onUpdateStatus(r.id,'bestätigt')} style={{fontSize:12,padding:'4px 10px',border:'1px solid #3a9e5f',borderRadius:6,background:'#fff',color:'#3a9e5f',cursor:'pointer',fontFamily:'inherit'}}>✓</button>}
          {r.status!=='abgesagt'  && <button onClick={()=>onUpdateStatus(r.id,'abgesagt')}  style={{fontSize:12,padding:'4px 10px',border:'1px solid #c0392b',borderRadius:6,background:'#fff',color:'#c0392b',cursor:'pointer',fontFamily:'inherit'}}>✗</button>}
          {r.status!=='no-show'   && <button onClick={()=>onUpdateStatus(r.id,'no-show')} style={{fontSize:12,padding:'4px 10px',border:'1px solid #e0e0e5',borderRadius:6,background:'#fff',color:'#6e6e73',cursor:'pointer',fontFamily:'inherit'}}>–</button>}
        </div>
      </div>
    </div>
  );
}