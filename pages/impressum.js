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
          <a href="/" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9e978c' }}>← Zurück</a>
        </div>

        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 8 }}>Rechtliches</div>
        <h1 style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontSize: 32, color: '#18150f', marginBottom: 32, letterSpacing: '0.04em' }}>Impressum</h1>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Angaben gemäß § 5 TMG</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            <strong>Benjamin Zielbauer</strong><br />
            Waldhornstr. 6<br />
            68804 Altlußheim<br />
            Deutschland
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Kontakt</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            E-Mail: <a href="mailto:team.restaurantiq@gmail.com">team.restaurantiq@gmail.com</a>
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, padding: '28px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)' }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 14 }}>Über RestaurantIQ</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
            RestaurantIQ ist ein KI-gestütztes Reservierungssystem für die Gastronomie. Die Plattform wird betrieben von Benjamin Zielbauer.
          </p>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: '#9e978c', textAlign: 'center' }}>
          <a href="/datenschutz">Datenschutzerklärung</a>
        </div>

      </div>
    </>
  );
}
