import { useState } from 'react';
import { Check, X, UserX, Phone, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

function parseTimeMinutes(uhrzeit) {
  if (!uhrzeit) return null;
  const [h, m] = uhrzeit.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function isOverdue(r, nowMinutes) {
  if (r.checked_in_at || r.status === 'abgesagt' || r.status === 'no-show') return false;
  const resMinutes = parseTimeMinutes(r.uhrzeit);
  if (resMinutes === null) return false;
  return nowMinutes - resMinutes >= 15;
}

export default function ServiceMode({ reservations, todayStr, tomorrowStr, onCheckIn, onUpdateStatus }) {
  const [showTomorrow, setShowTomorrow] = useState(false);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todayRes = [...reservations]
    .filter(r => r.datum === todayStr)
    .sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit));

  const tomorrowRes = [...reservations]
    .filter(r => r.datum === tomorrowStr)
    .sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit));

  return (
    <div>
      {todayRes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px', color: '#6e6e73', fontSize: 15 }}>
          Keine Reservierungen für heute.
        </div>
      ) : todayRes.map(r => {
        const done = r.checked_in_at || r.status === 'abgesagt' || r.status === 'no-show';
        const overdue = isOverdue(r, nowMinutes);
        const bg = r.checked_in_at ? '#f0faf4' : r.status === 'abgesagt' || r.status === 'no-show' ? '#f5f5f7' : overdue ? '#fdf0ee' : '#fff';
        const border = r.checked_in_at ? '#3a9e5f' : r.status === 'abgesagt' || r.status === 'no-show' ? '#e0e0e5' : overdue ? '#e74c3c' : '#e0e0e5';
        const dimmed = r.status === 'abgesagt' || r.status === 'no-show';

        return (
          <div key={r.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '20px', marginBottom: 12, opacity: dimmed ? 0.6 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div style={{ fontSize: 38, fontWeight: 700, color: overdue && !r.checked_in_at ? '#c0392b' : '#1d1d1f', lineHeight: 1 }}>
                  {r.uhrzeit}
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#6e6e73', lineHeight: 1 }}>
                  {r.personen}P
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {overdue && !r.checked_in_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fdf0ee', border: '1px solid #f5c6c6', borderRadius: 6, padding: '3px 8px' }}>
                    <AlertCircle size={12} color="#c0392b" />
                    <span style={{ fontSize: 11, color: '#c0392b', fontWeight: 600 }}>Überfällig</span>
                  </div>
                )}
                {r.checked_in_at && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#edfbf2', border: '1px solid #b8eacc', borderRadius: 6, padding: '3px 8px' }}>
                    <Check size={12} color="#3a9e5f" />
                    <span style={{ fontSize: 11, color: '#3a9e5f', fontWeight: 600 }}>
                      Angekommen {new Date(r.checked_in_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {r.status === 'no-show' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f5f5f7', border: '1px solid #e0e0e5', borderRadius: 6, padding: '3px 8px' }}>
                    <span style={{ fontSize: 11, color: '#6e6e73', fontWeight: 600 }}>No-Show</span>
                  </div>
                )}
                {r.status === 'abgesagt' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fdf0ee', border: '1px solid #f5c6c6', borderRadius: 6, padding: '3px 8px' }}>
                    <span style={{ fontSize: 11, color: '#c0392b', fontWeight: 600 }}>Abgesagt</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ fontSize: 19, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>{r.name}</div>
            {r.telefon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6e6e73', marginBottom: r.sonderwunsch ? 10 : 0 }}>
                <Phone size={12} /> {r.telefon}
              </div>
            )}

            {r.sonderwunsch && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#92400e', marginTop: r.telefon ? 0 : 4, marginBottom: 4 }}>
                {r.sonderwunsch}
              </div>
            )}

            {!done && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => onCheckIn(r.id)} style={{ flex: 1, padding: '13px 8px', fontSize: 14, fontWeight: 600, background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Check size={16} /> Da
                </button>
                <button onClick={() => onUpdateStatus(r.id, 'no-show')} style={{ flex: 1, padding: '13px 8px', fontSize: 14, fontWeight: 500, background: '#fff', color: '#6e6e73', border: '1px solid #e0e0e5', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <UserX size={16} /> No-Show
                </button>
                <button onClick={() => onUpdateStatus(r.id, 'abgesagt')} style={{ flex: 1, padding: '13px 8px', fontSize: 14, fontWeight: 500, background: '#fff', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <X size={16} /> Abgesagt
                </button>
              </div>
            )}
          </div>
        );
      })}

      {tomorrowRes.length > 0 && (
        <div style={{ borderTop: '1px solid #e0e0e5', paddingTop: 16, marginTop: 8 }}>
          <button onClick={() => setShowTomorrow(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#6e6e73', fontFamily: 'inherit', marginBottom: showTomorrow ? 12 : 0 }}>
            {showTomorrow ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Morgen — {tomorrowRes.length} {tomorrowRes.length === 1 ? 'Reservierung' : 'Reservierungen'}
          </button>
          {showTomorrow && tomorrowRes.map(r => (
            <div key={r.id} style={{ background: '#f5f5f7', borderRadius: 10, padding: '14px 16px', marginBottom: 8, border: '1px solid #e0e0e5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f' }}>{r.uhrzeit}</div>
                <div style={{ fontSize: 14, color: '#6e6e73' }}>{r.personen} Pers.</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{r.name}</div>
              </div>
              {r.sonderwunsch && <div style={{ fontSize: 12, color: '#6e6e73', marginTop: 4 }}>{r.sonderwunsch}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
