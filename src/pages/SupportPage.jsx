import { useState } from 'react';

function LegalHeader({ lang, setLang }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #E4E2DB',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#1A1917' }}>
        <div style={{ width: 32, height: 32, background: '#1A1917', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
        <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'system-ui, sans-serif' }}>Move Up</span>
      </a>
      <div style={{ display: 'flex', gap: 8 }}>
        {['fr', 'en'].map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            style={{
              padding: '4px 10px', borderRadius: 6,
              border: '1px solid #E4E2DB',
              background: lang === l ? '#1A1917' : 'white',
              color: lang === l ? 'white' : '#6B6860',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1917', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E4E2DB' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: '#3A3835', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

const SUPPORT_EMAIL = 'thomas@eur-relocation.com';

export default function SupportPage() {
  const [lang, setLang] = useState(
    typeof navigator !== 'undefined' && navigator.language?.startsWith('fr') ? 'fr' : 'en'
  );
  const isFr = lang === 'fr';

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '720px', margin: '0 auto',
      padding: '24px 20px 60px', color: '#1A1917',
      height: '100vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      <LegalHeader lang={lang} setLang={setLang} />

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>
        {isFr ? 'Assistance' : 'Support'}
      </h1>
      <p style={{ fontSize: 14, color: '#6B6860', marginBottom: 36 }}>
        {isFr
          ? 'Une question, un bug à signaler, ou besoin d’aide pour utiliser Move Up ? Nous répondons rapidement.'
          : 'Have a question, a bug to report, or need help using Move Up? We reply quickly.'}
      </p>

      <Section title={isFr ? 'Nous contacter' : 'Contact us'}>
        <p style={{ marginBottom: 8 }}>
          {isFr
            ? 'Écrivez-nous directement par email, nous répondons en général sous 24 à 48h ouvrées :'
            : 'Email us directly, we usually reply within 24 to 48 business hours:'}
        </p>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: '#2B6BE6', fontWeight: 600 }}>
            {SUPPORT_EMAIL}
          </a>
        </p>
      </Section>

      <Section title={isFr ? 'Questions fréquentes' : 'Frequently asked questions'}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          {isFr ? 'Comment créer un devis pour un client ?' : 'How do I create a quote for a client?'}
        </p>
        <p style={{ marginBottom: 16 }}>
          {isFr
            ? 'Depuis le tableau de bord, lancez une nouvelle visite ou ouvrez une visite existante, puis générez le devis depuis l’onglet correspondant. Vous pouvez le personnaliser (langue, remise, prestations incluses) avant de l’envoyer.'
            : 'From the dashboard, start a new visit or open an existing one, then generate the quote from the relevant tab. You can customize it (language, discount, included services) before sending it.'}
        </p>

        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          {isFr ? 'Comment gérer ou annuler mon abonnement ?' : 'How do I manage or cancel my subscription?'}
        </p>
        <p style={{ marginBottom: 16 }}>
          {isFr
            ? 'Rendez-vous dans Réglages > Abonnement pour gérer votre formule ou l’annuler à tout moment. En cas de difficulté, contactez-nous à l’adresse ci-dessus.'
            : 'Go to Settings > Subscription to manage your plan or cancel it at any time. If you run into trouble, contact us at the email above.'}
        </p>

        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          {isFr ? 'Comment demander la suppression de mes données ?' : 'How do I request deletion of my data?'}
        </p>
        <p>
          {isFr
            ? <>Contactez-nous à l’adresse ci-dessus, ou consultez notre <a href="/confidentialite" style={{ color: '#2B6BE6' }}>politique de confidentialité</a> pour plus de détails sur vos droits.</>
            : <>Contact us at the email above, or see our <a href="/confidentialite" style={{ color: '#2B6BE6' }}>privacy policy</a> for more details on your rights.</>}
        </p>
      </Section>
    </div>
  );
}
