import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATALOG, CRATE_ELIGIBLE_IDS } from '../data/catalog';
import { AddRoomSheet } from './Step3Rooms';

const PHOTO_CATEGORIES_FR = ['Mobilier', 'Accès', 'Fragile', 'Stationnement', 'Contrainte', 'Autre'];
const PHOTO_CATEGORIES_EN = ['Furniture', 'Access', 'Fragile', 'Parking', 'Constraint', 'Other'];

async function compressImage(dataURL, maxW = 1200, quality = 0.75) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataURL);
    img.src = dataURL;
  });
}

const ROOM_BOX_TYPES = {
  bedroom:      ['box_standard', 'box_wardrobe', 'box_books', 'box_fragile'],
  childBedroom: ['box_standard', 'box_wardrobe', 'box_books', 'box_fragile'],
  dressing:     ['box_wardrobe', 'box_standard'],
  kitchen:      ['box_standard', 'box_dishes', 'box_fragile', 'box_large'],
  diningRoom:   ['box_standard', 'box_dishes', 'box_fragile'],
  livingRoom:   ['box_standard', 'box_books', 'box_fragile', 'box_large'],
  office:       ['box_archives', 'box_books', 'box_standard', 'box_fragile'],
  bathroom:     ['box_standard', 'box_fragile'],
  laundry:      ['box_standard', 'box_large'],
  garage:       ['box_standard', 'box_large'],
  basement:     ['box_standard', 'box_large', 'box_archives'],
  attic:        ['box_standard', 'box_large', 'box_archives'],
  garden:       ['box_standard', 'box_large'],
  storageBox:   ['box_standard', 'box_large', 'box_archives'],
  misc:         ['box_standard', 'box_fragile', 'box_large'],
};

const minusBtnStyle = {
  background: 'var(--danger-light)', color: 'var(--danger)',
  border: 'none', borderRadius: '50%', width: '26px', height: '26px',
  cursor: 'pointer', fontSize: '16px', fontWeight: '700', lineHeight: '1',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
};

