export default function Datenschutz() {
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
        <h1 style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontSize: 32, color: '#18150f', marginBottom: 8, letterSpacing: '0.04em' }}>Datenschutzerklärung</h1>
        <p style={{ fontSize: 13, color: '#9e978c', marginBottom: 32 }}>Stand: Mai 2026 · Gemäß DSGVO (EU) 2016/679</p>

        {[
          {
            title: '1. Verantwortlicher',
            content: (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:<br /><br />
                <strong>Benjamin Zielbauer</strong><br />
                Waldhornstr. 6<br />
                68804 Altlußheim<br />
                E-Mail: <a href="mailto:team.restaurantiq@gmail.com">team.restaurantiq@gmail.com</a>
              </p>
            )
          },
          {
            title: '2. Welche Daten wir erheben',
            content: (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                <p style={{ marginBottom: 10 }}>Im Rahmen einer Tischreservierung über diesen Chat erheben wir folgende Daten:</p>
                <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
                  <li>Vor- und Nachname</li>
                  <li>Telefonnummer</li>
                  <li>E-Mail-Adresse (freiwillig)</li>
                  <li>Gewünschtes Datum, Uhrzeit und Personenzahl</li>
                  <li>Sonderwünsche (freiwillig, z. B. Allergien, Anlässe)</li>
                </ul>
                <p>Darüber hinaus verarbeitet der KI-Assistent den Gesprächsverlauf, um Anfragen zu beantworten.</p>
              </div>
            )
          },
          {
            title: '3. Zweck und Rechtsgrundlage',
            content: (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                <p style={{ marginBottom: 8 }}>Die Daten werden ausschließlich zur <strong>Bearbeitung und Bestätigung von Tischreservierungen</strong> verwendet.</p>
                <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung bzw. vorvertragliche Maßnahmen).</p>
              </div>
            )
          },
          {
            title: '4. Speicherung und Löschung',
            content: (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                Reservierungsdaten werden in unserer Datenbank gespeichert und nach Ablauf der gesetzlichen Aufbewahrungsfristen gelöscht. Auf Anfrage löschen wir Ihre Daten vorzeitig, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>
            )
          },
          {
            title: '5. Einsatz von KI (Anthropic Claude)',
            content: (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                <p style={{ marginBottom: 8 }}>Dieser Chat-Assistent verwendet die KI-Technologie von <strong>Anthropic, PBC</strong> (San Francisco, USA). Ihre Gesprächsinhalte werden zur Verarbeitung an Anthropic übermittelt. Anthropic ist als Auftragsverarbeiter gemäß Art. 28 DSGVO verpflichtet, Ihre Daten ausschließlich zur Bereitstellung des Dienstes zu verwenden.</p>
                <p>Für die Übermittlung in die USA gelten die Standardvertragsklauseln der EU-Kommission. Weitere Informationen: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">anthropic.com/privacy</a></p>
              </div>
            )
          },
          {
            title: '6. Datenbankdienstleister (Supabase)',
            content: (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                Reservierungsdaten werden bei <strong>Supabase, Inc.</strong> gespeichert. Die Datenbank befindet sich auf Servern in der EU (Frankfurt). Supabase ist als Auftragsverarbeiter gemäß Art. 28 DSGVO vertraglich gebunden.
              </p>
            )
          },
          {
            title: '7. E-Mail-Versand (Google Gmail)',
            content: (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                Für den Versand von Reservierungsbestätigungen per E-Mail nutzen wir den Gmail-Dienst von <strong>Google LLC</strong> (USA). Dabei werden Name, E-Mail-Adresse und Reservierungsdetails an Google übermittelt. Es gelten die Standardvertragsklauseln der EU-Kommission.
              </p>
            )
          },
          {
            title: '8. Ihre Rechte',
            content: (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                <p style={{ marginBottom: 8 }}>Sie haben jederzeit das Recht auf:</p>
                <ul style={{ paddingLeft: 20, marginBottom: 8 }}>
                  <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
                  <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
                  <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
                  <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
                  <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
                </ul>
                <p>Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:team.restaurantiq@gmail.com">team.restaurantiq@gmail.com</a></p>
              </div>
            )
          },
          {
            title: '9. Beschwerderecht',
            content: (
              <p style={{ fontSize: 14, lineHeight: 1.8, color: '#302c24' }}>
                Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren. In Baden-Württemberg ist dies der <strong>Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg</strong> (LfDI BW), <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer">www.baden-wuerttemberg.datenschutz.de</a>.
              </p>
            )
          },
        ].map(({ title, content }) => (
          <div key={title} style={{ background: '#fff', borderRadius: 10, padding: '24px 32px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 12 }}>{title}</h2>
            {content}
          </div>
        ))}

        <div style={{ marginTop: 24, fontSize: 12, color: '#9e978c', textAlign: 'center' }}>
          <a href="/impressum">Impressum</a>
        </div>

      </div>
    </>
  );
}
