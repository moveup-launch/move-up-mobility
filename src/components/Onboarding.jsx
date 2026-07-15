import { useState } from 'react';
import { useApp } from '../context/AppContext';
import BoxMascot from './BoxMascot';

/**
 * Onboarding affiché au premier lancement (une seule fois).
 * Le même contenu est réutilisable comme "guide" depuis les Réglages
 * en passant la prop `asGuide` (ajoute un bouton fermer, pas de flag persistant).
 */
export default function Onboarding({ onDone, asGuide = false }) {
  const { lang } = useApp();
  const isFr = lang === 'fr';
  const [step, setStep] = useState(0);

  const screens = isFr
    ? [
        {
          mascot: 'happy',
          title: 'Bienvenue sur Move Up',
          body: "Votre assistant de visite pour les déménagements. Estimez un volume en quelques minutes, sur le terrain.",
        },
        {
          emoji: '📋',
          title: 'Créez une visite',
          body: "Renseignez le client et le logement, puis ajoutez les meubles pièce par pièce. Le volume total se calcule tout seul.",
        },
        {
          emoji: '🔍',
          title: 'Trouvez tout, vite',
          body: "Utilisez la recherche pour trouver n'importe quel objet, même par son surnom (télé, transat, karcher…). L'onglet Divers couvre les cas particuliers.",
        },
        {
          emoji: '📤',
          title: 'Partagez avec le client',
          body: "Générez un rapport PDF soigné, envoyez un lien de suivi, ou créez un devis — le tout dans la langue de votre client.",
        },
      ]
    : [
        {
          mascot: 'happy',
          title: 'Welcome to Move Up',
          body: 'Your moving survey assistant. Estimate a volume in minutes, right on site.',
        },
        {
          emoji: '📋',
          title: 'Create a visit',
          body: 'Fill in the client and housing, then add furniture room by room. The total volume is calculated automatically.',
        },
        {
          emoji: '🔍',
          title: 'Find everything, fast',
          body: "Use search to find any item, even by nickname. The 'Misc' tab covers the special cases.",
        },
        {
          emoji: '📤',
          title: 'Share with your client',
          body: 'Generate a polished PDF report, send a tracking link, or create a quote — all in your client\'s language.',
        },
      ];

  const isLast = step === screens.length - 1;
  const cur = screens[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg, #F7F6F2)',
      display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Bouton passer / fermer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <button
          onClick={onDone}
          style={{ background: 'none', border: 'none', color: 'var(--text3, #9B9790)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          {asGuide ? (isFr ? 'Fermer' : 'Close') : (isFr ? 'Passer' : 'Skip')}
        </button>
      </div>

      {/* Contenu de l'écran */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          {cur.mascot
            ? <BoxMascot mood={cur.mascot} size={96} />
            : <div style={{ fontSize: 72 }}>{cur.emoji}</div>}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text, #1A1917)', margin: '0 0 14px' }}>{cur.title}</h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--text2, #6B6862)', margin: 0, maxWidth: 340 }}>{cur.body}</p>
      </div>

      {/* Indicateurs de position (points) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {screens.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? 'var(--accent, #2B6BE6)' : 'var(--border, #E4E2DB)',
              transition: 'width 0.2s',
            }}
          />
        ))}
      </div>

      {/* Boutons navigation */}
      <div style={{ padding: '0 24px 40px', paddingBottom: 'max(40px, env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => (isLast ? onDone() : setStep(s => s + 1))}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: 'var(--accent, #2B6BE6)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {isLast ? (isFr ? 'Commencer' : 'Get started') : (isFr ? 'Suivant' : 'Next')}
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{
              width: '100%', padding: '12px', marginTop: 8, background: 'none', border: 'none',
              color: 'var(--text3, #9B9790)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isFr ? 'Retour' : 'Back'}
          </button>
        )}
      </div>
    </div>
  );
}
