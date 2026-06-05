import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { CATALOG } from '../data/catalog';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

const emptyAccess = {
  address: '', city: '', postalCode: '', floor: '',
  noFixedAddress: false,
  elevator: 'no',
  elevatorUsable: 'toCheck',
  elevatorSize: 'toCheck',
  parkingAvailable: 'toCheck',
  accessDifficult: 'toCheck',
  truckDistance: '',
  furnitureLiftNeeded: 'toCheck',
  furnitureLiftFeasible: 'toCheck',
  furnitureLiftLocation: '',
  furnitureLiftComment: '',
  accessNotes: '',
};

const baseClient = {
  name: '', phone: '', email: '',
  visitDate: new Date().toISOString().split('T')[0],
  surveyor: '', moveDate: '', notes: '',
};

const initialState = {
  client: { ...baseClient },
  housingType: '',
  moveType: 'local',
  moveSegments: [],
  origin: { ...emptyAccess },
  destination: { ...emptyAccess },
  rooms: [],
  currentRoomId: null,
  boxesDone: {},
  boxesRemaining: {},
  nextRoomId: 1,
  householdPersons: 0,
  transportOverride: null,
  editingVisitId: null,
};

export function AppProvider({ children }) {
  const [lang, setLangState] = useState('fr');
  const [currentStep, setCurrentStepState] = useState(0);
  const [state, setState] = useState(initialState);
  const [sheet, setSheet] = useState({ isOpen: false, content: null });
  const [modal, setModal] = useState({ isOpen: false, content: null });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState('dashboard');
  const mainScrollRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, [currentStep, viewMode]);

  const setLang = (l) => setLangState(l);
  const t = (key) => TRANSLATIONS[lang]?.[key] || key;
  const tCat = (obj) => {
    if (!obj) return '';
    return obj[lang] || obj.fr || obj.en || '';
  };

  const goToStep = (i) => {
    if (i >= 0 && i <= 4) setCurrentStepState(i);
  };
  const nextStep = () => setCurrentStepState(s => Math.min(4, s + 1));
  const prevStep = () => setCurrentStepState(s => Math.max(0, s - 1));

  const signOut = async () => {
    await supabase.auth.signOut();
    setViewMode('dashboard');
  };

  const startNewVisit = () => {
    setState({
      ...initialState,
      client: { ...baseClient, surveyor: user?.email || '' },
    });
    setCurrentStepState(0);
    setViewMode('wizard');
  };

  const updateClient = (field, value) =>
    setState(s => ({ ...s, client: { ...s.client, [field]: value } }));

  const updateOrigin = (field, value) =>
    setState(s => ({ ...s, origin: { ...s.origin, [field]: value } }));

  const updateDestination = (field, value) =>
    setState(s => ({ ...s, destination: { ...s.destination, [field]: value } }));

  const setHousingType = (val) => setState(s => ({ ...s, housingType: val }));
  const setMoveType = (val) => setState(s => ({ ...s, moveType: val }));
  const setHouseholdPersons = (val) => setState(s => ({ ...s, householdPersons: Math.max(0, val) }));
  const setTransportOverride = (val) => setState(s => ({ ...s, transportOverride: val }));

  // Move segments (multi-line transport breakdown)
  const addMoveSegment = () => {
    setState(s => ({
      ...s,
      moveSegments: [...(s.moveSegments || []), {
        id: `seg_${Date.now()}`,
        type: 'local',
        volume: 0,
        comment: '',
      }],
    }));
  };

  const updateMoveSegment = (id, field, value) => {
    setState(s => ({
      ...s,
      moveSegments: (s.moveSegments || []).map(seg =>
        seg.id === id ? { ...seg, [field]: value } : seg
      ),
    }));
  };

  const removeMoveSegment = (id) => {
    setState(s => ({
      ...s,
      moveSegments: (s.moveSegments || []).filter(seg => seg.id !== id),
    }));
  };

  const getSegmentSolution = (type, volume) => {
    const v = parseFloat(volume) || 0;
    const isFr = lang === 'fr';
    if (type === 'sea') {
      if (v < 5) return isFr ? 'Maritime LCL - petit volume' : 'Sea LCL - small volume';
      if (v < 30) return isFr ? 'Maritime LCL - groupage' : 'Sea LCL - groupage';
      if (v < 60) return isFr ? 'Conteneur 20 pieds' : '20ft container';
      return isFr ? 'Conteneur 40 pieds' : '40ft container';
    }
    if (type === 'air') {
      if (v < 1) return isFr ? 'Colis express' : 'Express parcel';
      if (v < 5) return isFr ? 'Palette aerienne' : 'Air pallet';
      return isFr ? 'Groupage aerien' : 'Air groupage';
    }
    if (type === 'storage') return isFr ? 'Garde-meuble / box' : 'Storage / warehouse';
    if (type === 'road') return isFr ? 'Route internationale' : 'International road';
    return isFr ? 'Route / National' : 'Road / National';
  };

  const addRoom = (type) => {
    setState(s => {
      const count = s.rooms.filter(r => r.type === type).length + 1;
      const baseName = TRANSLATIONS[lang]?.[type] || type;
      const name = count > 1 ? `${baseName} ${count}` : baseName;
      const id = `room_${s.nextRoomId}`;
      return {
        ...s,
        rooms: [...s.rooms, { id, type, name, items: [] }],
        currentRoomId: id,
        nextRoomId: s.nextRoomId + 1,
      };
    });
  };

  const deleteRoom = (id) => {
    setState(s => {
      const rooms = s.rooms.filter(r => r.id !== id);
      const currentRoomId = s.currentRoomId === id
        ? (rooms.length ? rooms[0].id : null)
        : s.currentRoomId;
      return { ...s, rooms, currentRoomId };
    });
  };

  const renameRoom = (id, name) =>
    setState(s => ({ ...s, rooms: s.rooms.map(r => r.id === id ? { ...r, name } : r) }));

  const selectRoom = (id) => setState(s => ({ ...s, currentRoomId: id }));

  const setRoomTab = (showBoxes) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id === s.currentRoomId ? { ...r, _showBoxes: showBoxes } : r),
    }));

  const addItemToRoom = (roomId, catKey, itemId, variantId) => {
    const cat = CATALOG[catKey];
    if (!cat) return;
    const itemDef = cat.find(i => i.id === itemId);
    const variant = itemDef?.variants.find(v => v.id === variantId);
    if (!variant) return;
    const uid = `${itemId}_${variantId}`;
    const currentLang = lang;
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        const existing = r.items.find(i => i.itemId === uid);
        if (existing) {
          return { ...r, items: r.items.map(i => i.itemId === uid ? { ...i, qty: i.qty + 1 } : i) };
        }
        const name = itemDef.name[currentLang] || itemDef.name.fr || itemDef.name.en || '';
        const variantLabel = variant.label[currentLang] || variant.label.fr || variant.label.en || '';
        return {
          ...r,
          items: [...r.items, {
            itemId: uid,
            catalogId: itemId,
            name,
            variantLabel,
            icon: itemDef.icon,
            qty: 1,
            volume_m3: variant.volume_m3,
            fragile: variant.fragile,
            heavy: variant.heavy,
            requires_protection: variant.requires_protection,
            requires_disassembly: variant.requires_disassembly,
            possible_furniture_lift: variant.possible_furniture_lift,
          }],
        };
      }),
    }));
  };

  const addCustomItemToRoom = (roomId, name, volume_m3, qty) => {
    const uid = `custom_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          items: [...r.items, {
            itemId: uid,
            catalogId: 'custom',
            name,
            variantLabel: lang === 'fr' ? 'Objet divers' : 'Misc item',
            icon: '📦',
            qty,
            volume_m3,
            fragile: false,
            heavy: false,
            requires_protection: false,
            requires_disassembly: false,
            possible_furniture_lift: false,
            isCustom: true,
          }],
        };
      }),
    }));
  };

  const changeQty = (roomId, itemId, delta) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        const items = r.items
          .map(i => i.itemId === itemId ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
          .filter(i => i.qty > 0);
        return { ...r, items };
      }),
    }));

  const updateItemVolume = (roomId, itemId, vol) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          items: r.items.map(i =>
            i.itemId === itemId ? { ...i, volume_m3: Math.max(0.001, parseFloat(vol) || 0.001) } : i
          ),
        };
      }),
    }));

  const toggleItemCrate = (roomId, itemId) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          items: r.items.map(i =>
            i.itemId === itemId ? { ...i, needsCrate: !i.needsCrate } : i
          ),
        };
      }),
    }));

  const changeBox = (source, id, delta) =>
    setState(s => ({
      ...s,
      [source]: { ...s[source], [id]: Math.max(0, (s[source][id] || 0) + delta) },
    }));

  const setBox = (source, id, value) =>
    setState(s => ({
      ...s,
      [source]: { ...s[source], [id]: Math.max(0, parseInt(value) || 0) },
    }));

  const applyBoxSuggestions = (suggestions) => {
    setState(s => {
      const newRemaining = { ...s.boxesRemaining };
      Object.entries(suggestions).forEach(([id, qty]) => {
        newRemaining[id] = Math.max(newRemaining[id] || 0, qty);
      });
      return { ...s, boxesRemaining: newRemaining };
    });
  };

  const getRoomVolume = (room) =>
    (room.items || []).reduce((sum, item) => sum + (item.volume_m3 || 0) * (item.qty || 1), 0);

  const getTotalVolume = () => {
    let vol = state.rooms.reduce((sum, r) => sum + getRoomVolume(r), 0);
    [...Object.entries(state.boxesDone), ...Object.entries(state.boxesRemaining)].forEach(([k, v]) => {
      const bt = CATALOG.boxTypes.find(b => b.id === k);
      if (bt) vol += bt.volume_m3 * (v || 0);
    });
    return vol;
  };

  const getRecommendedTruck = (vol) => {
    const mt = state.moveType || 'local';
    return getSegmentSolution(mt, vol);
  };

  const getRecommendedTeam = (vol) => {
    const isFr = lang === 'fr';
    let base = Math.max(2, Math.floor(vol / 10));
    const reasons = [];

    // +1 per 2 floors without elevator or lift
    ['origin', 'destination'].forEach(prefix => {
      const d = state[prefix];
      const floorNum = parseInt(d.floor) || 0;
      const hasElevator = d.elevator === 'yes' && d.elevatorUsable !== 'no';
      const hasLift = d.furnitureLiftNeeded === 'yes' && d.furnitureLiftFeasible === 'yes';
      if (floorNum >= 2 && !hasElevator && !hasLift) {
        const add = Math.floor(floorNum / 2);
        if (add > 0) {
          base += add;
          const loc = prefix === 'origin'
            ? (isFr ? 'départ' : 'origin') : (isFr ? 'arrivée' : 'dest.');
          reasons.push(`+${add} ${isFr ? 'étage(s) sans asc.' : 'floor(s) no elev.'} (${loc})`);
        }
      }
    });

    // +1 if portage > 30m
    if (['origin', 'destination'].some(p => ['30_50', 'gt50'].includes(state[p].truckDistance))) {
      base += 1;
      reasons.push(isFr ? '+1 portage > 30m' : '+1 carry > 30m');
    }

    // +1 for exceptional heavy items
    const allItems = state.rooms.flatMap(r => r.items || []).filter(i => i.qty > 0);
    const hasExceptional = allItems.some(i =>
      ['piano_upright', 'piano_grand', 'safe', 'pool_table'].includes(i.catalogId)
    );
    if (hasExceptional) {
      base += 1;
      reasons.push(isFr ? '+1 objet exceptionnel lourd' : '+1 exceptional heavy item');
    }

    // +1 if difficult access
    if (['origin', 'destination'].some(p => state[p].accessDifficult === 'yes')) {
      base += 1;
      reasons.push(isFr ? '+1 accès difficile' : '+1 difficult access');
    }

    // -1 if furniture lift available
    const hasLiftAvailable = ['origin', 'destination'].some(p =>
      state[p].furnitureLiftNeeded === 'yes' && state[p].furnitureLiftFeasible === 'yes'
    );
    if (hasLiftAvailable) {
      base = Math.max(2, base - 1);
      reasons.push(isFr ? '-1 monte-meubles prévu' : '-1 furniture lift planned');
    }

    base = Math.max(2, base);
    const label = `${base} ${isFr ? 'déménageurs' : 'movers'}`;
    return { count: base, label, reasons };
  };

  const getEquipment = () => {
    const equip = [];
    const allItems = state.rooms.flatMap(r => r.items || []).filter(i => i.qty > 0);
    const hasLift = allItems.some(i => i.possible_furniture_lift);
    const hasFragile = allItems.some(i => i.fragile);
    const hasHeavy = allItems.some(i => i.heavy);
    const hasMattress = allItems.some(i => i.catalogId === 'mattress');
    const hasWardrobe = allItems.some(i => i.catalogId === 'wardrobe');
    const hasDressing = state.rooms.some(r => r.type === 'dressing');
    const hasBookshelf = allItems.some(i => i.catalogId === 'bookshelf');

    equip.push(lang === 'fr' ? 'Couvertures de protection' : 'Protective blankets');
    if (hasMattress) equip.push(lang === 'fr' ? 'Housses matelas' : 'Mattress covers');
    equip.push(lang === 'fr' ? 'Cartons adaptes' : 'Appropriate boxes');
    if (hasWardrobe || hasDressing) equip.push(lang === 'fr' ? 'Cartons penderie' : 'Wardrobe boxes');
    if (hasBookshelf) equip.push(lang === 'fr' ? 'Cartons livres' : 'Book boxes');
    if (hasFragile) equip.push(lang === 'fr' ? 'Papier bulle' : 'Bubble wrap');
    if (hasHeavy) equip.push(lang === 'fr' ? 'Sangles' : 'Straps');
    if (hasHeavy || hasLift) equip.push(lang === 'fr' ? 'Protection sol' : 'Floor protection');
    if (hasLift) equip.push(lang === 'fr' ? 'Monte-meubles' : 'Furniture lift');

    return equip;
  };

  const getCheckPoints = () => {
    const points = [];
    ['origin', 'destination'].forEach(prefix => {
      const d = state[prefix];
      const label = prefix === 'origin'
        ? (lang === 'fr' ? 'Origine' : 'Origin')
        : (lang === 'fr' ? 'Destination' : 'Destination');
      if (d.elevator === 'no') {
        points.push(`${label} : ${t('alertElevatorNo')}`);
      }
      if (d.elevatorUsable === 'no') {
        points.push(`${label} : ${lang === 'fr' ? 'Ascenseur inutilisable' : 'Elevator unusable'}`);
      } else if (d.elevatorUsable === 'toCheck' && d.elevator === 'yes') {
        points.push(`${label} : ${lang === 'fr' ? 'Utilisation ascenseur a confirmer' : 'Elevator use to confirm'}`);
      }
      if (d.parkingAvailable === 'no') {
        points.push(`${label} : ${t('alertParkingNo')}`);
      } else if (d.parkingAvailable === 'toCheck') {
        points.push(`${label} : ${lang === 'fr' ? 'Stationnement camion a verifier' : 'Truck parking to verify'}`);
      }
      if (d.furnitureLiftNeeded === 'yes' && d.furnitureLiftFeasible === 'toCheck') {
        points.push(`${label} : ${t('alertLiftCheck')}`);
      }
      if (d.furnitureLiftNeeded === 'toCheck') {
        points.push(`${label} : ${lang === 'fr' ? 'Besoin monte-meubles a confirmer' : 'Furniture lift need to confirm'}`);
      }
      if (d.truckDistance === '30_50') {
        points.push(`${label} : ${t('alertLong30')}`);
      } else if (d.truckDistance === 'gt50') {
        points.push(`${label} : ${t('alertLong50')}`);
      }
    });
    return points;
  };

  const getAllCrateItems = () => {
    const items = [];
    state.rooms.forEach(r =>
      (r.items || []).filter(i => i.needsCrate && i.qty > 0).forEach(i =>
        items.push({ ...i, roomName: r.name })
      )
    );
    return items;
  };

  const getAllFragile = () => {
    const items = [];
    state.rooms.forEach(r => (r.items || []).filter(i => i.fragile && i.qty > 0).forEach(i => items.push({ ...i, roomName: r.name })));
    return items;
  };

  const getAllHeavy = () => {
    const items = [];
    state.rooms.forEach(r => (r.items || []).filter(i => i.heavy && i.qty > 0).forEach(i => items.push({ ...i, roomName: r.name })));
    return items;
  };

  const getAllDisassembly = () => {
    const items = [];
    state.rooms.forEach(r => (r.items || []).filter(i => i.requires_disassembly && i.qty > 0).forEach(i => items.push({ ...i, roomName: r.name })));
    return items;
  };

  const getTotalBoxes = (source) => Object.values(source).reduce((sum, v) => sum + (v || 0), 0);

  const getBoxVolume = (source) => {
    let vol = 0;
    Object.entries(source).forEach(([k, v]) => {
      const bt = CATALOG.boxTypes.find(b => b.id === k);
      if (bt) vol += bt.volume_m3 * (v || 0);
    });
    return vol;
  };

  const getBoxSuggestions = () => {
    const suggestions = {};

    const bookshelfBoxes = {
      'bookshelf_bk_column': 2, 'bookshelf_bk_small': 2, 'bookshelf_bk_medium': 4,
      'bookshelf_bk_large': 8, 'bookshelf_bk_wall': 4, 'bookshelf_bk_kallax_s': 2, 'bookshelf_bk_kallax_l': 6,
    };
    const dresserBoxes = {
      'dresser_dresser_chiffonnier': 2, 'dresser_dresser_small': 2, 'dresser_dresser_std': 2,
      'dresser_dresser_large': 2, 'dresser_dresser_double': 2, 'dresser_dresser_antique': 2,
    };
    const wardrobeBoxes = {
      'wardrobe_ward_1door': 1, 'wardrobe_ward_2door': 2, 'wardrobe_ward_3door': 3, 'wardrobe_ward_dressing': 4,
    };

    state.rooms.forEach(r => {
      (r.items || []).filter(i => i.qty > 0).forEach(i => {
        if (bookshelfBoxes[i.itemId]) suggestions.box_books = (suggestions.box_books || 0) + bookshelfBoxes[i.itemId] * i.qty;
        if (dresserBoxes[i.itemId]) suggestions.box_standard = (suggestions.box_standard || 0) + dresserBoxes[i.itemId] * i.qty;
        if (wardrobeBoxes[i.itemId]) suggestions.box_wardrobe = (suggestions.box_wardrobe || 0) + wardrobeBoxes[i.itemId] * i.qty;
      });
      if (r.type === 'kitchen' && (r.items || []).some(i => i.qty > 0)) {
        suggestions.box_dishes = (suggestions.box_dishes || 0) + 3;
      }
    });

    return suggestions;
  };

  const getRoomIcon = (type) => CATALOG.roomIcons[type] || '📦';

  const saveVisit = async () => {
    if (!user) return { error: 'Not authenticated' };
    const vol = getTotalVolume();
    const payload = {
      client_name: state.client.name || null,
      client_email: state.client.email || null,
      client_phone: state.client.phone || null,
      visit_date: state.client.visitDate || null,
      move_date: state.client.moveDate || null,
      total_volume: vol,
      recommended_truck: getRecommendedTruck(vol),
      client_data: {
        ...state.client,
        housingType: state.housingType,
        moveType: state.moveType,
        moveSegments: state.moveSegments || [],
        householdPersons: state.householdPersons,
        transportOverride: state.transportOverride || null,
      },
      origin_data: state.origin,
      destination_data: state.destination,
      rooms_data: state.rooms,
      boxes_done: state.boxesDone,
      boxes_remaining: state.boxesRemaining,
    };

    if (state.editingVisitId) {
      const { data, error } = await supabase
        .from('visits').update(payload).eq('id', state.editingVisitId).select().single();
      if (!error) setState(s => ({ ...s, editingVisitId: null }));
      return { data, error };
    }

    const { data, error } = await supabase.from('visits').insert({
      user_id: user.id,
      ...payload,
    }).select().single();
    return { data, error };
  };

  const loadVisit = (visitData) => {
    const cd = visitData.client_data || {};
    const maxRoomNum = (visitData.rooms_data || []).reduce((max, r) => {
      const n = parseInt((r.id || '').replace('room_', '')) || 0;
      return Math.max(max, n);
    }, 0);

    const migrateAccess = (raw) => ({
      ...emptyAccess,
      ...raw,
      elevatorUsable: raw?.elevatorUsable || 'toCheck',
      elevatorSize: raw?.elevatorSize || 'toCheck',
      parkingAvailable: raw?.parkingAvailable || 'toCheck',
      accessDifficult: raw?.accessDifficult || 'toCheck',
      noFixedAddress: raw?.noFixedAddress || false,
      furnitureLiftNeeded: raw?.furnitureLiftNeeded || (raw?.furnitureLift ? 'yes' : 'toCheck'),
      furnitureLiftFeasible: raw?.furnitureLiftFeasible || 'toCheck',
      furnitureLiftLocation: raw?.furnitureLiftLocation || '',
      furnitureLiftComment: raw?.furnitureLiftComment || '',
    });

    setState({
      ...initialState,
      client: {
        name: cd.name || '',
        phone: cd.phone || '',
        email: cd.email || '',
        visitDate: cd.visitDate || new Date().toISOString().split('T')[0],
        surveyor: cd.surveyor || user?.email || '',
        moveDate: cd.moveDate || '',
        notes: cd.notes || '',
      },
      housingType: cd.housingType || '',
      moveType: cd.moveType || (cd.isInternational ? 'sea' : 'local'),
      moveSegments: cd.moveSegments || [],
      origin: migrateAccess(visitData.origin_data),
      destination: migrateAccess(visitData.destination_data),
      rooms: visitData.rooms_data || [],
      currentRoomId: visitData.rooms_data?.[0]?.id || null,
      boxesDone: visitData.boxes_done || {},
      boxesRemaining: visitData.boxes_remaining || {},
      nextRoomId: maxRoomNum + 1,
      householdPersons: cd.householdPersons || 0,
      transportOverride: cd.transportOverride || null,
      editingVisitId: visitData.id,
    });
    setCurrentStepState(0);
    setViewMode('wizard');
  };

  const openSheet = (content) => setSheet({ isOpen: true, content });
  const closeSheet = () => setSheet({ isOpen: false, content: null });
  const openModal = (content) => setModal({ isOpen: true, content });
  const closeModal = () => setModal({ isOpen: false, content: null });

  return (
    <AppContext.Provider value={{
      lang, setLang,
      currentStep, goToStep, nextStep, prevStep,
      state,
      t, tCat,
      updateClient, updateOrigin, updateDestination,
      setHousingType, setMoveType, setHouseholdPersons, setTransportOverride,
      addMoveSegment, updateMoveSegment, removeMoveSegment, getSegmentSolution,
      addRoom, deleteRoom, renameRoom, selectRoom,
      setRoomTab, addItemToRoom, addCustomItemToRoom, changeQty,
      updateItemVolume, toggleItemCrate,
      changeBox, setBox, applyBoxSuggestions,
      getRoomVolume, getTotalVolume,
      getRecommendedTruck, getRecommendedTeam,
      getEquipment, getCheckPoints,
      getAllFragile, getAllHeavy, getAllDisassembly, getAllCrateItems,
      getTotalBoxes, getBoxVolume, getRoomIcon,
      getBoxSuggestions,
      sheet, openSheet, closeSheet,
      modal, openModal, closeModal,
      mainScrollRef,
      user, authLoading,
      viewMode, setViewMode,
      signOut, startNewVisit,
      saveVisit, loadVisit,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
