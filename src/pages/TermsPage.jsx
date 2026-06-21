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

export default function TermsPage() {
  const [lang, setLang] = useState(
    typeof navigator !== 'undefined' && navigator.language?.startsWith('fr') ? 'fr' : 'en'
  );
  const isFr = lang === 'fr';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '720px', margin: '0 auto', padding: '24px 20px 60px', color: '#1A1917' }}>
      <LegalHeader lang={lang} setLang={setLang} />

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>
        {isFr ? "Conditions Générales d'Utilisation" : 'Terms of Service'}
      </h1>
      <p style={{ fontSize: 13, color: '#9E9C94', marginBottom: 36 }}>
        {isFr ? `Dernière mise à jour : ${UPDATED}` : `Last updated: ${UPDATED_EN}`}
      </p>

      <Section title={isFr ? '1. Objet' : '1. Purpose'}>
        {isFr ? (
          <>
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application Move Up Mobility, éditée par Thomas Hoste, entrepreneur individuel en cours d'immatriculation (SIRET en cours d'attribution), domicilié en France.</p>
            <p style={{ marginTop: 8 }}>Contact : <a href="mailto:contact@moveupapp.com" style={{ color: '#2B6BE6' }}>contact@moveupapp.com</a></p>
            <p style={{ marginTop: 8 }}>Move Up Mobility est un logiciel SaaS destiné aux professionnels du déménagement pour la gestion de visites commerciales, l'estimation de volumes, la génération de rapports et de devis.</p>
          </>
        ) : (
          <>
            <p>These Terms of Service govern the use of the Move Up Mobility application, published by Thomas Hoste, individual entrepreneur in the process of registration (SIRET number pending), based in France.</p>
            <p style={{ marginTop: 8 }}>Contact: <a href="mailto:contact@moveupapp.com" style={{ color: '#2B6BE6' }}>contact@moveupapp.com</a></p>
            <p style={{ marginTop: 8 }}>Move Up Mobility is a SaaS software for moving professionals for managing commercial surveys, estimating volumes, and generating reports and quotes.</p>
          </>
        )}
      </Section>

      <Section title={isFr ? '2. Acceptation des CGU' : '2. Acceptance of Terms'}>
        {isFr
          ? <p>L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.</p>
          : <p>Use of the application implies full acceptance of these Terms. If you do not accept these terms, you must not use the application.</p>}
      </Section>

      <Section title={isFr ? '3. Description du service' : '3. Service Description'}>
        {isFr ? (
          <>
            <p>Move Up Mobility propose :</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Un outil de gestion de visites de déménagement</li>
              <li>Un catalogue d'inventaire avec calcul de volume</li>
              <li>La génération de rapports PDF et devis</li>
              <li>Un agenda de visites</li>
              <li>Le stockage de photos liées aux visites</li>
            </ul>
            <p style={{ marginTop: 8 }}>Le service est proposé en version gratuite (limitée) et en version payante par abonnement (plan « Pro »).</p>
          </>
        ) : (
          <>
            <p>Move Up Mobility offers:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>A moving survey management tool</li>
              <li>An inventory catalog with volume calculation</li>
              <li>PDF report and quote generation</li>
              <li>A visit agenda</li>
              <li>Storage of photos related to visits</li>
            </ul>
            <p style={{ marginTop: 8 }}>The service is offered in a free (limited) version and a paid subscription version ("Pro" plan).</p>
          </>
        )}
      </Section>

      <Section title={isFr ? '4. Création de compte' : '4. Account Creation'}>
        {isFr
          ? <p>L'utilisateur doit fournir des informations exactes lors de son inscription (email, nom, prénom). L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.</p>
          : <p>Users must provide accurate information when registering (email, first name, last name). Users are responsible for maintaining the confidentiality of their login credentials.</p>}
      </Section>

      <Section title={isFr ? '5. Abonnement et paiement' : '5. Subscription and Payment'}>
        {isFr
          ? <p>Le plan gratuit est limité en nombre de visites. Le plan Pro est facturé 9,99 € TTC par mois, sans engagement, résiliable à tout moment. Le paiement est traité par notre prestataire Stripe. Aucune donnée bancaire n'est stockée par Move Up Mobility.</p>
          : <p>The free plan is limited in the number of visits. The Pro plan is billed at 9.99 € incl. VAT per month, without commitment, cancellable at any time. Payments are processed by our provider Stripe. No banking data is stored by Move Up Mobility.</p>}
      </Section>

      <Section title={isFr ? '6. Données et contenus utilisateur' : '6. User Data and Content'}>
        {isFr ? (
          <>
            <p>L'utilisateur reste propriétaire des données qu'il saisit (informations clients, photos, inventaires). Move Up Mobility s'engage à ne pas exploiter ces données à d'autres fins que la fourniture du service.</p>
            <p style={{ marginTop: 8 }}>L'utilisateur est seul responsable de la licéité des données personnelles de tiers (ses clients) qu'il saisit dans l'application, et s'engage à respecter le RGPD vis-à-vis de ses propres clients.</p>
          </>
        ) : (
          <>
            <p>Users retain ownership of the data they enter (client information, photos, inventories). Move Up Mobility undertakes not to use this data for any purpose other than providing the service.</p>
            <p style={{ marginTop: 8 }}>Users are solely responsible for the lawfulness of third-party personal data (their clients) entered into the application, and agree to comply with GDPR with respect to their own clients.</p>
          </>
        )}
      </Section>

      <Section title={isFr ? '7. Disponibilité du service' : '7. Service Availability'}>
        {isFr
          ? <p>Move Up Mobility s'efforce d'assurer une disponibilité maximale du service mais ne garantit pas un fonctionnement ininterrompu. Des interruptions pour maintenance peuvent survenir.</p>
          : <p>Move Up Mobility strives to ensure maximum service availability but does not guarantee uninterrupted operation. Maintenance interruptions may occur.</p>}
      </Section>

      <Section title={isFr ? '8. Responsabilité' : '8. Liability'}>
        {isFr
          ? <p>Move Up Mobility fournit un outil d'aide à l'estimation. Les volumes, recommandations et calculs générés sont indicatifs et ne sauraient engager la responsabilité de l'éditeur en cas d'écart avec la réalité. L'utilisateur reste seul responsable des devis et engagements commerciaux pris avec ses propres clients.</p>
          : <p>Move Up Mobility provides an estimation assistance tool. Volumes, recommendations and calculations generated are indicative and cannot engage the publisher's liability in case of discrepancy with reality. Users remain solely responsible for quotes and commercial commitments made with their own clients.</p>}
      </Section>

      <Section title={isFr ? '9. Résiliation' : '9. Termination'}>
        {isFr
          ? <p>L'utilisateur peut supprimer son compte à tout moment depuis les paramètres. La résiliation de l'abonnement Pro peut être effectuée à tout moment et prend effet à la fin de la période de facturation en cours.</p>
          : <p>Users may delete their account at any time from the settings. Cancellation of the Pro subscription can be made at any time and takes effect at the end of the current billing period.</p>}
      </Section>

      <Section title={isFr ? '10. Modification des CGU' : '10. Amendments'}>
        {isFr
          ? <p>Move Up Mobility se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles.</p>
          : <p>Move Up Mobility reserves the right to modify these Terms at any time. Users will be notified of substantial changes.</p>}
      </Section>

      <Section title={isFr ? '11. Droit applicable' : '11. Governing Law'}>
        {isFr
          ? <p>Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.</p>
          : <p>These Terms are governed by French law. In the event of a dispute, and in the absence of an amicable settlement, French courts shall have sole jurisdiction.</p>}
      </Section>

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #E4E2DB', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <a href="/" style={{ color: '#2B6BE6', fontSize: 13, textDecoration: 'none' }}>
          ← {isFr ? 'Retour à l\'accueil' : 'Back to home'}
        </a>
        <a href="/confidentialite" style={{ color: '#2B6BE6', fontSize: 13, textDecoration: 'none' }}>
          {isFr ? 'Politique de confidentialité' : 'Privacy Policy'} →
        </a>
      </div>
    </div>
  );
}
