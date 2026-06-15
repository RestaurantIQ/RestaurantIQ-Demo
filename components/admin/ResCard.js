import { Check, X, Minus } from 'lucide-react';

const STATUS = {
  'neu':       { label: 'Neu',       color: '#92400e', bg: '#fef3c7', dot: '#d97706' },
  'bestätigt': { label: 'Bestätigt', color: '#14532d', bg: '#dcfce7', dot: '#16a34a' },
  'abgesagt':  { label: 'Abgesagt',  color: '#7f1d1d', bg: '#fee2e2', dot: '#dc2626' },
  'no-show':   { label: 'No-Show',   color: '#3f3f46', bg: '#f4f4f5', dot: '#71717a' },
};

export default function ResCard({ r, onUpdateStatus }) {
  const s = STATUS[r.status] || STATUS['neu'];

  const checkinTime = r.checked_in_at
    ? new Date(r.checked_in_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      marginBottom: 7,
      border: '1px solid #e8e3da',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1714', lineHeight: 1.2 }}>{r.name}</div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
            {checkinTime && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#dcfce7', color: '#14532d', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Check size={9} strokeWidth={2.5} /> {checkinTime}
              </span>
            )}
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
              {s.label}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#4a4540', marginBottom: 3 }}>
          {r.datum} · {r.uhrzeit} Uhr · {r.personen} {r.personen === 1 ? 'Person' : 'Personen'}
        </div>

        <div style={{ fontSize: 12, color: '#8c867e' }}>
          {r.telefon}{r.email ? ` · ${r.email}` : ''}
        </div>

        {r.sonderwunsch && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b4c0a', background: '#fef9ee', border: '1px solid #fde68a', padding: '5px 10px', borderRadius: 6 }}>
            {r.sonderwunsch}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #f0ece4', padding: '8px 16px', display: 'flex', gap: 6, background: '#faf9f7' }}>
        {r.status !== 'bestätigt' && (
          <button onClick={() => onUpdateStatus(r.id, 'bestätigt')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 6, border: '1px solid #86efac', background: '#f0fdf4', color: '#14532d', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Check size={11} strokeWidth={2.5} /> Bestätigen
          </button>
        )}
        {r.status !== 'abgesagt' && (
          <button onClick={() => onUpdateStatus(r.id, 'abgesagt')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff1f2', color: '#991b1b', cursor: 'pointer', fontFamily: 'inherit' }}>
            <X size={11} strokeWidth={2.5} /> Absagen
          </button>
        )}
        {r.status !== 'no-show' && (
          <button onClick={() => onUpdateStatus(r.id, 'no-show')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 400, padding: '5px 11px', borderRadius: 6, border: '1px solid #e8e3da', background: '#fff', color: '#71717a', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Minus size={11} strokeWidth={2} /> No-Show
          </button>
        )}
      </div>
    </div>
  );
}
