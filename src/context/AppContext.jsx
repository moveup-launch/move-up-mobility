import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { CATALOG } from '../data/catalog';
import { supabase } from '../lib/supabase';
import { openProCheckout } from '../lib/stripe';

const AppContext = createContext();

const FREE_VISIT_LIMIT = 3;

function UpgradePlanModal({ lang, onClose, onUpgrade }) {
  const isFr = lang === 'fr';
  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, color: 'var(--text)' }}>
        {isFr ? 'Limite du plan gratuit atteinte' : 'Free plan limit reached'}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>
        {isFr
          ? `Le plan gratuit est limité à ${FREE_VISIT_LIMIT} visites. Passez au Plan Pro à 9,99€/mois pour des visites illimitées.`
          : `The free plan is limited to ${FREE_VISIT_LIMIT} visits. Upgrade to Pro at 9.99€/month for unlimited visits.`}
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: 15, marginBottom: 10 }}
        onClick={onUpgrade}
      >
        {isFr ? "S'abonner au Plan Pro à 9,99€/mois →" : 'Subscribe to Pro at 9.99€/month →'}
      </button>
      <button
        className="btn btn-secondary"
        style={{ width: '100%', padding: '12px', fontSize: 14 }}
        onClick={onClose}
      >
        {isFr ? 'Plus tard' : 'Later'}
      </button>
    </div>
  );
}

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
  visitTime: '', visitStatus: 'prevue', agendaNotes: '',
  surveyor: '', moveDate: '', notes: '',
};

