// Visite d'exemple statique — utilisée uniquement par DemoVisitPage.
// Données en dur, structurées comme une vraie visite (rooms_data / items),
// mais SANS aucun appel Supabase ni dépendance à AppContext.

const room = (id, type, name, items) => ({ id, type, name, items });

const item = (itemId, catalogId, name, icon, volume_m3, qty, flags = {}) => ({
  itemId, catalogId, name, icon, volume_m3, qty,
  fragile: !!flags.fragile,
  heavy: !!flags.heavy,
  requires_disassembly: !!flags.disassembly,
});

export const DEMO_VISIT = {
  client_name: { fr: 'Famille Exemple', en: 'Example Family' },
  visit_date: '2026-08-15',
  housing_type: 'T3',
  origin_data: { address: '12 rue de la Paix', city: 'Paris' },
  destination_data: { address: '5 avenue des Fleurs', city: 'Lyon' },
  recommended_truck: { fr: 'Camion 20 m³ + 3 déménageurs', en: '20 m³ truck + 3 movers' },
  rooms_data: [
    room('room_demo_1', 'livingRoom', { fr: 'Salon', en: 'Living room' }, [
      item('sofa_corner_std', 'sofa_corner', { fr: "Canapé d'angle", en: 'Corner sofa' }, '🛋️', 3.0, 1, { heavy: true, disassembly: true }),
      item('armchair_std', 'armchair', { fr: 'Fauteuil', en: 'Armchair' }, '💺', 0.5, 1),
      item('ct_std', 'coffee_table', { fr: 'Table basse', en: 'Coffee table' }, '🪑', 0.35, 1, { fragile: true }),
      item('tvunit_std', 'tv_unit', { fr: 'Meuble TV', en: 'TV unit' }, '📺', 0.6, 1, { heavy: true }),
      item('tv_medium', 'tv', { fr: 'TV 50"', en: '50" TV' }, '📺', 0.3, 1, { fragile: true }),
      item('dt_rect_6', 'dining_table', { fr: 'Table à manger', en: 'Dining table' }, '🍽️', 1.0, 1, { fragile: true, disassembly: true }),
      item('dc_std', 'dining_chair', { fr: 'Chaises', en: 'Chairs' }, '🪑', 0.15, 4),
      item('buffet_std', 'buffet', { fr: 'Buffet', en: 'Buffet' }, '🗄️', 0.9, 1, { heavy: true }),
      item('box_standard', 'box_standard', { fr: 'Carton standard', en: 'Standard box' }, '📦', 0.07, 18),
      item('box_books', 'box_books', { fr: 'Carton livres', en: 'Books box' }, '📚', 0.04, 8),
    ]),
    room('room_demo_2', 'bedroom', { fr: 'Chambre', en: 'Bedroom' }, [
      item('bed_double', 'bed', { fr: 'Lit double (140cm)', en: 'Double bed' }, '🛏️', 1.0, 1, { disassembly: true }),
      item('mat_double', 'mattress', { fr: 'Matelas 2 places', en: 'Double mattress' }, '🟦', 0.5, 1, { heavy: true }),
      item('nightstand_std', 'nightstand', { fr: 'Table de nuit', en: 'Nightstand' }, '🪑', 0.15, 2),
      item('dresser_std', 'dresser', { fr: 'Commode', en: 'Dresser' }, '🗄️', 0.6, 1, { heavy: true }),
      item('ward_2door', 'wardrobe', { fr: 'Armoire 2 portes', en: '2-door wardrobe' }, '🚪', 1.2, 1, { heavy: true, disassembly: true }),
      item('desk_std', 'desk', { fr: 'Bureau', en: 'Desk' }, '🖥️', 0.5, 1),
      item('box_wardrobe', 'box_wardrobe', { fr: 'Carton penderie', en: 'Wardrobe box' }, '👔', 0.40, 7),
      item('box_standard', 'box_standard', { fr: 'Carton standard', en: 'Standard box' }, '📦', 0.07, 18),
      item('box_linen', 'box_linen', { fr: 'Carton linge', en: 'Linen box' }, '🧺', 0.10, 5),
    ]),
    room('room_demo_3', 'kitchen', { fr: 'Cuisine', en: 'Kitchen' }, [
      item('fridge_combo', 'fridge', { fr: 'Réfrigérateur combiné', en: 'Fridge-freezer combo' }, '🧊', 0.7, 1, { heavy: true }),
      item('dw_std', 'dishwasher', { fr: 'Lave-vaisselle', en: 'Dishwasher' }, '🍽️', 0.5, 1, { heavy: true }),
      item('oven_builtin', 'oven', { fr: 'Four encastrable', en: 'Built-in oven' }, '🔥', 0.3, 1, { heavy: true }),
      item('mw_std', 'microwave', { fr: 'Micro-ondes', en: 'Microwave' }, '📦', 0.1, 1, { fragile: true }),
      item('ktable_large', 'kitchen_table', { fr: 'Table de cuisine', en: 'Kitchen table' }, '🪑', 1.0, 1, { fragile: true, disassembly: true }),
      item('chair_std', 'chairs', { fr: 'Chaises', en: 'Chairs' }, '🪑', 0.15, 4),
      item('island_small', 'kitchen_island', { fr: 'Îlot de cuisine', en: 'Kitchen island' }, '🍳', 0.4, 1, { heavy: true, disassembly: true }),
      item('box_dishes', 'box_dishes', { fr: 'Carton vaisselle', en: 'Dishes box' }, '🍽️', 0.07, 16),
      item('box_standard', 'box_standard', { fr: 'Carton standard', en: 'Standard box' }, '📦', 0.07, 16),
      item('box_fragile', 'box_fragile', { fr: 'Carton fragile', en: 'Fragile box' }, '⚠️', 0.08, 8),
    ]),
  ],
};

export const getDemoRoomVolume = (r) =>
  r.items.reduce((sum, it) => sum + it.volume_m3 * it.qty, 0);

export const getDemoTotalVolume = () =>
  DEMO_VISIT.rooms_data.reduce((sum, r) => sum + getDemoRoomVolume(r), 0);

const collectFlagged = (flagKey) => {
  const out = [];
  DEMO_VISIT.rooms_data.forEach(r => {
    r.items.filter(it => it[flagKey]).forEach(it => out.push({ ...it, roomName: r.name }));
  });
  return out;
};

export const getDemoFragileItems = () => collectFlagged('fragile');
export const getDemoHeavyItems = () => collectFlagged('heavy');
export const getDemoDisassemblyItems = () => collectFlagged('requires_disassembly');
