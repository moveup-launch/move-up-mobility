import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { CATALOG } from '../data/catalog';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

const initialState = {
  client: {
    name: '', phone: '', email: '',
    visitDate: new Date().toISOString().split('T')[0],
    surveyor: '', moveDate: '', notes: ''
  },
  origin: { address: '', city: '', postalCode: '', floor: '', elevator: 'no', furnitureLift: false, truckDistance: '', accessNotes: '' },
  destination: { address: '', city: '', postalCode: '', floor: '', elevator: 'no', furnitureLift: false, truckDistance: '', accessNotes: '' },
  housingType: '',
  rooms: [],
  currentRoomId: null,
  boxesDone: {},
  boxesRemaining: {},
  nextRoomId: 1,
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
    if (i <= currentStep + 1 && i >= 0) setCurrentStepState(i);
  };
  const nextStep = () => setCurrentStepState(s => Math.min(5, s + 1));
  const prevStep = () => setCurrentStepState(s => Math.max(0, s - 1));

  const signOut = async () => {
    await supabase.auth.signOut();
    setViewMode('dashboard');
  };

  const startNewVisit = () => {
    setState(initialState);
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
    if (vol <= 18) return t('truck20');
    if (vol <= 28) return t('truck30');
    if (vol <= 38) return t('truck40');
    if (vol <= 48) return t('truck50');
    if (vol <= 58) return t('truck60');
    return t('truckMultiple');
  };

  const getRecommendedTeam = (vol) => {
    if (vol <= 20) return lang === 'fr' ? '2 déménageurs' : '2 movers';
    if (vol <= 40) return lang === 'fr' ? '3 déménageurs' : '3 movers';
    return lang === 'fr' ? '4 déménageurs ou plus' : '4+ movers';
  };

  const getEquipment = () => {
    const equip = [];
    const hasLift = state.rooms.some(r => (r.items || []).some(i => i.possible_furniture_lift && i.qty > 0));
    const hasHeavy = state.rooms.some(r => (r.items || []).some(i => i.heavy && i.qty > 0));
    const hasFragile = state.rooms.some(r => (r.items || []).some(i => i.fragile && i.qty > 0));
    if (hasLift) equip.push(lang === 'fr' ? '🏗️ Monte-meubles' : '🏗️ Furniture lift');
    if (hasHeavy) equip.push(lang === 'fr' ? '🛞 Diable / Transpalette' : '🛞 Dolly / Hand truck');
    if (hasFragile) equip.push(lang === 'fr' ? '🛡️ Couvertures de protection' : '🛡️ Protective blankets');
    equip.push(lang === 'fr' ? "📦 Matériel d'emballage" : '📦 Packing supplies');
    return equip;
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

  const getRoomIcon = (type) => CATALOG.roomIcons[type] || '📦';

  const saveVisit = async () => {
    if (!user) return { error: 'Not authenticated' };
    const vol = getTotalVolume();
    const { data, error } = await supabase.from('visits').insert({
      user_id: user.id,
      client_name: state.client.name || null,
      client_email: state.client.email || null,
      client_phone: state.client.phone || null,
      visit_date: state.client.visitDate || null,
      move_date: state.client.moveDate || null,
      total_volume: vol,
      recommended_truck: getRecommendedTruck(vol),
      client_data: state.client,
      origin_data: state.origin,
      destination_data: state.destination,
      rooms_data: state.rooms,
      boxes_done: state.boxesDone,
      boxes_remaining: state.boxesRemaining,
    }).select().single();
    return { data, error };
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
      setHousingType,
      addRoom, deleteRoom, renameRoom, selectRoom,
      setRoomTab, addItemToRoom, changeQty,
      changeBox, setBox,
      getRoomVolume, getTotalVolume,
      getRecommendedTruck, getRecommendedTeam,
      getEquipment, getAllFragile, getAllHeavy, getAllDisassembly,
      getTotalBoxes, getBoxVolume, getRoomIcon,
      sheet, openSheet, closeSheet,
      modal, openModal, closeModal,
      mainScrollRef,
      user, authLoading,
      viewMode, setViewMode,
      signOut, startNewVisit,
      saveVisit,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
