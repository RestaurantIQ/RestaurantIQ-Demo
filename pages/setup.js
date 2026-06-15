import { useState } from 'react';

export default function Setup() {
  const [form, setForm] = useState({ secret: '', name: '', username: '', password: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/auth/create-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      setResult({ ok: r.ok, data });
    } catch (err) {
      setResult({ ok: false, data: { error: err.message } });
    }
    setLoading(false);
  }

  const f = { fontFamily: "'Inter',-apple-system,sans-serif" };

  return (
    <div style={{ ...f, minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus{outline:none;border-color:#1d1d1f!important}`}</style>
      <div style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 400, border: '1px solid #e0e0e5', boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: 4 }}>Restaurant anlegen</div>
          <div style={{ fontSize: 13, color: '#6e6e73', fontWeight: 300 }}>Einmalige Einrichtung · RestaurantIQ</div>
        </div>

        {result?.ok ? (
          <div style={{ background: '#edfbf2', border: '1px solid #3a9e5f', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#3a9e5f', marginBottom: 8 }}>Restaurant angelegt</div>
            <div style={{ fontSize: 13, color: '#1d1d1f', marginBottom: 4 }}>Name: <strong>{result.data.name}</strong></div>
            <div style={{ fontSize: 13, color: '#1d1d1f', marginBottom: 16 }}>Benutzername: <strong>{result.data.username}</strong></div>
            <a href="/admin" style={{ display: 'block', textAlign: 'center', padding: '11px', background: '#1d1d1f', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Zum Admin-Bereich
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'secret',   label: 'Setup-Passwort (SETUP_SECRET)', type: 'password', placeholder: 'Dein SETUP_SECRET aus Vercel' },
              { key: 'name',     label: 'Restaurantname',                 type: 'text',     placeholder: 'Zum Goldenen Löwen' },
              { key: 'username', label: 'Benutzername',                   type: 'text',     placeholder: 'goldener-loewe' },
              { key: 'password', label: 'Passwort',                       type: 'password', placeholder: 'Sicheres Passwort wählen' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#6e6e73', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <input
                  type={type}
                  placeholder={placeholder}
                  required
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #e0e0e5', borderRadius: 8, fontSize: 14, fontWeight: 300, fontFamily: 'inherit', color: '#1d1d1f', transition: 'border-color 0.15s' }}
                />
              </div>
            ))}

            {result && !result.ok && (
              <div style={{ fontSize: 13, color: '#c0392b', padding: '8px 12px', background: '#fdf0ee', borderRadius: 8 }}>
                {result.data?.error || 'Ein Fehler ist aufgetreten.'}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', marginTop: 4,
              background: '#1d1d1f', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 500,
              cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
              opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s',
            }}>
              {loading ? 'Wird angelegt…' : 'Restaurant anlegen'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
