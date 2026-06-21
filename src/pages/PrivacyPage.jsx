import { useState } from 'react';

const UPDATED = '21 juin 2026';
const UPDATED_EN = 'June 21, 2026';

function LegalHeader({ lang, setLang }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #E4E2DB',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#1A1917' }}>
        <div style={{ width: 32, height: 32, background: '#1A1917', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
        <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'system-ui, sans-serif' }}>Move Up Mobility</span>
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

export default function PrivacyPage() {
  const [lang, setLang] = useState(
    typeof navigator !== 'undefined' && navigator.language?.startsWith('fr') ? 'fr' : 'en'
  );
  const isFr = lang === 'fr';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '720px', margin: '0 auto', padding: '24px 20px 60px', color: '#1A1917' }}>
      <LegalHeader lang={lang} setLang={setLang} />

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>
        {isFr ? 'Politique de Confidentialité' : 'Privacy Policy'}
      </h1>
      <p style={{ fontSize: 13, color: '#9E9C94', marginBottom: 36 }}>
        {isFr ? `Dernière mise à jour : ${UPDATED}` : `Last updated: ${UPDATED_EN}`}
      </p>

      <Section title={isFr ? '1. Responsable du traitement' : '1. Data Controller'}>
        {isFr ? (
          <>
            <p>Thomas Hoste, entrepreneur individuel en cours d'immatriculation, est responsable du traitement des données collectées via Move Up Mobility.</p>
            <p style={{ marginTop: 8 }}>Contact : <a href="mailto:contact@moveupapp.com" style={{ color: '#2B6BE6' }}>contact@moveupapp.com</a></p>
          </>
        ) : (
          <>
            <p>Thomas Hoste, individual entrepreneur in the process of registration, is the data controller for data collected via Move Up Mobility.</p>
            <p style={{ marginTop: 8 }}>Contact: <a href="mailto:contact@moveupapp.com" style={{ color: '#2B6BE6' }}>contact@moveupapp.com</a></p>
          </>
        )}
      </Section>

      <Section title={isFr ? '2. Données collectées' : '2. Data Collected'}>
        {isFr ? (
          <>
            <p style={{ marginBottom: 8 }}>Nous collectons les données suivantes :</p>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Données de compte utilisateur :</p>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <li>Email, mot de passe (chiffré), prénom, nom, nom d'entreprise, téléphone</li>
            </ul>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Données saisies par l'utilisateur concernant ses propres clients :</p>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <li>Nom, téléphone, email, adresse des clients du déménageur</li>
              <li>Photos prises lors des visites</li>
              <li>Détails d'inventaire et de volume</li>
            </ul>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Données techniques :</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>Adresse IP, type de navigateur (à des fins de sécurité et de fonctionnement)</li>
            </ul>
          </>
        ) : (
          <>
            <p style={{ marginBottom: 8 }}>We collect the following data:</p>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>User account data:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <li>Email, password (encrypted), first name, last name, company name, phone</li>
            </ul>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Data entered by users about their own clients:</p>
            <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
              <li>Name, phone, email, address of the mover's clients</li>
              <li>Photos taken during visits</li>
              <li>Inventory and volume details</li>
            </ul>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Technical data:</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>IP address, browser type (for security and operational purposes)</li>
            </ul>
          </>
        )}
      </Section>

      <Section title={isFr ? '3. Finalités du traitement' : '3. Purposes of Processing'}>
        {isFr ? (
          <>
            <p>Les données sont utilisées pour :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Permettre la création et la gestion de compte</li>
              <li>Fournir les fonctionnalités du service (visites, devis, PDF)</li>
              <li>Traiter les paiements d'abonnement via Stripe</li>
              <li>Envoyer des emails transactionnels (confirmation, factures)</li>
              <li>Améliorer le service</li>
            </ul>
          </>
        ) : (
          <>
            <p>Data is used to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Enable account creation and management</li>
              <li>Provide service features (visits, quotes, PDF)</li>
              <li>Process subscription payments via Stripe</li>
              <li>Send transactional emails (confirmations, invoices)</li>
              <li>Improve the service</li>
            </ul>
          </>
        )}
      </Section>

      <Section title={isFr ? '4. Base légale' : '4. Legal Basis'}>
        {isFr
          ? <p>Le traitement repose sur l'exécution du contrat (CGU acceptées à l'inscription) et, pour certaines communications, sur l'intérêt légitime de l'éditeur.</p>
          : <p>Processing is based on the performance of the contract (Terms accepted at registration) and, for certain communications, on the legitimate interest of the publisher.</p>}
      </Section>

      <Section title={isFr ? '5. Hébergement et sous-traitants' : '5. Hosting and Sub-processors'}>
        {isFr ? (
          <>
            <p>Les données sont hébergées et traitées par :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Supabase</strong> — base de données et authentification (hébergement UE)</li>
              <li><strong>Vercel</strong> — hébergement de l'application</li>
              <li><strong>Stripe</strong> — traitement des paiements</li>
              <li><strong>Resend</strong> — envoi d'emails transactionnels</li>
            </ul>
            <p style={{ marginTop: 8 }}>Ces prestataires sont conformes au RGPD.</p>
          </>
        ) : (
          <>
            <p>Data is hosted and processed by:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Supabase</strong> — database and authentication (EU hosting)</li>
              <li><strong>Vercel</strong> — application hosting</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email sending</li>
            </ul>
            <p style={{ marginTop: 8 }}>These providers comply with GDPR.</p>
          </>
        )}
      </Section>

      <Section title={isFr ? '6. Durée de conservation' : '6. Retention Period'}>
        {isFr
          ? <p>Les données sont conservées pendant toute la durée d'utilisation du compte, et supprimées dans un délai de 30 jours après suppression du compte par l'utilisateur, sauf obligation légale de conservation plus longue.</p>
          : <p>Data is retained for the entire duration of account use, and deleted within 30 days after account deletion by the user, unless there is a longer legal retention obligation.</p>}
      </Section>

      <Section title={isFr ? '7. Droits des utilisateurs' : '7. User Rights'}>
        {isFr ? (
          <>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 10 }}>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous à <a href="mailto:contact@moveupapp.com" style={{ color: '#2B6BE6' }}>contact@moveupapp.com</a>. Vous pouvez également demander la suppression de votre compte directement depuis les paramètres de l'application.</p>
          </>
        ) : (
          <>
            <p>In accordance with GDPR, you have the following rights:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 10 }}>
              <li>Right of access to your data</li>
              <li>Right of rectification</li>
              <li>Right to erasure</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:contact@moveupapp.com" style={{ color: '#2B6BE6' }}>contact@moveupapp.com</a>. You can also request account deletion directly from the application settings.</p>
          </>
        )}
      </Section>

      <Section title={isFr ? '8. Sécurité' : '8. Security'}>
        {isFr
          ? <p>Les données sont protégées par chiffrement et des politiques d'accès strictes (Row Level Security) garantissant que chaque utilisateur n'accède qu'à ses propres données.</p>
          : <p>Data is protected by encryption and strict access policies (Row Level Security) ensuring that each user only accesses their own data.</p>}
      </Section>

      <Section title={isFr ? '9. Cookies' : '9. Cookies'}>
        {isFr
          ? <p>Move Up Mobility utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du service (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé à ce jour.</p>
          : <p>Move Up Mobility uses only technical cookies strictly necessary for the operation of the service (authentication). No advertising or third-party tracking cookies are used at this time.</p>}
      </Section>

      <Section title={isFr ? '10. Mineurs' : '10. Minors'}>
        {isFr
          ? <p>Le service est destiné aux professionnels et n'est pas conçu pour être utilisé par des mineurs.</p>
          : <p>The service is intended for professionals and is not designed to be used by minors.</p>}
      </Section>

      <Section title={isFr ? '11. Réclamation' : '11. Complaints'}>
        {isFr
          ? <p>Vous disposez du droit d'introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#2B6BE6' }}>www.cnil.fr</a>) si vous estimez que vos droits ne sont pas respectés.</p>
          : <p>You have the right to lodge a complaint with the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#2B6BE6' }}>www.cnil.fr</a>) if you believe your rights are not being respected.</p>}
      </Section>

      <Section title={isFr ? '12. Modification de la politique' : '12. Policy Updates'}>
        {isFr
          ? <p>Cette politique peut être mise à jour. La date de dernière mise à jour est indiquée en haut de cette page.</p>
          : <p>This policy may be updated. The date of the last update is shown at the top of this page.</p>}
      </Section>

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E4E2DB', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <a href="/" style={{ color: '#2B6BE6', fontSize: 13, textDecoration: 'none' }}>
          ← {isFr ? "Retour à l'accueil" : 'Back to home'}
        </a>
        <a href="/cgu" style={{ color: '#2B6BE6', fontSize: 13, textDecoration: 'none' }}>
          {isFr ? "Conditions Générales d'Utilisation" : 'Terms of Service'} →
        </a>
      </div>
    </div>
  );
}
