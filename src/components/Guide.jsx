import { useState } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Guide d'utilisation enrichi (consultable depuis les Réglages).
 * Format accordéon : liste de thèmes qu'on déplie. Bilingue FR/EN via le lang de l'app.
 * Distinct de l'Onboarding (écrans d'accueil courts au 1er lancement).
 */

const GUIDE_FR = [
  {
    icon: '📋',
    title: 'Créer une visite',
    steps: [
      "Depuis l'accueil, touchez Nouvelle visite (ou planifiez-la depuis l'agenda).",
      "Renseignez le client : nom, téléphone, email, date, et sa langue (FR/EN) pour les messages qu'il recevra.",
      "Décrivez le logement : type, étage, ascenseur, monte-meubles, stationnement — au départ comme à l'arrivée.",
    ],
    tip: "La langue du client détermine la langue des SMS/emails qu'il recevra, indépendamment de la langue de votre app.",
  },
  {
    icon: '🛋️',
    title: "Faire l'inventaire",
    steps: [
      "Ajoutez les pièces du logement, puis sélectionnez une pièce.",
      "Touchez les objets pour les ajouter ; ajustez les quantités avec + / −.",
      "Utilisez la barre de recherche pour trouver n'importe quel objet — même par surnom (« télé », « transat », « karcher »…).",
      "L'onglet Divers regroupe les objets moins courants.",
    ],
    tip: "Le volume total se calcule automatiquement au fur et à mesure. La recherche cherche dans tout le catalogue, quelle que soit la pièce.",
  },
  {
    icon: '📄',
    title: 'Synthèse & rapport PDF',
    steps: [
      "En fin d'inventaire, touchez Voir la synthèse pour le récapitulatif (volume total, détail par pièce).",
      "Générez le rapport PDF : page de garde soignée aux couleurs de votre entreprise, volume total, trajet, répartition par pièce.",
      "Choisissez la langue du PDF (FR/EN) avant de le générer.",
    ],
    tip: "Le PDF reprend automatiquement votre logo et votre couleur (définis dans les Réglages).",
  },
  {
    icon: '🔗',
    title: 'Lien de suivi client',
    steps: [
      "Après avoir enregistré la visite, un lien de suivi est créé automatiquement.",
      "Touchez Copier le lien ou envoyez-le via SMS/email.",
      "Le client ouvre ce lien et suit l'avancement de son dossier, sans avoir besoin de compte.",
    ],
    tip: "Le lien ne montre au client que les infos essentielles, pas vos données internes.",
  },
  {
    icon: '🧾',
    title: 'Créer un devis',
    steps: [
      "Depuis une visite ou le menu Devis, créez un nouveau devis.",
      "Renseignez les prestations, coûts, services inclus et exclusions.",
      "Choisissez la langue du devis (distincte de la langue de l'app) puis générez le PDF.",
    ],
    tip: "Le montant total et la validité sont mis en avant dans le PDF.",
  },
  {
    icon: '🗓️',
    title: "L'agenda & les messages RDV",
    steps: [
      "Basculez entre vue liste et vue calendrier (pastilles colorées par statut).",
      "Sur une visite à venir, envoyez les messages en deux temps : 1. Proposer la date, puis 2. Confirmer le RDV.",
      "Chaque message part dans la langue du client, avec possibilité de basculer FR/EN à l'envoi.",
    ],
    tip: "Touchez un jour du calendrier pour voir toutes les visites de cette journée.",
  },
  {
    icon: '💡',
    title: 'Astuces & précision',
    steps: [
      "Renseignez le volume réel chargé après un déménagement : l'app calcule votre précision d'estimation moyenne.",
      "Changez votre logo et votre couleur dans les Réglages — ils s'appliquent à tous vos documents.",
      "Après une mise à jour, si un écran semble figé, quittez complètement l'app et rouvrez-la.",
    ],
    tip: null,
  },
];