const initialState = {
  client: { ...baseClient },
  housingType: '',
  housingTypeOrigin: '',
  housingTypeDestination: '',
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
  justFinishedInventory: false,
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
  const [quoteVisit, setQuoteVisit] = useState(null);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const mainScrollRef = useRef(null);
  const lastSavedVisitIdRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [expertMode, setExpertModeState] = useState(
    () => localStorage.getItem('expertMode') === 'true'
  );
  const [customCatalog, setCustomCatalogState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customCatalog') || '[]'); }
    catch { return []; }
  });
  const [volumeOverrides, setVolumeOverridesState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('volumeOverrides') || '{}'); }
    catch { return {}; }
  });

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

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  useEffect(() => {
    const handleOnline = async () => {
      if (lastSavedVisitIdRef.current) {
        uploadPhotos(lastSavedVisitIdRef.current);
      }
      // Sync des sauvegardes d'inventaire en attente
      try {
        const pendingSaves = JSON.parse(localStorage.getItem('moveup_pending_saves') || '{}');
        for (const [key, { userId, payload, editingVisitId }] of Object.entries(pendingSaves)) {
          let err;
          if (editingVisitId) {
            ({ error: err } = await supabase.from('visits').update(payload).eq('id', editingVisitId));
          } else {
            ({ error: err } = await supabase.from('visits').insert({ user_id: userId, ...payload }));
          }
          if (!err) {
            const current = JSON.parse(localStorage.getItem('moveup_pending_saves') || '{}');
            delete current[key];
            localStorage.setItem('moveup_pending_saves', JSON.stringify(current));
          }
        }
      } catch (e) {
        console.error('Sync pending saves error:', e);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const setLang = (l) => setLangState(l);
  const t = (key) => TRANSLATIONS[lang]?.[key] || key;
  const tCat = (obj) => {
    if (!obj) return '';
    return obj[lang] || obj.fr || obj.en || '';
  };

  const goToStep = (i) => {
    if (i >= 0 && i <= 3) setCurrentStepState(i);
  };
  const nextStep = () => {
    setCurrentStepState(s => {
      if (s === 2) setState(st => ({ ...st, justFinishedInventory: true }));
      return Math.min(3, s + 1);
    });
  };
  const clearJustFinishedInventory = () =>
    setState(s => ({ ...s, justFinishedInventory: false }));
  const prevStep = () => setCurrentStepState(s => Math.max(0, s - 1));

  const signOut = async () => {
    await supabase.auth.signOut();
    setViewMode('dashboard');
  };

  const saveProfile = async (data) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...data });
    if (!error) setProfile(prev => ({ ...(prev || {}), ...data }));
    return { error };
  };

  const setExpertMode = (val) => {
    localStorage.setItem('expertMode', String(val));
    setExpertModeState(val);
  };

  const addCustomCatalogItem = (item) => {
    const newItem = { ...item, id: `custom_${Date.now()}` };
    setCustomCatalogState(prev => {
      const updated = [...prev, newItem];
      localStorage.setItem('customCatalog', JSON.stringify(updated));
      return updated;
    });
    return newItem;
  };

  const deleteCustomCatalogItem = (id) => {
    setCustomCatalogState(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('customCatalog', JSON.stringify(updated));
      return updated;
    });
  };

  const setVolumeOverride = (uid, volume) => {
    setVolumeOverridesState(prev => {
      const updated = { ...prev, [uid]: parseFloat(volume) };
      localStorage.setItem('volumeOverrides', JSON.stringify(updated));
      return updated;
    });
  };

  const resetVolumeOverride = (uid) => {
    setVolumeOverridesState(prev => {
      const updated = { ...prev };
      delete updated[uid];
      localStorage.setItem('volumeOverrides', JSON.stringify(updated));
      return updated;
    });
  };

  const getSurveyorName = () => {
    if (profile?.first_name || profile?.last_name) {
      return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    }
    return user?.email || '';
  };

  const startNewVisit = () => {
    setState({
      ...initialState,
      client: { ...baseClient, surveyor: getSurveyorName() },
    });
    setCurrentStepState(0);
    setViewMode('wizard');
  };

  const [planVisitSignal, setPlanVisitSignal] = useState(0);
  const openPlanVisit = async () => {
    if ((profile?.plan || 'free') === 'free') {
      const { count } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true });
      if ((count || 0) >= FREE_VISIT_LIMIT) {
        openModal(
          <UpgradePlanModal
            lang={lang}
            onClose={closeModal}
            onUpgrade={() => { closeModal(); openProCheckout(user?.email); }}
          />
        );
        return;
      }
    }
    setViewMode('agenda');
    setPlanVisitSignal(n => n + 1);
  };

  const openNewQuote = (visitData) => {
    setQuoteVisit(visitData || null);
    setEditingQuoteId(null);
    setViewMode('quote-editor');
  };

  const openEditQuote = (quoteId) => {
    setEditingQuoteId(quoteId);
    setQuoteVisit(null);
    setViewMode('quote-editor');
  };

  const startQuickVisit = () => {
    setState({
      ...initialState,
      client: { ...baseClient, surveyor: getSurveyorName() },
    });
    setCurrentStepState(0);
    setViewMode('quickvisit');
  };

  const updateClient = (field, value) =>
    setState(s => ({ ...s, client: { ...s.client, [field]: value } }));

  const updateOrigin = (field, value) =>
    setState(s => ({ ...s, origin: { ...s.origin, [field]: value } }));

  const updateDestination = (field, value) =>
    setState(s => ({ ...s, destination: { ...s.destination, [field]: value } }));

  const setHousingType = (val) => setState(s => ({ ...s, housingType: val }));
  const setHousingTypeOrigin = (val) => setState(s => ({ ...s, housingTypeOrigin: val }));
  const setHousingTypeDestination = (val) => setState(s => ({ ...s, housingTypeDestination: val }));
  const setMoveType = (val) => setState(s => ({ ...s, moveType: val }));
  const setHouseholdPersons = (val) => setState(s => ({ ...s, householdPersons: Math.max(0, val) }));
  const setTransportOverride = (val) => setState(s => ({ ...s, transportOverride: val }));

  // Move segments (multi-line transport breakdown)
  const addMoveSegment = () => {
    setState(s => ({
      ...s,
      moveSegments: [...(s.moveSegments || []), {
        id: `seg_${Date.now()}`,
        type: '',
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
    if (type === 'sea' || type === 'international') {
      if (v < 5)  return isFr ? 'Aérien ou LCL groupage'  : 'Air or LCL groupage';
      if (v <= 30) return isFr ? 'Maritime LCL groupage'   : 'Sea LCL groupage';
      if (v <= 60) return isFr ? "Conteneur 20'"           : "20' Container";
      return isFr ? "Conteneur 40' HC" : "40' HC Container";
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

  const addRoom = (type, customName) => {
    setState(s => {
      const count = s.rooms.filter(r => r.type === type).length + 1;
      const baseName = TRANSLATIONS[lang]?.[type] || type;
      const name = customName || (count > 1 ? `${baseName} ${count}` : baseName);
      const id = `room_${s.nextRoomId}`;
      return {
        ...s,
        rooms: [...s.rooms, { id, type, name, isCustomName: !!customName, items: [], boxesDone: {}, boxesRemaining: {} }],
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
    setState(s => ({ ...s, rooms: s.rooms.map(r => r.id === id ? { ...r, name, isCustomName: true } : r) }));

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

  const updateItemComment = (roomId, itemId, comment) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return { ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, comment } : i) };
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

  const updateItemCrate = (roomId, itemId, crate) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          items: r.items.map(i =>
            i.itemId === itemId ? { ...i, crate: crate || null } : i
          ),
        };
      }),
    }));

  const updateItemTransportMode = (roomId, itemId, mode) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          items: r.items.map(i =>
            i.itemId === itemId ? { ...i, transportMode: mode || null } : i
          ),
        };
      }),
    }));

  const updateItemFlags = (roomId, itemId, flags) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return { ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, ...flags } : i) };
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

  const getTotalVolume = () =>
    state.rooms.reduce((sum, r) => sum + getRoomVolume(r), 0);

  const getRecommendedTruck = (vol) => {
    const segments = state.moveSegments || [];
    if (segments.length > 0) {
      const primary = segments.reduce((a, b) => ((b.volume || 0) > (a.volume || 0) ? b : a));
      return getSegmentSolution(primary.type, primary.volume || vol);
    }
    const mt = state.moveType || 'local';
    // Moveype explicitement international → on l'utilise tel quel
    if (mt !== 'local') return getSegmentSolution(mt, vol);
    // Auto-détection : code postal non-français (pas 5 chiffres) → international
    const destPc = (state.destination?.postalCode || '').trim();
    if (destPc && !/^\d{5}$/.test(destPc)) {
      return getSegmentSolution('international', vol);
    }
    return getSegmentSolution('local', vol);
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

  const MATTRESS_SIZE_MAP = {
    mat_baby: '60cm', mat_child: '80cm', mat_single: '90cm',
    mat_120: '120cm', mat_double: '140cm', mat_queen: '160cm', mat_king: '180cm',
  };

  const getMattressCovers = () => {
    const allItems = state.rooms.flatMap(r => r.items || []).filter(i => i.qty > 0);
    const mattressItems = allItems.filter(i => i.catalogId === 'mattress');
    if (!mattressItems.length) return null;
    const counts = {};
    mattressItems.forEach(i => {
      const variantId = i.itemId.replace('mattress_', '');
      const size = MATTRESS_SIZE_MAP[variantId] || '?';
      counts[size] = (counts[size] || 0) + i.qty;
    });
    const detail = Object.entries(counts).map(([size, qty]) => `${qty}x${size}`).join(', ');
    return lang === 'fr' ? `Housses matelas (${detail})` : `Mattress covers (${detail})`;
  };

  const getEquipment = () => {
    const isFr = lang === 'fr';
    const equip = [];
    const allItems = state.rooms.flatMap(r => r.items || []).filter(i => i.qty > 0);
    const hasLift = allItems.some(i => i.possible_furniture_lift);
    const hasFragile = allItems.some(i => i.fragile);
    const hasHeavy = allItems.some(i => i.heavy);
    const hasMattress = allItems.some(i => i.catalogId === 'mattress');
    const hasWardrobe = allItems.some(i => i.catalogId === 'wardrobe');
    const hasDressing = state.rooms.some(r => r.type === 'dressing');
    const hasBookshelf = allItems.some(i => i.catalogId === 'bookshelf');
    const hasKitchen = state.rooms.some(r => r.type === 'kitchen');
    const hasTV = allItems.some(i => i.catalogId === 'tv');
    const hasPiano = allItems.some(i => ['piano_upright', 'piano_grand'].includes(i.catalogId));

    equip.push(isFr ? 'Couvertures de protection' : 'Protective blankets');

    const mattressLine = getMattressCovers();
    if (hasMattress && mattressLine) equip.push(mattressLine);

    if (hasFragile) equip.push(isFr ? 'Papier bulle' : 'Bubble wrap');
    if (hasFragile || hasKitchen) equip.push(isFr ? 'Cartons vaisselle' : 'Dish boxes');
    if (hasBookshelf) equip.push(isFr ? 'Cartons livres' : 'Book boxes');
    if (hasWardrobe || hasDressing) equip.push(isFr ? 'Cartons penderie' : 'Wardrobe boxes');
    if (hasKitchen) equip.push(isFr ? 'Cartons cuisine' : 'Kitchen boxes');
    equip.push(isFr ? 'Cartons standards' : 'Standard boxes');

    if (hasTV) equip.push(isFr ? 'Carton TV / emballage écran' : 'TV box / screen wrapping');
    if (hasPiano) equip.push(isFr ? 'Protection piano (couvertures + sangles spéciales)' : 'Piano protection (covers + special straps)');
    if (hasHeavy) equip.push(isFr ? 'Sangles de portage' : 'Carrying straps');
    if (hasHeavy || hasLift) equip.push(isFr ? 'Protection sol' : 'Floor protection');
    if (hasLift) equip.push(isFr ? 'Monte-meubles' : 'Furniture lift');

    return equip;
  };

  const getCheckPoints = () => {
    const points = [];
    ['origin', 'destination'].forEach(prefix => {
      const d = state[prefix];
      if (d.noFixedAddress) return;
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
      (r.items || []).filter(i => (i.crate || i.needsCrate) && i.qty > 0).forEach(i =>
        items.push({ ...i, roomName: r.name })
      )
    );
    return items;
  };

  const getItemsByTransportMode = () => {
    const modes = {};
    state.rooms.forEach(r => {
      (r.items || []).filter(i => i.qty > 0).forEach(i => {
        const m = i.transportMode || 'undefined';
        if (!modes[m]) modes[m] = { count: 0, volume: 0, items: [] };
        modes[m].count += i.qty;
        modes[m].volume += (i.volume_m3 || 0) * i.qty;
        modes[m].items.push({ name: i.name, icon: i.icon || '📦', qty: i.qty, roomName: r.name });
      });
    });
    return modes;
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
    if (!navigator.onLine) {
      // Sauvegarde locale en attente de reconnexion
      const vol = getTotalVolume();
      const offlinePayload = {
        client_name: state.client.name || null,
        client_email: state.client.email || null,
        client_phone: state.client.phone || null,
        visit_date: state.client.visitDate || null,
        move_date: state.client.moveDate || null,
        visit_time: state.client.visitTime || null,
        visit_status: state.client.visitStatus || 'prevue',
        agenda_notes: state.client.agendaNotes || null,
        commercial_name: state.client.surveyor || null,
        total_volume: vol,
        recommended_truck: getRecommendedTruck(vol),
        client_data: { ...state.client, housingType: state.housingType, housingTypeOrigin: state.housingTypeOrigin, housingTypeDestination: state.housingTypeDestination, moveType: state.moveType, moveSegments: state.moveSegments || [], householdPersons: state.householdPersons, transportOverride: state.transportOverride || null },
        origin_data: state.origin,
        destination_data: state.destination,
        rooms_data: state.rooms.map(r => { const { photos, ...rest } = r; return rest; }),
        boxes_done: state.boxesDone,
        boxes_remaining: state.boxesRemaining,
      };
      try {
        const key = state.editingVisitId || `inv_${Date.now()}`;
        const all = JSON.parse(localStorage.getItem('moveup_pending_saves') || '{}');
        all[key] = { userId: user.id, payload: offlinePayload, editingVisitId: state.editingVisitId };
        localStorage.setItem('moveup_pending_saves', JSON.stringify(all));
      } catch (e) { console.error('LocalStorage save error:', e); }
      return { data: { id: state.editingVisitId }, error: null, _pending: true };
    }
    const vol = getTotalVolume();
    const payload = {
      client_name: state.client.name || null,
      client_email: state.client.email || null,
      client_phone: state.client.phone || null,
      visit_date: state.client.visitDate || null,
      move_date: state.client.moveDate || null,
      visit_time: state.client.visitTime || null,
      visit_status: state.client.visitStatus || 'prevue',
      agenda_notes: state.client.agendaNotes || null,
      commercial_name: state.client.surveyor || null,
      total_volume: vol,
      recommended_truck: getRecommendedTruck(vol),
      client_data: {
        ...state.client,
        housingType: state.housingType,
        housingTypeOrigin: state.housingTypeOrigin,
        housingTypeDestination: state.housingTypeDestination,
        moveType: state.moveType,
        moveSegments: state.moveSegments || [],
        householdPersons: state.householdPersons,
        transportOverride: state.transportOverride || null,
      },
      origin_data: state.origin,
      destination_data: state.destination,
      rooms_data: state.rooms.map(r => { const { photos, ...rest } = r; return rest; }),
      boxes_done: state.boxesDone,
      boxes_remaining: state.boxesRemaining,
    };

    if (state.editingVisitId) {
      const editId = state.editingVisitId;
      const { data, error } = await supabase
        .from('visits').update(payload).eq('id', editId).select().single();
      if (!error) {
        const roomsSnapshot = state.rooms;
        lastSavedVisitIdRef.current = editId;
        setState(s => ({ ...s, editingVisitId: null }));
        uploadPhotos(editId, roomsSnapshot);
      }
      return { data, error };
    }

    const { data, error } = await supabase.from('visits').insert({
      user_id: user.id,
      ...payload,
    }).select().single();
    if (!error && data) {
      lastSavedVisitIdRef.current = data.id;
      uploadPhotos(data.id, state.rooms);
    }
    return { data, error };
  };

  const loadVisit = async (visitData) => {
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
        visitDate: cd.visitDate || visitData.visit_date || new Date().toISOString().split('T')[0],
        visitTime: cd.visitTime || visitData.visit_time || '',
        visitStatus: cd.visitStatus || visitData.visit_status || 'prevue',
        agendaNotes: cd.agendaNotes || visitData.agenda_notes || '',
        surveyor: cd.surveyor || visitData.commercial_name || user?.email || '',
        moveDate: cd.moveDate || '',
        notes: cd.notes || '',
      },
      housingType: cd.housingType || '',
      housingTypeOrigin: cd.housingTypeOrigin || cd.housingType || '',
      housingTypeDestination: cd.housingTypeDestination || cd.housingType || '',
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

    if (visitData.id) {
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('visit_id', visitData.id);
      if (photosData && photosData.length > 0) {
        const photosByRoom = {};
        for (const p of photosData) {
          if (!photosByRoom[p.room_id]) photosByRoom[p.room_id] = [];
          const { data: urlData } = supabase.storage
            .from('visit-photos')
            .getPublicUrl(p.storage_path);
          photosByRoom[p.room_id].push({
            id: p.id,
            dataURL: urlData.publicUrl,
            comment: p.comment || '',
            category: p.category || '',
            storagePath: p.storage_path,
            uploadStatus: 'done',
          });
        }
        setState(s => ({
          ...s,
          rooms: s.rooms.map(r => ({
            ...r,
            photos: photosByRoom[r.id] || r.photos || [],
          })),
        }));
      }
    }
  };

  // ── Photos ──────────────────────────────────────────────────────
  const addRoomPhoto = (roomId, dataURL, category = 'Autre') => {
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return {
          ...r,
          photos: [...(r.photos || []), {
            id: photoId, dataURL, comment: '', category,
            storagePath: null, uploadStatus: 'pending',
          }],
        };
      }),
    }));
    return photoId;
  };

  const deleteRoomPhoto = (roomId, photoId) => {
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return { ...r, photos: (r.photos || []).filter(p => p.id !== photoId) };
      }),
    }));
  };

  const updateRoomPhoto = (roomId, photoId, updates) => {
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        return { ...r, photos: (r.photos || []).map(p => p.id === photoId ? { ...p, ...updates } : p) };
      }),
    }));
  };

  const uploadPhotos = async (visitId, roomsSnapshot) => {
    const rooms = roomsSnapshot || state.rooms;
    for (const room of rooms) {
      const pending = (room.photos || []).filter(p => p.uploadStatus === 'pending' && p.dataURL);
      for (const photo of pending) {
        updateRoomPhoto(room.id, photo.id, { uploadStatus: 'uploading' });
        try {
          const ext = photo.dataURL.startsWith('data:image/png') ? 'png' : 'jpg';
          const path = `${user.id}/${visitId}/${room.id}/photo-${Date.now()}.${ext}`;
          const res = await fetch(photo.dataURL);
          const blob = await res.blob();
          const { error: upErr } = await supabase.storage
            .from('visit-photos').upload(path, blob, { contentType: blob.type });
          if (upErr) throw upErr;
          await supabase.from('photos').insert({
            visit_id: visitId, room_id: room.id,
            storage_path: path, comment: photo.comment, category: photo.category,
          });
          updateRoomPhoto(room.id, photo.id, { uploadStatus: 'done', storagePath: path });
        } catch {
          updateRoomPhoto(room.id, photo.id, { uploadStatus: 'error' });
        }
      }
    }
  };

  const retryPhotoUploads = async () => {
    if (lastSavedVisitIdRef.current) {
      await uploadPhotos(lastSavedVisitIdRef.current);
    }
  };

  // ────────────────────────────────────────────────────────────────

  // Auto-save: débounce 3s après le dernier changement
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'offline'
  const autoSaveTimerRef = useRef(null);
  const performAutoSave = useRef(null);
  performAutoSave.current = async () => {
    if (!state.editingVisitId || viewMode !== 'wizard') return;
    const vol = getTotalVolume();
    const payload = {
      total_volume: vol,
      recommended_truck: getRecommendedTruck(vol),
      client_data: {
        ...state.client,
        housingType: state.housingType,
        housingTypeOrigin: state.housingTypeOrigin,
        housingTypeDestination: state.housingTypeDestination,
        moveType: state.moveType,
        moveSegments: state.moveSegments || [],
        householdPersons: state.householdPersons,
        transportOverride: state.transportOverride || null,
      },
      origin_data: state.origin,
      destination_data: state.destination,
      rooms_data: state.rooms.map(r => { const { photos, ...rest } = r; return rest; }),
      boxes_done: state.boxesDone,
      boxes_remaining: state.boxesRemaining,
    };
    setSaveStatus('saving');
    if (!navigator.onLine) {
      try {
        const all = JSON.parse(localStorage.getItem('moveup_pending_saves') || '{}');
        all[state.editingVisitId] = { userId: user?.id, payload, editingVisitId: state.editingVisitId };
        localStorage.setItem('moveup_pending_saves', JSON.stringify(all));
        setSaveStatus('offline');
      } catch { setSaveStatus('idle'); }
      setTimeout(() => setSaveStatus(s => s === 'offline' ? 'idle' : s), 3000);
      return;
    }
    const { error } = await supabase.from('visits').update(payload).eq('id', state.editingVisitId);
    if (!error) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(s => s === 'saved' ? 'idle' : s), 3000);
    } else {
      setSaveStatus('idle');
    }
  };
  useEffect(() => {
    if (!state.editingVisitId || viewMode !== 'wizard') return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => { performAutoSave.current?.(); }, 3000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const openSheet = (content) => setSheet({ isOpen: true, content });
  const closeSheet = () => setSheet({ isOpen: false, content: null });
  const openModal = (content) => setModal({ isOpen: true, content });
  const closeModal = () => setModal({ isOpen: false, content: null });

  return (
    <AppContext.Provider value={{
      lang, setLang,
      currentStep, goToStep, nextStep, prevStep, clearJustFinishedInventory,
      state,
      t, tCat,
      updateClient, updateOrigin, updateDestination,
      setHousingType, setHousingTypeOrigin, setHousingTypeDestination,
      setMoveType, setHouseholdPersons, setTransportOverride,
      addMoveSegment, updateMoveSegment, removeMoveSegment, getSegmentSolution,
      addRoom, deleteRoom, renameRoom, selectRoom,
      setRoomTab, addItemToRoom, addCustomItemToRoom, changeQty,
      updateItemComment, updateItemVolume, updateItemCrate, updateItemTransportMode, updateItemFlags,
      getRoomVolume, getTotalVolume,
      getRecommendedTruck, getRecommendedTeam,
      getEquipment, getMattressCovers, getCheckPoints,
      getAllFragile, getAllHeavy, getAllDisassembly, getAllCrateItems, getItemsByTransportMode,
      getRoomIcon,
      sheet, openSheet, closeSheet,
      modal, openModal, closeModal,
      mainScrollRef,
      user, authLoading,
      viewMode, setViewMode,
      signOut, startNewVisit, startQuickVisit,
      planVisitSignal, openPlanVisit,
      saveStatus,
      quoteVisit, editingQuoteId, openNewQuote, openEditQuote,
      saveVisit, loadVisit,
      profile, saveProfile,
      expertMode, setExpertMode,
      customCatalog, addCustomCatalogItem, deleteCustomCatalogItem,
      volumeOverrides, setVolumeOverride, resetVolumeOverride,
      addRoomPhoto, deleteRoomPhoto, updateRoomPhoto, uploadPhotos, retryPhotoUploads,
      supabaseClient: supabase,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
