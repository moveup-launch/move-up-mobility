// Contenu de la visite fictive du mode démo local (voir DemoAppContext.jsx +
// DemoExplorePage.jsx). Le "panier" de départ ci-dessous référence
// directement le vrai catalogue (data/catalog.js) par catKey/itemId/variantId
// — comme le ferait un ajout manuel dans l'inventaire réel — pour que les
// objets affichés (nom, icône, volume, tags fragile/lourd/démontage) soient
// exactement ceux du vrai catalogue, sans données dupliquées à maintenir.

import { CATALOG } from './catalog';
import { TRANSLATIONS } from './translations';

const ROOMS_SEED = [
  {
    type: 'livingRoom',
    items: [
      { catKey: 'livingRoom', itemId: 'sofa_corner', variantId: 'sofa_corner_std', qty: 1 },
      { catKey: 'livingRoom', itemId: 'armchair', variantId: 'armchair_std', qty: 1 },
      { catKey: 'livingRoom', itemId: 'coffee_table', variantId: 'ct_std', qty: 1 },
      { catKey: 'livingRoom', itemId: 'tv_unit', variantId: 'tvunit_std', qty: 1 },
      { catKey: 'common', itemId: 'tv', variantId: 'tv_medium', qty: 1 },
      { catKey: 'diningRoom', itemId: 'dining_table', variantId: 'dt_rect_6', qty: 1 },
      { catKey: 'diningRoom', itemId: 'dining_chair', variantId: 'dc_std', qty: 4 },
      { catKey: 'livingRoom', itemId: 'buffet', variantId: 'buffet_std', qty: 1 },
      { catKey: 'boxes', itemId: 'box_standard', variantId: 'v', qty: 14 },
      { catKey: 'boxes', itemId: 'box_books', variantId: 'v', qty: 8 },
    ],
  },
  {
    type: 'bedroom',
    items: [
      { catKey: 'bedroom', itemId: 'bed', variantId: 'bed_double', qty: 1 },
      { catKey: 'bedroom', itemId: 'mattress', variantId: 'mat_double', qty: 1 },
      { catKey: 'bedroom', itemId: 'nightstand', variantId: 'nightstand_std', qty: 2 },
      { catKey: 'bedroom', itemId: 'dresser', variantId: 'dresser_std', qty: 1 },
      { catKey: 'bedroom', itemId: 'wardrobe', variantId: 'ward_2door', qty: 1 },
      { catKey: 'bedroom', itemId: 'desk', variantId: 'desk_std', qty: 1 },
      { catKey: 'boxes', itemId: 'box_wardrobe', variantId: 'v', qty: 7 },
      { catKey: 'boxes', itemId: 'box_standard', variantId: 'v', qty: 14 },
      { catKey: 'boxes', itemId: 'box_linen', variantId: 'v', qty: 5 },
    ],
  },
  {
    type: 'kitchen',
    items: [
      { catKey: 'kitchen', itemId: 'fridge', variantId: 'fridge_combo', qty: 1 },
      { catKey: 'kitchen', itemId: 'dishwasher', variantId: 'dw_std', qty: 1 },
      { catKey: 'kitchen', itemId: 'oven', variantId: 'oven_builtin', qty: 1 },
      { catKey: 'kitchen', itemId: 'microwave', variantId: 'mw_std', qty: 1 },
      { catKey: 'kitchen', itemId: 'kitchen_table', variantId: 'ktable_large', qty: 1 },
      { catKey: 'kitchen', itemId: 'chairs', variantId: 'chair_std', qty: 4 },
      { catKey: 'kitchen', itemId: 'kitchen_island', variantId: 'island_small', qty: 1 },
      { catKey: 'boxes', itemId: 'box_dishes', variantId: 'v', qty: 14 },
      { catKey: 'boxes', itemId: 'box_standard', variantId: 'v', qty: 12 },
      { catKey: 'boxes', itemId: 'box_fragile', variantId: 'v', qty: 8 },
    ],
  },
];

