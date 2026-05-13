export default function Impressum() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Outfit:wght@300;400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; font-weight: 300; background: #f7f3ed; color: #18150f; -webkit-font-smoothing: antialiased; }
        a { color: #b09050; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '40px 24px 60px' }}>

        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9e978c' }}>← Zurück zum Chat</a>
        </div>

        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 8 }}>Rechtliches</div>
        <h1 style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontSize: 32, color: '#18150f', marginBottom: 32, letterSpacing: '0.04em' }}>Impressum</h1>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Angaben gemäß § 5 TMG</h2>

          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            <strong>La Fontana di Capri</strong><br />
            Betrieben durch: Zielbauer &amp; Winkler GbR<br />
            <br />
            <strong>Gesellschafter:</strong><br />
            [Vorname Nachname Gesellschafter 1]<br />
            [Vorname Nachname Gesellschafter 2]<br />
            <br />
            [Straße und Hausnummer]<br />
            [PLZ] Neulußheim<br />
            Deutschland
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Kontakt</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            Telefon: 06205 37008<br />
            E-Mail: <a href="mailto:team.restaurantiq@gmail.com">team.restaurantiq@gmail.com</a>
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Zuständige Aufsichtsbehörde</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            Ordnungsamt / Gewerbeaufsicht<br />
            Gemeinde Neulußheim<br />
            [Adresse der Gemeinde eintragen]
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Umsatzsteuer-ID</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
            [USt-IdNr. eintragen]
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Technischer Betrieb</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            Das digitale Reservierungssystem wird betrieben durch:<br />
            <strong>RestaurantIQ</strong> – Zielbauer &amp; Winkler GbR<br />
            <a href="mailto:team.restaurantiq@gmail.com">team.restaurantiq@gmail.com</a>
          </p>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: '#9e978c', textAlign: 'center' }}>
          <a href="/datenschutz">Datenschutzerklärung</a>
          <span style={{ margin: '0 8px' }}>·</span>
          <a href="/">Zurück zum Chat</a>
        </div>

      </div>
    </>
  );
}
