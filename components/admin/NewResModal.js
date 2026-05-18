export default function NewResModal({ form, onChange, onSave, onClose, loading, error }) {
  const fields = [
    {key:'name',      label:'Name *',     type:'text',   placeholder:'Max Mustermann'},
    {key:'datum',     label:'Datum *',    type:'text',   placeholder:'31.12.2026'},
    {key:'uhrzeit',   label:'Uhrzeit *',  type:'time',   placeholder:'19:00'},
    {key:'personen',  label:'Personen *', type:'number', placeholder:'2'},
    {key:'telefon',   label:'Telefon *',  type:'text',   placeholder:'+49 123 456789'},
    {key:'email',     label:'E-Mail',     type:'email',  placeholder:'gast@beispiel.de'},
    {key:'sonderwunsch', label:'Hinweis', type:'text',   placeholder:'Fensterplatz, Allergie...'},
  ];

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',overflow:'hidden'}}>
        <div style={{padding:'20px 24px 16px',borderBottom:'1px solid #e0e0e5',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'#6e6e73',letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:500,marginBottom:2}}>Manuell anlegen</div>
            <div style={{fontSize:16,fontWeight:600,color:'#1d1d1f'}}>Neue Reservierung</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#6e6e73'}}>✕</button>
        </div>
        <div style={{padding:'20px 24px',display:'flex',flexDirection:'column',gap:12}}>
          {fields.map(({key,label,type,placeholder}) => (
            <div key={key}>
              <div style={{fontSize:11,fontWeight:500,color:'#6e6e73',letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:5}}>{label}</div>
              <input type={type} placeholder={placeholder} value={form[key]}
                onChange={e => onChange(key, e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:'1px solid #e0e0e5',borderRadius:8,fontSize:14,fontFamily:'inherit',color:'#1d1d1f',outline:'none'}}/>
            </div>
          ))}
          {error && <div style={{fontSize:13,color:'#c0392b',background:'#fdf0ee',padding:'8px 12px',borderRadius:8}}>{error}</div>}
          <button onClick={onSave} disabled={loading} style={{marginTop:4,padding:'12px',background:'#1d1d1f',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.5:1}}>
            {loading ? 'Wird gespeichert…' : 'Reservierung speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}