// Même forme que ce que produit addItemToRoom() dans context/AppContext.jsx
// (voir DemoAppContext.jsx) : name/variantLabel déjà résolus dans la langue
// donnée, pas d'objet bilingue conservé sur l'item.
function buildDemoItem({ catKey, itemId, variantId, qty }, lang) {
  const itemDef = (CATALOG[catKey] || []).find(i => i.id === itemId);
  const variant = itemDef?.variants.find(v => v.id === variantId);
  if (!itemDef || !variant) return null; // garde-fou : ids vérifiés à la main contre catalog.js
  return {
    itemId: `${itemId}_${variantId}`,
    catalogId: itemId,
    name: itemDef.name[lang] || itemDef.name.fr || itemDef.name.en || '',
    variantLabel: variant.label[lang] || variant.label.fr || variant.label.en || '',
    icon: itemDef.icon,
    qty,
    volume_m3: variant.volume_m3,
    fragile: variant.fragile,
    heavy: variant.heavy,
    requires_protection: variant.requires_protection,
    requires_disassembly: variant.requires_disassembly,
    possible_furniture_lift: variant.possible_furniture_lift,
  };
}

export function buildDemoRooms(lang) {
  return ROOMS_SEED.map((room, idx) => ({
    id: `demo_room_${idx + 1}`,
    type: room.type,
    name: TRANSLATIONS[lang]?.[room.type] || room.type,
    isCustomName: false,
    items: room.items.map(seed => buildDemoItem(seed, lang)).filter(Boolean),
    photos: [],
  }));
}

// État complet, à la forme exacte de `state` dans context/AppContext.jsx
// (voir initialState) : c'est ce qui permet de réutiliser Step4Inventory,
// Step5Summary et generateVisitPDF() sans aucune adaptation.
export function buildDemoState(lang) {
  const isFr = lang === 'fr';
  const rooms = buildDemoRooms(lang);
  return {
    client: {
      name: isFr ? 'Famille Exemple' : 'Example Family',
      phone: '',
      email: '',
      visitDate: '2026-08-28',
      visitTime: '10:00',
      visitStatus: 'prevue',
      agendaNotes: '',
      surveyor: 'Alex Dupont',
      moveDate: '2026-09-15',
      notes: '',
      clientLang: lang,
    },
    housingType: 'apartment',
    housingTypeOrigin: 'apartment',
    housingTypeDestination: 'apartment',
    moveType: 'local',
    moveSegments: [],
    origin: {
      address: '12 rue de la Paix', city: 'Paris', postalCode: '75002', floor: '3',
      noFixedAddress: false,
      elevator: 'yes', elevatorUsable: 'yes', elevatorSize: 'yes',
      parkingAvailable: 'yes', accessDifficult: 'no',
      truckDistance: 'lt10',
      furnitureLiftNeeded: 'no', furnitureLiftFeasible: 'toCheck',
      furnitureLiftLocation: '', furnitureLiftComment: '',
      accessNotes: isFr ? 'Digicode à l’entrée, RAS.' : 'Entry keypad, no issue.',
    },
    destination: {
      address: '5 avenue des Fleurs', city: 'Lyon', postalCode: '69006', floor: '4',
      noFixedAddress: false,
      elevator: 'no', elevatorUsable: 'toCheck', elevatorSize: 'toCheck',
      parkingAvailable: 'toCheck', accessDifficult: 'yes',
      truckDistance: '30_50',
      furnitureLiftNeeded: 'yes', furnitureLiftFeasible: 'toCheck',
      furnitureLiftLocation: isFr ? 'Façade côté rue' : 'Street-facing façade',
      furnitureLiftComment: '',
      accessNotes: isFr ? 'Rue étroite, vérifier l’accès camion.' : 'Narrow street, check truck access.',
    },
    rooms,
    destinations: [],
    currentRoomId: rooms[0]?.id || null,
    boxesDone: {},
    boxesRemaining: {},
    nextRoomId: rooms.length + 1,
    householdPersons: 3,
    transportOverride: null,
    editingVisitId: null,
    justFinishedInventory: false,
    canCelebrateCompletion: false,
    shareToken: null,
  };
}
