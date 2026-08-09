// Types de destination prédéfinis pour le dispatch des objets d'inventaire.
// Partagé entre AppContext, l'UI (Step4Inventory, LiveVolumePanel, Step5Summary)
// et pdfGenerator.js (module non-React, ne peut pas importer de composants
// d'icônes) — d'où l'emoji plutôt qu'un composant lucide-react ici.
export const DESTINATION_PRESETS = [
  { key: 'sea',      fr: 'Maritime',  en: 'Sea',      emoji: '🚢' },
  { key: 'air',      fr: 'Aérien',    en: 'Air',      emoji: '✈️' },
  { key: 'storage',  fr: 'Stockage',  en: 'Storage',  emoji: '📦' },
  { key: 'groupage', fr: 'Groupage',  en: 'Groupage', emoji: '🔗' },
  { key: 'road',     fr: 'Terrestre', en: 'Road',     emoji: '🚚' },
];

export function getPresetLabel(key, lang) {
  const p = DESTINATION_PRESETS.find(p => p.key === key);
  if (!p) return key;
  return lang === 'fr' ? p.fr : p.en;
}