const GUIDE_EN = [
  {
    icon: '📋',
    title: 'Create a visit',
    steps: [
      "From the home screen, tap New visit (or schedule it from the calendar).",
      "Fill in the client: name, phone, email, date, and their language (FR/EN) for the messages they'll receive.",
      "Describe the housing: type, floor, elevator, furniture lift, parking — both origin and destination.",
    ],
    tip: "The client's language sets the language of the SMS/emails they receive, independently of your app's language.",
  },
  {
    icon: '🛋️',
    title: 'Build the inventory',
    steps: [
      "Add the rooms, then select a room.",
      "Tap items to add them; adjust quantities with + / −.",
      "Use the search bar to find any item — even by nickname.",
      "The Misc tab groups the less common items.",
    ],
    tip: "The total volume is calculated automatically as you go. Search looks through the whole catalog, regardless of the room.",
  },
  {
    icon: '📄',
    title: 'Summary & PDF report',
    steps: [
      "At the end of the inventory, tap View summary for the recap (total volume, breakdown by room).",
      "Generate the PDF report: a polished cover page in your company colors, total volume, route, breakdown by room.",
      "Choose the PDF language (FR/EN) before generating it.",
    ],
    tip: "The PDF automatically uses your logo and color (set in Settings).",
  },
  {
    icon: '🔗',
    title: 'Client tracking link',
    steps: [
      "After saving the visit, a tracking link is created automatically.",
      "Tap Copy link or send it via SMS/email.",
      "The client opens this link and follows their file's progress, with no account needed.",
    ],
    tip: "The link only shows the client essential info, not your internal data.",
  },
  {
    icon: '🧾',
    title: 'Create a quote',
    steps: [
      "From a visit or the Quotes menu, create a new quote.",
      "Fill in the services, costs, included services and exclusions.",
      "Choose the quote language (separate from the app language) then generate the PDF.",
    ],
    tip: "The total amount and validity are highlighted in the PDF.",
  },
  {
    icon: '🗓️',
    title: 'Calendar & appointment messages',
    steps: [
      "Switch between list view and calendar view (colored dots by status).",
      "On an upcoming visit, send messages in two steps: 1. Propose the date, then 2. Confirm the appointment.",
      "Each message goes out in the client's language, with the option to switch FR/EN when sending.",
    ],
    tip: "Tap a day in the calendar to see all the visits for that day.",
  },
  {
    icon: '💡',
    title: 'Tips & accuracy',
    steps: [
      "Enter the real volume loaded after a move: the app computes your average estimate accuracy.",
      "Change your logo and color in Settings — they apply to all your documents.",
      "After an update, if a screen seems stuck, fully quit the app and reopen it.",
    ],
    tip: null,
  },
];

export default function Guide({ onDone }) {
  const { lang } = useApp();
  const isFr = lang === 'fr';
  const topics = isFr ? GUIDE_FR : GUIDE_EN;
  const [open, setOpen] = useState(0); // premier thème ouvert par défaut

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg, #F7F6F2)',
      overflowY: 'auto', fontFamily: 'var(--font)',
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 40px' }}>
        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text, #1A1917)', margin: 0 }}>
            ❓ {isFr ? "Guide d'utilisation" : 'User guide'}
          </h1>
          <button
            onClick={onDone}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text3, #9B9790)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3, #9B9790)', margin: '0 0 20px' }}>
          {isFr
            ? 'Tout ce qu\'il faut savoir pour utiliser Move Up au quotidien.'
            : 'Everything you need to use Move Up day to day.'}
        </p>

        {/* Thèmes en accordéon */}
        {topics.map((topic, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              style={{
                background: 'var(--surface, #fff)',
                border: `1px solid ${isOpen ? 'var(--accent, #2B6BE6)' : 'var(--border, #E4E2DB)'}`,
                borderRadius: 14, marginBottom: 10, overflow: 'hidden',
              }}
            >
              <div
                onClick={() => setOpen(isOpen ? -1 : i)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', cursor: 'pointer' }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: 'var(--accent-light, #EEF3FD)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0,
                }}>
                  {topic.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #1A1917)', flex: 1 }}>{topic.title}</div>
                <span style={{ color: 'var(--text3, #9B9790)', fontSize: 13 }}>{isOpen ? '▲' : '▼'}</span>
              </div>
              {isOpen && (
                <div style={{ padding: '0 16px 16px 66px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--text2, #6B6862)' }}>
                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                    {topic.steps.map((s, si) => (
                      <li key={si} style={{ marginBottom: 7 }}>{s}</li>
                    ))}
                  </ol>
                  {topic.tip && (
                    <div style={{
                      marginTop: 10, padding: '10px 12px', background: 'var(--surface2, #F3F1EB)',
                      borderRadius: 8, fontSize: 12.5, color: 'var(--text2, #6B6862)',
                    }}>
                      💡 {topic.tip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
