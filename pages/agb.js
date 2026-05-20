export default function AGB() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400&family=Outfit:wght@300;400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', sans-serif; font-weight: 300; background: #f7f3ed; color: #18150f; -webkit-font-smoothing: antialiased; }
        a { color: #b09050; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9e978c' }}>← Zurück</a>
        </div>

        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9e978c', marginBottom: 8 }}>Rechtliches</div>
        <h1 style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontSize: 32, color: '#18150f', marginBottom: 8, letterSpacing: '0.04em' }}>Allgemeine Geschäftsbedingungen</h1>
        <p style={{ fontSize: 12, color: '#9e978c', marginBottom: 40 }}>Stand: Mai 2026</p>

        {[
          {
            title: '§ 1 Geltungsbereich',
            content: `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen Benjamin Zielbauer, Waldhornstr. 6, 68804 Altlußheim (nachfolgend „RestaurantIQ") und Unternehmern im Sinne des § 14 BGB (nachfolgend „Kunde") über die Nutzung der SaaS-Plattform RestaurantIQ. Abweichende oder ergänzende Bedingungen des Kunden werden nicht anerkannt, es sei denn, ihre Geltung wird ausdrücklich schriftlich bestätigt.`,
          },
          {
            title: '§ 2 Leistungsbeschreibung',
            content: `RestaurantIQ stellt dem Kunden eine cloudbasierte Software zur Verwaltung von Tischreservierungen sowie einen KI-gestützten Chat-Assistenten für Gäste zur Verfügung. Der Zugriff erfolgt über einen passwortgeschützten Bereich unter restaurantiq.de sowie über eine individuelle Chat-URL. Leistungsumfang und technische Spezifikationen ergeben sich aus der jeweils aktuellen Produktbeschreibung auf der Website.`,
          },
          {
            title: '§ 3 Nutzungsrechte',
            content: `RestaurantIQ räumt dem Kunden ein nicht übertragbares, nicht ausschließliches Recht zur Nutzung der Plattform für die Dauer des Vertragsverhältnisses ein. Eine Weitergabe von Zugangsdaten an Dritte außerhalb des Betriebs des Kunden ist untersagt. Der Quellcode der Software bleibt ausschließliches Eigentum von RestaurantIQ.`,
          },
          {
            title: '§ 4 Pflichten des Kunden',
            content: `Der Kunde ist verpflichtet, seine Zugangsdaten vertraulich zu behandeln und bei Verdacht auf Missbrauch unverzüglich RestaurantIQ zu informieren. Der Kunde trägt dafür Sorge, dass über die Plattform erhobene Gästedaten nur im Rahmen der geltenden Datenschutzgesetze verarbeitet werden. Die Nutzung der Plattform für rechtswidrige Zwecke ist untersagt.`,
          },
          {
            title: '§ 5 Support-Zugriff und Fernwartung',
            content: `Zur Erbringung von Support-Leistungen und zur Fehlerdiagnose ist RestaurantIQ berechtigt, temporär auf den Account des Kunden zuzugreifen. Dies geschieht ausschließlich zu Wartungs- und Supportzwecken. Ein solcher Zugriff wird auf das notwendige Minimum beschränkt und erfolgt nur im Rahmen der Vertragserfüllung. Dieser Zugriff berührt nicht die Eigenverantwortung des Kunden für seine Daten und Einstellungen.`,
          },
          {
            title: '§ 6 Verfügbarkeit',
            content: `RestaurantIQ strebt eine Verfügbarkeit der Plattform von mindestens 99 % im Monatsdurchschnitt an, ausgenommen planmäßige Wartungsarbeiten, die nach Möglichkeit außerhalb der Hauptnutzungszeiten stattfinden. Ein Anspruch auf ununterbrochene Verfügbarkeit besteht nicht. Bei Störungen wird RestaurantIQ unverzüglich tätig, um den normalen Betrieb wiederherzustellen.`,
          },
          {
            title: '§ 7 Preise und Zahlung',
            content: `Die Nutzungsgebühren richten sich nach dem zum Zeitpunkt des Vertragsschlusses gültigen Preisblatt. Alle Preise verstehen sich zuzüglich der gesetzlichen Umsatzsteuer. Rechnungen sind innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug fällig. Bei Zahlungsverzug ist RestaurantIQ berechtigt, den Zugang zur Plattform zu sperren.`,
          },
          {
            title: '§ 8 Laufzeit und Kündigung',
            content: `Der Vertrag läuft auf unbestimmte Zeit und kann von beiden Seiten mit einer Frist von 30 Tagen zum Monatsende in Textform gekündigt werden. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt. Nach Vertragsende werden die Daten des Kunden für 30 Tage gespeichert und danach unwiderruflich gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.`,
          },
          {
            title: '§ 9 Haftung',
            content: `RestaurantIQ haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei schuldhafter Verletzung des Lebens, des Körpers oder der Gesundheit. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vertragstypisch vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen. RestaurantIQ übernimmt keine Haftung für Datenverluste, die durch den Kunden oder durch Umstände außerhalb des Einflussbereichs von RestaurantIQ verursacht werden.`,
          },
          {
            title: '§ 10 Datenschutz',
            content: `Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung von RestaurantIQ, die unter restaurantiq.de/datenschutz abrufbar ist. Soweit RestaurantIQ im Auftrag des Kunden personenbezogene Daten von Gästen verarbeitet, wird ein Auftragsverarbeitungsvertrag (AVV) auf Anfrage zur Verfügung gestellt.`,
          },
          {
            title: '§ 11 Sonstiges',
            content: `Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist Heidelberg, sofern der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Änderungen dieser AGB werden dem Kunden in Textform mitgeteilt und gelten als genehmigt, wenn der Kunde nicht innerhalb von vier Wochen nach Bekanntgabe widerspricht.`,
          },
        ].map((section, i) => (
          <div
            key={i}
            style={{ background: '#fff', borderRadius: 10, padding: '24px 28px', boxShadow: '0 1px 8px rgba(24,21,15,0.06)', marginBottom: 14 }}
          >
            <h2 style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: '#18150f', marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: '#302c24' }}>{section.content}</p>
          </div>
        ))}

        <div style={{ marginTop: 24, fontSize: 12, color: '#9e978c', textAlign: 'center', display: 'flex', gap: 20, justifyContent: 'center' }}>
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
        </div>

      </div>
    </>
  );
}