// Tâches 1 & 4 : variantes cliquables, pas de bouton +, bouton - discret si qty > 0
function QuickAdjustSheet({ roomId, catKey, itemId }) {
  const { tCat, lang, state, changeQty, addItemToRoom, closeSheet } = useApp();
  const cat = CATALOG[catKey];
  const item = cat?.find(i => i.id === itemId);
  if (!item) return null;
  const room = state.rooms.find(r => r.id === roomId);
  const roomItems = room?.items || [];
  const isFr = lang === 'fr';

  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">{item.icon} {tCat(item.name)}</div>
      {item.variants.map(v => {
        const uid = `${itemId}_${v.id}`;
        const invItem = roomItems.find(i => i.itemId === uid);
        const qty = invItem?.qty || 0;
        return (
          <div
            key={v.id}
            className={`variant-option ${qty > 0 ? 'in-inventory' : ''}`}
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => addItemToRoom(roomId, catKey, itemId, v.id)}
          >
            <div style={{ flex: 1 }}>
              <div className="var-name">{tCat(v.label)}</div>
              <div className="var-vol">{v.volume_m3} m³</div>
              <div className="var-tags">
                {v.fragile && <span className="tag tag-fragile">Fragile</span>}
                {v.heavy && <span className="tag tag-heavy">{isFr ? 'Lourd' : 'Heavy'}</span>}
                {v.requires_disassembly && <span className="tag tag-disassembly">{isFr ? 'Demontage' : 'Disassembly'}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {qty > 0 && (
                <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--accent)', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              )}
              {qty > 0 && (
                <button
                  style={minusBtnStyle}
                  onClick={(e) => { e.stopPropagation(); changeQty(roomId, uid, -1); }}
                >
                  −
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ padding: '16px' }}>
        <button className="pdf-btn" style={{ width: '100%' }} onClick={closeSheet}>
          {isFr ? 'Fermer' : 'Close'}
        </button>
      </div>
    </>
  );
}

const MISC_SUGGESTIONS_FR = {
  bedroom:      [{ n: 'Coiffeuse', v: 0.3 }, { n: 'Table à langer', v: 0.4 }, { n: 'Poussette / landau', v: 0.6 }, { n: 'Parc bébé', v: 0.3 }, { n: 'Transat bébé', v: 0.15 }, { n: 'Couette / oreillers', v: 0.1 }, { n: 'Tête de lit', v: 0.2 }],
  childBedroom: [{ n: 'Poussette / landau', v: 0.6 }, { n: 'Parc bébé', v: 0.3 }, { n: 'Transat bébé', v: 0.15 }, { n: 'Peluches (lot)', v: 0.1 }, { n: 'Jouets (lot)', v: 0.3 }, { n: 'Tapis de jeux', v: 0.1 }],
  dressing:     [{ n: 'Cintres (lot)', v: 0.05 }, { n: 'Boîtes à chaussures', v: 0.1 }, { n: 'Miroir pied', v: 0.15 }, { n: 'Rangements modulables', v: 0.3 }],
  kitchen:      [{ n: 'Machine à pain', v: 0.15 }, { n: 'Extracteur de jus', v: 0.1 }, { n: 'Réfrigérateur à vin', v: 0.3 }, { n: 'Yaourtière', v: 0.05 }, { n: 'Ustensiles cuisine (lot)', v: 0.1 }, { n: 'Poubelle de tri', v: 0.1 }],
  diningRoom:   [{ n: 'Nappe / linge de table', v: 0.05 }, { n: 'Service vaisselle', v: 0.2 }, { n: 'Luminaire suspension', v: 0.1 }, { n: 'Cave à vin encastrée', v: 0.5 }],
  livingRoom:   [{ n: 'Console de jeux (PS/Xbox)', v: 0.05 }, { n: 'Home cinéma / barre de son', v: 0.2 }, { n: 'Cave à vin', v: 0.5 }, { n: 'Climatiseur mobile', v: 0.3 }, { n: 'Coussins / plaids', v: 0.1 }, { n: 'Rideaux / voilages', v: 0.1 }],
  office:       [{ n: 'Scanner', v: 0.05 }, { n: 'NAS / Serveur', v: 0.1 }, { n: 'Hub USB / Switch réseau', v: 0.02 }, { n: 'Câbles / accessoires', v: 0.05 }, { n: 'Livres / archives (lot)', v: 0.3 }],
  bathroom:     [{ n: 'Pèse-personne', v: 0.03 }, { n: 'Accessoires SDB (lot)', v: 0.05 }, { n: 'Climatiseur / ventilateur', v: 0.1 }],
  laundry:      [{ n: 'Produits lessive (lot)', v: 0.1 }, { n: 'Séchoir pliable', v: 0.15 }, { n: 'Aspirateur', v: 0.08 }],
  garage:       [{ n: 'Quad / Moto-cross', v: 1.5 }, { n: 'Compresseur', v: 0.3 }, { n: 'Groupe électrogène', v: 0.5 }, { n: 'Perceuse à colonne', v: 0.4 }, { n: 'Outillage divers', v: 0.2 }, { n: 'Bidons / jerrican', v: 0.1 }],
  garden:       [{ n: 'Tondeuse robot', v: 0.1 }, { n: 'Débroussailleuse', v: 0.2 }, { n: 'Taille-haie', v: 0.15 }, { n: 'Barbecue fixe / plancha', v: 0.4 }, { n: 'Salon de jardin', v: 1.5 }, { n: 'Parasol / pergola', v: 0.5 }, { n: 'Trampoline', v: 2.0 }, { n: 'Piscine hors-sol', v: 1.5 }, { n: 'Abri de jardin', v: 3.0 }, { n: 'Brouette', v: 0.3 }, { n: 'Bac à sable', v: 0.5 }],
  misc:         [{ n: 'Cartons divers', v: 0.06 }, { n: 'Sacs bagages', v: 0.1 }, { n: 'Objets fragiles', v: 0.1 }],
};
const MISC_SUGGESTIONS_EN = {
  bedroom:      [{ n: 'Dressing table', v: 0.3 }, { n: 'Changing table', v: 0.4 }, { n: 'Pram / pushchair', v: 0.6 }, { n: 'Baby cot/playpen', v: 0.3 }, { n: 'Baby bouncer', v: 0.15 }, { n: 'Duvet / pillows', v: 0.1 }],
  childBedroom: [{ n: 'Pram / pushchair', v: 0.6 }, { n: 'Baby playpen', v: 0.3 }, { n: 'Stuffed toys', v: 0.1 }, { n: 'Toys (set)', v: 0.3 }, { n: 'Play mat', v: 0.1 }],
  dressing:     [{ n: 'Hangers (set)', v: 0.05 }, { n: 'Shoe boxes', v: 0.1 }, { n: 'Full-length mirror', v: 0.15 }],
  kitchen:      [{ n: 'Bread maker', v: 0.15 }, { n: 'Juicer', v: 0.1 }, { n: 'Wine fridge', v: 0.3 }, { n: 'Yogurt maker', v: 0.05 }, { n: 'Kitchen utensils', v: 0.1 }],
  diningRoom:   [{ n: 'Table linen', v: 0.05 }, { n: 'Tableware set', v: 0.2 }, { n: 'Pendant light', v: 0.1 }],
  livingRoom:   [{ n: 'Gaming console (PS/Xbox)', v: 0.05 }, { n: 'Home cinema / soundbar', v: 0.2 }, { n: 'Wine cabinet', v: 0.5 }, { n: 'Mobile air conditioning', v: 0.3 }, { n: 'Cushions / throws', v: 0.1 }],
  office:       [{ n: 'Scanner', v: 0.05 }, { n: 'NAS / Server', v: 0.1 }, { n: 'USB hub / Network switch', v: 0.02 }, { n: 'Books / archives', v: 0.3 }],
  bathroom:     [{ n: 'Bathroom scale', v: 0.03 }, { n: 'Bathroom accessories', v: 0.05 }],
  laundry:      [{ n: 'Laundry products', v: 0.1 }, { n: 'Folding dryer', v: 0.15 }, { n: 'Vacuum cleaner', v: 0.08 }],
  garage:       [{ n: 'Quad / Dirt bike', v: 1.5 }, { n: 'Air compressor', v: 0.3 }, { n: 'Generator', v: 0.5 }, { n: 'Drill press', v: 0.4 }, { n: 'Misc tools', v: 0.2 }],
  garden:       [{ n: 'Robotic mower', v: 0.1 }, { n: 'Brush cutter', v: 0.2 }, { n: 'Hedge trimmer', v: 0.15 }, { n: 'Fixed BBQ / plancha', v: 0.4 }, { n: 'Garden set', v: 1.5 }, { n: 'Parasol / pergola', v: 0.5 }, { n: 'Trampoline', v: 2.0 }, { n: 'Above-ground pool', v: 1.5 }, { n: 'Garden shed', v: 3.0 }, { n: 'Wheelbarrow', v: 0.3 }, { n: 'Sandpit', v: 0.5 }],
  misc:         [{ n: 'Moving boxes', v: 0.06 }, { n: 'Luggage bags', v: 0.1 }, { n: 'Fragile items', v: 0.1 }],
};

function CustomItemSheet({ roomId, roomType }) {
  const { lang, addCustomItemToRoom, closeSheet } = useApp();
  const [name, setName] = useState('');
  const [volumeStr, setVolumeStr] = useState('0.3');
  const [qty, setQty] = useState(1);
  const isFr = lang === 'fr';

  const volume = parseFloat(volumeStr) || 0.1;

  const suggestions = (isFr ? MISC_SUGGESTIONS_FR : MISC_SUGGESTIONS_EN)[roomType] || [];

  const volumePresets = [
    { val: 0.1, label: isFr ? 'Petit' : 'Small' },
    { val: 0.3, label: isFr ? 'Moyen' : 'Medium' },
    { val: 0.5, label: isFr ? 'Grand' : 'Large' },
    { val: 1.0, label: isFr ? 'Tres grand' : 'Very large' },
  ];

  const handleAdd = () => {
    if (!name.trim()) return;
    addCustomItemToRoom(roomId, name.trim(), volume, qty);
    closeSheet();
  };

  const pickSuggestion = (s) => {
    setName(s.n);
    setVolumeStr(String(s.v));
  };

  return (
    <>
      <div className="sheet-handle" />
      <div className="sheet-title">📦 {isFr ? 'Objet non liste' : 'Unlisted item'}</div>

      {suggestions.length > 0 && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isFr ? 'Suggestions rapides' : 'Quick suggestions'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {suggestions.map(s => (
              <button
                key={s.n}
                onClick={() => pickSuggestion(s)}
                style={{
                  padding: '5px 10px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer',
                  background: name === s.n ? 'var(--accent)' : 'var(--surface2)',
                  color: name === s.n ? 'white' : 'var(--text2)',
                  border: `1px solid ${name === s.n ? 'var(--accent)' : 'var(--border)'}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {s.n}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field" style={{ padding: '0 16px 12px' }}>
        <label>{isFr ? "Nom de l'objet" : 'Item name'}</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder={isFr ? 'Ex: Tabouret de bar...' : 'Ex: Bar stool...'} />
      </div>
      <div className="field" style={{ padding: '0 16px 12px' }}>
        <label>{isFr ? 'Volume en m³' : 'Volume in m³'}</label>
        <input
          type="number" step="0.01" min="0.01" inputMode="decimal"
          value={volumeStr}
          onChange={e => setVolumeStr(e.target.value)}
          onBlur={e => { const v = parseFloat(e.target.value); if (v > 0) setVolumeStr(String(v)); }}
          style={{ fontSize: '16px', fontWeight: '600' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          {volumePresets.map(p => (
            <button
              key={p.val}
              onClick={() => setVolumeStr(String(p.val))}
              style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                background: volume === p.val ? 'var(--accent)' : 'var(--surface2)',
                color: volume === p.val ? 'white' : 'var(--text2)',
                border: `1px solid ${volume === p.val ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {p.label} ({p.val} m³)
            </button>
          ))}
        </div>
      </div>
      <div className="field" style={{ padding: '0 16px 12px' }}>
        <label>{isFr ? 'Quantite' : 'Quantity'}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
          <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '18px', fontWeight: '600' }}>{qty}</span>
          <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <button className="pdf-btn" style={{ width: '100%', opacity: name.trim() ? 1 : 0.5 }}
          onClick={handleAdd} disabled={!name.trim()}>
          {isFr ? '+ Ajouter' : '+ Add'}
        </button>
      </div>
    </>
  );
}

function RoomBoxSection({ room }) {
  const { t, lang, changeRoomBox } = useApp();
  const isFr = lang === 'fr';
  const boxIds = ROOM_BOX_TYPES[room.type] || ['box_standard', 'box_large'];
  const boxes = CATALOG.boxTypes.filter(b => boxIds.includes(b.id));

  const sections = [
    { key: 'boxesRemaining', source: room.boxesRemaining || {}, label: isFr ? '📦 Cartons à emballer (nos équipes)' : '📦 Boxes to pack (our team)' },
    { key: 'boxesDone',      source: room.boxesDone      || {}, label: isFr ? '✅ Cartons déjà faits (client)'      : '✅ Already packed (client)'        },
  ];

  const totalBoxes = sections.reduce((sum, sec) =>
    sum + Object.values(sec.source).reduce((s, v) => s + (v || 0), 0), 0);

  return (
    <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        📦 {isFr ? 'Cartons de cette pièce' : 'Boxes for this room'}
        {totalBoxes > 0 && (
          <span style={{ background: 'var(--accent)', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
            {totalBoxes}
          </span>
        )}
      </div>
      {sections.map(sec => (
        <div key={sec.key} style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
            {sec.label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {boxes.map(bt => {
              const qty = sec.source[bt.id] || 0;
              return (
                <div
                  key={bt.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: qty > 0 ? 'var(--accent-light)' : 'var(--surface2)',
                    border: `1px solid ${qty > 0 ? 'var(--accent)' : 'var(--border)'}`,
                    position: 'relative',
                  }}
                  onClick={() => changeRoomBox(room.id, sec.key, bt.id, 1)}
                >
                  {qty > 0 && (
                    <div style={{
                      position: 'absolute', top: '-7px', right: '-7px',
                      background: 'var(--accent)', color: 'white', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                    }}>{qty}</div>
                  )}
                  <span style={{ fontSize: '20px' }}>{bt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{t(bt.nameKey)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{bt.volume_m3} m³</div>
                  </div>
                  {qty > 0 && (
                    <button
                      style={minusBtnStyle}
                      onClick={(e) => { e.stopPropagation(); changeRoomBox(room.id, sec.key, bt.id, -1); }}
                    >
                      −
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CatalogSection({ room }) {
  const { tCat, lang, state, addItemToRoom, openSheet, changeQty } = useApp();

  const catLabels = {
    bedroom: lang === 'fr' ? 'Chambre / Bureau' : 'Bedroom / Office',
    livingRoom: lang === 'fr' ? 'Salon / Séjour / Entrée' : 'Living room / Hallway',
    kitchen: lang === 'fr' ? 'Cuisine' : 'Kitchen',
    office: lang === 'fr' ? 'Bureau' : 'Office',
    garden: lang === 'fr' ? 'Jardin' : 'Garden',
    garageBasement: lang === 'fr' ? 'Garage / Cave' : 'Garage / Basement',
    laundry: lang === 'fr' ? 'Buanderie' : 'Laundry',
    bathroom: lang === 'fr' ? 'Salle de bain' : 'Bathroom',
    exceptional: lang === 'fr' ? 'Objets exceptionnels' : 'Exceptional items',
  };

  const cats = CATALOG.roomCatalogMap[room.type] || ['bedroom'];
  const result = [];
  cats.forEach(cat => {
    if (CATALOG[cat]) result.push({ key: cat, items: CATALOG[cat] });
  });

  const exceptionalForRoom = CATALOG.exceptional.filter(item =>
    item.allowedRooms && item.allowedRooms.includes(room.type)
  );
  if (exceptionalForRoom.length > 0) {
    result.push({ key: 'exceptional', items: exceptionalForRoom });
  }

  const handleItemClick = (item, cat) => {
    if (item.variants.length === 1) {
      addItemToRoom(room.id, cat.key, item.id, item.variants[0].id);
    } else {
      openSheet(<QuickAdjustSheet roomId={room.id} catKey={cat.key} itemId={item.id} />);
    }
  };

  const handleMultiMinus = (e, item) => {
    e.stopPropagation();
    for (const v of item.variants) {
      const uid = `${item.id}_${v.id}`;
      const invItem = (room.items || []).find(i => i.itemId === uid);
      if (invItem && invItem.qty > 0) {
        changeQty(room.id, uid, -1);
        break;
      }
    }
  };

  return (
    <>
      {result.map(cat => (
        <div key={cat.key} className="catalog-category">
          <div className="catalog-category-title">{catLabels[cat.key] || cat.key}</div>
          <div className="item-grid">
            {cat.items.map(item => {
              const qty = (room.items || []).filter(i => i.catalogId === item.id).reduce((s, i) => s + i.qty, 0);
              const isSingle = item.variants.length === 1;
              const singleUid = isSingle ? `${item.id}_${item.variants[0].id}` : null;
              return (
                <div
                  key={item.id}
                  className={`item-card ${qty > 0 ? 'in-inventory' : ''}`}
                  style={{ position: 'relative' }}
                  onClick={() => handleItemClick(item, cat)}
                >
                  {qty > 0 && <div className="item-qty-badge">{qty}</div>}
                  <span className="item-icon">{item.icon}</span>
                  <div className="item-name">{tCat(item.name)}</div>
                  {qty > 0 && (
                    <button
                      onClick={(e) => {
                        if (isSingle) { e.stopPropagation(); changeQty(room.id, singleUid, -1); }
                        else { handleMultiMinus(e, item); }
                      }}
                      style={{
                        position: 'absolute', bottom: '4px', right: '4px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'var(--danger-light)', color: 'var(--danger)',
                        border: 'none', cursor: 'pointer', fontSize: '14px',
                        fontWeight: '700', lineHeight: '1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                    >
                      −
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ padding: '8px 0 4px' }}>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px', fontSize: '13px', borderStyle: 'dashed' }}
          onClick={() => openSheet(<CustomItemSheet roomId={room.id} roomType={room.type} />)}
        >
          + {lang === 'fr' ? 'Divers / Objet non liste' : 'Misc / Unlisted item'}
        </button>
      </div>
    </>
  );
}

const TRANSPORT_MODES = [
  { val: 'road',    icon: '🚛', labelFr: 'Route',     labelEn: 'Road'    },
  { val: 'sea',     icon: '🚢', labelFr: 'Maritime',  labelEn: 'Sea'     },
  { val: 'air',     icon: '✈️', labelFr: 'Aérien',   labelEn: 'Air'     },
  { val: 'storage', icon: '📦', labelFr: 'Stockage',  labelEn: 'Storage' },
  { val: null,      icon: '❓', labelFr: 'Non défini', labelEn: 'Undef.' },
];

function InventoryList({ room }) {
  const { t, lang, changeQty, updateItemVolume, updateItemCrate, updateItemTransportMode } = useApp();
  const [editingItemId, setEditingItemId] = useState(null);
  const [editVolume, setEditVolume] = useState('');
  const [crateEditId, setCrateEditId] = useState(null);
  const [crateForm, setCrateForm] = useState({ l: '', w: '', h: '' });
  const items = (room.items || []).filter(i => i.qty > 0);
  const isFr = lang === 'fr';

  const startEdit = (item) => {
    setEditingItemId(item.itemId);
    setEditVolume(String(item.volume_m3));
  };

  const commitEdit = (itemId) => {
    const v = parseFloat(editVolume);
    if (v > 0) updateItemVolume(room.id, itemId, v);
    setEditingItemId(null);
  };

  const openCrateForm = (item) => {
    if (item.crate) {
      setCrateForm({ l: String(item.crate.l), w: String(item.crate.w), h: String(item.crate.h) });
    } else {
      setCrateForm({ l: '', w: '', h: '' });
    }
    setCrateEditId(item.itemId);
  };

  const commitCrate = (itemId) => {
    const l = parseFloat(crateForm.l);
    const w = parseFloat(crateForm.w);
    const h = parseFloat(crateForm.h);
    if (l > 0 && w > 0 && h > 0) {
      updateItemCrate(room.id, itemId, { l, w, h, vol: parseFloat((l * w * h / 1000000).toFixed(4)) });
    }
    setCrateEditId(null);
  };

  const removeCrate = (itemId) => {
    updateItemCrate(room.id, itemId, null);
    setCrateEditId(null);
  };

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text3)', fontSize: '13px' }}>
        {isFr ? "Cliquez sur un objet pour l'ajouter" : 'Tap an item to add it'}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div className="card-title" style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
        {isFr ? 'Inventaire' : 'Inventory'}
      </div>
      {items.map(item => (
        <div key={item.itemId} className="inv-item" style={{ alignItems: 'flex-start' }}>
          <div className="inv-icon">{item.icon}</div>
          <div className="inv-info" style={{ flex: 1 }}>
            <div className="inv-name">{item.name}</div>
            <div className="inv-variant">{item.variantLabel}</div>

            {/* Volume edit */}
            {editingItemId === item.itemId ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <input
                  type="number" step="0.01" min="0.001" inputMode="decimal"
                  value={editVolume}
                  onChange={e => setEditVolume(e.target.value)}
                  onBlur={() => commitEdit(item.itemId)}
                  onKeyDown={e => e.key === 'Enter' && commitEdit(item.itemId)}
                  autoFocus
                  style={{ width: '70px', padding: '3px 6px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--accent)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>m³</span>
                <button onClick={() => commitEdit(item.itemId)}
                  style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
                  OK
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="inv-vol">{(item.volume_m3 * item.qty).toFixed(3)} m³</div>
                <button title={t('editVolume')} onClick={() => startEdit(item)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text3)', padding: '0 2px', lineHeight: 1 }}>
                  ✏️
                </button>
              </div>
            )}

            {/* Transport mode selector */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
              {TRANSPORT_MODES.map(m => (
                <button
                  key={String(m.val)}
                  title={isFr ? m.labelFr : m.labelEn}
                  onClick={() => updateItemTransportMode(room.id, item.itemId, m.val)}
                  style={{
                    padding: '2px 6px', borderRadius: '10px', fontSize: '11px', cursor: 'pointer',
                    border: `1px solid ${item.transportMode === m.val ? 'var(--accent)' : 'var(--border)'}`,
                    background: item.transportMode === m.val ? 'var(--accent)' : 'var(--surface2)',
                    color: item.transportMode === m.val ? 'white' : 'var(--text3)',
                    fontWeight: item.transportMode === m.val ? '700' : '400',
                  }}
                >
                  {m.icon}
                </button>
              ))}
            </div>

            {/* Bouton caisse — toujours visible */}
            <div style={{ marginTop: '6px' }}>
              <button
                onClick={() => crateEditId === item.itemId ? setCrateEditId(null) : openCrateForm(item)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: item.crate ? '#FEF3C7' : '#FFFBEB',
                  color: item.crate ? '#92400E' : '#A16207',
                  border: `${item.crate ? '2px' : '1px dashed'} #FCD34D`,
                  borderRadius: '8px', padding: '5px 10px', fontSize: '12px',
                  cursor: 'pointer', fontWeight: '600',
                }}
              >
                📦 {item.crate ? `${item.crate.l}×${item.crate.w}×${item.crate.h} cm` : (isFr ? 'Caisse' : 'Crate')}
              </button>
            </div>

            {/* Crate form (L×l×H) — affiché quand ouvert */}
            {crateEditId === item.itemId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap', background: 'var(--surface2)', borderRadius: '6px', padding: '6px 8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600' }}>L</span>
                <input type="number" min="1" inputMode="numeric" value={crateForm.l} onChange={e => setCrateForm(f => ({ ...f, l: e.target.value }))}
                  placeholder="cm" style={{ width: '50px', padding: '3px 5px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }} />
                <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600' }}>×l</span>
                <input type="number" min="1" inputMode="numeric" value={crateForm.w} onChange={e => setCrateForm(f => ({ ...f, w: e.target.value }))}
                  placeholder="cm" style={{ width: '50px', padding: '3px 5px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }} />
                <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '600' }}>×H</span>
                <input type="number" min="1" inputMode="numeric" value={crateForm.h} onChange={e => setCrateForm(f => ({ ...f, h: e.target.value }))}
                  placeholder="cm" style={{ width: '50px', padding: '3px 5px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center' }} />
                {crateForm.l && crateForm.w && crateForm.h && (
                  <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '700' }}>
                    = {(parseFloat(crateForm.l) * parseFloat(crateForm.w) * parseFloat(crateForm.h) / 1000000).toFixed(4)} m³
                  </span>
                )}
                <button onClick={() => commitCrate(item.itemId)}
                  style={{ padding: '3px 10px', fontSize: '11px', borderRadius: '4px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                  OK
                </button>
                {item.crate && (
                  <button onClick={() => removeCrate(item.itemId)}
                    style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', background: 'var(--danger-light)', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}>
                    ✕ {isFr ? 'Retirer' : 'Remove'}
                  </button>
                )}
              </div>
            )}

            <div className="inv-tags" style={{ marginTop: '3px' }}>
              {item.fragile && <span className="tag tag-fragile">{t('tagFragile')}</span>}
              {item.heavy && <span className="tag tag-heavy">{t('tagHeavy')}</span>}
              {item.requires_disassembly && <span className="tag tag-disassembly">{t('tagDisassembly')}</span>}
              {item.possible_furniture_lift && <span className="tag tag-lift">{t('tagLift')}</span>}
            </div>
          </div>

          {/* Colonne droite : +/- */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div className="inv-qty">
              <button className="qty-btn" onClick={() => changeQty(room.id, item.itemId, -1)}>−</button>
              <span className="qty-num">{item.qty}</span>
              <button className="qty-btn" onClick={() => changeQty(room.id, item.itemId, 1)}>+</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const CROSS_CATALOG_MAP = {
  bedroom:      ['office', 'livingRoom'],
  childBedroom: ['office', 'livingRoom'],
  dressing:     ['bedroom'],
  livingRoom:   ['office', 'diningRoom'],
  office:       ['bedroom', 'livingRoom'],
  kitchen:      ['diningRoom'],
  diningRoom:   [],
  bathroom:     [],
  laundry:      [],
  garage:       ['garageBasement'],
  basement:     ['garageBasement'],
  attic:        ['garageBasement'],
  garden:       [],
  storageBox:   ['garageBasement'],
  misc:         ['livingRoom', 'bedroom', 'office'],
};

const CROSS_CAT_LABELS = {
  bedroom:       { fr: 'Chambre / Bureau',          en: 'Bedroom / Office' },
  livingRoom:    { fr: 'Salon / Séjour',             en: 'Living room' },
  kitchen:       { fr: 'Cuisine',                    en: 'Kitchen' },
  diningRoom:    { fr: 'Salle à manger',             en: 'Dining room' },
  office:        { fr: 'Bureau',                     en: 'Office' },
  garageBasement:{ fr: 'Garage / Cave',              en: 'Garage / Basement' },
  garden:        { fr: 'Jardin',                     en: 'Garden' },
  babyEquip:     { fr: 'Équipement bébé',            en: 'Baby equipment' },
  laundry:       { fr: 'Buanderie',                  en: 'Laundry' },
  bathroom:      { fr: 'Salle de bain',              en: 'Bathroom' },
};

function CrossCatalogSection({ room }) {
  const { tCat, lang, state, addItemToRoom, openSheet, changeQty } = useApp();
  const [expanded, setExpanded] = useState(false);
  const isFr = lang === 'fr';

  const crossCats = (CROSS_CATALOG_MAP[room.type] || []).filter(k => CATALOG[k] && CATALOG[k].length > 0);
  if (crossCats.length === 0) return null;

  const handleItemClick = (item, catKey) => {
    if (item.variants.length === 1) {
      addItemToRoom(room.id, catKey, item.id, item.variants[0].id);
    } else {
      openSheet(<QuickAdjustSheet roomId={room.id} catKey={catKey} itemId={item.id} />);
    }
  };

  const handleMinus = (e, item, catKey) => {
    e.stopPropagation();
    for (const v of item.variants) {
      const uid = `${item.id}_${v.id}`;
      const inv = (room.items || []).find(i => i.itemId === uid);
      if (inv && inv.qty > 0) { changeQty(room.id, uid, -1); break; }
    }
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border)', background: 'var(--surface2)',
          color: 'var(--text2)', fontSize: '13px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600',
        }}
      >
        <span>🔗 {isFr ? 'Autres objets référencés' : 'Cross-catalog items'}</span>
        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ marginTop: '6px' }}>
          {crossCats.map(catKey => {
            const label = CROSS_CAT_LABELS[catKey]?.[isFr ? 'fr' : 'en'] || catKey;
            return (
              <div key={catKey} className="catalog-category">
                <div className="catalog-category-title" style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {label}
                </div>
                <div className="item-grid">
                  {CATALOG[catKey].map(item => {
                    const qty = (room.items || []).filter(i => i.catalogId === item.id).reduce((s, i) => s + i.qty, 0);
                    const isSingle = item.variants.length === 1;
                    const singleUid = isSingle ? `${item.id}_${item.variants[0].id}` : null;
                    return (
                      <div
                        key={item.id}
                        className={`item-card ${qty > 0 ? 'in-inventory' : ''}`}
                        style={{ position: 'relative' }}
                        onClick={() => handleItemClick(item, catKey)}
                      >
                        {qty > 0 && <div className="item-qty-badge">{qty}</div>}
                        <span className="item-icon">{item.icon}</span>
                        <div className="item-name">{tCat(item.name)}</div>
                        {qty > 0 && (
                          <button
                            onClick={(e) => {
                              if (isSingle) { e.stopPropagation(); changeQty(room.id, singleUid, -1); }
                              else handleMinus(e, item, catKey);
                            }}
                            style={{
                              position: 'absolute', bottom: '4px', right: '4px',
                              width: '20px', height: '20px', borderRadius: '50%',
                              background: 'var(--danger-light)', color: 'var(--danger)',
                              border: 'none', cursor: 'pointer', fontSize: '14px',
                              fontWeight: '700', lineHeight: '1',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                            }}
                          >
                            −
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const FREE_PHOTO_LIMIT = 5;

function RoomPhotosSection({ room }) {
  const { lang, t, profile, addRoomPhoto, deleteRoomPhoto, updateRoomPhoto, retryPhotoUploads, setViewMode } = useApp();
  const isFr = lang === 'fr';
  const cats = isFr ? PHOTO_CATEGORIES_FR : PHOTO_CATEGORIES_EN;
  const [lightbox, setLightbox] = useState(null);
  const photos = room.photos || [];
  const hasErrors = photos.some(p => p.uploadStatus === 'error');
  const plan = profile?.plan || 'free';
  const photoLimit = plan === 'free' ? FREE_PHOTO_LIMIT : Infinity;
  const atLimit = photos.length >= photoLimit;

  const handleFiles = async (files) => {
    const toProcess = Array.from(files || []).slice(0, Math.max(0, photoLimit - photos.length));
    for (const file of toProcess) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const compressed = await compressImage(e.target.result);
        addRoomPhoto(room.id, compressed, isFr ? 'Autre' : 'Other');
      };
      reader.readAsDataURL(file);
    }
  };

  const statusIndicator = (photo) => {
    if (photo.uploadStatus === 'uploading') return (
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'var(--accent)', borderRadius: '0 0 6px 6px', animation: 'pulse 1.2s infinite' }} />
    );
    if (photo.uploadStatus === 'done') return (
      <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: '#16A34A', color: 'white', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '700' }}>✓</div>
    );
    if (photo.uploadStatus === 'error') return (
      <div style={{ position: 'absolute', bottom: '3px', right: '3px', background: '#DC2626', color: 'white', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700' }}>!</div>
    );
    return null;
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <div className="card-title" style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '8px' }}>
        📷 {t('photoSection')}
      </div>

      {/* Boutons capture */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <label style={{ flex: 1, cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
            style={{ display: 'none' }}
          />
          <div style={{
            textAlign: 'center', padding: '10px 6px', fontSize: '12px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', userSelect: 'none',
          }}>
            📷 {t('takePhoto')}
          </div>
        </label>
        <label style={{ flex: 1, cursor: 'pointer' }}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
            style={{ display: 'none' }}
          />
          <div style={{
            textAlign: 'center', padding: '10px 6px', fontSize: '12px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', userSelect: 'none',
          }}>
            🖼️ {t('chooseGallery')}
          </div>
        </label>
      </div>

      {/* Limite plan gratuit */}
      {atLimit && plan === 'free' && (
        <div
          onClick={() => setViewMode('pricing')}
          style={{ background: '#EEF3FD', border: '1px solid #2B6BE6', borderRadius: 8, padding: '8px 12px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 14 }}>🔒</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2B6BE6' }}>
              {isFr ? `Limite de ${FREE_PHOTO_LIMIT} photos (plan gratuit)` : `${FREE_PHOTO_LIMIT} photos limit (free plan)`}
            </div>
            <div style={{ fontSize: 11, color: '#2B6BE6', opacity: 0.8 }}>
              {isFr ? 'Passer au Pro pour des photos illimitées →' : 'Upgrade to Pro for unlimited photos →'}
            </div>
          </div>
        </div>
      )}

      {/* Bande miniatures */}
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={photo.dataURL}
                onClick={() => setLightbox(photo.id)}
                style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: '2px solid var(--border)', display: 'block' }}
                alt=""
              />
              <button
                onClick={() => deleteRoomPhoto(room.id, photo.id)}
                style={{
                  position: 'absolute', top: '2px', right: '2px',
                  background: 'rgba(220,38,38,0.85)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '18px', height: '18px',
                  cursor: 'pointer', fontSize: '10px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1,
                }}
              >×</button>
              {statusIndicator(photo)}
            </div>
          ))}
        </div>
      )}

      {/* Bouton retry si des uploads ont échoué */}
      {hasErrors && (
        <button
          onClick={() => retryPhotoUploads()}
          style={{
            width: '100%', padding: '8px', marginBottom: '8px',
            borderRadius: '8px', border: '1px solid #DC2626',
            background: '#FEF2F2', color: '#DC2626',
            fontSize: '12px', cursor: 'pointer', fontWeight: '600',
          }}
        >
          ↺ {t('uploadRetry')}
        </button>
      )}

      {/* Détails photo (commentaire + catégorie) */}
      {photos.map((photo, idx) => (
        <div key={photo.id} style={{
          background: 'var(--surface2)', borderRadius: '8px',
          padding: '8px', marginBottom: '6px',
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <img
            src={photo.dataURL}
            onClick={() => setLightbox(photo.id)}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, cursor: 'pointer' }}
            alt=""
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <select
              value={photo.category}
              onChange={e => updateRoomPhoto(room.id, photo.id, { category: e.target.value })}
              style={{
                width: '100%', marginBottom: '5px', padding: '5px 6px',
                borderRadius: '6px', border: '1px solid var(--border)',
                fontSize: '12px', background: 'var(--bg)', color: 'var(--text)',
              }}
            >
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder={t('photoComment')}
              value={photo.comment}
              onChange={e => updateRoomPhoto(room.id, photo.id, { comment: e.target.value })}
              style={{
                width: '100%', padding: '5px 6px', borderRadius: '6px',
                border: '1px solid var(--border)', fontSize: '12px',
                boxSizing: 'border-box', background: 'var(--bg)', color: 'var(--text)',
              }}
            />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text3)', flexShrink: 0, paddingTop: '2px' }}>
            #{idx + 1}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {lightbox && (() => {
        const photo = photos.find(p => p.id === lightbox);
        if (!photo) return null;
        return (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
              zIndex: 9999, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
          >
            <img
              src={photo.dataURL}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
              alt=""
            />
            {photo.comment && (
              <div style={{ color: 'white', marginTop: '12px', fontSize: '14px', textAlign: 'center' }}>
                {photo.comment}
              </div>
            )}
            <div style={{ color: 'rgba(255,255,255,0.55)', marginTop: '4px', fontSize: '12px' }}>
              {photo.category}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '16px', fontSize: '11px' }}>
              {isFr ? 'Appuyer pour fermer' : 'Tap to close'}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function BoxesSection() {
  const { t, lang, state, changeBox, setBox, setHouseholdPersons, getBoxSuggestions, applyBoxSuggestions } = useApp();
  const [suggestOpen, setSuggestOpen] = useState(false);
  const isFr = lang === 'fr';
  const suggestions = getBoxSuggestions();
  const hasSuggestions = Object.values(suggestions).some(v => v > 0);

  const sections = [
    { key: 'boxesDone', source: state.boxesDone, label: t('boxesDone') },
    { key: 'boxesRemaining', source: state.boxesRemaining, label: t('boxesRemaining') },
  ];

  return (
    <>
      {/* Note globale */}
      <div style={{
        background: '#EEF3FD', border: '1px solid #BFDBFE',
        borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '12px',
        fontSize: '13px', color: '#1D4ED8', fontWeight: '600',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        📦 {isFr ? 'Ces cartons concernent toute la visite' : 'These boxes apply to the entire visit'}
      </div>

      {/* Nombre de personnes + suggestion optionnelle */}
      <div className="card">
        <div className="card-title">{t('nbPeople')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <button className="qty-btn" onClick={() => setHouseholdPersons((state.householdPersons || 0) - 1)}>−</button>
          <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '22px', fontWeight: '700' }}>
            {state.householdPersons || 0}
          </span>
          <button className="qty-btn" onClick={() => setHouseholdPersons((state.householdPersons || 0) + 1)}>+</button>
        </div>
        {hasSuggestions && !suggestOpen && (
          <button
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '10px', padding: '10px', fontSize: '13px' }}
            onClick={() => setSuggestOpen(true)}
          >
            {isFr ? 'Suggerer des cartons' : 'Suggest boxes'}
          </button>
        )}
      </div>

      {/* Panel de suggestion */}
      {suggestOpen && hasSuggestions && (
        <div className="card" style={{ borderLeft: '3px solid var(--accent)' }}>
          <div className="card-title">{t('boxSuggestions')}</div>
          {Object.entries(suggestions).map(([id, qty]) => {
            const bt = CATALOG.boxTypes.find(b => b.id === id);
            if (!bt || qty === 0) return null;
            return (
              <div key={id} className="box-row">
                <span className="box-icon">{bt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="box-label">{t(bt.nameKey)}</div>
                </div>
                <strong style={{ fontSize: '16px' }}>{qty}</strong>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
              onClick={() => setSuggestOpen(false)}
            >
              {isFr ? 'Ignorer' : 'Ignore'}
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px', fontSize: '13px' }}
              onClick={() => { applyBoxSuggestions(suggestions); setSuggestOpen(false); }}
            >
              {t('applySuggestions')}
            </button>
          </div>
        </div>
      )}

      {/* Sections cartons cliquables */}
      {sections.map(sec => (
        <div key={sec.key} className="card">
          <div className="card-title">{sec.label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {CATALOG.boxTypes.map(bt => {
              const qty = sec.source[bt.id] || 0;
              return (
                <div
                  key={bt.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: qty > 0 ? 'var(--accent-light)' : 'var(--surface2)',
                    border: `1px solid ${qty > 0 ? 'var(--accent)' : 'var(--border)'}`,
                    position: 'relative',
                  }}
                  onClick={() => changeBox(sec.key, bt.id, 1)}
                >
                  {qty > 0 && (
                    <div style={{
                      position: 'absolute', top: '-7px', right: '-7px',
                      background: 'var(--accent)', color: 'white', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                    }}>{qty}</div>
                  )}
                  <span style={{ fontSize: '22px' }}>{bt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{t(bt.nameKey)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{bt.volume_m3} m³ / {isFr ? 'carton' : 'box'}</div>
                  </div>
                  {qty > 0 && (
                    <button
                      style={minusBtnStyle}
                      onClick={(e) => { e.stopPropagation(); changeBox(sec.key, bt.id, -1); }}
                    >
                      −
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function DeleteRoomModal({ roomId, roomName }) {
  const { lang, deleteRoom, closeModal } = useApp();
  const isFr = lang === 'fr';
  return (
    <>
      <div className="modal-title">{isFr ? `Supprimer "${roomName}" ?` : `Delete "${roomName}"?`}</div>
      <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '8px', textAlign: 'center' }}>
        {isFr ? 'Tous les objets de cette pièce seront supprimés.' : 'All items in this room will be deleted.'}
      </div>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={closeModal}>{isFr ? 'Annuler' : 'Cancel'}</button>
        <button className="btn btn-danger" onClick={() => { deleteRoom(roomId); closeModal(); }}>
          {isFr ? 'Supprimer' : 'Delete'}
        </button>
      </div>
    </>
  );
}

export default function Step4Inventory() {
  const { t, lang, state, getTotalVolume, getRoomVolume, getRoomIcon, selectRoom, openSheet, openModal, deleteRoom } = useApp();

  if (state.rooms.length === 0) {
    return (
      <>
        <div className="section-header"><div className="section-title">{t('inventory')}</div></div>
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <div className="empty-title">{lang === 'fr' ? 'Aucune pièce' : 'No rooms'}</div>
          <div className="empty-sub">{lang === 'fr' ? "Ajoutez des pièces à l'étape précédente" : 'Add rooms in the previous step'}</div>
        </div>
        {/* Tâche 2 : bouton ajout pièce même si liste vide */}
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '14px', fontSize: '14px', borderStyle: 'dashed', marginTop: '12px' }}
          onClick={() => openSheet(<AddRoomSheet />)}
        >
          + {t('addRoom')}
        </button>
      </>
    );
  }

  const room = state.rooms.find(r => r.id === state.currentRoomId) || state.rooms[0];
  const totalVol = getTotalVolume();

  return (
    <>
      <div className="volume-bar-wrap">
        <div className="volume-big">{totalVol.toFixed(1)}<span> m³</span></div>
        <div className="volume-breakdown">
          {lang === 'fr' ? 'Volume total estimé' : 'Total estimated volume'}<br />
          {lang === 'fr' ? 'Pièce :' : 'Room:'} <strong>{getRoomVolume(room).toFixed(2)} m³</strong>
        </div>
      </div>

      {/* Sélecteur de pièce + bouton ajouter pièce */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        <div className="room-selector" style={{ flex: 1, overflowX: 'auto' }}>
          {state.rooms.map(r => (
            <button
              key={r.id}
              className={`room-sel-btn ${r.id === (state.currentRoomId || state.rooms[0].id) ? 'active' : ''}`}
              onClick={() => selectRoom(r.id)}
            >
              <span className="sel-icon">{getRoomIcon(r.type)}</span>
              <span className="sel-name">{r.name}</span>
            </button>
          ))}
        </div>
        <button
          className="room-sel-btn"
          style={{ flexShrink: 0, fontWeight: '700', fontSize: '18px', padding: '8px 12px', border: '1px dashed var(--accent)', color: 'var(--accent)' }}
          onClick={() => openSheet(<AddRoomSheet />)}
          title={lang === 'fr' ? 'Ajouter une pièce' : 'Add a room'}
        >
          +
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
        <button
          style={{
            background: 'none', border: 'none', color: 'var(--danger)',
            fontSize: '12px', cursor: 'pointer', padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
          onClick={() => openModal(<DeleteRoomModal roomId={room.id} roomName={room.name} />)}
        >
          🗑️ {lang === 'fr' ? 'Supprimer cette pièce' : 'Delete this room'}
        </button>
      </div>

      <CatalogSection room={room} />
      <CrossCatalogSection room={room} />
      <InventoryList room={room} />
      <RoomBoxSection room={room} />
      <RoomPhotosSection room={room} />
    </>
  );
}
