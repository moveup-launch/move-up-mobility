import { useState } from 'react';
import { AppContext } from './AppContext';
import { CATALOG } from '../data/catalog';
import { TRANSLATIONS } from '../data/translations';
import { DESTINATION_PRESETS } from '../data/destinationPresets';
import { buildDemoState } from '../data/demoVisit';

// Fournisseur de contexte dédié au mode démo local (voir DemoExplorePage.jsx).
//
// Pourquoi un contexte séparé plutôt qu'un mode "démo" ajouté à AppProvider
// (context/AppContext.jsx) : le mode démo doit rester strictement local
// (aucune authentification, aucun appel réseau/Supabase — même hors-ligne) et
// totalement isolé de l'app réelle authentifiée, pour pouvoir être retiré ou
// ajusté sans risque si jamais il ne s'avérait pas être la cause du rejet
// Apple "erreur au lancement". Ce fournisseur alimente donc le MÊME objet
// React Context (AppContext, exporté depuis context/AppContext.jsx) que
// l'app réelle : ça permet de réutiliser tels quels les écrans réels
// d'inventaire/synthèse (Step4Inventory, Step5Summary, Step6PDF,
// Step3Rooms#AddRoomSheet, BottomSheet, Modal...) sans modifier une seule
// ligne de leur code, ni de la logique de l'app authentifiée — seule la
// "tuyauterie" (état + actions) change, en local pur, ci-dessous.
//
// Les fonctions ci-dessous sont une copie volontairement indépendante des
// fonctions pures équivalentes de context/AppContext.jsx (mêmes calculs,
// mêmes signatures, réduites à ce que Step4Inventory/Step5Summary/Step6PDF
// utilisent réellement) : dupliquer plutôt que réutiliser garantit qu'une
// modification de ce fichier ne peut jamais affecter l'app authentifiée, et
// inversement.

function DemoLockedFeatureModal({ lang, onClose }) {
  const isFr = lang === 'fr';
  return (
    <>
      <div className="modal-title">🔒 {isFr ? 'Fonctionnalité compte requis' : 'Account required'}</div>
      <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16, textAlign: 'center' }}>
        {isFr
          ? "Les devis ne sont pas disponibles dans cette visite d'exemple. Créez votre compte pour y accéder."
          : 'Quotes are not available in this example visit. Create your account to access them.'}
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>{isFr ? 'Fermer' : 'Close'}</button>
      </div>
    </>
  );
}

