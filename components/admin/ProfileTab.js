import { useState, useEffect, useRef } from 'react';
import ChatThemePicker from './ChatThemePicker';


const ACCENT_OPTIONS = [
  { value: 'classic',  label: 'Klassisch' },
  { value: 'modern',   label: 'Modern' },
  { value: 'italian',  label: 'Italienisch' },
  { value: 'french',   label: 'Französisch' },
  { value: 'greek',    label: 'Griechisch' },
];

const BASE_URL = 'https://restaurantiq.de';
const CHAT_URL = 'https://chat.restaurantiq.de';

export default function ProfileTab() {
  const [profile, setProfile] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]         = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const snippetRef            = useRef(null);
  const fileInputRef          = useRef(null);
  const [logoUrl, setLogoUrl]           = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setProfile(d);
        setLogoUrl(d.logo_url || null);
        setForm({
          address:            d.address || '',
          phone:              d.phone || '',
          hours:              d.hours || '',
          menu:               d.menu || '',
          bot_name:           d.bot_name || 'Sofia',
          bot_accent:         d.bot_accent || 'classic',
          description:        d.description || '',
          notification_email: d.notification_email || '',
          chat_theme:         d.chat_theme || 'elegant',
        });
      })
      .catch(() => setError('Profil konnte nicht geladen werden.'));
  }, []);

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    const r = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Fehler beim Speichern. Bitte nochmal versuchen.');
    }
    setSaving(false);
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Nur Bilder erlaubt.'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Logo darf max. 2 MB groß sein.'); return; }
    setLogoUploading(true);
    setError('');
    try {
      const r = await fetch('/api/upload-logo', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const data = await r.json();
      if (r.ok) setLogoUrl(data.url);
      else setError(data.error || 'Upload fehlgeschlagen');
    } catch {
      setError('Upload fehlgeschlagen');
    }
    setLogoUploading(false);
    e.target.value = '';
  }

  function copyLink() {
    const url = CHAT_URL + '/' + (profile?.username || '');
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function copySnippet() {
    const text = snippetRef.current?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const embedSnippet = profile?.username
    ? `<script src="${BASE_URL}/widget.js"\n        data-restaurant-name="${profile.username ? (form.address ? profile.username : (profile.name || '')) : ''}"\n        data-restaurant="${profile.username}"></script>`
    : '';

  const cleanSnippet = profile?.username
    ? `<script src="${BASE_URL}/widget.js" data-restaurant-name="${profile.name || ''}" data-restaurant="${profile.username}"></script>`
    : '';

  const inp = { width: '100%', border: '1px solid #e0e0e5', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', background: '#fff', color: '#1d1d1f', outline: 'none' };
  const label = { fontSize: 12, fontWeight: 500, color: '#6e6e73', marginBottom: 6, display: 'block', letterSpacing: '0.02em', textTransform: 'uppercase' };
  const section = { marginBottom: 28 };

  if (!profile) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#6e6e73', fontSize: 14 }}>Laden...</div>;
  }

  return (
    <div style={{ maxWidth: 640 }}>

      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e0e0e5' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>Restaurant-Profil</h2>
        <p style={{ fontSize: 13, color: '#6e6e73' }}>Diese Informationen verwendet der Chatbot und erscheinen in E-Mails an Gäste.</p>
      </div>

      <div style={section}>
        <label style={label}>Logo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, border: '1px solid #e0e0e5', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {logoUrl
              ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
              : <span style={{ fontSize: 11, color: '#9e9ea0', textAlign: 'center', lineHeight: 1.4 }}>Kein<br/>Logo</span>
            }
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              style={{ background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #e0e0e5', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: logoUploading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: logoUploading ? 0.6 : 1 }}
            >
              {logoUploading ? 'Wird hochgeladen…' : logoUrl ? 'Logo ändern' : 'Logo hochladen'}
            </button>
            <p style={{ fontSize: 11, color: '#9e9ea0', marginTop: 6 }}>PNG, JPG oder WebP · max. 2 MB</p>
          </div>
        </div>
      </div>

      <div style={section}>
        <label style={label}>Kurzbeschreibung</label>
        <input style={inp} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Italienisches Familienrestaurant seit 30 Jahren in Neulußheim" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...section }}>
        <div>
          <label style={label}>Adresse</label>
          <input style={inp} value={form.address} onChange={e => set('address', e.target.value)}
            placeholder="Musterstraße 1, 12345 Stadt" />
        </div>
        <div>
          <label style={label}>Telefon</label>
          <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="06205 37008" />
        </div>
      </div>

      <div style={section}>
        <label style={label}>Öffnungszeiten</label>
        <input style={inp} value={form.hours} onChange={e => set('hours', e.target.value)}
          placeholder="Di–So ab 11:30 Uhr, Montag Ruhetag" />
      </div>

      <div style={section}>
        <label style={label}>Speisekarte</label>
        <textarea style={{ ...inp, height: 180, resize: 'vertical', lineHeight: 1.6 }}
          value={form.menu} onChange={e => set('menu', e.target.value)}
          placeholder="VORSPEISEN: Antipasto 12 € · Carpaccio 14 €&#10;PASTA: Spaghetti Bolognese 11 €&#10;..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...section }}>
        <div>
          <label style={label}>Bot-Name</label>
          <input style={inp} value={form.bot_name} onChange={e => set('bot_name', e.target.value)}
            placeholder="Sofia" />
        </div>
        <div>
          <label style={label}>Küchenstil</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={form.bot_accent} onChange={e => set('bot_accent', e.target.value)}>
            {ACCENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div style={section}>
        <label style={label}>Benachrichtigungs-E-Mail</label>
        <input style={inp} type="email" value={form.notification_email} onChange={e => set('notification_email', e.target.value)}
          placeholder="restaurant@beispiel.de" />
        <p style={{ fontSize: 11, color: '#9e9ea0', marginTop: 6 }}>Neue Reservierungsanfragen werden an diese Adresse gesendet.</p>
      </div>

      <div style={{ borderTop: '1px solid #e0e0e5', paddingTop: 28, marginBottom: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Chat-Design</h3>
        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 16 }}>So sieht der Chatbot für Ihre Gäste aus. Wählen Sie einen Stil.</p>
        <ChatThemePicker
          selectedTheme={form.chat_theme}
          onSelect={val => set('chat_theme', val)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
        <button onClick={save} disabled={saving} style={{ background: '#1d1d1f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 500, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
        {saved && <span style={{ fontSize: 13, color: '#3a9e5f', fontWeight: 500 }}>Gespeichert</span>}
        {error && <span style={{ fontSize: 13, color: '#c0392b' }}>{error}</span>}
      </div>

      <div style={{ borderTop: '1px solid #e0e0e5', paddingTop: 28, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Ihr Chatbot-Link</h3>
        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 12 }}>Diesen Link können Ihre Gäste direkt aufrufen oder Sie ihn auf Ihrer Website verlinken.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f5f7', borderRadius: 8, padding: '10px 14px', border: '1px solid #e0e0e5' }}>
          <span style={{ fontSize: 13, color: '#1d1d1f', flex: 1, fontFamily: 'monospace' }}>{CHAT_URL}/{profile?.username || ''}</span>
          <button onClick={copyLink} style={{ background: copiedLink ? '#3a9e5f' : '#1d1d1f', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.2s' }}>
            {copiedLink ? 'Kopiert' : 'Kopieren'}
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e0e0e5', paddingTop: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Widget einbinden</h3>
        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 16 }}>Diesen Code einmal in den HTML-Code Ihrer Website einfügen, kurz vor dem schließenden &lt;/body&gt;-Tag.</p>
        <div style={{ background: '#1d1d1f', borderRadius: 10, padding: '16px 20px', position: 'relative' }}>
          <pre ref={snippetRef} style={{ fontFamily: 'monospace', fontSize: 12, color: '#a8d8a8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.7 }}>
{`<script\n  src="${BASE_URL}/widget.js"\n  data-restaurant-name="${profile.name || ''}"\n  data-restaurant="${profile.username || ''}"\n></script>`}
          </pre>
          <button onClick={copySnippet} style={{ position: 'absolute', top: 12, right: 12, background: copied ? '#3a9e5f' : 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
            {copied ? 'Kopiert' : 'Kopieren'}
          </button>
        </div>
      </div>
    </div>
  );
}