export function DemoAppProvider({ lang, onFinishInventory, children }) {
  const [state, setState] = useState(() => buildDemoState(lang));
  const [sheet, setSheet] = useState({ isOpen: false, content: null });
  const [modal, setModal] = useState({ isOpen: false, content: null });

  const t = (key) => TRANSLATIONS[lang]?.[key] || key;
  const tCat = (obj) => (!obj ? '' : obj[lang] || obj.fr || obj.en || '');

  const openSheet = (content) => setSheet({ isOpen: true, content });
  const closeSheet = () => setSheet({ isOpen: false, content: null });
  const openModal = (content) => setModal({ isOpen: true, content });
  const closeModal = () => setModal({ isOpen: false, content: null });

  // ── Pièces ──────────────────────────────────────────────────────
  const addRoom = (type, customName) => {
    setState(s => {
      const count = s.rooms.filter(r => r.type === type).length + 1;
      const baseName = TRANSLATIONS[lang]?.[type] || type;
      const name = customName || (count > 1 ? `${baseName} ${count}` : baseName);
      const id = `demo_room_${s.nextRoomId}`;
      return {
        ...s,
        rooms: [...s.rooms, { id, type, name, isCustomName: !!customName, items: [], photos: [] }],
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

  const selectRoom = (id) => setState(s => ({ ...s, currentRoomId: id }));

  // ── Objets ──────────────────────────────────────────────────────
  const addItemToRoom = (roomId, catKey, itemId, variantId) => {
    const cat = CATALOG[catKey];
    if (!cat) return;
    const itemDef = cat.find(i => i.id === itemId);
    const variant = itemDef?.variants.find(v => v.id === variantId);
    if (!variant) return;
    const uid = `${itemId}_${variantId}`;
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => {
        if (r.id !== roomId) return r;
        const existing = r.items.find(i => i.itemId === uid);
        if (existing) {
          return { ...r, items: r.items.map(i => i.itemId === uid ? { ...i, qty: i.qty + 1 } : i) };
        }
        const name = itemDef.name[lang] || itemDef.name.fr || itemDef.name.en || '';
        const variantLabel = variant.label[lang] || variant.label.fr || variant.label.en || '';
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
    const uid = `demo_custom_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
      rooms: s.rooms.map(r => r.id !== roomId ? r : {
        ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, comment } : i),
      }),
    }));

  const updateItemVolume = (roomId, itemId, vol) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : {
        ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, volume_m3: Math.max(0.001, parseFloat(vol) || 0.001) } : i),
      }),
    }));

  const updateItemCrate = (roomId, itemId, crate) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : {
        ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, crate: crate || null } : i),
      }),
    }));

  const updateItemDestination = (roomId, itemId, destination) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : {
        ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, destination } : i),
      }),
    }));

  const updateItemFlags = (roomId, itemId, flags) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : {
        ...r, items: r.items.map(i => i.itemId === itemId ? { ...i, ...flags } : i),
      }),
    }));

  const addDestination = (label) => {
    const trimmed = (label || '').trim();
    if (!trimmed) return null;
    const norm = trimmed.toLowerCase();
    const presetMatch = DESTINATION_PRESETS.find(
      p => p.fr.toLowerCase() === norm || p.en.toLowerCase() === norm
    );
    if (presetMatch) return { kind: 'preset', key: presetMatch.key };
    const existing = (state.destinations || []).find(d => d.label.trim().toLowerCase() === norm);
    if (existing) return { kind: 'custom', id: existing.id };
    const id = `demo_dest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setState(s => ({ ...s, destinations: [...(s.destinations || []), { id, label: trimmed }] }));
    return { kind: 'custom', id };
  };

  const removeDestination = (id) =>
    setState(s => ({
      ...s,
      destinations: (s.destinations || []).filter(d => d.id !== id),
      rooms: s.rooms.map(r => ({
        ...r,
        items: r.items.map(i =>
          (i.destination?.kind === 'custom' && i.destination.id === id) ? { ...i, destination: null } : i
        ),
      })),
    }));

  // ── Segments de transport manuels (Step5Summary) ─────────────────
  const addMoveSegment = () =>
    setState(s => ({ ...s, moveSegments: [...(s.moveSegments || []), { id: `demo_seg_${Date.now()}`, type: '', volume: 0, comment: '' }] }));
  const updateMoveSegment = (id, field, value) =>
    setState(s => ({ ...s, moveSegments: (s.moveSegments || []).map(seg => seg.id === id ? { ...seg, [field]: value } : seg) }));
  const removeMoveSegment = (id) =>
    setState(s => ({ ...s, moveSegments: (s.moveSegments || []).filter(seg => seg.id !== id) }));

  // ── Volumes / logistique — copies pures de AppContext.jsx ────────
  const getRoomVolume = (room) =>
    (room.items || []).reduce((sum, item) => sum + (item.volume_m3 || 0) * (item.qty || 1), 0);

  const getTotalVolume = () => state.rooms.reduce((sum, r) => sum + getRoomVolume(r), 0);

  const getRoomIcon = (type) => CATALOG.roomIcons[type] || '📦';

  const getSegmentSolution = (type, volume) => {
    const v = parseFloat(volume) || 0;
    const isFr = lang === 'fr';
    if (type === 'sea' || type === 'international') {
      if (v < 5) return isFr ? 'Aérien ou LCL groupage' : 'Air or LCL groupage';
      if (v <= 30) return isFr ? 'Maritime LCL groupage' : 'Sea LCL groupage';
      if (v <= 60) return isFr ? "Conteneur 20'" : "20' Container";
      return isFr ? "Conteneur 40' HC" : "40' HC Container";
    }
    if (type === 'air') {
      if (v < 1) return isFr ? 'Colis express' : 'Express parcel';
      if (v < 5) return isFr ? 'Palette aerienne' : 'Air pallet';
      return isFr ? 'Groupage aerien' : 'Air groupage';
    }
    if (type === 'storage') return isFr ? 'Garde-meuble / box' : 'Storage / warehouse';
    if (type === 'groupage') return isFr ? 'Groupage (mer ou air selon volume)' : 'Groupage (sea or air depending on volume)';
    if (type === 'road') return isFr ? 'Route internationale' : 'International road';
    return isFr ? 'Route / National' : 'Road / National';
  };

  const getItemsByDestination = () => {
    const groups = {};
    const ensure = (groupKey, meta) => {
      if (!groups[groupKey]) groups[groupKey] = { ...meta, count: 0, volume: 0, items: [] };
      return groups[groupKey];
    };
    state.rooms.forEach(r => {
      (r.items || []).filter(i => i.qty > 0).forEach(i => {
        const d = i.destination;
        let groupKey, meta;
        if (!d) {
          groupKey = 'main';
          meta = { kind: 'main' };
        } else if (d.kind === 'preset') {
          groupKey = `preset:${d.key}`;
          meta = { kind: 'preset', key: d.key };
        } else {
          groupKey = `custom:${d.id}`;
          const dest = (state.destinations || []).find(x => x.id === d.id);
          meta = { kind: 'custom', id: d.id, label: dest?.label || (lang === 'fr' ? 'Destination supprimée' : 'Deleted destination') };
        }
        const g = ensure(groupKey, meta);
        g.count += i.qty;
        g.volume += (i.volume_m3 || 0) * i.qty;
        g.items.push({ name: i.name, icon: i.icon || '📦', qty: i.qty, roomName: r.name });
      });
    });
    return groups;
  };

  const getDispatchSegments = () => {
    const manual = state.moveSegments || [];
    if (manual.length > 0) return manual;
    const groups = getItemsByDestination();
    const segments = [];
    DESTINATION_PRESETS.forEach(p => {
      const g = groups[`preset:${p.key}`];
      if (g?.volume > 0) segments.push({ type: p.key, volume: g.volume });
    });
    let roadVolume = groups.main?.volume || 0;
    Object.keys(groups).forEach(k => { if (k.startsWith('custom:')) roadVolume += groups[k].volume; });
    if (roadVolume > 0) {
      const road = segments.find(s => s.type === 'road');
      if (road) road.volume += roadVolume;
      else segments.push({ type: 'road', volume: roadVolume });
    }
    return segments;
  };

  const getRecommendedTruck = (vol) => {
    const segments = getDispatchSegments();
    if (segments.length > 0) {
      const primary = segments.reduce((a, b) => ((b.volume || 0) > (a.volume || 0) ? b : a));
      return getSegmentSolution(primary.type, primary.volume || vol);
    }
    const mt = state.moveType || 'local';
    if (mt !== 'local') return getSegmentSolution(mt, vol);
    const destPc = (state.destination?.postalCode || '').trim();
    if (destPc && !/^\d{5}$/.test(destPc)) return getSegmentSolution('international', vol);
    return getSegmentSolution('local', vol);
  };

  const collectFlagged = (flagKey) => {
    const out = [];
    state.rooms.forEach(r =>
      (r.items || []).filter(i => i[flagKey] && i.qty > 0).forEach(i => out.push({ ...i, roomName: r.name }))
    );
    return out;
  };
  const getAllFragile = () => collectFlagged('fragile');
  const getAllHeavy = () => collectFlagged('heavy');
  const getAllDisassembly = () => collectFlagged('requires_disassembly');
  const getAllCrateItems = () => {
    const items = [];
    state.rooms.forEach(r =>
      (r.items || []).filter(i => (i.crate || i.needsCrate) && i.qty > 0).forEach(i => items.push({ ...i, roomName: r.name }))
    );
    return items;
  };

  // ── Photos — 100% locales, jamais d'upload (aucun compte, voir plus haut) ─
  const addRoomPhoto = (roomId, dataURL, category) => {
    const photoId = `demo_photo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : {
        ...r, photos: [...(r.photos || []), { id: photoId, dataURL, comment: '', category, storagePath: null, uploadStatus: 'done' }],
      }),
    }));
    return photoId;
  };
  const deleteRoomPhoto = (roomId, photoId) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : { ...r, photos: (r.photos || []).filter(p => p.id !== photoId) }),
    }));
  const updateRoomPhoto = (roomId, photoId, updates) =>
    setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.id !== roomId ? r : { ...r, photos: (r.photos || []).map(p => p.id === photoId ? { ...p, ...updates } : p) }),
    }));
  const retryPhotoUploads = async () => {}; // rien n'est jamais en attente en mode démo

  // ── Fonctionnalités hors périmètre du mode démo (compte requis) ──
  const openNewQuote = () => openModal(<DemoLockedFeatureModal lang={lang} onClose={closeModal} />);
  const saveVisit = async () => ({ data: { id: 'demo' }, error: null });

  return (
    <AppContext.Provider value={{
      lang, t, tCat,
      state,
      nextStep: () => onFinishInventory?.(),
      clearJustFinishedInventory: () => {},
      hasFullAccess: () => true,
      isTrialExpired: () => false,
      addRoom, deleteRoom, selectRoom,
      addItemToRoom, addCustomItemToRoom, changeQty,
      updateItemComment, updateItemVolume, updateItemCrate, updateItemDestination, updateItemFlags,
      addDestination, removeDestination,
      addMoveSegment, updateMoveSegment, removeMoveSegment, getSegmentSolution,
      getRoomVolume, getTotalVolume, getRoomIcon,
      getRecommendedTruck, getItemsByDestination,
      getAllFragile, getAllHeavy, getAllDisassembly, getAllCrateItems,
      sheet, openSheet, closeSheet,
      modal, openModal, closeModal,
      profile: null,
      setViewMode: () => {},
      saveStatus: 'idle',
      saveVisit, openNewQuote,
      addRoomPhoto, deleteRoomPhoto, updateRoomPhoto, retryPhotoUploads,
    }}>
      {children}
    </AppContext.Provider>
  );
}
